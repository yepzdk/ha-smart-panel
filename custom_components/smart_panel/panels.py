"""Panel lifecycle: adding, linking, reports, online state and removal."""

import asyncio
from collections.abc import Mapping
from datetime import timedelta
import logging
import re
from types import MappingProxyType
from typing import Any

import voluptuous as vol

from homeassistant.components.webhook import async_generate_path
from homeassistant.config_entries import SOURCE_IGNORE, ConfigEntry, ConfigSubentry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.util import dt as dt_util

from .commands import async_link, async_unlink
from .const import (
    CONF_HA_URL,
    CONF_MOBILE_APP_ENTRY_ID,
    CONF_REF,
    CONF_WEBHOOK_ID,
    DOMAIN,
    LINK_RETRY_INTERVAL,
    MINIMAL_APP_VERSION_SUFFIX,
    MOBILE_APP_APP_VERSION,
    MOBILE_APP_DEVICE_ID,
    MOBILE_APP_DEVICE_NAME,
    MOBILE_APP_DOMAIN,
    MOBILE_APP_MODEL,
    ONLINE_TIMEOUT,
    REF_PATTERN,
    SIGNAL_PANELS_CHANGED,
    SUBENTRY_TYPE_PANEL,
    signal_panel_added,
    signal_panel_updated,
)
from .models import Panel, SmartPanelConfigEntry, StoredReport

_LOGGER = logging.getLogger(__name__)

_REF_INVALID_CHARS = re.compile(r"[^A-Za-z0-9_-]")


def _strict_int(value: Any) -> int:
    """Accept an int, but not a bool."""
    if isinstance(value, bool) or not isinstance(value, int):
        raise vol.Invalid("expected an integer")
    return value


def _strict_bool(value: Any) -> bool:
    """Accept a bool only."""
    if not isinstance(value, bool):
        raise vol.Invalid("expected a boolean")
    return value


REPORT_SCHEMA = vol.Schema(
    {
        vol.Required("ref"): vol.All(str, vol.Match(REF_PATTERN)),
        vol.Required("event"): str,
        vol.Required("app_version"): str,
        vol.Required("app_version_code"): _strict_int,
        vol.Required("ha_app_version"): vol.Any(None, str),
        vol.Required("maintenance"): _strict_bool,
        vol.Required("screen_off"): _strict_bool,
        # Null when the setting is missing; above 255 on OEMs with a wider scale.
        vol.Required("brightness"): vol.Any(None, _strict_int),
        vol.Required("brightness_auto"): _strict_bool,
        vol.Required("manufacturer"): str,
        vol.Required("model"): str,
        vol.Required("android_version"): str,
        vol.Required("sdk"): _strict_int,
    },
    extra=vol.REMOVE_EXTRA,
)


@callback
def async_get_loaded_entry(hass: HomeAssistant) -> SmartPanelConfigEntry | None:
    """Return the loaded Smart Panel config entry, if there is one."""
    entries: list[SmartPanelConfigEntry] = hass.config_entries.async_loaded_entries(
        DOMAIN
    )
    return entries[0] if entries else None


def ref_for_device_id(device_id: str) -> str:
    """Return the panel ref for a mobile_app device id."""
    return _REF_INVALID_CHARS.sub("_", device_id)[:64]


def status_url(entry: ConfigEntry) -> str:
    """Return the URL a panel posts its reports to."""
    return entry.options[CONF_HA_URL] + async_generate_path(entry.data[CONF_WEBHOOK_ID])


def _panel_subentries(entry: ConfigEntry) -> dict[str, ConfigSubentry]:
    """Return the panel subentries of the entry by subentry id."""
    return {
        subentry_id: subentry
        for subentry_id, subentry in entry.subentries.items()
        if subentry.subentry_type == SUBENTRY_TYPE_PANEL
    }


@callback
def async_candidates(hass: HomeAssistant, entry: ConfigEntry) -> list[dict[str, Any]]:
    """Return mobile_app registrations that are not panels yet, likely panels first."""
    added = _panel_subentries(entry).values()
    added_entry_ids = {subentry.data[CONF_MOBILE_APP_ENTRY_ID] for subentry in added}
    added_refs = {subentry.unique_id for subentry in added}

    candidates: list[dict[str, Any]] = []
    for mobile_app_entry in hass.config_entries.async_entries(MOBILE_APP_DOMAIN):
        if (
            mobile_app_entry.source == SOURCE_IGNORE
            or not mobile_app_entry.data.get(MOBILE_APP_DEVICE_ID)
            or mobile_app_entry.entry_id in added_entry_ids
            or ref_for_device_id(mobile_app_entry.data[MOBILE_APP_DEVICE_ID])
            in added_refs
        ):
            continue
        app_version = mobile_app_entry.data.get(MOBILE_APP_APP_VERSION) or ""
        candidates.append(
            {
                "mobile_app_entry_id": mobile_app_entry.entry_id,
                "name": mobile_app_entry.data.get(MOBILE_APP_DEVICE_NAME)
                or mobile_app_entry.title,
                "app_version": app_version,
                "model": mobile_app_entry.data.get(MOBILE_APP_MODEL) or "",
                "likely_panel": app_version.endswith(MINIMAL_APP_VERSION_SUFFIX),
            }
        )
    candidates.sort(
        key=lambda item: (not item["likely_panel"], item["name"].casefold())
    )
    return candidates


