"""Tests for panel status reports and the entities they drive."""

from datetime import timedelta
from http import HTTPStatus
import json
from typing import Any

from freezegun.api import FrozenDateTimeFactory
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.smart_panel.const import DOMAIN
from homeassistant.components import webhook
from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import device_registry as dr
from homeassistant.util.aiohttp import MockRequest

from .conftest import KITCHEN_REF, WEBHOOK_ID, PushRecorder, kitchen_report

SCREEN = "switch.smart_panel_kitchen_screen"
MAINTENANCE = "switch.smart_panel_kitchen_maintenance_mode"
AUTO_BRIGHTNESS = "switch.smart_panel_kitchen_automatic_brightness"
BRIGHTNESS = "number.smart_panel_kitchen_brightness"
CONNECTIVITY = "binary_sensor.smart_panel_kitchen_connectivity"
HA_APP_VERSION = "sensor.smart_panel_kitchen_home_assistant_app_version"
LAST_SEEN = "sensor.smart_panel_kitchen_last_seen"
PANEL_APP = "update.smart_panel_kitchen_panel_app"
RESTART = "button.smart_panel_kitchen_restart"


async def _post(
    hass: HomeAssistant, hass_client_no_auth: ClientSessionGenerator, body: Any
) -> None:
    client = await hass_client_no_auth()
    kwargs = {"data": body} if isinstance(body, str) else {"json": body}
    response = await client.post(f"/api/webhook/{WEBHOOK_ID}", **kwargs)
    assert response.status == HTTPStatus.OK
    assert await response.text() == ""
    await hass.async_block_till_done()


async def test_entities_before_first_report(
    hass: HomeAssistant, setup_integration: MockConfigEntry
) -> None:
    """State entities wait for a report; the panel counts as offline."""
    for entity_id in (
        SCREEN,
        MAINTENANCE,
        AUTO_BRIGHTNESS,
        BRIGHTNESS,
        HA_APP_VERSION,
        PANEL_APP,
    ):
        assert hass.states.get(entity_id).state == STATE_UNAVAILABLE, entity_id
    assert hass.states.get(CONNECTIVITY).state == STATE_OFF
    assert hass.states.get(LAST_SEEN).state == STATE_UNKNOWN
    assert hass.states.get(RESTART).state != STATE_UNAVAILABLE


