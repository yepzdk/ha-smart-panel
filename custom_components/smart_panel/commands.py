"""Commands to panels, sent as broadcast intents through the Companion app.

A command goes through mobile_app's `notify` device action, the same path an
automation uses. That action finds the notify target service of exactly this
registration by its webhook id, so it never reaches another registration;
when two registrations share a device name only one of them has a target
service and the other one fails instead of being mixed up.
"""

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
import logging
from typing import Any

from homeassistant.components.device_automation import (
    DeviceAutomationType,
    InvalidDeviceAutomationConfig,
    async_get_device_automation_platform,
)
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import CONF_DEVICE_ID, CONF_DOMAIN, CONF_TYPE
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import device_registry as dr

from .const import (
    DOMAIN,
    DPC_PACKAGE,
    MOBILE_APP_DEVICE_ID,
    MOBILE_APP_DOMAIN,
    SCREEN_OFF_DISABLED,
    SCREEN_OFF_ISSUE_URL,
)
from .models import Panel

_LOGGER = logging.getLogger(__name__)

NOTIFY_ACTION_TYPE = "notify"
NOTIFY_MESSAGE = "command_broadcast_intent"

# Companion app command that sets when its websocket stays connected. Panels
# run the minimal app without cloud push, so the websocket is the only command
# path; with the default setting it drops once the screen overlay hides the
# app, and every later command fails.
PERSISTENT_CONNECTION_MESSAGE = "command_persistent_connection"
PERSISTENT_CONNECTION_DATA = {"persistent": "always"}

# The device action renders its message and data as templates.
_TEMPLATE_MARKERS = ("{{", "{%", "{#")

# DPC broadcast actions.
ACTION_SCREEN_OFF = "SCREEN_OFF"
ACTION_SCREEN_ON = "SCREEN_ON"
ACTION_SET_BRIGHTNESS = "SET_BRIGHTNESS"
ACTION_NAVIGATE = "NAVIGATE"
ACTION_REBOOT = "REBOOT"
ACTION_MAINTENANCE_ON = "MAINTENANCE_ON"
ACTION_MAINTENANCE_OFF = "MAINTENANCE_OFF"
ACTION_UPDATE_HA = "UPDATE_HA"
ACTION_UPDATE_PANEL = "UPDATE_PANEL"
ACTION_FACTORY_RESET = "FACTORY_RESET"
ACTION_LINK = "LINK"
ACTION_UNLINK = "UNLINK"

# Commands of the WebSocket API.
COMMAND_SCREEN_ON = "screen_on"
COMMAND_SCREEN_OFF = "screen_off"
COMMAND_BRIGHTNESS = "brightness"
COMMAND_AUTO_BRIGHTNESS = "auto_brightness"
COMMAND_NAVIGATE = "navigate"
COMMAND_RELOAD = "reload"
COMMAND_MAINTENANCE_ON = "maintenance_on"
COMMAND_MAINTENANCE_OFF = "maintenance_off"
COMMAND_RESTART = "restart"
COMMAND_UPDATE_PANEL_APP = "update_panel_app"
COMMAND_UPDATE_HA_APP = "update_ha_app"
COMMAND_FACTORY_RESET = "factory_reset"
COMMAND_REFRESH = "refresh"

# Commands without parameters and the action each one sends.
_SIMPLE_COMMANDS = {
    COMMAND_SCREEN_ON: ACTION_SCREEN_ON,
    COMMAND_SCREEN_OFF: ACTION_SCREEN_OFF,
    COMMAND_RELOAD: ACTION_NAVIGATE,
    COMMAND_MAINTENANCE_ON: ACTION_MAINTENANCE_ON,
    COMMAND_MAINTENANCE_OFF: ACTION_MAINTENANCE_OFF,
    COMMAND_RESTART: ACTION_REBOOT,
    COMMAND_UPDATE_PANEL_APP: ACTION_UPDATE_PANEL,
    COMMAND_UPDATE_HA_APP: ACTION_UPDATE_HA,
}

FACTORY_RESET_CONFIRMATION = "wipe"
BRIGHTNESS_AUTO = "auto"


@dataclass(frozen=True, slots=True)
class Extra:
    """One intent extra.

    String extras carry the `:String` type suffix: the Companion app turns an
    untyped all-digit value into an Int and splits untyped values on `:`.
    """

    name: str
    value: str
    typed: bool = True


def encode_extras(extras: Sequence[Extra]) -> str:
    """Encode extras in the Companion app `intent_extras` format.

    A comma would start another extra, and template syntax would be rendered
    by the device action, so values containing either are refused.
    """
    parts: list[str] = []
    for extra in extras:
        if "," in extra.value:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="invalid_extra_value",
                translation_placeholders={"name": extra.name},
            )
        if any(marker in extra.value for marker in _TEMPLATE_MARKERS):
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="template_in_extra_value",
                translation_placeholders={"name": extra.name},
            )
        parts.append(
            f"{extra.name}:{extra.value}:String"
            if extra.typed
            else f"{extra.name}:{extra.value}"
        )
    return ",".join(parts)


async def async_send_action(
    hass: HomeAssistant, panel: Panel, action: str, extras: Sequence[Extra] = ()
) -> None:
    """Send one DPC action to a panel as a broadcast intent."""
    data = {
        "intent_package_name": DPC_PACKAGE,
        "intent_action": f"{DPC_PACKAGE}.{action}",
    }
    if extras:
        data["intent_extras"] = encode_extras(extras)
    await _async_notify(hass, panel, NOTIFY_MESSAGE, data)


