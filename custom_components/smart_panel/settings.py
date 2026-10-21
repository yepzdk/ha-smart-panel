"""Provisioning settings: defaults and the validator shared by every writer."""

from collections.abc import Mapping
from ipaddress import ip_address
from typing import Any

from yarl import URL

from homeassistant.core import HomeAssistant
from homeassistant.helpers.network import NoURLAvailableError, get_url
from homeassistant.util.network import is_local

from .const import (
    CONF_HA_URL,
    CONF_WIFI_HIDDEN,
    CONF_WIFI_PASSWORD,
    CONF_WIFI_SECURITY,
    CONF_WIFI_SSID,
    DEFAULT_WIFI_SECURITY,
    WIFI_SECURITY_NONE,
)

# An SSID is at most 32 bytes. A WPA passphrase is at most 63 characters, or
# 64 for a raw hexadecimal key.
MAX_SSID_BYTES = 32
MAX_PASSWORD_LENGTH = 64

ERROR_REQUIRED = "required"
ERROR_INVALID_URL = "invalid_url"
ERROR_PASSWORD_REQUIRED = "password_required"
ERROR_TOO_LONG = "too_long"
ERROR_HTTPS_REQUIRED = "https_required"

# Host names that only resolve on the local network.
LOCAL_HOST_SUFFIXES = (".local", ".home.arpa")


def default_ha_url(hass: HomeAssistant) -> str:
    """Return the URL a panel on the local network should use for Home Assistant."""
    try:
        return get_url(hass, prefer_external=False, allow_ip=True)
    except NoURLAvailableError:
        return ""


def default_options(hass: HomeAssistant) -> dict[str, Any]:
    """Return the options a new config entry starts with."""
    return {
        CONF_WIFI_SSID: "",
        CONF_WIFI_PASSWORD: "",
        CONF_WIFI_SECURITY: DEFAULT_WIFI_SECURITY,
        CONF_WIFI_HIDDEN: False,
        CONF_HA_URL: default_ha_url(hass),
    }


def validate_settings(
    user_input: Mapping[str, Any], current: Mapping[str, Any]
) -> tuple[dict[str, Any], dict[str, str]]:
    """Validate new settings.

    `user_input` holds `wifi_ssid`, `wifi_security`, `wifi_hidden`, `ha_url` and
    optionally `wifi_password`; a missing password keeps the current one.
    Returns the options to store and a mapping of field to error code. The
    options must not be stored when there are errors.
    """
    errors: dict[str, str] = {}

    ssid: str = user_input[CONF_WIFI_SSID]
    if not ssid.strip():
        errors[CONF_WIFI_SSID] = ERROR_REQUIRED
    elif len(ssid.encode()) > MAX_SSID_BYTES:
        errors[CONF_WIFI_SSID] = ERROR_TOO_LONG

    # The security type is one of WIFI_SECURITY_TYPES; both callers' schemas
    # enforce that.
    security: str = user_input[CONF_WIFI_SECURITY]

    password: str = user_input.get(
        CONF_WIFI_PASSWORD, current.get(CONF_WIFI_PASSWORD, "")
    )
    if security != WIFI_SECURITY_NONE and not password:
        errors[CONF_WIFI_PASSWORD] = ERROR_PASSWORD_REQUIRED
    elif len(password) > MAX_PASSWORD_LENGTH:
        errors[CONF_WIFI_PASSWORD] = ERROR_TOO_LONG

    ha_url = user_input[CONF_HA_URL].strip().rstrip("/")
    if not ha_url:
        errors[CONF_HA_URL] = ERROR_REQUIRED
    elif not _is_valid_ha_url(ha_url):
        errors[CONF_HA_URL] = ERROR_INVALID_URL
    elif not _is_secure_or_local(URL(ha_url)):
        errors[CONF_HA_URL] = ERROR_HTTPS_REQUIRED

    options = {
        CONF_WIFI_SSID: ssid,
        CONF_WIFI_PASSWORD: password,
        CONF_WIFI_SECURITY: security,
        CONF_WIFI_HIDDEN: bool(user_input[CONF_WIFI_HIDDEN]),
        CONF_HA_URL: ha_url,
    }
    return options, errors


def _is_valid_ha_url(value: str) -> bool:
    """Return whether the value is an absolute http(s) URL a panel can use.

    The status URL derived from it travels in a Companion app intent extra,
    which cannot carry a comma.
    """
    if "," in value or any(char.isspace() for char in value):
        return False
    try:
        url = URL(value)
    except ValueError:
        return False
    return (
        url.scheme in ("http", "https")
        and bool(url.host)
        and not url.query_string
        and not url.fragment
    )


def _is_secure_or_local(url: URL) -> bool:
    """Return whether the URL is https, or http to a host on the local network.

    Panels may be away from home, and their status reports carry the webhook
    id, so plain http is only accepted where it cannot leave the local network.
    """
    if url.scheme == "https":
        return True
    host = (url.host or "").lower().rstrip(".")
    if host == "localhost" or host.endswith(LOCAL_HOST_SUFFIXES):
        return True
    try:
        return is_local(ip_address(host))
    except ValueError:
        return False


def settings_payload(hass: HomeAssistant, options: Mapping[str, Any]) -> dict[str, Any]:
    """Return the settings as the frontend sees them, without the password."""
    return {
        CONF_WIFI_SSID: options[CONF_WIFI_SSID],
        "wifi_password_set": bool(options[CONF_WIFI_PASSWORD]),
        CONF_WIFI_SECURITY: options[CONF_WIFI_SECURITY],
        CONF_WIFI_HIDDEN: options[CONF_WIFI_HIDDEN],
        CONF_HA_URL: options[CONF_HA_URL],
        "ha_url_default": default_ha_url(hass),
    }


def missing_for_qr(options: Mapping[str, Any]) -> list[str]:
    """Return the settings that must be filled in before a QR code can be made."""
    missing: list[str] = []
    if not options[CONF_WIFI_SSID]:
        missing.append(CONF_WIFI_SSID)
    if (
        options[CONF_WIFI_SECURITY] != WIFI_SECURITY_NONE
        and not options[CONF_WIFI_PASSWORD]
    ):
        missing.append(CONF_WIFI_PASSWORD)
    if not options[CONF_HA_URL]:
        missing.append(CONF_HA_URL)
    return missing
