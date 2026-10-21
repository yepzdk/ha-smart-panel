"""Brightness of a panel."""

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .commands import async_set_brightness
from .const import KEY_BRIGHTNESS
from .entity import SmartPanelEntity, async_setup_panel_entities
from .models import Panel, SmartPanelConfigEntry

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartPanelConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the brightness number."""

    def _create(entry: SmartPanelConfigEntry, panel: Panel) -> list[NumberEntity]:
        return [BrightnessNumber(entry, panel, KEY_BRIGHTNESS)]

    async_setup_panel_entities(hass, entry, async_add_entities, _create)


class BrightnessNumber(SmartPanelEntity, NumberEntity):
    """Screen brightness of 0-255; setting it switches automatic brightness off."""

    _attr_native_min_value = 0
    _attr_native_max_value = 255
    _attr_native_step = 1
    _attr_mode = NumberMode.SLIDER

    @property
    def native_value(self) -> int | None:
        """Return the reported brightness; unknown when the panel has none.

        Reported as is: OEMs with a wider scale report values above 255.
        """
        assert self.panel.status is not None
        return self.panel.status["brightness"]

    async def async_set_native_value(self, value: float) -> None:
        """Set a manual brightness."""
        await async_set_brightness(self.hass, self.panel, round(value))
