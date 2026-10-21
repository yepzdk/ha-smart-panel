"""Base entity for Smart Panel entities."""

from collections.abc import Callable, Iterable

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN, signal_panel_added, signal_panel_updated
from .models import Panel, SmartPanelConfigEntry


class SmartPanelEntity(Entity):
    """An entity of one panel, updated when the panel reports."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    # State entities have nothing to show before the panel's first report.
    _requires_report = True

    def __init__(self, entry: SmartPanelConfigEntry, panel: Panel, key: str) -> None:
        """Initialize the entity."""
        self.entry = entry
        self.panel = panel
        self._attr_translation_key = key
        self._attr_unique_id = f"{panel.ref}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, panel.ref)}, name=panel.title
        )

    @property
    def available(self) -> bool:
        """Return whether the entity has a state to show."""
        return not self._requires_report or self.panel.status is not None

    async def async_added_to_hass(self) -> None:
        """Follow the panel's reports and online state."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                signal_panel_updated(self.panel.subentry_id),
                self.async_write_ha_state,
            )
        )


@callback
def async_setup_panel_entities(
    hass: HomeAssistant,
    entry: SmartPanelConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
    create_entities: Callable[[SmartPanelConfigEntry, Panel], Iterable[Entity]],
) -> None:
    """Add a platform's entities for every panel, now and when panels are added."""

    @callback
    def _async_add_panel(subentry_id: str) -> None:
        async_add_entities(
            create_entities(entry, entry.runtime_data.panels[subentry_id]),
            config_subentry_id=subentry_id,
        )

    for subentry_id in entry.runtime_data.panels:
        _async_add_panel(subentry_id)

    entry.async_on_unload(
        async_dispatcher_connect(
            hass, signal_panel_added(entry.entry_id), _async_add_panel
        )
    )