def panel_subentry_values(
    mobile_app_entry: ConfigEntry,
) -> tuple[str, str, dict[str, str]]:
    """Return title, unique id and data of the panel subentry for a registration."""
    ref = ref_for_device_id(mobile_app_entry.data[MOBILE_APP_DEVICE_ID])
    title = mobile_app_entry.data.get(MOBILE_APP_DEVICE_NAME) or mobile_app_entry.title
    return (
        title,
        ref,
        {CONF_REF: ref, CONF_MOBILE_APP_ENTRY_ID: mobile_app_entry.entry_id},
    )


@callback
def async_add_panel(
    hass: HomeAssistant, entry: SmartPanelConfigEntry, mobile_app_entry_id: str
) -> str | None:
    """Add a panel for a candidate registration and return its subentry id.

    Returns None when the registration is not a candidate. Linking happens in
    the entry update listener, like for panels added through the subentry flow.
    """
    if not any(
        candidate["mobile_app_entry_id"] == mobile_app_entry_id
        for candidate in async_candidates(hass, entry)
    ):
        return None
    mobile_app_entry = hass.config_entries.async_get_known_entry(mobile_app_entry_id)
    title, unique_id, data = panel_subentry_values(mobile_app_entry)
    subentry = ConfigSubentry(
        data=MappingProxyType(data),
        subentry_type=SUBENTRY_TYPE_PANEL,
        title=title,
        unique_id=unique_id,
    )
    hass.config_entries.async_add_subentry(entry, subentry)
    return subentry.subentry_id


@callback
def async_create_panels(
    hass: HomeAssistant, entry: ConfigEntry, stored: Mapping[str, StoredReport]
) -> dict[str, Panel]:
    """Create the runtime panels and their devices for a config entry being set up.

    Each panel gets back the report it sent before the restart. A panel whose
    report is recent enough is online right away and goes offline when that
    report is as old as the online timeout.
    """
    panels: dict[str, Panel] = {}
    for subentry_id, subentry in _panel_subentries(entry).items():
        panel = Panel.from_subentry(subentry)
        if (report := stored.get(panel.ref)) is not None:
            panel.status = report.status
            panel.last_seen = report.received
            _async_track_offline(hass, panel)
        _async_update_device(hass, entry, panel)
        panels[subentry_id] = panel
    return panels


@callback
def _async_update_device(hass: HomeAssistant, entry: ConfigEntry, panel: Panel) -> None:
    """Create or update the panel's device, with details from the last report."""
    status: Mapping[str, Any] = panel.status or {}
    dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id,
        config_subentry_id=panel.subentry_id,
        identifiers={(DOMAIN, panel.ref)},
        name=panel.title,
        manufacturer=status.get("manufacturer"),
        model=status.get("model"),
        sw_version=status.get("app_version"),
    )


@callback
def async_handle_report(
    hass: HomeAssistant, entry: SmartPanelConfigEntry, report: Mapping[str, Any]
) -> None:
    """Store a validated report from a panel and notify listeners."""
    panel = entry.runtime_data.panel_by_ref(report["ref"])
    if panel is None:
        _LOGGER.debug("Ignoring report for unknown ref %s", report["ref"])
        return

    if panel.last_seen is not None and not panel.online:
        _LOGGER.info("Panel %s is back online", panel.title)
    panel.status = {key: value for key, value in report.items() if key != "ref"}
    panel.last_seen = dt_util.utcnow()
    _async_update_device(hass, entry, panel)
    _async_track_offline(hass, panel)
    entry.runtime_data.reports.async_schedule_save(entry.runtime_data.panels)
    _async_panel_changed(hass, panel)