async def test_report_updates_entities_and_device(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
    device_registry: dr.DeviceRegistry,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A report sets every entity and the device details."""
    freezer.move_to("2026-10-21T10:00:00+00:00")
    await _post(hass, hass_client_no_auth, kitchen_report(event="link"))

    assert hass.states.get(SCREEN).state == STATE_ON
    assert hass.states.get(MAINTENANCE).state == STATE_OFF
    assert hass.states.get(AUTO_BRIGHTNESS).state == STATE_OFF
    assert hass.states.get(BRIGHTNESS).state == "128"
    assert hass.states.get(CONNECTIVITY).state == STATE_ON
    assert hass.states.get(HA_APP_VERSION).state == "2026.8.4-minimal"
    assert hass.states.get(LAST_SEEN).state == "2026-10-21T10:00:00+00:00"
    update = hass.states.get(PANEL_APP)
    assert update.state == STATE_ON
    assert update.attributes["installed_version"] == "0.5.0"
    assert update.attributes["latest_version"] == "0.6.0"

    device = device_registry.async_get_device_by_identifier(
        (DOMAIN, KITCHEN_REF), setup_integration.entry_id
    )
    assert device is not None
    assert device.name == "smart-panel-kitchen"
    assert device.manufacturer == "OnePlus"
    assert device.model == "AC2003"
    assert device.sw_version == "0.5.0"

    await _post(
        hass,
        hass_client_no_auth,
        kitchen_report(
            event="change",
            screen_off=True,
            maintenance=True,
            brightness_auto=True,
            ha_app_version=None,
        ),
    )
    assert hass.states.get(SCREEN).state == STATE_OFF
    assert hass.states.get(MAINTENANCE).state == STATE_ON
    assert hass.states.get(AUTO_BRIGHTNESS).state == STATE_ON
    assert hass.states.get(HA_APP_VERSION).state == STATE_UNKNOWN


async def test_brightness_null_or_wide_scale(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """A missing brightness is unknown; a wider OEM scale is shown as reported."""
    await _post(hass, hass_client_no_auth, kitchen_report(brightness=None))
    assert hass.states.get(BRIGHTNESS).state == STATE_UNKNOWN

    await _post(hass, hass_client_no_auth, kitchen_report(brightness=1023))
    assert hass.states.get(BRIGHTNESS).state == "1023"


async def test_auto_brightness_off_keeps_current_value(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
) -> None:
    """Turning automatic brightness off sets the reported value manually."""
    await _post(
        hass, hass_client_no_auth, kitchen_report(brightness=90, brightness_auto=True)
    )
    pushes.clear()
    await hass.services.async_call(
        "switch", "turn_off", {"entity_id": AUTO_BRIGHTNESS}, blocking=True
    )
    assert pushes[0].data["intent_extras"] == "brightness:90"


async def test_panel_goes_offline_after_35_minutes(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
    freezer: FrozenDateTimeFactory,
) -> None:
    """Without a report for 35 minutes the panel is offline."""
    freezer.move_to("2026-10-21T10:00:00+00:00")
    await _post(hass, hass_client_no_auth, kitchen_report())
    assert hass.states.get(CONNECTIVITY).state == STATE_ON

    freezer.tick(timedelta(minutes=34))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(CONNECTIVITY).state == STATE_ON

    # A heartbeat restarts the 35 minutes.
    await _post(hass, hass_client_no_auth, kitchen_report(event="heartbeat"))
    freezer.tick(timedelta(minutes=34))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(CONNECTIVITY).state == STATE_ON

    freezer.tick(timedelta(minutes=1, seconds=1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(CONNECTIVITY).state == STATE_OFF
    # The report is no longer current; only its time stays visible.
    assert hass.states.get(SCREEN).state == STATE_UNAVAILABLE
    assert hass.states.get(PANEL_APP).state == STATE_UNAVAILABLE
    assert hass.states.get(LAST_SEEN).state == "2026-10-21T10:34:00+00:00"
    assert hass.states.get(RESTART).state != STATE_UNAVAILABLE


@pytest.mark.parametrize(
    "body",
    [
        kitchen_report(ref="someone-else"),
        kitchen_report(ref=123),
        "not json",
        '["a list"]',
        kitchen_report(brightness="128"),
        kitchen_report(screen_off=1),
        kitchen_report(sdk=True),
        {key: value for key, value in kitchen_report().items() if key != "model"},
    ],
)
async def test_invalid_or_unknown_reports_are_ignored(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
    body: Any,
) -> None:
    """Unknown refs and malformed reports change nothing and still get HTTP 200."""
    await _post(hass, hass_client_no_auth, body)
    assert hass.states.get(SCREEN).state == STATE_UNAVAILABLE
    assert hass.states.get(CONNECTIVITY).state == STATE_OFF


async def test_unknown_fields_are_accepted(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """A newer panel app may send more fields than this version knows."""
    await _post(hass, hass_client_no_auth, kitchen_report(battery=80))
    assert hass.states.get(SCREEN).state == STATE_ON


async def test_report_from_remote_address_is_accepted(
    hass: HomeAssistant, setup_integration: MockConfigEntry
) -> None:
    """A panel away from home reports from a public address."""
    request = MockRequest(
        content=json.dumps(kitchen_report()).encode(),
        mock_source="test",
        method="POST",
        remote="203.0.113.7",
    )
    response = await webhook.async_handle_webhook(hass, WEBHOOK_ID, request)
    await hass.async_block_till_done()

    assert response.status == HTTPStatus.OK
    assert hass.states.get(SCREEN).state == STATE_ON


async def test_screen_off_is_disabled(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
) -> None:
    """Screen off is refused until home-assistant/core#176371 is fixed."""
    await _post(hass, hass_client_no_auth, kitchen_report())
    pushes.clear()

    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            "switch", "turn_off", {"entity_id": SCREEN}, blocking=True
        )
    assert err.value.translation_key == "screen_off_disabled"
    assert "176371" in str(err.value)
    assert "https://github.com/home-assistant/core/issues/176371" in str(err.value)
    assert len(pushes) == 0
    assert hass.states.get(SCREEN).state == STATE_ON


async def test_screen_state_still_reported(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """The screen switch keeps showing a panel whose screen is off."""
    await _post(hass, hass_client_no_auth, kitchen_report(screen_off=True))
    assert hass.states.get(SCREEN).state == STATE_OFF


@pytest.mark.parametrize(
    ("domain", "service", "entity_id", "data", "action", "extras"),
    [
        ("switch", "turn_on", SCREEN, {}, "SCREEN_ON", None),
        ("switch", "turn_on", MAINTENANCE, {}, "MAINTENANCE_ON", None),
        ("switch", "turn_off", MAINTENANCE, {}, "MAINTENANCE_OFF", None),
        ("switch", "turn_on", AUTO_BRIGHTNESS, {}, "SET_BRIGHTNESS", "brightness:auto"),
        (
            "number",
            "set_value",
            BRIGHTNESS,
            {"value": 42},
            "SET_BRIGHTNESS",
            "brightness:42",
        ),
        ("button", "press", "button.smart_panel_kitchen_reload", {}, "NAVIGATE", None),
        ("button", "press", RESTART, {}, "REBOOT", None),
        (
            "button",
            "press",
            "button.smart_panel_kitchen_reinstall_home_assistant_app",
            {},
            "UPDATE_HA",
            None,
        ),
        ("update", "install", PANEL_APP, {}, "UPDATE_PANEL", None),
    ],
)
async def test_entity_actions_send_commands(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
    domain: str,
    service: str,
    entity_id: str,
    data: dict[str, Any],
    action: str,
    extras: str | None,
) -> None:
    """Each entity action sends its command to the panel."""
    await _post(hass, hass_client_no_auth, kitchen_report())
    pushes.clear()

    await hass.services.async_call(
        domain, service, {"entity_id": entity_id, **data}, blocking=True
    )
    [push] = pushes
    assert push.token == f"token-{KITCHEN_REF}"
    assert push.data["intent_action"] == f"dk.yepzdk.hapanel.{action}"
    assert push.data.get("intent_extras") == extras
