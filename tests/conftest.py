"""Fixtures for Smart Panel tests."""

from collections.abc import Iterator
from dataclasses import dataclass
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)

from custom_components.smart_panel.const import DOMAIN, DPC_LATEST_RELEASE_API
from homeassistant.config_entries import ConfigSubentryData
from homeassistant.core import HomeAssistant
from homeassistant.core_config import async_process_ha_core_config
from homeassistant.setup import async_setup_component

pytest_plugins = "pytest_homeassistant_custom_component"

WEBHOOK_ID = "a" * 64
HA_URL = "http://192.168.1.10:8123"
KITCHEN_REF = "kitchen-0001"
# Sent after every successful LINK so the app keeps its websocket connected.
KEEP_CONNECTED = "command_persistent_connection"
# The Companion app's push relay; every registration uses it with its own token.
PUSH_URL = "https://mobile-apps.home-assistant.io/api/sendPushNotification"


def mobile_app_data(
    device_id: str, device_name: str, app_version: str, model: str
) -> dict[str, Any]:
    """Return the data of a mobile_app registration that supports push."""
    return {
        "app_data": {"push_token": f"token-{device_id}", "push_url": PUSH_URL},
        "app_id": "io.homeassistant.companion.android",
        "app_name": "Home Assistant",
        "app_version": app_version,
        "device_id": device_id,
        "device_name": device_name,
        "manufacturer": "OnePlus",
        "model": model,
        "os_name": "Android",
        "os_version": "12",
        "supports_encryption": False,
        "user_id": "user",
        "webhook_id": f"webhook-{device_id}",
    }


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Load the integration from custom_components."""


@pytest.fixture(autouse=True)
async def internal_url(hass: HomeAssistant) -> None:
    """Give Home Assistant the local URL panels use by default."""
    await async_process_ha_core_config(hass, {"internal_url": HA_URL})


@pytest.fixture
def mobile_app_entries(hass: HomeAssistant) -> dict[str, MockConfigEntry]:
    """Add mobile_app registrations: two panels and a phone."""
    entries = {
        "kitchen": MockConfigEntry(
            domain="mobile_app",
            title="smart-panel-kitchen",
            data=mobile_app_data(
                KITCHEN_REF, "smart-panel-kitchen", "2026.8.4-minimal", "AC2003"
            ),
        ),
        "phone": MockConfigEntry(
            domain="mobile_app",
            title="Anna's phone",
            data=mobile_app_data(
                "phone:42.x", "Anna's phone", "2026.8.4-full", "Pixel 9"
            ),
        ),
        "hall": MockConfigEntry(
            domain="mobile_app",
            title="smart-panel-hall",
            data=mobile_app_data(
                "hall-0002", "smart-panel-hall", "2026.8.4-minimal", "AC2003"
            ),
        ),
    }
    for entry in entries.values():
        entry.add_to_hass(hass)
    return entries


@dataclass(frozen=True)
class Push:
    """A notification mobile_app posted to the push relay."""

    token: str
    webhook_id: str
    message: str
    data: dict[str, Any]

    @property
    def command(self) -> str:
        """Return the DPC action of a broadcast intent, else the message."""
        if self.message == "command_broadcast_intent":
            return self.data["intent_action"].removeprefix("dk.yepzdk.hapanel.")
        return self.message


class PushRecorder:
    """The notifications posted to the push relay since the last clear."""

    def __init__(self, mocker: AiohttpClientMocker) -> None:
        """Initialize the recorder."""
        self._mocker = mocker
        self._start = 0

    def clear(self) -> None:
        """Forget the notifications sent so far."""
        self._start = len(self._mocker.mock_calls)

    @property
    def sent(self) -> list[Push]:
        """Return the notifications sent since the last clear."""
        return [
            Push(
                token=body["push_token"],
                webhook_id=body["registration_info"]["webhook_id"],
                message=body["message"],
                data=body["data"],
            )
            for method, url, body, _headers in self._mocker.mock_calls[self._start :]
            if method == "POST" and str(url) == PUSH_URL
        ]

    def __iter__(self) -> Iterator[Push]:
        """Iterate over the notifications sent."""
        return iter(self.sent)

    def __len__(self) -> int:
        """Return how many notifications were sent."""
        return len(self.sent)

    def __getitem__(self, index: int) -> Push:
        """Return one notification."""
        return self.sent[index]


@pytest.fixture
async def pushes(
    hass: HomeAssistant,
    mobile_app_entries: dict[str, MockConfigEntry],
    aioclient_mock: AiohttpClientMocker,
) -> PushRecorder:
    """Set up mobile_app with its real notify services; record what it pushes."""
    aioclient_mock.post(PUSH_URL, json={}, status=201)
    assert await async_setup_component(hass, "mobile_app", {})
    await hass.async_block_till_done()
    return PushRecorder(aioclient_mock)


@pytest.fixture
def mock_github(aioclient_mock: AiohttpClientMocker) -> AiohttpClientMocker:
    """Answer the latest-release lookup with version 0.6.0."""
    aioclient_mock.get(
        DPC_LATEST_RELEASE_API,
        json={
            "tag_name": "v0.6.0",
            "html_url": "https://github.com/yepzdk/ha-panel-dpc/releases/tag/v0.6.0",
        },
    )
    return aioclient_mock


@pytest.fixture
def options() -> dict[str, Any]:
    """Return the entry options."""
    return {
        "wifi_ssid": "Home",
        "wifi_password": "secret-password",
        "wifi_security": "WPA",
        "wifi_hidden": False,
        "ha_url": HA_URL,
    }


@pytest.fixture
def config_entry(
    hass: HomeAssistant,
    mobile_app_entries: dict[str, MockConfigEntry],
    options: dict[str, Any],
) -> MockConfigEntry:
    """Add the Smart Panel entry with the kitchen panel."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Smart Panel",
        data={"webhook_id": WEBHOOK_ID},
        options=options,
        subentries_data=[
            ConfigSubentryData(
                data={
                    "ref": KITCHEN_REF,
                    "mobile_app_entry_id": mobile_app_entries["kitchen"].entry_id,
                },
                subentry_type="panel",
                title="smart-panel-kitchen",
                unique_id=KITCHEN_REF,
            )
        ],
    )
    entry.add_to_hass(hass)
    return entry


@pytest.fixture
async def setup_integration(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    pushes: PushRecorder,
    mock_github: AiohttpClientMocker,
) -> MockConfigEntry:
    """Set up the integration with the kitchen panel."""
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done(wait_background_tasks=True)
    return config_entry


def kitchen_report(**changes: Any) -> dict[str, Any]:
    """Return a status report from the kitchen panel."""
    return {
        "ref": KITCHEN_REF,
        "event": "report",
        "app_version": "0.5.0",
        "app_version_code": 9,
        "ha_app_version": "2026.8.4-minimal",
        "maintenance": False,
        "screen_off": False,
        "brightness": 128,
        "brightness_auto": False,
        "manufacturer": "OnePlus",
        "model": "AC2003",
        "android_version": "12",
        "sdk": 31,
    } | changes