@callback
def _async_track_offline(hass: HomeAssistant, panel: Panel) -> None:
    """Mark the panel offline once its last report is as old as the timeout."""
    if panel.cancel_offline_timer is not None:
        panel.cancel_offline_timer()
        panel.cancel_offline_timer = None
    assert panel.last_seen is not None
    delay = panel.last_seen + ONLINE_TIMEOUT - dt_util.utcnow()
    if delay <= timedelta(0):
        return

    @callback
    def _async_went_offline(_now: Any) -> None:
        panel.cancel_offline_timer = None
        _LOGGER.info(
            "Panel %s is offline: no report for %s minutes",
            panel.title,
            int(ONLINE_TIMEOUT.total_seconds() // 60),
        )
        _async_panel_changed(hass, panel)

    panel.cancel_offline_timer = async_call_later(hass, delay, _async_went_offline)


@callback
def _async_panel_changed(hass: HomeAssistant, panel: Panel) -> None:
    """Notify the panel's entities and the WebSocket subscribers."""
    async_dispatcher_send(hass, signal_panel_updated(panel.subentry_id))
    async_dispatcher_send(hass, SIGNAL_PANELS_CHANGED)


@callback
def async_cancel_timers(entry: SmartPanelConfigEntry) -> None:
    """Cancel the offline timers of every panel."""
    for panel in entry.runtime_data.panels.values():
        if panel.cancel_offline_timer is not None:
            panel.cancel_offline_timer()
            panel.cancel_offline_timer = None


async def _async_link(
    hass: HomeAssistant, entry: ConfigEntry, panel: Panel, failure_level: int
) -> None:
    """Send LINK and log a failure; the panel keeps its previous link if any."""
    try:
        await async_link(hass, panel, status_url(entry))
    except HomeAssistantError as err:
        _LOGGER.log(failure_level, "Could not link panel %s: %s", panel.title, err)


async def _async_unlink(hass: HomeAssistant, panel: Panel) -> None:
    """Send UNLINK and log a failure."""
    try:
        await async_unlink(hass, panel)
    except HomeAssistantError as err:
        _LOGGER.warning(
            "Could not unlink removed panel %s; it keeps reporting until it is "
            "linked again or reset: %s",
            panel.title,
            err,
        )


async def async_link_all(hass: HomeAssistant, entry: SmartPanelConfigEntry) -> None:
    """Send LINK to every panel when the entry is set up.

    Right after a restart the panels have not reconnected yet, so failures are
    expected and only logged at debug level; the panels keep the link they
    persisted earlier.
    """
    await asyncio.gather(
        *(
            _async_link(hass, entry, panel, logging.DEBUG)
            for panel in entry.runtime_data.panels.values()
        )
    )


@callback
def async_start_link_retry(hass: HomeAssistant, entry: SmartPanelConfigEntry) -> None:
    """Send LINK again every few minutes to each panel that is not online.

    A LINK fails while the panel's app is not connected, for example right
    after a restart or right after the panel was added; without a retry such
    a panel would stay unlinked. One retry per panel at a time; the timer and
    running retries stop when the entry unloads.
    """

    async def _async_retry(panel: Panel) -> None:
        try:
            await _async_link(hass, entry, panel, logging.DEBUG)
        finally:
            panel.link_retry_in_flight = False

    @callback
    def _async_retry_offline(_now: Any) -> None:
        for panel in entry.runtime_data.panels.values():
            if panel.online or panel.link_retry_in_flight:
                continue
            panel.link_retry_in_flight = True
            entry.async_create_background_task(
                hass, _async_retry(panel), f"smart_panel link retry {panel.ref}"
            )

    entry.async_on_unload(
        async_track_time_interval(
            hass,
            _async_retry_offline,
            LINK_RETRY_INTERVAL,
            cancel_on_shutdown=True,
        )
    )


async def async_unlink_all(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Send UNLINK to every panel of an entry that is being removed."""
    await asyncio.gather(
        *(
            _async_unlink(hass, Panel.from_subentry(subentry))
            for subentry in _panel_subentries(entry).values()
        )
    )


async def async_sync_panels(hass: HomeAssistant, entry: SmartPanelConfigEntry) -> None:
    """Bring the runtime panels in line with the entry after it was updated.

    Added panel subentries get entities and a LINK, removed ones an UNLINK.
    A changed Home Assistant URL links every panel again with the new status URL.
    """
    data = entry.runtime_data
    subentries = _panel_subentries(entry)

    removed = [
        data.panels.pop(subentry_id)
        for subentry_id in list(data.panels)
        if subentry_id not in subentries
    ]
    for panel in removed:
        if panel.cancel_offline_timer is not None:
            panel.cancel_offline_timer()
            panel.cancel_offline_timer = None

    if removed:
        # The stored reports follow the panels, so a removed one is dropped.
        data.reports.async_schedule_save(data.panels)

    added: list[Panel] = []
    for subentry_id, subentry in subentries.items():
        if subentry_id in data.panels:
            continue
        panel = Panel.from_subentry(subentry)
        data.panels[subentry_id] = panel
        _async_update_device(hass, entry, panel)
        async_dispatcher_send(hass, signal_panel_added(entry.entry_id), subentry_id)
        added.append(panel)

    ha_url = entry.options[CONF_HA_URL]
    to_link = added
    if ha_url != data.linked_ha_url:
        data.linked_ha_url = ha_url
        to_link = list(data.panels.values())

    if removed or added:
        async_dispatcher_send(hass, SIGNAL_PANELS_CHANGED)

    await asyncio.gather(
        *(_async_unlink(hass, panel) for panel in removed),
        *(_async_link(hass, entry, panel, logging.WARNING) for panel in to_link),
    )
