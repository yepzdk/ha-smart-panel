"""Tests for commands sent to panels."""

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.smart_panel.commands import Extra, encode_extras
from custom_components.smart_panel.const import DOMAIN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import device_registry as dr

from .conftest import HA_URL, KITCHEN_REF, WEBHOOK_ID, PushRecorder, mobile_app_data


def test_encode_extras_types_every_string_value() -> None:
    """String values carry :String so the Companion app keeps them as text."""
    assert (
        encode_extras(
            [
                Extra("ref", "000123"),
                Extra("url", "http://192.168.1.10:8123/api/webhook/abc"),
                Extra("brightness", "128", typed=False),
            ]
        )
        == "ref:000123:String,url:http://192.168.1.10:8123/api/webhook/abc:String,brightness:128"
    )


def test_encode_extras_rejects_comma() -> None:
    """A comma would split the value into another extra."""
    with pytest.raises(ServiceValidationError) as err:
        encode_extras([Extra("path", "/a,b")])
    assert err.value.translation_key == "invalid_extra_value"


@pytest.mark.parametrize("value", ["/{{ states('x') }}", "/{% if %}", "/{# x #}"])
def test_encode_extras_rejects_template_syntax(value: str) -> None:
    """The device action renders templates, so a value cannot carry one."""
    with pytest.raises(ServiceValidationError) as err:
        encode_extras([Extra("path", value)])
    assert err.value.translation_key == "template_in_extra_value"


def _panel_id(entry: MockConfigEntry) -> str:
    return next(iter(entry.subentries))


async def _command(
    hass_ws_client: WebSocketGenerator, hass: HomeAssistant, **params: Any
) -> dict[str, Any]:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "smart_panel/command", **params})
    return await client.receive_json()


@pytest.mark.parametrize(
    ("params", "action", "extras"),
    [
        ({"command": "screen_off"}, "SCREEN_OFF", None),
        ({"command": "screen_on"}, "SCREEN_ON", None),
        ({"command": "brightness", "value": 0}, "SET_BRIGHTNESS", "brightness:0"),
        ({"command": "brightness", "value": 255}, "SET_BRIGHTNESS", "brightness:255"),
        ({"command": "auto_brightness"}, "SET_BRIGHTNESS", "brightness:auto"),
        (
            {"command": "navigate", "path": "/lovelace/kitchen"},
            "NAVIGATE",
            "path:/lovelace/kitchen:String",
        ),
        ({"command": "navigate"}, "NAVIGATE", None),
        ({"command": "reload"}, "NAVIGATE", None),
        ({"command": "maintenance_on"}, "MAINTENANCE_ON", None),
        ({"command": "maintenance_off"}, "MAINTENANCE_OFF", None),
        ({"command": "restart"}, "REBOOT", None),
        ({"command": "update_panel_app"}, "UPDATE_PANEL", None),
        ({"command": "update_ha_app"}, "UPDATE_HA", None),
        (
            {"command": "factory_reset", "confirm": "wipe"},
            "FACTORY_RESET",
            "confirm:wipe:String",
        ),
        (
            {"command": "refresh"},
            "LINK",
            f"ref:{KITCHEN_REF}:String,url:{HA_URL}/api/webhook/{WEBHOOK_ID}:String",
        ),
    ],
)
async def test_command_push(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
    params: dict[str, Any],
    action: str,
    extras: str | None,
) -> None:
    """Each command is pushed as one broadcast intent to the panel's registration."""
    pushes.clear()
    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), **params
    )
    assert response["success"], response
    assert response["result"] == {}

    expected_data = {
        "intent_package_name": "dk.yepzdk.hapanel",
        "intent_action": f"dk.yepzdk.hapanel.{action}",
    }
    if extras is not None:
        expected_data["intent_extras"] = extras
    [push] = pushes
    assert push.token == f"token-{KITCHEN_REF}"
    assert push.webhook_id == f"webhook-{KITCHEN_REF}"
    assert push.message == "command_broadcast_intent"
    assert push.data == expected_data


@pytest.mark.parametrize(
    "params",
    [
        {"command": "factory_reset"},
        {"command": "factory_reset", "confirm": "yes"},
        {"command": "brightness"},
        {"command": "brightness", "value": 256},
        {"command": "brightness", "value": -1},
        {"command": "navigate", "path": "lovelace"},
        {"command": "navigate", "path": "/a,b"},
        {"command": "navigate", "path": "/{{ 1 }}"},
        {"command": "dance"},
    ],
)
async def test_command_invalid_input(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
    params: dict[str, Any],
) -> None:
    """Invalid input is refused before anything is sent."""
    pushes.clear()
    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), **params
    )
    assert not response["success"]
    assert response["error"]["code"] == "invalid_input"
    assert len(pushes) == 0


