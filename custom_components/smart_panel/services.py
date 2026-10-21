"""Actions of the Smart Panel integration."""

import voluptuous as vol

from homeassistant.const import ATTR_DEVICE_ID
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv, device_registry as dr

from .commands import (
    COMMAND_FACTORY_RESET,
    FACTORY_RESET_CONFIRMATION,
    async_navigate,
    async_run_command,
)
from .const import DOMAIN
from .models import Panel
from .panels import async_get_loaded_entry

SERVICE_NAVIGATE = "navigate"
SERVICE_FACTORY_RESET = "factory_reset"

ATTR_PATH = "path"
ATTR_CONFIRM = "confirm"

NAVIGATE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_DEVICE_ID): cv.string,
        vol.Optional(ATTR_PATH): cv.string,
    }
)
FACTORY_RESET_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_DEVICE_ID): cv.string,
        vol.Required(ATTR_CONFIRM): cv.boolean,
    }
)


@callback
def _async_get_panel(hass: HomeAssistant, device_id: str) -> Panel:
    """Return the panel for a device id."""
    if (entry := async_get_loaded_entry(hass)) is None:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="not_loaded"
        )
    device = dr.async_get(hass).async_get(device_id)
    if device is not None:
        for domain, ref in device.identifiers:
            if domain == DOMAIN and (panel := entry.runtime_data.panel_by_ref(ref)):
                return panel
    raise ServiceValidationError(
        translation_domain=DOMAIN,
        translation_key="device_not_found",
        translation_placeholders={"device_id": device_id},
    )


async def _async_navigate(call: ServiceCall) -> None:
    """Open Home Assistant on a panel, optionally at a path."""
    panel = _async_get_panel(call.hass, call.data[ATTR_DEVICE_ID])
    await async_navigate(call.hass, panel, call.data.get(ATTR_PATH))


async def _async_factory_reset(call: ServiceCall) -> None:
    """Wipe a panel."""
    if not call.data[ATTR_CONFIRM]:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="factory_reset_not_confirmed"
        )
    panel = _async_get_panel(call.hass, call.data[ATTR_DEVICE_ID])
    await async_run_command(
        call.hass, panel, COMMAND_FACTORY_RESET, confirm=FACTORY_RESET_CONFIRMATION
    )


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    """Register the actions."""
    hass.services.async_register(
        DOMAIN, SERVICE_NAVIGATE, _async_navigate, schema=NAVIGATE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_FACTORY_RESET, _async_factory_reset, schema=FACTORY_RESET_SCHEMA
    )
