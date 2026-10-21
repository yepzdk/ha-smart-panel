"""The Smart Panel integration: provision and manage Android wall panels."""

from homeassistant.components import webhook
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.typing import ConfigType

from .const import CONF_HA_URL, CONF_WEBHOOK_ID, DOMAIN, SIGNAL_PANELS_CHANGED
from .coordinator import LatestReleaseCoordinator
from .models import SmartPanelConfigEntry, SmartPanelData
from .panels import (
    async_cancel_timers,
    async_create_panels,
    async_link_all,
    async_start_link_retry,
    async_sync_panels,
    async_unlink_all,
)
from .reports import make_webhook_handler
from .services import async_setup_services
from .sidebar import (
    async_register_sidebar_panel,
    async_register_static_path,
    async_remove_sidebar_panel,
)
from .websocket import async_register_websocket_commands

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.NUMBER,
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.UPDATE,
]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the actions, WebSocket API and panel files."""
    async_setup_services(hass)
    async_register_websocket_commands(hass)
    await async_register_static_path(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: SmartPanelConfigEntry) -> bool:
    """Set up Smart Panel from a config entry."""
    coordinator = LatestReleaseCoordinator(hass, entry)
    entry.runtime_data = SmartPanelData(
        coordinator=coordinator,
        panels=async_create_panels(hass, entry),
        linked_ha_url=entry.options[CONF_HA_URL],
    )
    entry.async_on_unload(lambda: async_cancel_timers(entry))

    # GitHub being unreachable must not keep the panels from working, so a
    # failed lookup only leaves the latest version unknown until the next try.
    await coordinator.async_refresh()

    @callback
    def _async_release_updated() -> None:
        async_dispatcher_send(hass, SIGNAL_PANELS_CHANGED)

    entry.async_on_unload(coordinator.async_add_listener(_async_release_updated))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    webhook_id: str = entry.data[CONF_WEBHOOK_ID]
    webhook.async_register(
        hass,
        DOMAIN,
        "Smart Panel",
        webhook_id,
        make_webhook_handler(entry),
        local_only=True,
        allowed_methods=["POST"],
    )
    entry.async_on_unload(lambda: webhook.async_unregister(hass, webhook_id))

    await async_register_sidebar_panel(hass)
    entry.async_on_unload(lambda: async_remove_sidebar_panel(hass))

    entry.async_on_unload(entry.add_update_listener(async_sync_panels))
    entry.async_create_background_task(
        hass, async_link_all(hass, entry), "smart_panel link panels"
    )
    async_start_link_retry(hass, entry)
    async_dispatcher_send(hass, SIGNAL_PANELS_CHANGED)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: SmartPanelConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: SmartPanelConfigEntry) -> None:
    """Tell every panel to stop reporting when the integration is removed."""
    await async_unlink_all(hass, entry)
