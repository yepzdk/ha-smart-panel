"""Status reports posted by the panels."""

from collections.abc import Awaitable, Callable
import logging

from aiohttp.web import Request, Response
import voluptuous as vol

from homeassistant.core import HomeAssistant

from .models import SmartPanelConfigEntry
from .panels import REPORT_SCHEMA, async_handle_report

_LOGGER = logging.getLogger(__name__)

type WebhookHandler = Callable[
    [HomeAssistant, str, Request], Awaitable[Response | None]
]


def make_webhook_handler(entry: SmartPanelConfigEntry) -> WebhookHandler:
    """Return the webhook handler for a config entry.

    Every request is answered with HTTP 200 and an empty body; reports that
    are not valid JSON or carry an unknown ref are ignored.
    """

    async def handle_webhook(
        hass: HomeAssistant, webhook_id: str, request: Request
    ) -> Response | None:
        try:
            body = await request.json()
        except ValueError:
            _LOGGER.debug("Ignoring report that is not valid JSON")
            return None

        ref = body.get("ref") if isinstance(body, dict) else None
        if not isinstance(ref, str) or entry.runtime_data.panel_by_ref(ref) is None:
            _LOGGER.debug("Ignoring report for unknown ref %s", ref)
            return None

        try:
            report = REPORT_SCHEMA(body)
        except vol.Invalid as err:
            _LOGGER.warning("Ignoring invalid report from panel %s: %s", ref, err)
            return None

        async_handle_report(hass, entry, report)
        return None

    return handle_webhook
