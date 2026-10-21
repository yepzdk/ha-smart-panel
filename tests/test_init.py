"""Tests for setting up and removing the integration."""

from http import HTTPStatus

from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)

from custom_components.smart_panel.const import DPC_LATEST_RELEASE_API
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, ServiceCall

from .conftest import HA_URL, KITCHEN_REF, WEBHOOK_ID


async def test_setup_links_every_panel(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    notify_calls: list[ServiceCall],
) -> None:
    """Every panel gets its ref and status URL again when the integration starts."""
    assert setup_integration.state is ConfigEntryState.LOADED
    assert [call.data for call in notify_calls] == [
        {
            "message": "command_broadcast_intent",
            "target": [f"webhook-{KITCHEN_REF}"],
            "data": {
                "intent_package_name": "dk.yepzdk.hapanel",
                "intent_action": "dk.yepzdk.hapanel.LINK",
                "intent_extras": (
                    f"ref:{KITCHEN_REF}:String,"
                    f"url:{HA_URL}/api/webhook/{WEBHOOK_ID}:String"
                ),
            },
        }
    ]


async def test_setup_without_github(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    notify_calls: list[ServiceCall],
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """Panels work when GitHub cannot be reached; only the latest version is unknown."""
    aioclient_mock.get(DPC_LATEST_RELEASE_API, status=HTTPStatus.FORBIDDEN)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()

    assert config_entry.state is ConfigEntryState.LOADED
    assert config_entry.runtime_data.coordinator.data is None


async def test_unload_and_remove_unlinks_panels(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    notify_calls: list[ServiceCall],
) -> None:
    """Removing the integration tells every panel to stop reporting."""
    notify_calls.clear()
    assert await hass.config_entries.async_unload(setup_integration.entry_id)
    await hass.async_block_till_done()
    assert setup_integration.state is ConfigEntryState.NOT_LOADED
    assert notify_calls == []

    await hass.config_entries.async_remove(setup_integration.entry_id)
    await hass.async_block_till_done()
    assert [call.data["data"]["intent_action"] for call in notify_calls] == [
        "dk.yepzdk.hapanel.UNLINK"
    ]
