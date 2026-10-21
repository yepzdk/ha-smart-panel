"""Constants for the Smart Panel integration."""

from datetime import timedelta
import re
from typing import Final

DOMAIN: Final = "smart_panel"

# Config entry data and options.
CONF_WEBHOOK_ID: Final = "webhook_id"
CONF_WIFI_SSID: Final = "wifi_ssid"
CONF_WIFI_PASSWORD: Final = "wifi_password"
CONF_WIFI_SECURITY: Final = "wifi_security"
CONF_WIFI_HIDDEN: Final = "wifi_hidden"
CONF_HA_URL: Final = "ha_url"

WIFI_SECURITY_TYPES: Final = ("WPA", "WEP", "NONE")
WIFI_SECURITY_NONE: Final = "NONE"
DEFAULT_WIFI_SECURITY: Final = "WPA"

# Panel subentries.
SUBENTRY_TYPE_PANEL: Final = "panel"
CONF_REF: Final = "ref"
CONF_MOBILE_APP_ENTRY_ID: Final = "mobile_app_entry_id"
REF_PATTERN: Final = re.compile(r"^[A-Za-z0-9_-]{1,64}$")

# mobile_app config entry data keys.
MOBILE_APP_DOMAIN: Final = "mobile_app"
MOBILE_APP_APP_VERSION: Final = "app_version"
MOBILE_APP_DEVICE_ID: Final = "device_id"
MOBILE_APP_DEVICE_NAME: Final = "device_name"
MOBILE_APP_MODEL: Final = "model"
MOBILE_APP_WEBHOOK_ID: Final = "webhook_id"
MINIMAL_APP_VERSION_SUFFIX: Final = "-minimal"

# DPC (device-owner app on the panel).
DPC_PACKAGE: Final = "dk.yepzdk.hapanel"
DPC_ADMIN_COMPONENT: Final = "dk.yepzdk.hapanel/.AdminReceiver"
DPC_SIGNATURE_CHECKSUM: Final = "SwV7wTh3X3aDzEzDhGEJ-CY1XjJcEFQ2RGMM2CV0RxE"
DPC_APK_URL: Final = (
    "https://github.com/yepzdk/ha-panel-dpc/releases/latest/download/ha-panel-dpc.apk"
)
DPC_LATEST_RELEASE_API: Final = (
    "https://api.github.com/repos/yepzdk/ha-panel-dpc/releases/latest"
)
DPC_RELEASES_URL: Final = "https://github.com/yepzdk/ha-panel-dpc/releases"
HA_APK_URL: Final = "https://github.com/home-assistant/android/releases/latest/download/app-minimal-release.apk"

LATEST_RELEASE_INTERVAL: Final = timedelta(hours=6)
ONLINE_TIMEOUT: Final = timedelta(minutes=35)
# How often a panel that is not online is sent LINK again.
LINK_RETRY_INTERVAL: Final = timedelta(minutes=5)

# Sidebar panel.
PANEL_URL_PATH: Final = "smart-panel"
PANEL_COMPONENT_NAME: Final = "smart-panel-app"
PANEL_TITLE: Final = "Smart Panels"
PANEL_ICON: Final = "mdi:tablet-dashboard"
STATIC_URL_PATH: Final = "/smart_panel_static"
FRONTEND_DIR: Final = "frontend"
FRONTEND_BUNDLE: Final = "smart-panel.js"

# Entity keys (translation keys and unique id suffixes).
KEY_SCREEN: Final = "screen"
KEY_MAINTENANCE_MODE: Final = "maintenance_mode"
KEY_BRIGHTNESS: Final = "brightness"
KEY_AUTO_BRIGHTNESS: Final = "auto_brightness"
KEY_RELOAD: Final = "reload"
KEY_RESTART: Final = "restart"
KEY_UPDATE_HA_APP: Final = "update_ha_app"
KEY_PANEL_APP: Final = "panel_app"
KEY_CONNECTIVITY: Final = "connectivity"
KEY_HA_APP_VERSION: Final = "ha_app_version"
KEY_LAST_SEEN: Final = "last_seen"

# Entity platform and key, in the order the WebSocket API lists them.
ENTITY_KEYS: Final = (
    ("switch", KEY_SCREEN),
    ("switch", KEY_MAINTENANCE_MODE),
    ("number", KEY_BRIGHTNESS),
    ("switch", KEY_AUTO_BRIGHTNESS),
    ("button", KEY_RELOAD),
    ("button", KEY_RESTART),
    ("button", KEY_UPDATE_HA_APP),
    ("update", KEY_PANEL_APP),
    ("binary_sensor", KEY_CONNECTIVITY),
    ("sensor", KEY_HA_APP_VERSION),
    ("sensor", KEY_LAST_SEEN),
)

# Dispatcher signals.
SIGNAL_PANELS_CHANGED: Final = f"{DOMAIN}_panels_changed"


def signal_panel_updated(subentry_id: str) -> str:
    """Return the signal sent when one panel's state changes."""
    return f"{DOMAIN}_panel_updated_{subentry_id}"


def signal_panel_added(entry_id: str) -> str:
    """Return the signal sent when a panel is added to a loaded entry."""
    return f"{DOMAIN}_panel_added_{entry_id}"
