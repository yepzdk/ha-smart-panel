"""Config flow for the Smart Panel integration."""

import secrets
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    OptionsFlow,
    SubentryFlowResult,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)
from homeassistant.helpers.translation import async_get_translations

from .const import (
    CONF_HA_URL,
    CONF_MOBILE_APP_ENTRY_ID,
    CONF_WEBHOOK_ID,
    CONF_WIFI_HIDDEN,
    CONF_WIFI_PASSWORD,
    CONF_WIFI_SECURITY,
    CONF_WIFI_SSID,
    DOMAIN,
    SUBENTRY_TYPE_PANEL,
    WIFI_SECURITY_TYPES,
)
from .panels import async_candidates, panel_subentry_values
from .settings import default_options, validate_settings

TITLE = "Smart Panel"

OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_WIFI_SSID): TextSelector(),
        vol.Optional(CONF_WIFI_PASSWORD): TextSelector(
            TextSelectorConfig(type=TextSelectorType.PASSWORD)
        ),
        vol.Required(CONF_WIFI_SECURITY): SelectSelector(
            SelectSelectorConfig(
                options=list(WIFI_SECURITY_TYPES), mode=SelectSelectorMode.DROPDOWN
            )
        ),
        vol.Required(CONF_WIFI_HIDDEN): BooleanSelector(),
        vol.Required(CONF_HA_URL): TextSelector(
            TextSelectorConfig(type=TextSelectorType.URL)
        ),
    }
)


class SmartPanelConfigFlow(ConfigFlow, domain=DOMAIN):
    """Set up Smart Panel; one entry holds every panel."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm and create the entry with its webhook id and default settings."""
        if user_input is not None:
            return self.async_create_entry(
                title=TITLE,
                data={CONF_WEBHOOK_ID: secrets.token_hex(32)},
                options=default_options(self.hass),
            )
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow."""
        return SmartPanelOptionsFlow()

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry: ConfigEntry
    ) -> dict[str, type[ConfigSubentryFlow]]:
        """Return the subentry types: one per panel."""
        return {SUBENTRY_TYPE_PANEL: PanelSubentryFlow}


class SmartPanelOptionsFlow(OptionsFlow):
    """Edit the provisioning settings, validated like the Setup page."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Show and validate the settings form."""
        errors: dict[str, str] = {}
        suggested = {
            key: value
            for key, value in self.config_entry.options.items()
            if key != CONF_WIFI_PASSWORD
        }
        if user_input is not None:
            settings = dict(user_input)
            # The password is never shown; leaving the field empty keeps it.
            if not settings.get(CONF_WIFI_PASSWORD):
                settings.pop(CONF_WIFI_PASSWORD, None)
            options, errors = validate_settings(settings, self.config_entry.options)
            if not errors:
                return self.async_create_entry(data=options)
            suggested = {
                key: value
                for key, value in user_input.items()
                if key != CONF_WIFI_PASSWORD
            }

        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(OPTIONS_SCHEMA, suggested),
            errors=errors,
        )


class PanelSubentryFlow(ConfigSubentryFlow):
    """Add a panel from a mobile_app registration."""

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Pick the registration of the panel's Home Assistant app."""
        candidates = async_candidates(self.hass, self._get_entry())
        if not candidates:
            return self.async_abort(reason="no_candidates")

        if user_input is not None:
            entry_id = user_input[CONF_MOBILE_APP_ENTRY_ID]
            if not any(c["mobile_app_entry_id"] == entry_id for c in candidates):
                return self.async_abort(reason="already_configured")
            title, unique_id, data = panel_subentry_values(
                self.hass.config_entries.async_get_known_entry(entry_id)
            )
            return self.async_create_entry(title=title, data=data, unique_id=unique_id)

        marker = await self._async_likely_panel_marker()
        options = [
            SelectOptionDict(
                value=candidate["mobile_app_entry_id"],
                label=_candidate_label(candidate, marker),
            )
            for candidate in candidates
        ]
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_MOBILE_APP_ENTRY_ID): SelectSelector(
                        SelectSelectorConfig(
                            options=options, mode=SelectSelectorMode.LIST
                        )
                    )
                }
            ),
        )

    async def _async_likely_panel_marker(self) -> str:
        """Return the translated marker for registrations that are likely panels."""
        translations = await async_get_translations(
            self.hass, self.hass.config.language, "selector", {DOMAIN}
        )
        return translations.get(
            f"component.{DOMAIN}.selector.panel_candidate.options.likely_panel", ""
        )


def _candidate_label(candidate: dict[str, Any], marker: str) -> str:
    """Return the list label of a candidate: name, then marker, model and version."""
    details = [
        detail
        for detail in (
            marker if candidate["likely_panel"] else "",
            candidate["model"],
            candidate["app_version"],
        )
        if detail
    ]
    if not details:
        return candidate["name"]
    return f"{candidate['name']} ({', '.join(details)})"
