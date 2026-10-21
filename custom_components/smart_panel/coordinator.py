"""Coordinator for the latest DPC release on GitHub."""

from __future__ import annotations

from dataclasses import dataclass
import logging
from typing import TYPE_CHECKING

from aiohttp import ClientError, ClientTimeout

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DOMAIN,
    DPC_LATEST_RELEASE_API,
    DPC_RELEASES_URL,
    LATEST_RELEASE_INTERVAL,
)

if TYPE_CHECKING:
    from .models import SmartPanelConfigEntry

_LOGGER = logging.getLogger(__name__)

REQUEST_TIMEOUT = ClientTimeout(total=10)


@dataclass(frozen=True, slots=True)
class LatestRelease:
    """The latest published DPC release."""

    version: str
    release_url: str


class LatestReleaseCoordinator(DataUpdateCoordinator[LatestRelease]):
    """Look up the latest DPC release every six hours."""

    config_entry: SmartPanelConfigEntry

    def __init__(self, hass: HomeAssistant, entry: SmartPanelConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name="Smart Panel latest release",
            update_interval=LATEST_RELEASE_INTERVAL,
        )

    async def _async_update_data(self) -> LatestRelease:
        """Fetch the latest release from the GitHub API."""
        session = async_get_clientsession(self.hass)
        try:
            async with session.get(
                DPC_LATEST_RELEASE_API,
                headers={"Accept": "application/vnd.github+json"},
                timeout=REQUEST_TIMEOUT,
            ) as response:
                response.raise_for_status()
                body = await response.json()
        except (ClientError, TimeoutError, ValueError) as err:
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="release_lookup_failed",
                translation_placeholders={"error": str(err) or type(err).__name__},
            ) from err

        tag = body.get("tag_name") if isinstance(body, dict) else None
        if not isinstance(tag, str) or not tag.removeprefix("v"):
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="release_lookup_failed",
                translation_placeholders={"error": "no tag_name in the response"},
            )
        release_url = body.get("html_url")
        return LatestRelease(
            version=tag.removeprefix("v"),
            release_url=release_url
            if isinstance(release_url, str)
            else DPC_RELEASES_URL,
        )
