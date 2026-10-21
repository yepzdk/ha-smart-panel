"""Tests for the WebSocket API and the provisioning QR code."""

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import (
    ClientSessionGenerator,
    WebSocketGenerator,
)

from custom_components.smart_panel.qr import provisioning_payload
from homeassistant.core import HomeAssistant, ServiceCall

from .conftest import HA_URL, KITCHEN_REF, WEBHOOK_ID, kitchen_report

EXTRA = "android.app.extra."


async def _call(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, **message: Any
) -> dict[str, Any]:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(message)
    return await client.receive_json()


async def test_settings_never_include_password(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """The frontend learns whether a password is set, never the password."""
    response = await _call(hass, hass_ws_client, type="smart_panel/settings")
    assert response["result"] == {
        "wifi_ssid": "Home",
        "wifi_password_set": True,
        "wifi_security": "WPA",
        "wifi_hidden": False,
        "ha_url": HA_URL,
        "ha_url_default": HA_URL,
    }
    assert "secret-password" not in str(response)


@pytest.mark.parametrize(
    ("params", "errors"),
    [
        (
            {
                "wifi_ssid": "",
                "wifi_security": "WPA",
                "wifi_hidden": False,
                "ha_url": " ",
            },
            {"wifi_ssid": "required", "ha_url": "required"},
        ),
        (
            {
                "wifi_ssid": "Ø" * 17,
                "wifi_password": "",
                "wifi_security": "WEP",
                "wifi_hidden": False,
                "ha_url": "ha.local:8123",
            },
            {
                "wifi_ssid": "too_long",
                "wifi_password": "password_required",
                "ha_url": "invalid_url",
            },
        ),
        (
            {
                "wifi_ssid": "Home",
                "wifi_password": "x" * 65,
                "wifi_security": "WPA",
                "wifi_hidden": False,
                "ha_url": "http://a,b:8123",
            },
            {"wifi_password": "too_long", "ha_url": "invalid_url"},
        ),
    ],
)
async def test_settings_update_errors(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    params: dict[str, Any],
    errors: dict[str, str],
) -> None:
    """Invalid settings come back as field errors and nothing is saved."""
    before = dict(setup_integration.options)
    response = await _call(
        hass, hass_ws_client, type="smart_panel/settings/update", **params
    )
    assert response["result"] == {"errors": errors}
    assert dict(setup_integration.options) == before


async def test_settings_update_saves_and_keeps_password(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    notify_calls: list[ServiceCall],
) -> None:
    """An omitted password keeps the saved one; a new URL relinks the panels."""
    notify_calls.clear()
    response = await _call(
        hass,
        hass_ws_client,
        type="smart_panel/settings/update",
        wifi_ssid="Home 5G",
        wifi_security="WPA",
        wifi_hidden=True,
        ha_url="https://ha.example/",
    )
    assert response["result"] == {
        "settings": {
            "wifi_ssid": "Home 5G",
            "wifi_password_set": True,
            "wifi_security": "WPA",
            "wifi_hidden": True,
            "ha_url": "https://ha.example",
            "ha_url_default": HA_URL,
        }
    }
    assert setup_integration.options["wifi_password"] == "secret-password"

    await hass.async_block_till_done()
    assert [call.data["data"]["intent_extras"] for call in notify_calls] == [
        f"ref:{KITCHEN_REF}:String,url:https://ha.example/api/webhook/{WEBHOOK_ID}:String"
    ]


async def test_qr_not_ready_lists_missing_settings(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """No QR code until the network name and password are set."""
    hass.config_entries.async_update_entry(
        setup_integration,
        options=dict(setup_integration.options)
        | {"wifi_ssid": "", "wifi_password": ""},
    )
    response = await _call(hass, hass_ws_client, type="smart_panel/qr")
    assert response["result"] == {
        "ready": False,
        "svg": None,
        "missing": ["wifi_ssid", "wifi_password"],
    }

    hass.config_entries.async_update_entry(
        setup_integration,
        options=dict(setup_integration.options)
        | {"wifi_ssid": "Cafe", "wifi_security": "NONE"},
    )
    response = await _call(hass, hass_ws_client, type="smart_panel/qr")
    assert response["result"]["ready"] is True
    assert response["result"]["missing"] == []
    svg = response["result"]["svg"]
    assert svg.startswith("<svg")
    assert 'xmlns="http://www.w3.org/2000/svg"' in svg


def test_provisioning_payload() -> None:
    """Same keys as make-qr.sh plus the Home Assistant URL; hidden only when hidden."""
    options = {
        "wifi_ssid": "Home",
        "wifi_password": "secret-password",
        "wifi_security": "WPA",
        "wifi_hidden": False,
        "ha_url": HA_URL,
    }
    payload = provisioning_payload(options)
    assert payload == {
        f"{EXTRA}PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": (
            "dk.yepzdk.hapanel/.AdminReceiver"
        ),
        f"{EXTRA}PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": (
            "https://github.com/yepzdk/ha-panel-dpc/releases/latest/download/ha-panel-dpc.apk"
        ),
        f"{EXTRA}PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": (
            "SwV7wTh3X3aDzEzDhGEJ-CY1XjJcEFQ2RGMM2CV0RxE"
        ),
        f"{EXTRA}PROVISIONING_WIFI_SSID": "Home",
        f"{EXTRA}PROVISIONING_WIFI_PASSWORD": "secret-password",
        f"{EXTRA}PROVISIONING_WIFI_SECURITY_TYPE": "WPA",
        f"{EXTRA}PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": False,
        f"{EXTRA}PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
            "ha_apk_url": (
                "https://github.com/home-assistant/android/releases/latest/download/"
                "app-minimal-release.apk"
            ),
            "ha_url": HA_URL,
        },
    }

    hidden = provisioning_payload(options | {"wifi_hidden": True})
    assert hidden[f"{EXTRA}PROVISIONING_WIFI_HIDDEN"] is True


async def test_candidates(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
) -> None:
    """Registrations not yet added, likely panels first."""
    response = await _call(hass, hass_ws_client, type="smart_panel/candidates")
    assert response["result"] == {
        "candidates": [
            {
                "mobile_app_entry_id": mobile_app_entries["hall"].entry_id,
                "name": "smart-panel-hall",
                "app_version": "2026.8.4-minimal",
                "model": "AC2003",
                "likely_panel": True,
            },
            {
                "mobile_app_entry_id": mobile_app_entries["phone"].entry_id,
                "name": "Anna's phone",
                "app_version": "2026.8.4-full",
                "model": "Pixel 9",
                "likely_panel": False,
            },
        ]
    }


async def test_add_and_remove_panel(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
    notify_calls: list[ServiceCall],
) -> None:
    """Adding links the panel and creates its entities; removing unlinks it."""
    client = await hass_ws_client(hass)
    notify_calls.clear()

    await client.send_json_auto_id(
        {
            "type": "smart_panel/panels/add",
            "mobile_app_entry_id": mobile_app_entries["hall"].entry_id,
        }
    )
    response = await client.receive_json()
    panel_id = response["result"]["panel_id"]
    await hass.async_block_till_done()

    assert panel_id in setup_integration.subentries
    assert hass.states.get("switch.smart_panel_hall_screen") is not None
    assert len(notify_calls) == 1
    assert notify_calls[0].data["target"] == ["webhook-hall-0002"]
    assert notify_calls[0].data["data"] == {
        "intent_package_name": "dk.yepzdk.hapanel",
        "intent_action": "dk.yepzdk.hapanel.LINK",
        "intent_extras": (
            f"ref:hall-0002:String,url:{HA_URL}/api/webhook/{WEBHOOK_ID}:String"
        ),
    }

    # Already added: no longer a candidate.
    await client.send_json_auto_id(
        {
            "type": "smart_panel/panels/add",
            "mobile_app_entry_id": mobile_app_entries["hall"].entry_id,
        }
    )
    response = await client.receive_json()
    assert response["error"]["code"] == "not_found"

    notify_calls.clear()
    await client.send_json_auto_id(
        {"type": "smart_panel/panels/remove", "panel_id": panel_id}
    )
    response = await client.receive_json()
    assert response["result"] == {}
    await hass.async_block_till_done()

    assert panel_id not in setup_integration.subentries
    assert hass.states.get("switch.smart_panel_hall_screen") is None
    assert [call.data["data"]["intent_action"] for call in notify_calls] == [
        "dk.yepzdk.hapanel.UNLINK"
    ]
    assert notify_calls[0].data["target"] == ["webhook-hall-0002"]

    await client.send_json_auto_id(
        {"type": "smart_panel/panels/remove", "panel_id": panel_id}
    )
    response = await client.receive_json()
    assert response["error"]["code"] == "not_found"


async def test_panels_subscription(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """Subscribers get the panels at once and again after a report."""
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "smart_panel/panels/subscribe"})
    response = await client.receive_json()
    assert response["success"]

    event = (await client.receive_json())["event"]
    [panel] = event["panels"]
    assert panel["panel_id"] == next(iter(setup_integration.subentries))
    assert panel["name"] == "smart-panel-kitchen"
    assert panel["device_id"]
    assert panel["online"] is False
    assert panel["last_seen"] is None
    assert panel["status"] is None
    assert panel["latest_app_version"] == "0.6.0"
    assert panel["entities"] == {
        "screen": "switch.smart_panel_kitchen_screen",
        "maintenance_mode": "switch.smart_panel_kitchen_maintenance_mode",
        "brightness": "number.smart_panel_kitchen_brightness",
        "auto_brightness": "switch.smart_panel_kitchen_automatic_brightness",
        "reload": "button.smart_panel_kitchen_reload",
        "restart": "button.smart_panel_kitchen_restart",
        "update_ha_app": "button.smart_panel_kitchen_reinstall_home_assistant_app",
        "panel_app": "update.smart_panel_kitchen_panel_app",
        "connectivity": "binary_sensor.smart_panel_kitchen_connectivity",
        "ha_app_version": "sensor.smart_panel_kitchen_home_assistant_app_version",
        "last_seen": "sensor.smart_panel_kitchen_last_seen",
    }

    http = await hass_client_no_auth()
    await http.post(f"/api/webhook/{WEBHOOK_ID}", json=kitchen_report())
    await hass.async_block_till_done()

    event = (await client.receive_json())["event"]
    [panel] = event["panels"]
    assert panel["online"] is True
    assert panel["last_seen"] is not None
    expected_status = kitchen_report()
    del expected_status["ref"]
    assert panel["status"] == expected_status
