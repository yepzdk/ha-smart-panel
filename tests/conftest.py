"""Fixtures for Smart Panel tests."""

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_mock_service,
)
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)

from custom_components.smart_panel.const import DOMAIN, DPC_LATEST_RELEASE_API
from homeassistant.config_entries import ConfigSubentryData
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.core_config import async_process_ha_core_config
from homeassistant.setup import async_setup_component

pytest_plugins = "pytest_homeassistant_custom_component"

WEBHOOK_ID = "a" * 64
HA_URL = "http://192.168.1.10:8123"
KITCHEN_REF = "kitchen-0001"


def _mobile_app_data(
    device_id: str, device_name: str, app_version: str, model: str
) -> dict[str, Any]:
    return {
        "app_data": {},
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
            data=_mobile_app_data(
                KITCHEN_REF, "smart-panel-kitchen", "2026.8.4-minimal", "AC2003"
            ),
        ),
        "phone": MockConfigEntry(
            domain="mobile_app",
            title="Anna's phone",
            data=_mobile_app_data(
                "phone:42.x", "Anna's phone", "2026.8.4-full", "Pixel 9"
            ),
        ),
        "hall": MockConfigEntry(
            domain="mobile_app",
            title="smart-panel-hall",
            data=_mobile_app_data(
                "hall-0002", "smart-panel-hall", "2026.8.4-minimal", "AC2003"
            ),
        ),
    }
    for entry in entries.values():
        entry.add_to_hass(hass)
    return entries


@pytest.fixture
async def notify_calls(
    hass: HomeAssistant, mobile_app_entries: dict[str, MockConfigEntry]
) -> list[ServiceCall]:
    """Set up mobile_app and replace its notify base service with a recorder."""
    assert await async_setup_component(hass, "mobile_app", {})
    await hass.async_block_till_done()
    return async_mock_service(hass, "notify", "mobile_app")


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
    notify_calls: list[ServiceCall],
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
