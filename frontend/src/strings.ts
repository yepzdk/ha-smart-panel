// All text of the panel, in English. Keep sentences whole and use {name}
// placeholders, so another language can replace this table later.

/** Language of the text below. Dates and numbers inside sentences use it too. */
export const LANGUAGE = "en";

const STRINGS = {
  // App shell
  title: "Smart panels",
  menu: "Menu",
  tabs_label: "Smart panel pages",
  tab_setup: "Setup",
  tab_manage: "Manage",

  // Common
  cancel: "Cancel",
  close: "Close",
  dismiss: "Dismiss",
  loading: "Loading",
  retry: "Try again",
  error_no_connection:
    "Home Assistant did not answer. Check your connection and try again.",

  // Setup: settings form
  settings_title: "Wi-Fi and Home Assistant address",
  settings_intro:
    "New panels join this Wi-Fi network and connect to this Home Assistant address. Both end up in the setup QR code.",
  settings_load_error: "Could not load the settings: {message}",
  field_ssid: "Network name",
  field_ssid_helper: "The name (SSID) of the Wi-Fi network the panels use.",
  field_security: "Security",
  security_wpa: "WPA/WPA2",
  security_wep: "WEP",
  security_none: "None (open network)",
  field_security_helper: "Pick WPA/WPA2 also for networks that allow both WPA2 and WPA3.",
  field_password: "Password",
  field_password_helper_saved: "Leave empty to keep the saved password.",
  field_password_helper_new: "The password of the Wi-Fi network.",
  password_saved: "Password saved",
  password_show: "Show password",
  password_hide: "Hide password",
  field_hidden: "Hidden network",
  field_hidden_helper: "Turn this on if the network does not show its name.",
  field_ha_url: "Home Assistant address",
  field_ha_url_helper: "The address panels use to reach Home Assistant. Default: {url}",
  use_default: "Use default",
  save: "Save",
  settings_saved: "Settings saved",
  settings_save_error: "Could not save the settings: {message}",
  error_required: "Enter a value.",
  error_wifi_ssid_required: "Enter the network name.",
  error_ha_url_required: "Enter the Home Assistant address.",
  error_invalid_url:
    "Enter a full address that starts with http:// or https://.",
  error_password_required:
    "Enter the Wi-Fi password, or set security to None.",
  error_https_required:
    "Use an https:// address. http:// only works for a local address: a private IP address, localhost, or a .local or .home.arpa name.",
  error_too_long: "This is too long.",
  error_unknown: "This value is not valid.",
  error_other_field: "{field}: {message}",

  // Setup: QR code
  qr_title: "Setup QR code",
  qr_warning:
    "This QR code contains your Wi-Fi password. Keep printouts and downloads private.",
  qr_unsaved: "Save your changes to update the QR code.",
  qr_load_error: "Could not create the QR code: {message}",
  qr_print_error: "Could not print the QR code: {message}",
  qr_not_ready_title: "No QR code yet",
  qr_not_ready: "To create the QR code, fill in {fields}, then save.",
  qr_not_ready_generic: "Save the Wi-Fi settings to create the QR code.",
  qr_alt: "QR code to set up a smart panel",
  qr_hint: "Scan it from the welcome screen of the device. The steps below show how.",
  qr_print: "Print",
  qr_download: "Download SVG",
  qr_file_name: "smart-panel-setup.svg",
  missing_wifi_ssid: "the network name",
  missing_wifi_password: "the password",
  missing_ha_url: "the Home Assistant address",

  // Setup: printed page
  print_title: "Set up a smart panel",
  print_network: "Wi-Fi network: {ssid}",
  print_step_reset: "Factory reset the device.",
  print_step_wifi:
    "If the setup wizard asks you to join a Wi-Fi network before the QR scanner, skip it or choose the network from the QR code.",
  print_step_tap: "Tap the welcome screen 6 times.",
  print_step_scan: "Scan this QR code and join the network.",
  print_step_finish:
    "Finish every setup screen, then log in to Home Assistant with the dashboard user.",
  print_secret:
    "This page contains the Wi-Fi password. Destroy it when the panel is set up.",

  // Setup: guide
  guide_title: "Set up a panel",
  guide_wpa3:
    "Networks that only allow WPA3 are not supported by Android QR setup. Use a network that also allows WPA2.",
  step_reset_title: "Factory reset the device",
  step_reset:
    "On the device, open Settings > System > Reset options > Erase all data. The menu names differ a little between manufacturers.",
  step_reset_panel: "Already a panel? Use Factory reset on the {manage} tab instead.",
  step_wifi_title: "Skip the Wi-Fi screen",
  step_wifi:
    "If the setup wizard asks you to join a Wi-Fi network before the QR scanner, skip it or choose the network from the QR code.",
  step_tap_title: "Tap the welcome screen 6 times",
  step_tap:
    "On the first setup screen, tap the same empty spot 6 times. The device opens a QR code scanner.",
  step_scan_title: "Scan the QR code",
  step_scan:
    "Scan the QR code above and join the network when asked. The device downloads the panel app and makes it the device owner.",
  step_finish_title: "Finish every setup screen",
  step_finish:
    "Go through all remaining setup screens until the Home Assistant app opens.",
  step_login_title: "Log in with the dashboard user",
  step_login:
    "The Home Assistant address is already filled in. Log in with the user whose dashboard the panel should show.",
  step_fullscreen_title: "Turn on fullscreen",
  step_fullscreen:
    "In the Home Assistant app, open Settings > Companion app and turn on Fullscreen.",
  step_add_title: "Add the panel",
  step_add: "Open the {manage} tab and select Add panel.",

  // Manage: list
  panels_title: "Panels",
  add_panel: "Add panel",
  panels_load_error: "Could not load the panels: {message}",
  empty_title: "No panels yet",
  empty_description:
    "Set up a device with the QR code on the Setup tab. When it shows your dashboard, add it here.",
  go_to_setup: "Go to setup",

  // Manage: one panel
  online: "Online",
  offline: "Offline",
  last_seen: "Last seen {time}",
  last_seen_now: "Last seen just now",
  last_report_at: "Last report {time}",
  never_seen: "No status report yet",
  device_details: "{manufacturer} {model}, Android {version}",
  waiting_report:
    "Waiting for the first status report. If none arrives, update the panel app, then select Refresh status.",
  row_screen: "Screen",
  screen_off_disabled:
    "Screen off is disabled until a Home Assistant bug is fixed. Turning the screen off can disconnect the panel until it restarts.",
  screen_off_disabled_link: "Home Assistant issue #176371",
  opens_new_tab: "(opens in a new tab)",
  row_brightness: "Brightness",
  row_auto_brightness: "Automatic brightness",
  row_auto_brightness_helper: "Uses the light sensor of the device.",
  row_auto_brightness_unknown: "Move the brightness slider to turn this off.",
  row_maintenance: "Maintenance mode",
  row_maintenance_on: "On. The app is unpinned and the status bar is shown.",
  row_maintenance_off: "Off. The panel is locked to Home Assistant.",
  row_panel_app: "Panel app",
  row_ha_app: "Home Assistant app",
  state_on: "On",
  state_off: "Off",
  state_unknown: "Unknown",
  brightness_auto: "Automatic",
  not_installed: "Not installed",
  update_available: "Update available: {version}",
  update: "Update",
  update_panel_app_label: "Update the panel app",
  update_ha_app_label: "Update the Home Assistant app",
  reload: "Reload",
  refresh: "Refresh status",
  restart: "Restart",
  more_actions: "More actions",
  open_page: "Open a page",
  open_page_helper: "A path in Home Assistant, like /lovelace/0.",
  open: "Open",
  error_path_required: "Enter a path.",
  error_path_invalid: "Enter a path that starts with / and has no spaces or commas.",
  factory_reset: "Factory reset",
  remove: "Remove",

  // Manage: command feedback
  sent_screen_on: "Turning the screen on.",
  sent_screen_off: "Turning the screen off.",
  sent_brightness: "Brightness sent.",
  sent_auto_brightness: "Turning on automatic brightness.",
  sent_navigate: "Opening the page.",
  sent_reload: "Reloading Home Assistant on the panel.",
  sent_maintenance_on: "Turning on maintenance mode.",
  sent_maintenance_off: "Turning off maintenance mode.",
  sent_restart: "The panel is restarting.",
  sent_update_panel_app: "The panel app update has started.",
  sent_update_ha_app: "The Home Assistant app update has started.",
  sent_factory_reset: "The panel is being erased. You can remove it from this list.",
  sent_refresh: "Asked the panel for its status.",
  failed_screen_on: "Could not turn the screen on: {message}",
  failed_screen_off: "Could not turn the screen off: {message}",
  failed_brightness: "Could not set the brightness: {message}",
  failed_auto_brightness: "Could not turn on automatic brightness: {message}",
  failed_navigate: "Could not open the page: {message}",
  failed_reload: "Could not reload: {message}",
  failed_maintenance_on: "Could not turn on maintenance mode: {message}",
  failed_maintenance_off: "Could not turn off maintenance mode: {message}",
  failed_restart: "Could not restart the panel: {message}",
  failed_update_panel_app: "Could not update the panel app: {message}",
  failed_update_ha_app: "Could not update the Home Assistant app: {message}",
  failed_factory_reset: "Could not factory reset the panel: {message}",
  failed_refresh: "Could not ask the panel for its status: {message}",
  failed_remove: "Could not remove the panel: {message}",

  // Manage: dialogs
  restart_title: "Restart panel?",
  restart_text:
    "{name} restarts and opens Home Assistant again when it is back on.",
  reset_title: "Factory reset panel?",
  reset_text:
    "All data on {name} is erased and it returns to the first setup screen. You can't undo this. To use it again, set it up with the QR code on the Setup tab.",
  reset_confirm_label: "Type {name} to confirm",
  remove_title: "Remove panel?",
  remove_text:
    "{name} is removed from Smart Panel and stops reporting its status. Nothing changes on the device. You can add it again later.",
  removed: "{name} removed.",
  add_title: "Add panel",
  add_intro:
    "Pick the device. Devices that run the minimal Home Assistant app, like the panels, are listed first.",
  add_load_error: "Could not load the devices: {message}",
  add_empty_title: "No devices to add",
  add_empty:
    "Every device with the Home Assistant app is added already. Set up a new panel on the Setup tab first.",
  add_likely: "Likely a panel",
  add_device_details: "{model}, app {version}",
  add_error: "Could not add the panel: {message}",
  add: "Add",
  added: "{name} added.",
} as const;

export type StringKey = keyof typeof STRINGS;

/** The text for `key`, with every `{name}` replaced by `params.name`. */
export const t = (
  key: StringKey,
  params: Record<string, string | number> = {},
): string =>
  STRINGS[key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );

/** A text that may or may not exist, like the message for a backend error code. */
export const tryT = (
  key: string,
  params: Record<string, string | number> = {},
): string | undefined =>
  key in STRINGS ? t(key as StringKey, params) : undefined;