async def test_command_unknown_panel(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """An unknown panel id is reported as not found."""
    response = await _command(hass_ws_client, hass, panel_id="nope", command="reload")
    assert response["error"]["code"] == "not_found"


async def test_command_send_failure_carries_notify_error(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
    pushes: PushRecorder,
) -> None:
    """A panel app that is not connected for local push gets the notify error."""
    # The minimal app has no cloud push; it only receives over its own
    # websocket connection, which is not open here.
    kitchen = mobile_app_entries["kitchen"]
    hass.config_entries.async_update_entry(
        kitchen,
        data={**kitchen.data, "app_data": {"push_websocket_channel": True}},
    )
    pushes.clear()
    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), command="reload"
    )
    assert response["error"]["code"] == "send_failed"
    assert response["error"]["message"] == (
        "Could not send the command to smart-panel-kitchen: Device(s) with webhook "
        "id(s) webhook-kitchen-0001 not connected to local push notifications"
    )
    assert len(pushes) == 0


async def test_command_fails_for_registration_with_shared_device_name(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
) -> None:
    """A registration whose device name another one took cannot be reached.

    mobile_app registers one notify service per device name, so the later
    registration takes it over. The command must fail rather than reach the
    other device.
    """
    twin = MockConfigEntry(
        domain="mobile_app",
        title="smart-panel-kitchen",
        data=mobile_app_data(
            "kitchen-new-0003", "smart-panel-kitchen", "2026.8.4-minimal", "AC2003"
        ),
    )
    twin.add_to_hass(hass)
    assert await hass.config_entries.async_setup(twin.entry_id)
    await hass.async_block_till_done()
    pushes.clear()

    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), command="reload"
    )
    assert response["error"]["code"] == "send_failed"
    assert response["error"]["message"].startswith(
        "Could not send the command to smart-panel-kitchen: Home Assistant has no "
        "notification target for its app registration"
    )
    assert "same device name" in response["error"]["message"]
    assert len(pushes) == 0


async def test_command_fails_when_registration_is_gone(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
    pushes: PushRecorder,
) -> None:
    """Without a loaded mobile_app registration nothing can be sent."""
    await hass.config_entries.async_remove(mobile_app_entries["kitchen"].entry_id)
    await hass.async_block_till_done()
    pushes.clear()

    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), command="reload"
    )
    assert response["error"]["code"] == "send_failed"
    assert "not loaded" in response["error"]["message"]
    assert len(pushes) == 0


async def test_navigate_action(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
    device_registry: dr.DeviceRegistry,
) -> None:
    """The navigate action addresses the panel by its device."""
    device = device_registry.async_get_device_by_identifier(
        (DOMAIN, KITCHEN_REF), setup_integration.entry_id
    )
    assert device is not None
    pushes.clear()

    await hass.services.async_call(
        DOMAIN,
        "navigate",
        {"device_id": device.id, "path": "/energy"},
        blocking=True,
    )
    [push] = pushes
    assert push.token == f"token-{KITCHEN_REF}"
    assert push.data == {
        "intent_package_name": "dk.yepzdk.hapanel",
        "intent_action": "dk.yepzdk.hapanel.NAVIGATE",
        "intent_extras": "path:/energy:String",
    }


async def test_factory_reset_action_requires_confirmation(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
    device_registry: dr.DeviceRegistry,
) -> None:
    """Nothing is wiped unless confirm is on."""
    device = device_registry.async_get_device_by_identifier(
        (DOMAIN, KITCHEN_REF), setup_integration.entry_id
    )
    assert device is not None
    pushes.clear()

    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN,
            "factory_reset",
            {"device_id": device.id, "confirm": False},
            blocking=True,
        )
    assert err.value.translation_key == "factory_reset_not_confirmed"
    assert len(pushes) == 0

    await hass.services.async_call(
        DOMAIN,
        "factory_reset",
        {"device_id": device.id, "confirm": True},
        blocking=True,
    )
    [push] = pushes
    assert push.token == f"token-{KITCHEN_REF}"
    assert push.data["intent_action"] == "dk.yepzdk.hapanel.FACTORY_RESET"
    assert push.data["intent_extras"] == "confirm:wipe:String"


async def test_action_rejects_other_devices(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
    device_registry: dr.DeviceRegistry,
) -> None:
    """A device that is not a panel is refused."""
    phone = device_registry.async_get_device_by_identifier(
        ("mobile_app", "phone:42.x"), mobile_app_entries["phone"].entry_id
    )
    assert phone is not None
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN, "navigate", {"device_id": phone.id}, blocking=True
        )
    assert err.value.translation_key == "device_not_found"
