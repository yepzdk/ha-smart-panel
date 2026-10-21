"""Tests for keeping the panels' last reports across restarts."""

from datetime import timedelta
from typing import Any

from freezegun.api import FrozenDateTimeFactory
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.smart_panel.const import DOMAIN
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from .conftest import KITCHEN_REF, WEBHOOK_ID, PushRecorder, kitchen_report

STORAGE_KEY = "smart_panel.reports"
NOW = "2026-10-21T10:00:00+00:00"

SCREEN = "switch.smart_panel_kitchen_screen"
MAINTENANCE = "switch.smart_panel_kitchen_maintenance_mode"
AUTO_BRIGHTNESS = "switch.smart_panel_kitchen_automatic_brightness"
BRIGHTNESS = "number.smart_panel_kitchen_brightness"
CONNECTIVITY = "binary_sensor.smart_panel_kitchen_connectivity"
HA_APP_VERSION = "sensor.smart_panel_kitchen_home_assistant_app_version"
LAST_SEEN = "sensor.smart_panel_kitchen_last_seen"
PANEL_APP = "update.smart_panel_kitchen_panel_app"
RESTART = "button.smart_panel_kitchen_restart"

REPORT_ENTITIES = (
    SCREEN,
    MAINTENANCE,
    AUTO_BRIGHTNESS,
    BRIGHTNESS,
    HA_APP_VERSION,
    PANEL_APP,
)


def _status(**changes: Any) -> dict[str, Any]:
    """Return a kitchen report as it is stored, without the ref."""
    status = kitchen_report(**changes)
    del status["ref"]
    return status


def _storage(data: Any, version: int = 1) -> dict[str, Any]:
    """Return the storage file content holding the given data."""
    return {"version": version, "minor_version": 1, "key": STORAGE_KEY, "data": data}


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done(wait_background_tasks=True)
    assert entry.state is ConfigEntryState.LOADED


