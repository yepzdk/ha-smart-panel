"""Update entity for the panel app (the DPC)."""

from typing import Any

from homeassistant.components.update import UpdateEntity, UpdateEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .commands import COMMAND_UPDATE_PANEL_APP, async_run_command
from .const import KEY_PANEL_APP
from .coordinator import LatestReleaseCoordinator
from .entity import SmartPanelEntity, async_setup_panel_entities
from .models import Panel, SmartPanelConfigEntry

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: SmartPanelConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the panel app update entity."""

    def _create(entry: SmartPanelConfigEntry, panel: Panel) -> list[UpdateEntity]:
        return [PanelAppUpdate(entry, panel, KEY_PANEL_APP)]

    async_setup_panel_entities(hass, entry, async_add_entities, _create)


class PanelAppUpdate(
    SmartPanelEntity, CoordinatorEntity[LatestReleaseCoordinator], UpdateEntity
):
    """Installed version from the panel's report, latest version from GitHub."""

    _attr_supported_features = UpdateEntityFeature.INSTALL

    def __init__(self, entry: SmartPanelConfigEntry, panel: Panel, key: str) -> None:
        """Initialize the update entity."""
        SmartPanelEntity.__init__(self, entry, panel, key)
        CoordinatorEntity.__init__(self, entry.runtime_data.coordinator)

    @property
    def available(self) -> bool:
        """Return whether the panel is online; a failed lookup leaves latest unknown."""
        return self.panel.online

    @property
    def installed_version(self) -> str | None:
        """Return the version the panel reported."""
        assert self.panel.status is not None
        return self.panel.status["app_version"]

    @property
    def latest_version(self) -> str | None:
        """Return the latest released version, unknown when GitHub was not reached."""
        if self.coordinator.data is None:
            return None
        return self.coordinator.data.version

    @property
    def release_url(self) -> str | None:
        """Return the release page of the latest version."""
        if self.coordinator.data is None:
            return None
        return self.coordinator.data.release_url

    async def async_install(
        self, version: str | None, backup: bool, **kwargs: Any
    ) -> None:
        """Let the panel download and install the latest release."""
        await async_run_command(self.hass, self.panel, COMMAND_UPDATE_PANEL_APP)
