"""Tests for the provisioning settings validator."""

import pytest

from custom_components.smart_panel.settings import validate_settings

SETTINGS = {
    "wifi_ssid": "Home",
    "wifi_password": "secret-password",
    "wifi_security": "WPA",
    "wifi_hidden": False,
}


@pytest.mark.parametrize(
    "ha_url",
    [
        "https://ha.example.com",
        "https://203.0.113.7:8123",
        "http://192.168.1.10:8123",
        "http://10.0.0.5:8123",
        "http://127.0.0.1:8123",
        "http://[fe80::1]:8123",
        "http://localhost:8123",
        "http://foo.local:8123",
        "http://foo.home.arpa:8123",
    ],
)
def test_ha_url_accepted(ha_url: str) -> None:
    """https is accepted anywhere, http only for a local host."""
    options, errors = validate_settings({**SETTINGS, "ha_url": ha_url}, {})
    assert errors == {}
    assert options["ha_url"] == ha_url


@pytest.mark.parametrize(
    "ha_url",
    [
        "http://ha.example.com",
        "http://203.0.113.7:8123",
        "http://local.example.com",
    ],
)
def test_ha_url_https_required(ha_url: str) -> None:
    """http to a host that is not local must be https."""
    _, errors = validate_settings({**SETTINGS, "ha_url": ha_url}, {})
    assert errors == {"ha_url": "https_required"}