async def _wait_for_save(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    freezer.tick(timedelta(seconds=11))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


@pytest.fixture(autouse=True)
def frozen_now(freezer: FrozenDateTimeFactory) -> None:
    """Start every test at a known time."""
    freezer.move_to(NOW)


async def test_report_is_saved_and_restored(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A report is written after a short delay and back after a reload."""
    client = await hass_client_no_auth()
    await client.post(
        f"/api/webhook/{WEBHOOK_ID}", json=kitchen_report(screen_off=True)
    )
    await hass.async_block_till_done()
    assert STORAGE_KEY not in hass_storage

    await _wait_for_save(hass, freezer)
    assert hass_storage[STORAGE_KEY]["data"] == {
        KITCHEN_REF: {"status": _status(screen_off=True), "received": NOW}
    }

    # A report right before an unload is written by the unload.
    await client.post(f"/api/webhook/{WEBHOOK_ID}", json=kitchen_report())
    await hass.async_block_till_done()
    assert await hass.config_entries.async_unload(setup_integration.entry_id)
    await hass.async_block_till_done()
    assert hass_storage[STORAGE_KEY]["data"][KITCHEN_REF]["status"] == _status()

    await _setup(hass, setup_integration)
    assert hass.states.get(SCREEN).state == STATE_ON
    assert hass.states.get(CONNECTIVITY).state == STATE_ON


async def test_restart_restores_recent_report(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
    mock_github: AiohttpClientMocker,
    device_registry: dr.DeviceRegistry,
) -> None:
    """A report from before the restart that is still recent: online right away."""
    hass_storage[STORAGE_KEY] = _storage(
        {
            KITCHEN_REF: {
                "status": _status(
                    screen_off=True, maintenance=True, brightness=90, model="AC2004"
                ),
                "received": "2026-10-21T09:50:00+00:00",
            }
        }
    )
    await _setup(hass, config_entry)

    assert hass.states.get(CONNECTIVITY).state == STATE_ON
    assert hass.states.get(LAST_SEEN).state == "2026-10-21T09:50:00+00:00"
    assert hass.states.get(SCREEN).state == STATE_OFF
    assert hass.states.get(MAINTENANCE).state == STATE_ON
    assert hass.states.get(AUTO_BRIGHTNESS).state == STATE_OFF
    assert hass.states.get(BRIGHTNESS).state == "90"
    assert hass.states.get(HA_APP_VERSION).state == "2026.8.4-minimal"
    assert hass.states.get(PANEL_APP).attributes["installed_version"] == "0.5.0"
    device = device_registry.async_get_device_by_identifier(
        (DOMAIN, KITCHEN_REF), config_entry.entry_id
    )
    assert device is not None
    assert device.model == "AC2004"


async def test_restart_with_old_report(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
    mock_github: AiohttpClientMocker,
) -> None:
    """A report older than 35 minutes: offline, last seen shown, state unavailable."""
    hass_storage[STORAGE_KEY] = _storage(
        {KITCHEN_REF: {"status": _status(), "received": "2026-10-21T09:00:00+00:00"}}
    )
    await _setup(hass, config_entry)

    assert hass.states.get(CONNECTIVITY).state == STATE_OFF
    assert hass.states.get(LAST_SEEN).state == "2026-10-21T09:00:00+00:00"
    for entity_id in REPORT_ENTITIES:
        assert hass.states.get(entity_id).state == STATE_UNAVAILABLE, entity_id
    assert hass.states.get(RESTART).state != STATE_UNAVAILABLE


async def test_restored_report_goes_offline_on_time(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
    mock_github: AiohttpClientMocker,
    freezer: FrozenDateTimeFactory,
) -> None:
    """The offline timer runs from the stored receive time, not from the restart."""
    hass_storage[STORAGE_KEY] = _storage(
        {KITCHEN_REF: {"status": _status(), "received": "2026-10-21T09:50:00+00:00"}}
    )
    await _setup(hass, config_entry)
    assert hass.states.get(CONNECTIVITY).state == STATE_ON

    freezer.move_to("2026-10-21T10:24:59+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(CONNECTIVITY).state == STATE_ON
    assert hass.states.get(SCREEN).state == STATE_ON

    freezer.move_to("2026-10-21T10:25:01+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(CONNECTIVITY).state == STATE_OFF
    assert hass.states.get(SCREEN).state == STATE_UNAVAILABLE
    assert hass.states.get(LAST_SEEN).state == "2026-10-21T09:50:00+00:00"


async def test_removing_panel_deletes_its_report(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
    mock_github: AiohttpClientMocker,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A removed panel's report is dropped from the stored data."""
    hass_storage[STORAGE_KEY] = _storage(
        {KITCHEN_REF: {"status": _status(), "received": NOW}}
    )
    await _setup(hass, config_entry)

    subentry_id = next(iter(config_entry.subentries))
    assert hass.config_entries.async_remove_subentry(config_entry, subentry_id)
    await hass.async_block_till_done()
    await _wait_for_save(hass, freezer)
    assert hass_storage[STORAGE_KEY]["data"] == {}


async def test_removing_entry_deletes_reports(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
    mock_github: AiohttpClientMocker,
) -> None:
    """Removing the integration deletes the stored reports."""
    hass_storage[STORAGE_KEY] = _storage(
        {KITCHEN_REF: {"status": _status(), "received": NOW}}
    )
    await _setup(hass, config_entry)

    await hass.config_entries.async_remove(config_entry.entry_id)
    await hass.async_block_till_done()
    assert STORAGE_KEY not in hass_storage


async def test_reports_of_unknown_panels_are_dropped(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
    mock_github: AiohttpClientMocker,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A report for a ref that is no longer a panel is dropped on load."""
    hass_storage[STORAGE_KEY] = _storage(
        {
            KITCHEN_REF: {"status": _status(), "received": NOW},
            "removed-0003": {"status": _status(), "received": NOW},
        }
    )
    await _setup(hass, config_entry)
    assert hass.states.get(CONNECTIVITY).state == STATE_ON

    await _wait_for_save(hass, freezer)
    assert set(hass_storage[STORAGE_KEY]["data"]) == {KITCHEN_REF}


@pytest.mark.parametrize(
    "stored",
    [
        _storage("not a mapping"),
        _storage({KITCHEN_REF: "not a mapping"}),
        _storage({KITCHEN_REF: {"status": _status()}}),
        _storage({KITCHEN_REF: {"status": _status(screen_off=1), "received": NOW}}),
        _storage({KITCHEN_REF: {"status": _status(), "received": "yesterday"}}),
        _storage({KITCHEN_REF: {"status": _status(), "received": 12}}),
        _storage(
            {KITCHEN_REF: {"status": _status(), "received": "2026-10-21T10:00:00"}}
        ),
        _storage({KITCHEN_REF: {"status": _status(), "received": NOW}}, version=2),
    ],
)
async def test_unreadable_reports_are_ignored(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
    mock_github: AiohttpClientMocker,
    freezer: FrozenDateTimeFactory,
    caplog: pytest.LogCaptureFixture,
    stored: dict[str, Any],
) -> None:
    """Data that cannot be read is ignored with a warning; setup still succeeds."""
    hass_storage[STORAGE_KEY] = stored
    await _setup(hass, config_entry)

    assert "Ignoring the stored" in caplog.text
    assert hass.states.get(CONNECTIVITY).state == STATE_OFF
    assert hass.states.get(SCREEN).state == STATE_UNAVAILABLE

    # The unreadable data is replaced.
    await _wait_for_save(hass, freezer)
    assert hass_storage[STORAGE_KEY] == _storage({})
