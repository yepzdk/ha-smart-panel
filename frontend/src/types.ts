// The parts of the Home Assistant frontend objects this panel uses. The full
// types live in the frontend repository and are not published as a package.

export type UnsubscribeFunc = () => Promise<void>;

export interface HassConnection {
  subscribeMessage<T>(
    callback: (message: T) => void,
    message: Record<string, unknown>,
    options?: { resubscribe?: boolean },
  ): Promise<UnsubscribeFunc>;
}

export interface HomeAssistant {
  connection: HassConnection;
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  themes?: { darkMode?: boolean };
  dockedSidebar?: "docked" | "always_hidden" | "auto";
}

export interface Route {
  prefix: string;
  path: string;
}

export interface PanelInfo {
  url_path?: string;
  title?: string | null;
}

// WebSocket API of the smart_panel integration.

export type WifiSecurity = "WPA" | "WEP" | "NONE";

export interface Settings {
  wifi_ssid: string;
  wifi_password_set: boolean;
  wifi_security: WifiSecurity;
  wifi_hidden: boolean;
  ha_url: string;
  ha_url_default: string;
}

export interface SettingsUpdate {
  wifi_ssid: string;
  wifi_password?: string;
  wifi_security: WifiSecurity;
  wifi_hidden: boolean;
  ha_url: string;
}

export type SettingsUpdateResult =
  | { errors: Record<string, string> }
  | { settings: Settings };

export interface QrCode {
  ready: boolean;
  svg: string | null;
  missing: string[];
}

export interface PanelStatus {
  event: string;
  app_version: string;
  app_version_code: number;
  ha_app_version: string | null;
  maintenance: boolean;
  screen_off: boolean;
  brightness: number | null;
  brightness_auto: boolean;
  manufacturer: string;
  model: string;
  android_version: string;
  sdk: number;
}

export interface Panel {
  panel_id: string;
  name: string;
  device_id: string;
  online: boolean;
  last_seen: string | null;
  status: PanelStatus | null;
  latest_app_version: string | null;
  entities: Record<string, string>;
}

/** Why turning the screen off is disabled for now, with a link to the reason. */
export interface ScreenOffDisabled {
  reason_url: string;
}

export interface PanelsMessage {
  panels: Panel[];
  /** Set while turning the screen off is disabled. */
  screen_off_disabled: ScreenOffDisabled | null;
}

export interface Candidate {
  mobile_app_entry_id: string;
  name: string;
  app_version: string;
  model: string;
  likely_panel: boolean;
}

export type PanelCommand =
  | "screen_on"
  | "screen_off"
  | "brightness"
  | "auto_brightness"
  | "navigate"
  | "reload"
  | "maintenance_on"
  | "maintenance_off"
  | "restart"
  | "update_panel_app"
  | "update_ha_app"
  | "factory_reset"
  | "refresh";

export interface CommandOptions {
  value?: number;
  path?: string;
  confirm?: "wipe";
}
