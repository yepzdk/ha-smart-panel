"""The panels' last reports, kept across Home Assistant restarts."""

from collections.abc import Mapping
import logging
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import CONF_REF, DOMAIN
from .models import Panel, StoredReport
from .panels import REPORT_SCHEMA

_LOGGER = logging.getLogger(__name__)

STORAGE_KEY = f"{DOMAIN}.reports"
STORAGE_VERSION = 1
# Seconds to wait before writing, so a burst of reports is written once.
SAVE_DELAY = 10

STATUS = "status"
RECEIVED = "received"

type StoredData = dict[str, dict[str, Any]]


class ReportStore:
    """The last report and its receive time of every panel, keyed by ref."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the store."""
        self._store: Store[StoredData] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._save_pending = False
        # The stored data holds reports that are not restored, so the next
        # write cleans it up.
        self.needs_rewrite = False

    async def async_load(self) -> dict[str, StoredReport]:
        """Return the stored reports by ref.

        Data that cannot be read is ignored with a warning; the panels then
        start without a report, as they did before reports were stored.
        """
        try:
            data = await self._store.async_load()
        except (HomeAssistantError, NotImplementedError, KeyError, TypeError) as err:
            _LOGGER.warning("Ignoring the stored panel reports: %s", err)
            self.needs_rewrite = True
            return {}
        if data is None:
            return {}
        if not isinstance(data, dict):
            _LOGGER.warning("Ignoring the stored panel reports: not a mapping")
            self.needs_rewrite = True
            return {}

        reports: dict[str, StoredReport] = {}
        for ref, item in data.items():
            try:
                reports[ref] = _parse_report(ref, item)
            except (vol.Invalid, ValueError, TypeError, KeyError) as err:
                _LOGGER.warning("Ignoring the stored report of panel %s: %s", ref, err)
                self.needs_rewrite = True
        return reports

    @callback
    def async_schedule_save(self, panels: Mapping[str, Panel]) -> None:
        """Write the panels' reports after a short delay."""
        self._save_pending = True

        def _data() -> StoredData:
            self._save_pending = False
            return _serialize(panels)

        self._store.async_delay_save(_data, SAVE_DELAY)

    async def async_flush(self, panels: Mapping[str, Panel]) -> None:
        """Write a pending save now, before the entry unloads."""
        if self._save_pending:
            self._save_pending = False
            await self._store.async_save(_serialize(panels))

    async def async_remove(self) -> None:
        """Delete every stored report."""
        self._save_pending = False
        await self._store.async_remove()


def _parse_report(ref: str, item: Any) -> StoredReport:
    """Return a stored report after checking it like a received one."""
    status = REPORT_SCHEMA({**item[STATUS], CONF_REF: ref})
    del status[CONF_REF]
    received = dt_util.parse_datetime(item[RECEIVED])
    if received is None or received.tzinfo is None:
        raise ValueError(f"invalid receive time {item[RECEIVED]!r}")
    return StoredReport(status=status, received=received)


def _serialize(panels: Mapping[str, Panel]) -> StoredData:
    """Return the reports of the panels that have reported, by ref."""
    return {
        panel.ref: {STATUS: panel.status, RECEIVED: panel.last_seen.isoformat()}
        for panel in panels.values()
        if panel.status is not None and panel.last_seen is not None
    }
