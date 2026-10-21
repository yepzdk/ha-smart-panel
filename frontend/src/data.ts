// Every message to the smart_panel WebSocket API goes through this module.
import { t } from "./strings";
import type {
  Candidate,
  CommandOptions,
  HomeAssistant,
  PanelCommand,
  PanelsMessage,
  QrCode,
  Settings,
  SettingsUpdate,
  SettingsUpdateResult,
  UnsubscribeFunc,
} from "./types";

export const fetchSettings = (hass: HomeAssistant): Promise<Settings> =>
  hass.callWS<Settings>({ type: "smart_panel/settings" });

export const updateSettings = (
  hass: HomeAssistant,
  update: SettingsUpdate,
): Promise<SettingsUpdateResult> =>
  hass.callWS<SettingsUpdateResult>({
    type: "smart_panel/settings/update",
    ...update,
  });

export const fetchQrCode = (hass: HomeAssistant): Promise<QrCode> =>
  hass.callWS<QrCode>({ type: "smart_panel/qr" });

export const subscribePanels = (
  hass: HomeAssistant,
  callback: (message: PanelsMessage) => void,
): Promise<UnsubscribeFunc> =>
  hass.connection.subscribeMessage<PanelsMessage>(callback, {
    type: "smart_panel/panels/subscribe",
  });

export const fetchCandidates = async (
  hass: HomeAssistant,
): Promise<Candidate[]> =>
  (
    await hass.callWS<{ candidates: Candidate[] }>({
      type: "smart_panel/candidates",
    })
  ).candidates;

export const addPanel = (
  hass: HomeAssistant,
  mobileAppEntryId: string,
): Promise<{ panel_id: string }> =>
  hass.callWS<{ panel_id: string }>({
    type: "smart_panel/panels/add",
    mobile_app_entry_id: mobileAppEntryId,
  });

export const removePanel = (
  hass: HomeAssistant,
  panelId: string,
): Promise<Record<string, never>> =>
  hass.callWS<Record<string, never>>({
    type: "smart_panel/panels/remove",
    panel_id: panelId,
  });

export const sendCommand = (
  hass: HomeAssistant,
  panelId: string,
  command: PanelCommand,
  options: CommandOptions = {},
): Promise<Record<string, never>> =>
  hass.callWS<Record<string, never>>({
    type: "smart_panel/command",
    panel_id: panelId,
    command,
    ...options,
  });

/**
 * The text of an error from callWS. Core sends `{code, message}`; a lost
 * connection rejects with a number instead.
 */
export const errorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message !== ""
  ) {
    return error.message;
  }
  return t("error_no_connection");
};
