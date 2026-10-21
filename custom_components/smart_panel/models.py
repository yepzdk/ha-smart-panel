"""Runtime data for the Smart Panel integration."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.core import CALLBACK_TYPE
from homeassistant.util import dt as dt_util

from .const import CONF_MOBILE_APP_ENTRY_ID, CONF_REF, ONLINE_TIMEOUT

if TYPE_CHECKING:
    from .coordinator import LatestReleaseCoordinator

type SmartPanelConfigEntry = ConfigEntry[SmartPanelData]


@dataclass
class Panel:
    """One panel: its subentry and the last report it sent."""

    subentry_id: str
    ref: str
    mobile_app_entry_id: str
    title: str
    status: dict[str, Any] | None = None
    last_seen: datetime | None = None
    cancel_offline_timer: CALLBACK_TYPE | None = field(default=None, repr=False)
    # A LINK retry is on its way; the next retry skips the panel until it ends.
    link_retry_in_flight: bool = field(default=False, repr=False)

    @classmethod
    def from_subentry(cls, subentry: ConfigSubentry) -> Panel:
        """Create the runtime panel for a panel subentry."""
        return cls(
            subentry_id=subentry.subentry_id,
            ref=subentry.data[CONF_REF],
            mobile_app_entry_id=subentry.data[CONF_MOBILE_APP_ENTRY_ID],
            title=subentry.title,
        )

    @property
    def online(self) -> bool:
        """Return whether the last report is younger than the online timeout."""
        return (
            self.last_seen is not None
            and dt_util.utcnow() - self.last_seen < ONLINE_TIMEOUT
        )


@dataclass
class SmartPanelData:
    """Data held by a loaded config entry."""

    coordinator: LatestReleaseCoordinator
    panels: dict[str, Panel]
    # The Home Assistant URL the panels were last linked with. A changed URL
    # means every panel needs a new status URL.
    linked_ha_url: str

    def panel_by_ref(self, ref: str) -> Panel | None:
        """Return the panel with the given ref."""
        for panel in self.panels.values():
            if panel.ref == ref:
                return panel
        return None
