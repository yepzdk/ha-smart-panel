"""Switches of a panel: screen, maintenance mode and automatic brightness."""

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .commands import (
    COMMAND_AUTO_BRIGHTNESS,
    COMMAND_MAINTENANCE_OFF,
    COMMAND_MAINTENANCE_ON,
    COMMAND_SCREEN_OFF,
    COMMAND_SCREEN_ON,
    async_run_command,
    async_set_brightness,
)
from .const import DOMAIN, KEY_AUTO_BRIGHTNESS, KEY_MAINTENANCE_MODE, KEY_SCREEN
from .entity import SmartPanelEntity, async_setup_panel_entities
from .models import Panel, SmartPanelConfigEntry

PARALLEL_UPDATES = 0

# The panel takes manual brightness values of 0-255.
MAX_BRIGHTNESS = 255


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartPanelConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the switches."""

    def _create(entry: SmartPanelConfigEntry, panel: Panel) -> list[SwitchEntity]:
        return [
            ScreenSwitch(entry, panel, KEY_SCREEN),
            MaintenanceModeSwitch(entry, panel, KEY_MAINTENANCE_MODE),
            AutoBrightnessSwitch(entry, panel, KEY_AUTO_BRIGHTNESS),
        ]

    async_setup_panel_entities(hass, entry, async_add_entities, _create)


class ScreenSwitch(SmartPanelEntity, SwitchEntity):
    """On when the screen shows Home Assistant, off when the black overlay is up."""

    @property
    def is_on(self) -> bool | None:
        """Return whether the screen is on."""
        assert self.panel.status is not None
        return not self.panel.status["screen_off"]

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Remove the black overlay."""
        await async_run_command(self.hass, self.panel, COMMAND_SCREEN_ON)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Show the black overlay."""
        await async_run_command(self.hass, self.panel, COMMAND_SCREEN_OFF)


class MaintenanceModeSwitch(SmartPanelEntity, SwitchEntity):
    """On when the panel is unpinned for maintenance."""

    _attr_entity_category = EntityCategory.CONFIG

    @property
    def is_on(self) -> bool | None:
        """Return whether maintenance mode is on."""
        assert self.panel.status is not None
        return self.panel.status["maintenance"]

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Unpin the panel and show the status bar."""
        await async_run_command(self.hass, self.panel, COMMAND_MAINTENANCE_ON)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Lock the panel again."""
        await async_run_command(self.hass, self.panel, COMMAND_MAINTENANCE_OFF)


class AutoBrightnessSwitch(SmartPanelEntity, SwitchEntity):
    """On when the light sensor sets the brightness."""

    @property
    def is_on(self) -> bool | None:
        """Return whether automatic brightness is on."""
        assert self.panel.status is not None
        return self.panel.status["brightness_auto"]

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Let the light sensor set the brightness."""
        await async_run_command(self.hass, self.panel, COMMAND_AUTO_BRIGHTNESS)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Keep the current brightness as a manual value."""
        assert self.panel.status is not None
        brightness = self.panel.status["brightness"]
        if brightness is None:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="brightness_unknown"
            )
        # Some OEMs use a wider scale; the panel takes 0-255.
        await async_set_brightness(
            self.hass, self.panel, min(brightness, MAX_BRIGHTNESS)
        )
