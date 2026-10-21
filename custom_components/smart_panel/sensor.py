"""Diagnostic sensors of a panel."""

from datetime import datetime

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import KEY_HA_APP_VERSION, KEY_LAST_SEEN
from .entity import SmartPanelEntity, async_setup_panel_entities
from .models import Panel, SmartPanelConfigEntry

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartPanelConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the sensors."""

    def _create(entry: SmartPanelConfigEntry, panel: Panel) -> list[SensorEntity]:
        return [
            HaAppVersionSensor(entry, panel, KEY_HA_APP_VERSION),
            LastSeenSensor(entry, panel, KEY_LAST_SEEN),
        ]

    async_setup_panel_entities(hass, entry, async_add_entities, _create)


class HaAppVersionSensor(SmartPanelEntity, SensorEntity):
    """Version of the Home Assistant app; unknown when it is not installed."""

    _attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def native_value(self) -> str | None:
        """Return the reported version."""
        assert self.panel.status is not None
        return self.panel.status["ha_app_version"]


class LastSeenSensor(SmartPanelEntity, SensorEntity):
    """Time of the panel's last report."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    # Shows when the last report arrived, also once the panel is offline.
    _requires_online = False

    @property
    def native_value(self) -> datetime | None:
        """Return when the last report arrived."""
        return self.panel.last_seen
