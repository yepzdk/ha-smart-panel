"""The admin sidebar panel: static files and panel registration."""

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback
from homeassistant.loader import async_get_integration

from .const import (
    DOMAIN,
    FRONTEND_BUNDLE,
    FRONTEND_DIR,
    PANEL_COMPONENT_NAME,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    STATIC_URL_PATH,
)

_LOGGER = logging.getLogger(__name__)

FRONTEND_PATH = Path(__file__).parent / FRONTEND_DIR


async def async_register_static_path(hass: HomeAssistant) -> None:
    """Serve the panel bundle. Static paths cannot be removed, so once per run."""
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL_PATH, str(FRONTEND_PATH), cache_headers=False)]
    )


async def async_register_sidebar_panel(hass: HomeAssistant) -> None:
    """Add the admin-only sidebar panel.

    The module URL carries the integration version and the bundle's
    modification time so browsers load a new bundle after an update.
    """
    integration = await async_get_integration(hass, DOMAIN)
    bundle = FRONTEND_PATH / FRONTEND_BUNDLE
    try:
        mtime = int((await hass.async_add_executor_job(bundle.stat)).st_mtime)
    except FileNotFoundError:
        _LOGGER.error(
            "The panel bundle %s is missing, so the Smart Panels sidebar item is "
            "not added; reinstall the integration",
            bundle,
        )
        return

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_COMPONENT_NAME,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=(
            f"{STATIC_URL_PATH}/{FRONTEND_BUNDLE}?v={integration.version}&m={mtime}"
        ),
        require_admin=True,
        config={},
    )


@callback
def async_remove_sidebar_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar panel."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
