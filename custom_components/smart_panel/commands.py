"""Commands to panels, sent as broadcast intents through the Companion app."""

from collections.abc import Sequence
from dataclasses import dataclass

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

from .const import DOMAIN, DPC_PACKAGE, MOBILE_APP_DOMAIN, MOBILE_APP_WEBHOOK_ID
from .models import Panel

NOTIFY_DOMAIN = "notify"
NOTIFY_SERVICE = MOBILE_APP_DOMAIN
NOTIFY_MESSAGE = "command_broadcast_intent"

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
    """Encode extras in the Companion app `intent_extras` format."""
    parts: list[str] = []
    for extra in extras:
        if "," in extra.value:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="invalid_extra_value",
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
    """Send one DPC action to a panel through its mobile_app registration."""
    data = {
        "intent_package_name": DPC_PACKAGE,
        "intent_action": f"{DPC_PACKAGE}.{action}",
    }
    if extras:
        data["intent_extras"] = encode_extras(extras)

    mobile_app_entry = hass.config_entries.async_get_entry(panel.mobile_app_entry_id)
    if (
        mobile_app_entry is None
        or mobile_app_entry.domain != MOBILE_APP_DOMAIN
        or mobile_app_entry.state is not ConfigEntryState.LOADED
    ):
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="panel_not_registered",
            translation_placeholders={"panel": panel.title},
        )

    try:
        await hass.services.async_call(
            NOTIFY_DOMAIN,
            NOTIFY_SERVICE,
            {
                "message": NOTIFY_MESSAGE,
                "target": [mobile_app_entry.data[MOBILE_APP_WEBHOOK_ID]],
                "data": data,
            },
            blocking=True,
        )
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
    """Tell the panel its ref and where to report."""
    await async_send_action(
        hass,
        panel,
        ACTION_LINK,
        [Extra("ref", panel.ref), Extra("url", status_url)],
    )


async def async_unlink(hass: HomeAssistant, panel: Panel) -> None:
    """Tell the panel to forget its ref and stop reporting."""
    await async_send_action(hass, panel, ACTION_UNLINK)
