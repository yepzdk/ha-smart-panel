"""Buttons of a panel: reload, restart and reinstall the Home Assistant app."""

from homeassistant.components.button import ButtonDeviceClass, ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .commands import (
    COMMAND_RELOAD,
    COMMAND_RESTART,
    COMMAND_UPDATE_HA_APP,
    async_run_command,
)
from .const import KEY_RELOAD, KEY_RESTART, KEY_UPDATE_HA_APP
from .entity import SmartPanelEntity, async_setup_panel_entities
from .models import Panel, SmartPanelConfigEntry

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartPanelConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the buttons."""

    def _create(entry: SmartPanelConfigEntry, panel: Panel) -> list[ButtonEntity]:
        return [
            PanelCommandButton(entry, panel, KEY_RELOAD, COMMAND_RELOAD),
            PanelCommandButton(
                entry, panel, KEY_RESTART, COMMAND_RESTART, ButtonDeviceClass.RESTART
            ),
            PanelCommandButton(entry, panel, KEY_UPDATE_HA_APP, COMMAND_UPDATE_HA_APP),
        ]

    async_setup_panel_entities(hass, entry, async_add_entities, _create)


class PanelCommandButton(SmartPanelEntity, ButtonEntity):
    """A button that sends one command to the panel."""

    # Commands go through the Companion app and do not need a report first.
    _requires_report = False

    def __init__(
        self,
        entry: SmartPanelConfigEntry,
        panel: Panel,
        key: str,
        command: str,
        device_class: ButtonDeviceClass | None = None,
    ) -> None:
        """Initialize the button."""
        super().__init__(entry, panel, key)
        self._command = command
        self._attr_device_class = device_class

    async def async_press(self) -> None:
        """Send the command."""
        await async_run_command(self.hass, self.panel, self._command)