async def _async_notify(
    hass: HomeAssistant, panel: Panel, message: str, data: Mapping[str, str]
) -> None:
    """Send one notification command to the panel's mobile_app registration."""
    mobile_app_entry = hass.config_entries.async_get_entry(panel.mobile_app_entry_id)
    device = (
        dr.async_get(hass).async_get_device_by_identifier(
            (MOBILE_APP_DOMAIN, mobile_app_entry.data[MOBILE_APP_DEVICE_ID]),
            mobile_app_entry.entry_id,
        )
        if mobile_app_entry is not None
        and mobile_app_entry.domain == MOBILE_APP_DOMAIN
        and mobile_app_entry.state is ConfigEntryState.LOADED
        else None
    )
    if device is None:
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="panel_not_registered",
            translation_placeholders={"panel": panel.title},
        )

    try:
        platform = await async_get_device_automation_platform(
            hass, MOBILE_APP_DOMAIN, DeviceAutomationType.ACTION
        )
        config: dict[str, Any] = platform.ACTION_SCHEMA(
            {
                CONF_DEVICE_ID: device.id,
                CONF_DOMAIN: MOBILE_APP_DOMAIN,
                CONF_TYPE: NOTIFY_ACTION_TYPE,
                "message": message,
                "data": dict(data),
            }
        )
        await platform.async_call_action_from_config(hass, config, {}, None)
    except InvalidDeviceAutomationConfig as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="panel_not_reachable",
            translation_placeholders={"panel": panel.title, "error": str(err)},
        ) from err
    except HomeAssistantError as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="send_failed",
            translation_placeholders={"panel": panel.title, "error": str(err)},
        ) from err


async def async_run_command(
    hass: HomeAssistant,
    panel: Panel,
    command: str,
    *,
    value: int | None = None,
    path: str | None = None,
    confirm: str | None = None,
) -> None:
    """Run a WebSocket API command on a panel.

    Raises ServiceValidationError for invalid input and HomeAssistantError when
    the command could not be sent.
    """
    if command == COMMAND_SCREEN_OFF and SCREEN_OFF_DISABLED:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="screen_off_disabled",
            translation_placeholders={"url": SCREEN_OFF_ISSUE_URL},
        )
    if action := _SIMPLE_COMMANDS.get(command):
        await async_send_action(hass, panel, action)
    elif command == COMMAND_BRIGHTNESS:
        await async_set_brightness(hass, panel, value)
    elif command == COMMAND_AUTO_BRIGHTNESS:
        await async_send_action(
            hass,
            panel,
            ACTION_SET_BRIGHTNESS,
            [Extra("brightness", BRIGHTNESS_AUTO, typed=False)],
        )
    elif command == COMMAND_NAVIGATE:
        await async_navigate(hass, panel, path)
    elif command == COMMAND_FACTORY_RESET:
        if confirm != FACTORY_RESET_CONFIRMATION:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="factory_reset_not_confirmed",
            )
        await async_send_action(
            hass,
            panel,
            ACTION_FACTORY_RESET,
            [Extra("confirm", FACTORY_RESET_CONFIRMATION)],
        )
    else:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="unknown_command",
            translation_placeholders={"command": command},
        )


def screen_off_disabled_payload() -> dict[str, str] | None:
    """Return why screen off is disabled, as the frontend sees it, or None."""
    return {"reason_url": SCREEN_OFF_ISSUE_URL} if SCREEN_OFF_DISABLED else None


async def async_set_brightness(
    hass: HomeAssistant, panel: Panel, value: int | None
) -> None:
    """Set a manual brightness of 0-255."""
    if not isinstance(value, int) or isinstance(value, bool) or not 0 <= value <= 255:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="invalid_brightness",
        )
    await async_send_action(
        hass,
        panel,
        ACTION_SET_BRIGHTNESS,
        [Extra("brightness", str(value), typed=False)],
    )


async def async_navigate(hass: HomeAssistant, panel: Panel, path: str | None) -> None:
    """Open Home Assistant on the panel, at a path when one is given."""
    extras: list[Extra] = []
    if path:
        if not path.startswith("/"):
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="invalid_path",
            )
        extras.append(Extra("path", path))
    await async_send_action(hass, panel, ACTION_NAVIGATE, extras)


async def async_link(hass: HomeAssistant, panel: Panel, status_url: str) -> None:
    """Tell the panel its ref and where to report.

    After a successful LINK the Companion app is also told to keep its
    websocket connected at all times. A failure there is only logged: the
    panel is linked, and the next LINK tries again.
    """
    await async_send_action(
        hass,
        panel,
        ACTION_LINK,
        [Extra("ref", panel.ref), Extra("url", status_url)],
    )
    try:
        await _async_notify(
            hass, panel, PERSISTENT_CONNECTION_MESSAGE, PERSISTENT_CONNECTION_DATA
        )
    except HomeAssistantError as err:
        _LOGGER.warning(
            "Could not keep the Home Assistant app connection of %s open: %s",
            panel.title,
            err,
        )


async def async_unlink(hass: HomeAssistant, panel: Panel) -> None:
    """Tell the panel to forget its ref and stop reporting."""
    await async_send_action(hass, panel, ACTION_UNLINK)
