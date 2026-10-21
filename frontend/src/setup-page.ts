import {
  mdiAlertCircleOutline,
  mdiAlertOutline,
  mdiCheckCircleOutline,
  mdiChevronDown,
  mdiDownload,
  mdiEye,
  mdiEyeOff,
  mdiInformationOutline,
  mdiPrinter,
  mdiQrcode,
} from "@mdi/js";
import { css, html, LitElement, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { errorMessage, fetchQrCode, fetchSettings, updateSettings } from "./data";
import { listFormat } from "./format";
import { icon } from "./icon";
import { handleLinkClick } from "./navigation";
import { downloadQr, printQr, svgDataUrl } from "./qr-file";
import { t, tryT } from "./strings";
import type { StringKey } from "./strings";
import {
  alertStyles,
  baseStyles,
  buttonStyles,
  cardStyles,
  fieldStyles,
  spinnerStyles,
} from "./styles";
import type {
  HomeAssistant,
  QrCode,
  Settings,
  SettingsUpdate,
  WifiSecurity,
} from "./types";

interface FormValues {
  wifi_ssid: string;
  wifi_password: string;
  wifi_security: WifiSecurity;
  wifi_hidden: boolean;
  ha_url: string;
}

type FormField = keyof FormValues;

const FORM_FIELDS: readonly FormField[] = [
  "wifi_ssid",
  "wifi_security",
  "wifi_password",
  "wifi_hidden",
  "ha_url",
];

const SECURITY_OPTIONS: readonly [WifiSecurity, StringKey][] = [
  ["WPA", "security_wpa"],
  ["WEP", "security_wep"],
  ["NONE", "security_none"],
];

const isFormField = (name: string): name is FormField =>
  (FORM_FIELDS as readonly string[]).includes(name);

const formFromSettings = (settings: Settings): FormValues => ({
  wifi_ssid: settings.wifi_ssid,
  wifi_password: "",
  wifi_security: settings.wifi_security,
  wifi_hidden: settings.wifi_hidden,
  ha_url: settings.ha_url,
});

/** The message for an error code from the backend, about one field. */
const fieldErrorText = (field: string, code: string): string =>
  tryT(`error_${field}_${code}`) ?? tryT(`error_${code}`) ?? t("error_unknown");

/**
 * Inserts a link where `{placeholder}` stands in a sentence, so the sentence
 * stays whole in the string table.
 */
const withLink = (
  text: string,
  placeholder: string,
  link: TemplateResult,
): TemplateResult => {
  const [before, after = ""] = text.split(`{${placeholder}}`);
  return html`${before}${link}${after}`;
};

@customElement("smart-panel-setup")
export class SmartPanelSetup extends LitElement {
  @property({ attribute: false }) accessor hass!: HomeAssistant;

  /** URL of the Manage tab, for the links in the guide. */
  @property({ attribute: false }) accessor manageHref = "";

  @state() private accessor _settings: Settings | undefined;

  @state() private accessor _loadError: string | undefined;

  @state() private accessor _form: FormValues | undefined;

  @state() private accessor _errors: Record<string, string> = {};

  @state() private accessor _saving = false;

  @state() private accessor _saved = false;

  @state() private accessor _saveError: string | undefined;

  @state() private accessor _showPassword = false;

  @state() private accessor _qr: QrCode | undefined;

  @state() private accessor _qrError: string | undefined;

  @state() private accessor _printError: string | undefined;

  private _loadStarted = false;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("hass") && this.hass && !this._loadStarted) {
      this._loadStarted = true;
      void this._loadSettings();
      void this._loadQr();
    }
  }

  private async _loadSettings(): Promise<void> {
    this._loadError = undefined;
    try {
      const settings = await fetchSettings(this.hass);
      this._settings = settings;
      this._form = formFromSettings(settings);
    } catch (error) {
      this._loadError = errorMessage(error);
    }
  }

  private async _loadQr(): Promise<void> {
    this._qrError = undefined;
    try {
      this._qr = await fetchQrCode(this.hass);
    } catch (error) {
      this._qr = undefined;
      this._qrError = errorMessage(error);
    }
  }

  private get _dirty(): boolean {
    const form = this._form;
    const settings = this._settings;
    if (!form || !settings) {
      return false;
    }
    return (
      form.wifi_ssid !== settings.wifi_ssid ||
      form.wifi_security !== settings.wifi_security ||
      form.wifi_hidden !== settings.wifi_hidden ||
      form.ha_url !== settings.ha_url ||
      (form.wifi_security !== "NONE" && form.wifi_password !== "")
    );
  }

  protected override render() {
    return html`
      <div class="layout">
        ${this._renderSettings()} ${this._renderQr()} ${this._renderGuide()}
      </div>
    `;
  }

  private _renderSettings(): TemplateResult {
    return html`
      <section class="card settings" aria-labelledby="settings-title">
        <div class="card-header">
          <h2 id="settings-title">${t("settings_title")}</h2>
        </div>
        ${this._form
          ? this._renderForm(this._form)
          : this._loadError
            ? html`<div class="card-content">
                <div class="alert error" role="alert">
                  ${icon(mdiAlertCircleOutline)}
                  <span class="message"
                    >${t("settings_load_error", { message: this._loadError })}</span
                  >
                  <button
                    class="btn plain small alert-action"
                    type="button"
                    @click=${this._loadSettings}
                  >
                    ${t("retry")}
                  </button>
                </div>
              </div>`
            : html`<div class="loading">
                <span class="spinner large" role="progressbar" aria-label=${t("loading")}></span>
              </div>`}
      </section>
    `;
  }

  private _renderForm(form: FormValues): TemplateResult {
    const settings = this._settings!;
    const otherErrors = Object.entries(this._errors).filter(
      ([field]) => !isFormField(field),
    );
    const passwordHelper = settings.wifi_password_set
      ? t("field_password_helper_saved")
      : t("field_password_helper_new");
    return html`
      <form class="card-content" novalidate @submit=${this._save}>
        <p class="secondary">${t("settings_intro")}</p>

        ${this._saveError
          ? html`<div class="alert error" role="alert">
              ${icon(mdiAlertCircleOutline)}
              <span class="message"
                >${t("settings_save_error", { message: this._saveError })}</span
              >
            </div>`
          : nothing}
        ${otherErrors.length
          ? html`<div class="alert error" role="alert">
              ${icon(mdiAlertCircleOutline)}
              <span class="message">
                ${otherErrors.map(
                  ([field, code]) =>
                    html`<span class="block"
                      >${t("error_other_field", {
                        field,
                        message: fieldErrorText(field, code),
                      })}</span
                    >`,
                )}
              </span>
            </div>`
          : nothing}

        <div class="field">
          <label for="wifi_ssid" class="required">${t("field_ssid")}</label>
          <input
            id="wifi_ssid"
            name="wifi_ssid"
            class="input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
            .value=${form.wifi_ssid}
            aria-invalid=${this._errors.wifi_ssid ? "true" : "false"}
            aria-describedby="wifi_ssid-help"
            @input=${this._onInput}
          />
          ${this._renderHelp("wifi_ssid", t("field_ssid_helper"))}
        </div>

        <div class="field">
          <label for="wifi_security">${t("field_security")}</label>
          <div class="control">
            <select
              id="wifi_security"
              name="wifi_security"
              class="input"
              aria-invalid=${this._errors.wifi_security ? "true" : "false"}
              aria-describedby="wifi_security-help"
              @change=${this._onInput}
            >
              ${SECURITY_OPTIONS.map(
                ([value, label]) =>
                  html`<option value=${value} ?selected=${form.wifi_security === value}>
                    ${t(label)}
                  </option>`,
              )}
            </select>
            <span class="chevron">${icon(mdiChevronDown)}</span>
          </div>
          ${this._renderHelp("wifi_security", t("field_security_helper"))}
        </div>

        ${form.wifi_security === "NONE"
          ? nothing
          : html`<div class="field">
              <div class="label-row">
                <label
                  for="wifi_password"
                  class=${settings.wifi_password_set ? "" : "required"}
                  >${t("field_password")}</label
                >
                ${settings.wifi_password_set
                  ? html`<span class="saved-badge">
                      ${icon(mdiCheckCircleOutline)} ${t("password_saved")}
                    </span>`
                  : nothing}
              </div>
              <div class="control">
                <input
                  id="wifi_password"
                  name="wifi_password"
                  class="input has-end"
                  type=${this._showPassword ? "text" : "password"}
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  .value=${form.wifi_password}
                  aria-invalid=${this._errors.wifi_password ? "true" : "false"}
                  aria-describedby="wifi_password-help"
                  @input=${this._onInput}
                />
                <button
                  class="icon-button small end"
                  type="button"
                  aria-label=${this._showPassword ? t("password_hide") : t("password_show")}
                  title=${this._showPassword ? t("password_hide") : t("password_show")}
                  aria-controls="wifi_password"
                  aria-pressed=${this._showPassword ? "true" : "false"}
                  @click=${this._toggleShowPassword}
                >
                  ${icon(this._showPassword ? mdiEyeOff : mdiEye)}
                </button>
              </div>
              ${this._renderHelp("wifi_password", passwordHelper)}
            </div>`}

        <label class="check">
          <input
            name="wifi_hidden"
            type="checkbox"
            .checked=${form.wifi_hidden}
            aria-describedby="wifi_hidden-help"
            @change=${this._onInput}
          />
          <span class="check-text">
            <span class="label">${t("field_hidden")}</span>
            ${this._renderHelp("wifi_hidden", t("field_hidden_helper"))}
          </span>
        </label>

        <div class="field">
          <label for="ha_url" class="required">${t("field_ha_url")}</label>
          <input
            id="ha_url"
            name="ha_url"
            class="input"
            type="url"
            inputmode="url"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
            .value=${form.ha_url}
            aria-invalid=${this._errors.ha_url ? "true" : "false"}
            aria-describedby="ha_url-help"
            @input=${this._onInput}
          />
          <div class="help-row">
            ${this._renderHelp(
              "ha_url",
              t("field_ha_url_helper", { url: settings.ha_url_default }),
            )}
            ${form.ha_url !== settings.ha_url_default
              ? html`<button
                  class="btn plain small"
                  type="button"
                  @click=${this._useDefaultUrl}
                >
                  ${t("use_default")}
                </button>`
              : nothing}
          </div>
        </div>

        <div class="form-actions">
          <span class="save-status" role="status">
            ${this._saved && !this._dirty
              ? html`${icon(mdiCheckCircleOutline)} ${t("settings_saved")}`
              : nothing}
          </span>
          <button
            class="btn"
            type="submit"
            aria-busy=${this._saving ? "true" : "false"}
          >
            ${this._saving
              ? html`<span class="spinner" aria-hidden="true"></span>`
              : nothing}
            ${t("save")}
          </button>
        </div>
      </form>
    `;
  }

  /** Helper text below a field, replaced by the error when there is one. */
  private _renderHelp(field: FormField, helper: string): TemplateResult {
    const code = this._errors[field];
    return code
      ? html`<span id="${field}-help" class="field-error">
          ${icon(mdiAlertCircleOutline)} ${fieldErrorText(field, code)}
        </span>`
      : html`<span id="${field}-help" class="helper">${helper}</span>`;
  }

  private _renderQr(): TemplateResult {
    const qr = this._qr;
    let content: TemplateResult;
    if (this._qrError) {
      content = html`<div class="alert error" role="alert">
        ${icon(mdiAlertCircleOutline)}
        <span class="message">${t("qr_load_error", { message: this._qrError })}</span>
        <button class="btn plain small alert-action" type="button" @click=${this._loadQr}>
          ${t("retry")}
        </button>
      </div>`;
    } else if (!qr) {
      content = html`<div class="loading">
        <span class="spinner large" role="progressbar" aria-label=${t("loading")}></span>
      </div>`;
    } else if (!qr.ready || !qr.svg) {
      content = this._renderQrMissing(qr.missing);
    } else {
      content = html`
        <div class="alert warning">
          ${icon(mdiAlertOutline)}
          <span class="message">${t("qr_warning")}</span>
        </div>
        ${this._dirty
          ? html`<div class="alert">
              ${icon(mdiInformationOutline)}
              <span class="message">${t("qr_unsaved")}</span>
            </div>`
          : nothing}
        <div class="qr-frame">
          <img src=${svgDataUrl(qr.svg)} alt=${t("qr_alt")} />
        </div>
        <p class="secondary">${t("qr_hint")}</p>
        ${this._printError
          ? html`<div class="alert error" role="alert">
              ${icon(mdiAlertCircleOutline)}
              <span class="message"
                >${t("qr_print_error", { message: this._printError })}</span
              >
            </div>`
          : nothing}
      `;
    }
    const ready = Boolean(qr?.ready && qr.svg);
    return html`
      <section class="card qr" aria-labelledby="qr-title">
        <div class="card-header">
          <h2 id="qr-title">${t("qr_title")}</h2>
        </div>
        <div class="card-content">${content}</div>
        ${ready
          ? html`<div class="card-actions">
              <button class="btn filled" type="button" @click=${this._print}>
                ${icon(mdiPrinter)} ${t("qr_print")}
              </button>
              <button class="btn plain" type="button" @click=${this._download}>
                ${icon(mdiDownload)} ${t("qr_download")}
              </button>
            </div>`
          : nothing}
      </section>
    `;
  }

  private _renderQrMissing(missing: string[]): TemplateResult {
    const names = missing.map((key) => tryT(`missing_${key}`) ?? key);
    return html`
      <div class="qr-empty">
        <span class="qr-empty-icon">${icon(mdiQrcode)}</span>
        <h3>${t("qr_not_ready_title")}</h3>
        <p class="secondary">
          ${names.length
            ? t("qr_not_ready", { fields: listFormat.format(names) })
            : t("qr_not_ready_generic")}
        </p>
      </div>
    `;
  }

  private _renderGuide(): TemplateResult {
    const manageLink = html`<a href=${this.manageHref} @click=${handleLinkClick}
      >${t("tab_manage")}</a
    >`;
    const steps: [StringKey, TemplateResult | string][] = [
      [
        "step_reset_title",
        html`${t("step_reset")}
          <span class="block">${withLink(t("step_reset_panel"), "manage", manageLink)}</span>`,
      ],
      ["step_tap_title", t("step_tap")],
      ["step_scan_title", t("step_scan")],
      ["step_finish_title", t("step_finish")],
      ["step_login_title", t("step_login")],
      ["step_fullscreen_title", t("step_fullscreen")],
      ["step_add_title", withLink(t("step_add"), "manage", manageLink)],
    ];
    return html`
      <section class="card guide" aria-labelledby="guide-title">
        <div class="card-header">
          <h2 id="guide-title">${t("guide_title")}</h2>
        </div>
        <div class="card-content">
          <ol class="steps">
            ${steps.map(
              ([title, text]) => html`<li>
                <h3>${t(title)}</h3>
                <p class="secondary">${text}</p>
              </li>`,
            )}
          </ol>
          <div class="alert">
            ${icon(mdiInformationOutline)}
            <span class="message">${t("guide_wpa3")}</span>
          </div>
        </div>
      </section>
    `;
  }

  private _onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const name = target.name;
    if (!this._form || !isFormField(name)) {
      return;
    }
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    this._form = { ...this._form, [name]: value };
    this._saved = false;
    if (name in this._errors) {
      const { [name]: _cleared, ...rest } = this._errors;
      this._errors = rest;
    }
  }

  private _toggleShowPassword(): void {
    this._showPassword = !this._showPassword;
  }

  private _useDefaultUrl(): void {
    if (!this._form || !this._settings) {
      return;
    }
    this._form = { ...this._form, ha_url: this._settings.ha_url_default };
    this._saved = false;
    const { ha_url: _cleared, ...rest } = this._errors;
    this._errors = rest;
    this.renderRoot.querySelector<HTMLInputElement>("#ha_url")?.focus();
  }

  private async _save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const form = this._form;
    if (!form || this._saving) {
      return;
    }
    const update: SettingsUpdate = {
      wifi_ssid: form.wifi_ssid,
      wifi_security: form.wifi_security,
      wifi_hidden: form.wifi_hidden,
      ha_url: form.ha_url.trim(),
    };
    if (form.wifi_security !== "NONE" && form.wifi_password !== "") {
      update.wifi_password = form.wifi_password;
    }
    this._saving = true;
    this._saved = false;
    this._saveError = undefined;
    try {
      const result = await updateSettings(this.hass, update);
      if ("errors" in result) {
        this._errors = result.errors;
        await this.updateComplete;
        this.renderRoot
          .querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
        return;
      }
      this._settings = result.settings;
      this._form = formFromSettings(result.settings);
      this._errors = {};
      this._showPassword = false;
      this._saved = true;
      void this._loadQr();
    } catch (error) {
      this._saveError = errorMessage(error);
    } finally {
      this._saving = false;
    }
  }

  private async _print(): Promise<void> {
    if (!this._qr?.svg) {
      return;
    }
    this._printError = undefined;
    try {
      await printQr(this.renderRoot, this._qr.svg, this._settings?.wifi_ssid ?? "");
    } catch (error) {
      this._printError = errorMessage(error);
    }
  }

  private _download(): void {
    if (this._qr?.svg) {
      downloadQr(this._qr.svg);
    }
  }

  static override styles = [
    baseStyles,
    cardStyles,
    buttonStyles,
    fieldStyles,
    alertStyles,
    spinnerStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }

      .layout {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: var(--ha-space-4);
        align-items: start;
      }

      @container (min-width: 880px) {
        .layout {
          grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
          gap: var(--ha-space-6);
        }

        .guide {
          grid-column: 1 / -1;
        }
      }

      .block {
        display: block;
      }

      .label-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--ha-space-2);
      }

      .saved-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--ha-space-1);
        font-size: var(--ha-font-size-s);
        color: var(--secondary-text-color);
      }

      .saved-badge .icon {
        width: 16px;
        height: 16px;
        color: var(--success-color);
      }

      .help-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      /* Line the label of the plain button up with the text above it. */
      .help-row .btn {
        margin-inline-start: calc(-1 * var(--ha-space-3));
      }

      .form-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: var(--ha-space-4);
      }

      .save-status {
        display: inline-flex;
        align-items: center;
        gap: var(--ha-space-1);
        color: var(--secondary-text-color);
      }

      .save-status .icon {
        width: 18px;
        height: 18px;
        color: var(--success-color);
      }

      .qr-frame {
        align-self: center;
        width: 100%;
        max-width: 288px;
        padding: var(--ha-space-3);
        border-radius: var(--ha-border-radius-md);
        /* A QR code needs dark modules on a light ground to scan, also in dark mode. */
        background: #ffffff;
      }

      .qr-frame img {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 1;
        image-rendering: pixelated;
      }

      .qr-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ha-space-2);
        padding: var(--ha-space-6) var(--ha-space-4);
        text-align: center;
      }

      .qr-empty-icon .icon {
        width: 64px;
        height: 64px;
        color: var(--secondary-text-color);
      }

      .qr-empty h3 {
        font-size: var(--ha-font-size-l);
        font-weight: var(--ha-font-weight-medium);
      }

      .steps {
        margin: 0;
        padding: 0;
        list-style: none;
        counter-reset: step;
      }

      /* Two columns that read top to bottom, so the steps keep their order. */
      @container (min-width: 880px) {
        .steps {
          column-count: 2;
          column-gap: var(--ha-space-8);
        }
      }

      .steps li {
        position: relative;
        max-width: 70ch;
        padding-inline-start: 40px;
        padding-bottom: var(--ha-space-4);
        break-inside: avoid;
        counter-increment: step;
      }

      .steps li::before {
        content: counter(step);
        position: absolute;
        inset-inline-start: 0;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: var(--ha-border-radius-circle);
        background-color: var(--ha-color-fill-primary-normal-resting);
        color: var(--ha-color-on-primary-normal);
        font-size: var(--ha-font-size-m);
        font-weight: var(--ha-font-weight-medium);
      }

      .steps h3 {
        font-size: var(--ha-font-size-l);
        font-weight: var(--ha-font-weight-medium);
        line-height: 28px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "smart-panel-setup": SmartPanelSetup;
  }
}
