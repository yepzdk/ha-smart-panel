"""Tests for setting up and removing the integration."""

from datetime import timedelta
from http import HTTPStatus

from freezegun.api import FrozenDateTimeFactory
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.smart_panel.const import DPC_LATEST_RELEASE_API
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant

from .conftest import (
    HA_URL,
    KEEP_CONNECTED,
    KITCHEN_REF,
    WEBHOOK_ID,
    PushRecorder,
    kitchen_report,
)


async def test_setup_links_every_panel(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
) -> None:
    """Every panel gets its ref and status URL again when the integration starts."""
    assert setup_integration.state is ConfigEntryState.LOADED
    link, keep_connected = pushes
    assert link.token == f"token-{KITCHEN_REF}"
    assert link.message == "command_broadcast_intent"
    assert link.data == {
        "intent_package_name": "dk.yepzdk.hapanel",
        "intent_action": "dk.yepzdk.hapanel.LINK",
        "intent_extras": (
            f"ref:{KITCHEN_REF}:String,url:{HA_URL}/api/webhook/{WEBHOOK_ID}:String"
        ),
    }
    # The app is told to keep its websocket open, or commands stop arriving
    # once the screen overlay hides it.
    assert keep_connected.token == f"token-{KITCHEN_REF}"
    assert keep_connected.webhook_id == f"webhook-{KITCHEN_REF}"
    assert keep_connected.message == "command_persistent_connection"
    assert keep_connected.data == {"persistent": "always"}


async def test_setup_without_github(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
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
    pushes: PushRecorder,
) -> None:
    """Removing the integration tells every panel to stop reporting."""
    pushes.clear()
    assert await hass.config_entries.async_unload(setup_integration.entry_id)
    await hass.async_block_till_done()
    assert setup_integration.state is ConfigEntryState.NOT_LOADED
    assert len(pushes) == 0

    await hass.config_entries.async_remove(setup_integration.entry_id)
    await hass.async_block_till_done()
    assert [push.data["intent_action"] for push in pushes] == [
        "dk.yepzdk.hapanel.UNLINK"
    ]


async def test_link_retried_while_panel_is_not_online(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    setup_integration: MockConfigEntry,
    pushes: PushRecorder,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A panel that never reported gets LINK every 5 minutes; an online one does not."""
    pushes.clear()
    freezer.tick(timedelta(minutes=5))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert [(push.token, push.command) for push in pushes] == [
        (f"token-{KITCHEN_REF}", "LINK"),
        (f"token-{KITCHEN_REF}", KEEP_CONNECTED),
    ]

    client = await hass_client_no_auth()
    await client.post(f"/api/webhook/{WEBHOOK_ID}", json=kitchen_report(event="link"))
    await hass.async_block_till_done()

    pushes.clear()
    freezer.tick(timedelta(minutes=5))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert len(pushes) == 0

    # Without a report for 35 minutes the panel is offline and linked again.
    freezer.tick(timedelta(minutes=30, seconds=1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert [push.command for push in pushes] == ["LINK", KEEP_CONNECTED]

    # Unloading stops the retries.
    assert await hass.config_entries.async_unload(setup_integration.entry_id)
    pushes.clear()
    freezer.tick(timedelta(minutes=5))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert len(pushes) == 0
