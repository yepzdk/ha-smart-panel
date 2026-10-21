"""Tests for commands sent to panels."""

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_mock_service,
)
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.smart_panel.commands import Extra, encode_extras
from custom_components.smart_panel.const import DOMAIN
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import device_registry as dr

from .conftest import HA_URL, KITCHEN_REF, WEBHOOK_ID


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
async def test_command_notify_call(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    notify_calls: list[ServiceCall],
    params: dict[str, Any],
    action: str,
    extras: str | None,
) -> None:
    """Each command becomes one broadcast intent to the panel's registration."""
    notify_calls.clear()
    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), **params
    )
    assert response["success"], response
    assert response["result"] == {}

    assert len(notify_calls) == 1
    expected_data = {
        "intent_package_name": "dk.yepzdk.hapanel",
        "intent_action": f"dk.yepzdk.hapanel.{action}",
    }
    if extras is not None:
        expected_data["intent_extras"] = extras
    assert notify_calls[0].data == {
        "message": "command_broadcast_intent",
        "target": [f"webhook-{KITCHEN_REF}"],
        "data": expected_data,
    }


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
        {"command": "dance"},
    ],
)
async def test_command_invalid_input(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    notify_calls: list[ServiceCall],
    params: dict[str, Any],
) -> None:
    """Invalid input is refused before anything is sent."""
    notify_calls.clear()
    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), **params
    )
    assert not response["success"]
    assert response["error"]["code"] == "invalid_input"
    assert notify_calls == []


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
) -> None:
    """A notify failure, such as a disconnected panel, reaches the frontend."""
    async_mock_service(
        hass,
        "notify",
        "mobile_app",
        raise_exception=HomeAssistantError(
            "Device(s) with webhook id(s) webhook-kitchen-0001 not connected to "
            "local push notifications"
        ),
    )
    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), command="reload"
    )
    assert response["error"]["code"] == "send_failed"
    assert response["error"]["message"] == (
        "Could not send the command to smart-panel-kitchen: Device(s) with webhook "
        "id(s) webhook-kitchen-0001 not connected to local push notifications"
    )


async def test_command_fails_when_registration_is_gone(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
    notify_calls: list[ServiceCall],
) -> None:
    """Without a loaded mobile_app registration nothing can be sent."""
    await hass.config_entries.async_remove(mobile_app_entries["kitchen"].entry_id)
    await hass.async_block_till_done()
    notify_calls.clear()

    response = await _command(
        hass_ws_client, hass, panel_id=_panel_id(setup_integration), command="reload"
    )
    assert response["error"]["code"] == "send_failed"
    assert "not loaded" in response["error"]["message"]
    assert notify_calls == []


async def test_navigate_action(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    notify_calls: list[ServiceCall],
    device_registry: dr.DeviceRegistry,
) -> None:
    """The navigate action addresses the panel by its device."""
    device = device_registry.async_get_device_by_identifier(
        (DOMAIN, KITCHEN_REF), setup_integration.entry_id
    )
    assert device is not None
    notify_calls.clear()

    await hass.services.async_call(
        DOMAIN,
        "navigate",
        {"device_id": device.id, "path": "/energy"},
        blocking=True,
    )
    assert notify_calls[0].data["data"] == {
        "intent_package_name": "dk.yepzdk.hapanel",
        "intent_action": "dk.yepzdk.hapanel.NAVIGATE",
        "intent_extras": "path:/energy:String",
    }


async def test_factory_reset_action_requires_confirmation(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    notify_calls: list[ServiceCall],
    device_registry: dr.DeviceRegistry,
) -> None:
    """Nothing is wiped unless confirm is on."""
    device = device_registry.async_get_device_by_identifier(
        (DOMAIN, KITCHEN_REF), setup_integration.entry_id
    )
    assert device is not None
    notify_calls.clear()

    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN,
            "factory_reset",
            {"device_id": device.id, "confirm": False},
            blocking=True,
        )
    assert err.value.translation_key == "factory_reset_not_confirmed"
    assert notify_calls == []

    await hass.services.async_call(
        DOMAIN,
        "factory_reset",
        {"device_id": device.id, "confirm": True},
        blocking=True,
    )
    assert notify_calls[0].data["data"]["intent_action"] == (
        "dk.yepzdk.hapanel.FACTORY_RESET"
    )
    assert notify_calls[0].data["data"]["intent_extras"] == "confirm:wipe:String"


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
