"""Device-owner provisioning QR code."""

from collections.abc import Mapping
import io
import json
from typing import Any

import segno

from .const import (
    CONF_HA_URL,
    CONF_WIFI_HIDDEN,
    CONF_WIFI_PASSWORD,
    CONF_WIFI_SECURITY,
    CONF_WIFI_SSID,
    DPC_ADMIN_COMPONENT,
    DPC_APK_URL,
    DPC_SIGNATURE_CHECKSUM,
    HA_APK_URL,
)

_EXTRA = "android.app.extra."


def provisioning_payload(options: Mapping[str, Any]) -> dict[str, Any]:
    """Return the provisioning JSON object for the current settings.

    Same keys as `provisioning/make-qr.sh` in the DPC repository, plus the
    Home Assistant URL in the admin extras and the hidden flag for hidden
    networks.
    """
    payload: dict[str, Any] = {
        f"{_EXTRA}PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": DPC_ADMIN_COMPONENT,
        f"{_EXTRA}PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": DPC_APK_URL,
        f"{_EXTRA}PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": DPC_SIGNATURE_CHECKSUM,
        f"{_EXTRA}PROVISIONING_WIFI_SSID": options[CONF_WIFI_SSID],
        f"{_EXTRA}PROVISIONING_WIFI_PASSWORD": options[CONF_WIFI_PASSWORD],
        f"{_EXTRA}PROVISIONING_WIFI_SECURITY_TYPE": options[CONF_WIFI_SECURITY],
        f"{_EXTRA}PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": False,
        f"{_EXTRA}PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
            "ha_apk_url": HA_APK_URL,
            "ha_url": options[CONF_HA_URL],
        },
    }
    if options[CONF_WIFI_HIDDEN]:
        payload[f"{_EXTRA}PROVISIONING_WIFI_HIDDEN"] = True
    return payload


def render_svg(payload: Mapping[str, Any]) -> str:
    """Render the payload as an SVG QR code.

    The JSON is compact to keep the code small, and ASCII-only (non-ASCII
    characters escaped) like `make-qr.sh`, so no reader has to guess the text
    encoding. Dark modules on white with the standard quiet zone, sized by the
    viewBox only so the frontend can scale it. A standalone SVG document
    (with the SVG namespace, without an XML declaration), so it also works as
    an image source, a download and in a print document.
    """
    content = json.dumps(payload, separators=(",", ":"))
    code = segno.make_qr(content, error="m")
    buffer = io.BytesIO()
    code.save(
        buffer,
        kind="svg",
        xmldecl=False,
        svgns=True,
        nl=False,
        scale=1,
        border=4,
        omitsize=True,
        dark="#000000",
        light="#ffffff",
    )
    return buffer.getvalue().decode()
