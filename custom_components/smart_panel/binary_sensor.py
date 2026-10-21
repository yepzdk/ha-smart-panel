"""Connectivity of a panel."""

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import KEY_CONNECTIVITY
from .entity import SmartPanelEntity, async_setup_panel_entities
from .models import Panel, SmartPanelConfigEntry

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartPanelConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the connectivity sensor."""

    def _create(entry: SmartPanelConfigEntry, panel: Panel) -> list[BinarySensorEntity]:
        return [ConnectivitySensor(entry, panel, KEY_CONNECTIVITY)]

    async_setup_panel_entities(hass, entry, async_add_entities, _create)


class ConnectivitySensor(SmartPanelEntity, BinarySensorEntity):
    """On while the panel's last report is younger than 35 minutes."""

    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    # A panel that never reported is offline, which is a known state.
    _requires_report = False

    @property
    def is_on(self) -> bool:
        """Return whether the panel is online."""
        return self.panel.online
