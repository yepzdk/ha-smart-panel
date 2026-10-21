"""WebSocket API for the Smart Panel sidebar panel."""

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .commands import COMMAND_REFRESH, async_link, async_run_command
from .const import (
    CONF_HA_URL,
    CONF_MOBILE_APP_ENTRY_ID,
    CONF_WIFI_HIDDEN,
    CONF_WIFI_PASSWORD,
    CONF_WIFI_SECURITY,
    CONF_WIFI_SSID,
    DOMAIN,
    ENTITY_KEYS,
    SIGNAL_PANELS_CHANGED,
    SUBENTRY_TYPE_PANEL,
    WIFI_SECURITY_TYPES,
)
from .models import SmartPanelConfigEntry
from .panels import (
    async_add_panel,
    async_candidates,
    async_get_loaded_entry,
    status_url,
)
from .qr import provisioning_payload, render_svg
from .settings import missing_for_qr, settings_payload, validate_settings

ERR_NOT_FOUND = "not_found"
ERR_INVALID_INPUT = "invalid_input"
ERR_SEND_FAILED = "send_failed"
ERR_NOT_READY = "not_ready"


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register the WebSocket commands."""
    websocket_api.async_register_command(hass, ws_settings)
    websocket_api.async_register_command(hass, ws_settings_update)
    websocket_api.async_register_command(hass, ws_qr)
    websocket_api.async_register_command(hass, ws_panels_subscribe)
    websocket_api.async_register_command(hass, ws_candidates)
    websocket_api.async_register_command(hass, ws_panels_add)
    websocket_api.async_register_command(hass, ws_panels_remove)
    websocket_api.async_register_command(hass, ws_command)


@callback
def _async_get_entry(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg_id: int
) -> SmartPanelConfigEntry | None:
    """Return the loaded entry, or send not_ready and return None."""
    if (entry := async_get_loaded_entry(hass)) is None:
        connection.send_error(msg_id, ERR_NOT_READY, "Smart Panel is not loaded")
    return entry


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "smart_panel/settings"})
@callback
def ws_settings(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the provisioning settings without the Wi-Fi password."""
    if (entry := _async_get_entry(hass, connection, msg["id"])) is None:
        return
    connection.send_result(msg["id"], settings_payload(hass, entry.options))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "smart_panel/settings/update",
        vol.Required(CONF_WIFI_SSID): str,
        vol.Optional(CONF_WIFI_PASSWORD): str,
        vol.Required(CONF_WIFI_SECURITY): vol.In(WIFI_SECURITY_TYPES),
        vol.Required(CONF_WIFI_HIDDEN): bool,
        vol.Required(CONF_HA_URL): str,
    }
)
@callback
def ws_settings_update(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Validate and store the provisioning settings."""
    if (entry := _async_get_entry(hass, connection, msg["id"])) is None:
        return
    user_input = {key: value for key, value in msg.items() if key not in ("id", "type")}
    options, errors = validate_settings(user_input, entry.options)
    if errors:
        connection.send_result(msg["id"], {"errors": errors})
        return
    hass.config_entries.async_update_entry(entry, options=options)
    connection.send_result(msg["id"], {"settings": settings_payload(hass, options)})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "smart_panel/qr"})
@websocket_api.async_response
async def ws_qr(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the provisioning QR code, or what is missing to make it."""
    if (entry := _async_get_entry(hass, connection, msg["id"])) is None:
        return
    if missing := missing_for_qr(entry.options):
        connection.send_result(
            msg["id"], {"ready": False, "svg": None, "missing": missing}
        )
        return
    svg = await hass.async_add_executor_job(
        render_svg, provisioning_payload(entry.options)
    )
    connection.send_result(msg["id"], {"ready": True, "svg": svg, "missing": []})


@callback
def _async_panels_payload(hass: HomeAssistant) -> dict[str, Any]:
    """Return every panel as the frontend sees it."""
    if (entry := async_get_loaded_entry(hass)) is None:
        return {"panels": []}
    data = entry.runtime_data
    device_registry = dr.async_get(hass)
    entity_registry = er.async_get(hass)
    latest = data.coordinator.data.version if data.coordinator.data else None

    panels: list[dict[str, Any]] = []
    for panel in data.panels.values():
        device = device_registry.async_get_device_by_identifier(
            (DOMAIN, panel.ref), entry.entry_id
        )
        panels.append(
            {
                "panel_id": panel.subentry_id,
                "name": panel.title,
                "device_id": device.id if device else None,
                "online": panel.online,
                "last_seen": panel.last_seen.isoformat() if panel.last_seen else None,
                "status": panel.status,
                "latest_app_version": latest,
                "entities": {
                    key: entity_registry.async_get_entity_id(
                        platform, DOMAIN, f"{panel.ref}_{key}"
                    )
                    for platform, key in ENTITY_KEYS
                },
            }
        )
    return {"panels": panels}


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "smart_panel/panels/subscribe"})
@callback
def ws_panels_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Send the panels now and whenever they change."""
    if _async_get_entry(hass, connection, msg["id"]) is None:
        return

    @callback
    def _async_send_panels() -> None:
        connection.send_message(
            websocket_api.event_message(msg["id"], _async_panels_payload(hass))
        )

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, SIGNAL_PANELS_CHANGED, _async_send_panels
    )
    connection.send_result(msg["id"])
    _async_send_panels()


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "smart_panel/candidates"})
@callback
def ws_candidates(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the mobile_app registrations that can be added as panels."""
    if (entry := _async_get_entry(hass, connection, msg["id"])) is None:
        return
    connection.send_result(msg["id"], {"candidates": async_candidates(hass, entry)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "smart_panel/panels/add",
        vol.Required(CONF_MOBILE_APP_ENTRY_ID): str,
    }
)
@callback
def ws_panels_add(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add a registration as a panel; the panel is linked right after."""
    if (entry := _async_get_entry(hass, connection, msg["id"])) is None:
        return
    panel_id = async_add_panel(hass, entry, msg[CONF_MOBILE_APP_ENTRY_ID])
    if panel_id is None:
        connection.send_error(
            msg["id"], ERR_NOT_FOUND, "No registration that can be added has this id"
        )
        return
    connection.send_result(msg["id"], {"panel_id": panel_id})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "smart_panel/panels/remove", vol.Required("panel_id"): str}
)
@callback
def ws_panels_remove(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove a panel; it is unlinked right after."""
    if (entry := _async_get_entry(hass, connection, msg["id"])) is None:
        return
    subentry = entry.subentries.get(msg["panel_id"])
    if subentry is None or subentry.subentry_type != SUBENTRY_TYPE_PANEL:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Unknown panel")
        return
    hass.config_entries.async_remove_subentry(entry, subentry.subentry_id)
    connection.send_result(msg["id"], {})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "smart_panel/command",
        vol.Required("panel_id"): str,
        vol.Required("command"): str,
        vol.Optional("value"): int,
        vol.Optional("path"): str,
        vol.Optional("confirm"): str,
    }
)
@websocket_api.async_response
async def ws_command(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Send a command to a panel."""
    if (entry := _async_get_entry(hass, connection, msg["id"])) is None:
        return
    if (panel := entry.runtime_data.panels.get(msg["panel_id"])) is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Unknown panel")
        return
    try:
        if msg["command"] == COMMAND_REFRESH:
            # LINK rather than REPORT: it reports too, and it repairs a panel
            # that missed the LINK sent when it was added.
            await async_link(hass, panel, status_url(entry))
        else:
            await async_run_command(
                hass,
                panel,
                msg["command"],
                value=msg.get("value"),
                path=msg.get("path"),
                confirm=msg.get("confirm"),
            )
    except ServiceValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_INPUT, str(err))
        return
    except HomeAssistantError as err:
        connection.send_error(msg["id"], ERR_SEND_FAILED, str(err))
        return
    connection.send_result(msg["id"], {})
