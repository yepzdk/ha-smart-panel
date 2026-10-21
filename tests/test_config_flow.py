"""Tests for the config, options and panel subentry flows."""

from typing import Any
from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.smart_panel.const import DOMAIN
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from .conftest import HA_URL, KITCHEN_REF, WEBHOOK_ID, PushRecorder


async def test_user_flow_creates_entry_with_defaults(hass: HomeAssistant) -> None:
    """The entry gets a fresh webhook id and empty Wi-Fi settings."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM

    with patch("custom_components.smart_panel.async_setup_entry", return_value=True):
        result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Smart Panel"
    webhook_id = result["data"]["webhook_id"]
    assert len(webhook_id) == 64
    int(webhook_id, 16)
    assert result["options"] == {
        "wifi_ssid": "",
        "wifi_password": "",
        "wifi_security": "WPA",
        "wifi_hidden": False,
        "ha_url": HA_URL,
    }


async def test_only_one_entry(hass: HomeAssistant) -> None:
    """A second setup is refused."""
    MockConfigEntry(domain=DOMAIN, data={"webhook_id": WEBHOOK_ID}).add_to_hass(hass)
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


@pytest.mark.parametrize(
    ("user_input", "errors"),
    [
        (
            {
                "wifi_ssid": " ",
                "wifi_security": "WPA",
                "wifi_hidden": False,
                "ha_url": "",
            },
            {"wifi_ssid": "required", "ha_url": "required"},
        ),
        (
            {
                "wifi_ssid": "x" * 33,
                "wifi_security": "WPA",
                "wifi_hidden": False,
                "ha_url": "ftp://ha.local",
            },
            {"wifi_ssid": "too_long", "ha_url": "invalid_url"},
        ),
        (
            {
                "wifi_ssid": "Home",
                "wifi_password": "p" * 65,
                "wifi_security": "WPA",
                "wifi_hidden": False,
                "ha_url": "http://ha.local:8123/?x=1",
            },
            {"wifi_password": "too_long", "ha_url": "invalid_url"},
        ),
    ],
)
async def test_options_flow_rejects_invalid_settings(
    hass: HomeAssistant, user_input: dict[str, Any], errors: dict[str, str]
) -> None:
    """Invalid settings are reported per field and not saved."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={"webhook_id": WEBHOOK_ID},
        options={
            "wifi_ssid": "Old",
            "wifi_password": "old-password",
            "wifi_security": "WPA",
            "wifi_hidden": False,
            "ha_url": HA_URL,
        },
    )
    entry.add_to_hass(hass)
    old_options = dict(entry.options)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], user_input
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == errors
    assert dict(entry.options) == old_options


async def test_options_flow_requires_password_unless_open(hass: HomeAssistant) -> None:
    """A secured network needs a password; an open network does not."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={"webhook_id": WEBHOOK_ID},
        options={
            "wifi_ssid": "",
            "wifi_password": "",
            "wifi_security": "WPA",
            "wifi_hidden": False,
            "ha_url": HA_URL,
        },
    )
    entry.add_to_hass(hass)
    user_input = {
        "wifi_ssid": "Cafe",
        "wifi_security": "WPA",
        "wifi_hidden": True,
        "ha_url": "http://ha.local:8123/",
    }

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], user_input
    )
    assert result["errors"] == {"wifi_password": "password_required"}

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], user_input | {"wifi_security": "NONE"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert dict(entry.options) == {
        "wifi_ssid": "Cafe",
        "wifi_password": "",
        "wifi_security": "NONE",
        "wifi_hidden": True,
        "ha_url": "http://ha.local:8123",
    }


async def test_options_flow_empty_password_keeps_saved_one(hass: HomeAssistant) -> None:
    """The password field is never prefilled, so leaving it empty keeps it."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={"webhook_id": WEBHOOK_ID},
        options={
            "wifi_ssid": "Home",
            "wifi_password": "old-password",
            "wifi_security": "WPA",
            "wifi_hidden": False,
            "ha_url": HA_URL,
        },
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    schema_keys = {str(key): key for key in result["data_schema"].schema}
    assert "suggested_value" not in (schema_keys["wifi_password"].description or {})

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "wifi_ssid": "Home 2",
            "wifi_password": "",
            "wifi_security": "WPA",
            "wifi_hidden": False,
            "ha_url": HA_URL,
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["wifi_ssid"] == "Home 2"
    assert entry.options["wifi_password"] == "old-password"


async def test_panel_subentry_flow_lists_unadded_registrations(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
    pushes: PushRecorder,
) -> None:
    """Minimal-app registrations come first and are marked; added ones are left out."""
    entry = setup_integration
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, "panel"), context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM

    selector = result["data_schema"].schema["mobile_app_entry_id"]
    options = selector.config["options"]
    assert [option["value"] for option in options] == [
        mobile_app_entries["hall"].entry_id,
        mobile_app_entries["phone"].entry_id,
    ]
    assert (
        options[0]["label"]
        == "smart-panel-hall (likely panel, AC2003, 2026.8.4-minimal)"
    )
    assert options[1]["label"] == "Anna's phone (Pixel 9, 2026.8.4-full)"

    pushes.clear()
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"mobile_app_entry_id": mobile_app_entries["hall"].entry_id}
    )
    await hass.async_block_till_done()
    assert result["type"] is FlowResultType.CREATE_ENTRY

    subentry = next(
        sub for sub in entry.subentries.values() if sub.title == "smart-panel-hall"
    )
    assert subentry.unique_id == "hall-0002"
    assert dict(subentry.data) == {
        "ref": "hall-0002",
        "mobile_app_entry_id": mobile_app_entries["hall"].entry_id,
    }
    # The new panel is linked and gets its entities.
    assert [push.data["intent_action"] for push in pushes] == ["dk.yepzdk.hapanel.LINK"]
    assert pushes[0].token == "token-hall-0002"
    assert hass.states.get("switch.smart_panel_hall_screen") is not None


async def test_panel_subentry_flow_sanitizes_ref(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
) -> None:
    """A device id with characters outside the ref pattern becomes a valid ref."""
    entry = setup_integration
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, "panel"), context={"source": config_entries.SOURCE_USER}
    )
    await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"mobile_app_entry_id": mobile_app_entries["phone"].entry_id}
    )
    await hass.async_block_till_done()
    subentry = next(
        sub for sub in entry.subentries.values() if sub.title == "Anna's phone"
    )
    assert subentry.data["ref"] == subentry.unique_id == "phone_42_x"


async def test_panel_subentry_flow_aborts_without_candidates(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    mobile_app_entries: dict[str, MockConfigEntry],
) -> None:
    """With every registration added there is nothing to pick."""
    entry = setup_integration
    for name in ("hall", "phone"):
        result = await hass.config_entries.subentries.async_init(
            (entry.entry_id, "panel"), context={"source": config_entries.SOURCE_USER}
        )
        await hass.config_entries.subentries.async_configure(
            result["flow_id"],
            {"mobile_app_entry_id": mobile_app_entries[name].entry_id},
        )
    await hass.async_block_till_done()

    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, "panel"), context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "no_candidates"
    assert KITCHEN_REF in {sub.unique_id for sub in entry.subentries.values()}
