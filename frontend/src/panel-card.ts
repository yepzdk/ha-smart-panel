import {
  mdiAlertCircleOutline,
  mdiAlertOutline,
  mdiChevronDown,
  mdiClose,
  mdiInformationOutline,
  mdiTabletDashboard,
} from "@mdi/js";
import { css, html, LitElement, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { defineOnce } from "./define";
import "./dialog";
import { errorMessage, removePanel, sendCommand } from "./data";
import { dateTimeFormat, formatRelativeTime, percentFormat } from "./format";
import { icon } from "./icon";
import { t } from "./strings";
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
  CommandOptions,
  HomeAssistant,
  Panel,
  PanelCommand,
  PanelStatus,
  ScreenOffDisabled,
} from "./types";

/** The status values a command changes, shown right away until the panel reports. */
type Requested = Partial<
  Pick<PanelStatus, "screen_off" | "maintenance" | "brightness" | "brightness_auto">
>;

type Action = PanelCommand | "remove";

type DialogName = "restart" | "factory_reset" | "remove";

/**
 * How long a requested value is shown when the panel sends no report, before
 * the card falls back to the last reported value.
 */
const REQUESTED_TIMEOUT_MS = 30_000;

/** Quiet time after the last slider change before the brightness is sent. */
const BRIGHTNESS_DEBOUNCE_MS = 400;

/** How long a confirmation that a command was sent stays. */
const SUCCESS_MESSAGE_MS = 6_000;

/** "Just now" covers reports younger than this. */
const JUST_NOW_MS = 45_000;

/** Paths for NAVIGATE: no spaces, and no commas, which split intent extras. */
const PATH_PATTERN = /^\/[^\s,]*$/;

@defineOnce("smart-panel-card")
export class SmartPanelCard extends LitElement {
  @property({ attribute: false }) accessor hass!: HomeAssistant;

  @property({ attribute: false }) accessor panel!: Panel;

  /** The current time, from the list, so relative times move on. */
  @property({ attribute: false }) accessor now = new Date();

  /** Set while turning the screen off is disabled; turning it on still works. */
  @property({ attribute: false }) accessor screenOffDisabled: ScreenOffDisabled | null =
    null;

  @state() private accessor _pending: ReadonlySet<Action> = new Set();

  @state() private accessor _requested: Requested = {};

  @state() private accessor _brightnessDraft: number | undefined;

  @state() private accessor _success: string | undefined;

  @state() private accessor _error: string | undefined;

  @state() private accessor _dialog: DialogName | undefined;

  @state() private accessor _dialogError: string | undefined;

  @state() private accessor _resetConfirm = "";

  @state() private accessor _path = "";

  @state() private accessor _pathError: StringKey | undefined;

  private _requestedTimer: number | undefined;

  private _brightnessTimer: number | undefined;

  private _successTimer: number | undefined;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this._requestedTimer);
    window.clearTimeout(this._brightnessTimer);
    window.clearTimeout(this._successTimer);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    const previous = changed.get("panel");
    // A new report is the truth: drop requested values once no command runs.
    if (
      previous &&
      previous.last_seen !== this.panel.last_seen &&
      this._pending.size === 0
    ) {
      this._requested = {};
    }
  }

  /** The last report, with the values of commands that were just sent on top. */
  private get _status(): PanelStatus | null {
    const status = this.panel.status;
    return status ? { ...status, ...this._requested } : null;
  }

  protected override render() {
    const panel = this.panel;
    const status = this._status;
    return html`
      <article class="card" aria-labelledby="name">
        <div class="card-header">
          <span class="device-icon">${icon(mdiTabletDashboard)}</span>
          <div class="heading">
            <h3 id="name">${panel.name}</h3>
            <p class="secondary">
              ${this._renderLastSeen()}${status
                ? html`<span class="separator" aria-hidden="true"> · </span>${t(
                      "device_details",
                      {
                        manufacturer: status.manufacturer,
                        model: status.model,
                        version: status.android_version,
                      },
                    )}`
                : nothing}
            </p>
          </div>
          <span class="badge ${panel.online ? "online" : "offline"}">
            <span class="dot" aria-hidden="true"></span>
            ${panel.online ? t("online") : t("offline")}
          </span>
        </div>

        <div class="rows">
          ${status
            ? nothing
            : html`<div class="alert">
                ${icon(mdiInformationOutline)}
                <span class="message">${t("waiting_report")}</span>
              </div>`}
          ${this._renderScreen(status)} ${this._renderBrightness(status)}
          ${this._renderAutoBrightness(status)} ${this._renderMaintenance(status)}
          ${this._renderPanelApp(status)} ${this._renderHaApp(status)}
        </div>

        <div class="card-actions">
          ${this._renderActionButton("reload", t("reload"))}
          ${this._renderActionButton("refresh", t("refresh"))}
          ${this._renderActionButton("restart", t("restart"), () =>
            this._openDialog("restart"),
          )}
        </div>

        <details class="more">
          <summary>${t("more_actions")} ${icon(mdiChevronDown)}</summary>
          <div class="more-content">
            ${this._renderOpenPage()}
            <div class="danger-actions">
              <button
                class="btn plain danger small"
                type="button"
                @click=${() => this._openDialog("factory_reset")}
              >
                ${t("factory_reset")}
              </button>
              <button
                class="btn plain small"
                type="button"
                @click=${() => this._openDialog("remove")}
              >
                ${t("remove")}
              </button>
            </div>
          </div>
        </details>

        <div class="feedback">
          <p class="success" role="status">${this._success ?? nothing}</p>
          ${this._error
            ? html`<div class="alert error" role="alert">
                ${icon(mdiAlertCircleOutline)}
                <span class="message">${this._error}</span>
                <button
                  class="icon-button small alert-action"
                  type="button"
                  aria-label=${t("dismiss")}
                  title=${t("dismiss")}
                  @click=${this._dismissError}
                >
                  ${icon(mdiClose)}
                </button>
              </div>`
            : nothing}
        </div>
      </article>
      ${this._renderRestartDialog()} ${this._renderResetDialog()}
      ${this._renderRemoveDialog()}
    `;
  }

  private _renderLastSeen(): TemplateResult {
    const lastSeen = this.panel.last_seen;
    if (!lastSeen) {
      return html`${t("never_seen")}`;
    }
    const date = new Date(lastSeen);
    const text =
      Math.abs(this.now.getTime() - date.getTime()) < JUST_NOW_MS
        ? t("last_seen_now")
        : t("last_seen", { time: formatRelativeTime(date, this.now) });
    return html`<time datetime=${lastSeen} title=${dateTimeFormat.format(date)}
      >${text}</time
    >`;
  }

  /**
   * A row with a label, a line about the state, and a control at the end. A
   * note, when given, spans the full width below them.
   */
  private _renderRow(
    id: string,
    label: string,
    description: string | TemplateResult,
    control: TemplateResult,
    note: TemplateResult | typeof nothing = nothing,
  ): TemplateResult {
    return html`<div class="row">
      <div class="row-text">
        <span class="row-label" id="${id}-label">${label}</span>
        <span class="row-description secondary" id="${id}-description"
          >${description}</span
        >
      </div>
      <div class="row-control">${control}</div>
      ${note}
    </div>`;
  }

  /** `describedBy` adds ids to the row description, like a note below the row. */
  private _renderSwitch(
    id: string,
    checked: boolean,
    disabled: boolean,
    busy: boolean,
    onChange: (checked: boolean) => void,
    describedBy: readonly string[] = [],
  ): TemplateResult {
    return html`
      ${busy ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
      <input
        class="switch"
        type="checkbox"
        role="switch"
        .checked=${checked}
        ?disabled=${disabled || busy}
        aria-labelledby="${id}-label"
        aria-describedby=${[`${id}-description`, ...describedBy].join(" ")}
        aria-busy=${busy ? "true" : "false"}
        @change=${(event: Event) =>
          onChange((event.target as HTMLInputElement).checked)}
      />
    `;
  }

  private _renderScreen(status: PanelStatus | null): TemplateResult {
    const busy = this._isPending("screen_on", "screen_off");
    const description = status
      ? status.screen_off
        ? t("state_off")
        : t("state_on")
      : t("state_unknown");
    const muted = this.screenOffDisabled;
    // While muted the switch can only turn a screen that is off back on.
    const cannotTurnOff = Boolean(muted && !status?.screen_off);
    const note = muted
      ? html`<div class="alert warning row-note" id="screen-note">
          ${icon(mdiAlertOutline)}
          <span class="message"
            >${t("screen_off_disabled")}
            <a href=${muted.reason_url} target="_blank" rel="noopener noreferrer"
              >${t("screen_off_disabled_link")}<span class="visually-hidden">
                ${t("opens_new_tab")}</span
              ></a
            ></span
          >
        </div>`
      : nothing;
    return this._renderRow(
      "screen",
      t("row_screen"),
      description,
      this._renderSwitch(
        "screen",
        status ? !status.screen_off : false,
        !status || cannotTurnOff,
        busy,
        (on) => this._run(on ? "screen_on" : "screen_off", {}, { screen_off: !on }),
        muted ? ["screen-note"] : [],
      ),
      note,
    );
  }

  private _renderBrightness(status: PanelStatus | null): TemplateResult {
    const value = this._brightnessDraft ?? status?.brightness ?? null;
    const busy = this._isPending("brightness");
    let description: string;
    if (!status || value === null) {
      description = t("state_unknown");
    } else if (status.brightness_auto && this._brightnessDraft === undefined) {
      description = t("brightness_auto");
    } else {
      description = percentFormat.format(value / 255);
    }
    const percent = `${((value ?? 0) / 255) * 100}%`;
    return html`<div class="row brightness">
      <div class="row-text">
        <label class="row-label" for="brightness">${t("row_brightness")}</label>
        <span class="row-description secondary" id="brightness-description"
          >${description}</span
        >
      </div>
      <div class="row-control slider-control">
        ${busy ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
        <input
          id="brightness"
          class="slider"
          type="range"
          min="0"
          max="255"
          step="1"
          style="--slider-percent: ${percent}"
          .value=${String(value ?? 0)}
          ?disabled=${!status}
          aria-describedby="brightness-description"
          aria-valuetext=${description}
          @input=${this._onBrightnessInput}
          @change=${this._onBrightnessChange}
        />
      </div>
    </div>`;
  }

  private _renderAutoBrightness(status: PanelStatus | null): TemplateResult {
    const busy = this._isPending("auto_brightness");
    // Turning it off sends the current brightness, which must be known.
    const cannotTurnOff = Boolean(status?.brightness_auto && status.brightness === null);
    return this._renderRow(
      "auto-brightness",
      t("row_auto_brightness"),
      cannotTurnOff ? t("row_auto_brightness_unknown") : t("row_auto_brightness_helper"),
      this._renderSwitch(
        "auto-brightness",
        Boolean(status?.brightness_auto),
        !status || cannotTurnOff,
        busy,
        (on) => {
          if (on) {
            this._run("auto_brightness", {}, { brightness_auto: true });
          } else if (status?.brightness != null) {
            this._run(
              "brightness",
              { value: status.brightness },
              { brightness_auto: false },
            );
          }
        },
      ),
    );
  }

  private _renderMaintenance(status: PanelStatus | null): TemplateResult {
    const busy = this._isPending("maintenance_on", "maintenance_off");
    const description = status
      ? status.maintenance
        ? t("row_maintenance_on")
        : t("row_maintenance_off")
      : t("state_unknown");
    return this._renderRow(
      "maintenance",
      t("row_maintenance"),
      description,
      this._renderSwitch(
        "maintenance",
        Boolean(status?.maintenance),
        !status,
        busy,
        (on) =>
          this._run(on ? "maintenance_on" : "maintenance_off", {}, {
            maintenance: on,
          }),
      ),
    );
  }

  private _renderPanelApp(status: PanelStatus | null): TemplateResult {
    const latest = this.panel.latest_app_version;
    const updateAvailable = Boolean(
      status && latest && latest !== status.app_version,
    );
    const description = html`${status?.app_version ?? t("state_unknown")}${updateAvailable
      ? html`<span class="update-note"
          >${t("update_available", { version: latest! })}</span
        >`
      : nothing}`;
    return this._renderRow(
      "panel-app",
      t("row_panel_app"),
      description,
      this._renderUpdateButton(
        "update_panel_app",
        t("update_panel_app_label"),
        updateAvailable,
      ),
    );
  }

  private _renderHaApp(status: PanelStatus | null): TemplateResult {
    const description = status
      ? (status.ha_app_version ?? t("not_installed"))
      : t("state_unknown");
    return this._renderRow(
      "ha-app",
      t("row_ha_app"),
      description,
      this._renderUpdateButton("update_ha_app", t("update_ha_app_label"), false),
    );
  }

  private _renderUpdateButton(
    command: PanelCommand,
    label: string,
    emphasize: boolean,
  ): TemplateResult {
    const busy = this._isPending(command);
    return html`<button
      class="btn small ${emphasize ? "filled" : "plain"}"
      type="button"
      aria-label=${label}
      aria-busy=${busy ? "true" : "false"}
      @click=${() => this._run(command)}
    >
      ${busy ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
      ${t("update")}
    </button>`;
  }

  private _renderActionButton(
    command: PanelCommand,
    label: string,
    onClick: () => void = () => this._run(command),
  ): TemplateResult {
    const busy = this._isPending(command);
    return html`<button
      class="btn plain small"
      type="button"
      aria-busy=${busy ? "true" : "false"}
      @click=${onClick}
    >
      ${busy ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
      ${label}
    </button>`;
  }

  private _renderOpenPage(): TemplateResult {
    const busy = this._isPending("navigate");
    return html`<form class="field open-page" novalidate @submit=${this._openPage}>
      <label for="path">${t("open_page")}</label>
      <div class="open-page-row">
        <input
          id="path"
          class="input"
          type="text"
          inputmode="url"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          .value=${this._path}
          aria-invalid=${this._pathError ? "true" : "false"}
          aria-describedby="path-help"
          @input=${this._onPathInput}
        />
        <button class="btn filled" type="submit" aria-busy=${busy ? "true" : "false"}>
          ${busy ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
          ${t("open")}
        </button>
      </div>
      ${this._pathError
        ? html`<span id="path-help" class="field-error"
            >${icon(mdiAlertCircleOutline)} ${t(this._pathError)}</span
          >`
        : html`<span id="path-help" class="helper">${t("open_page_helper")}</span>`}
    </form>`;
  }

  private _renderDialogError(): TemplateResult | typeof nothing {
    return this._dialogError
      ? html`<div class="alert error dialog-error" role="alert">
          ${icon(mdiAlertCircleOutline)}
          <span class="message">${this._dialogError}</span>
        </div>`
      : nothing;
  }

  private _renderRestartDialog(): TemplateResult {
    const busy = this._isPending("restart");
    return html`<smart-panel-dialog
      confirmation
      .open=${this._dialog === "restart"}
      .heading=${t("restart_title")}
      .guarded=${busy}
      @closed=${this._closeDialog}
    >
      ${this._renderDialogError()}
      <p>${t("restart_text", { name: this.panel.name })}</p>
      <button
        slot="actions"
        class="btn plain"
        type="button"
        ?disabled=${busy}
        @click=${this._closeDialog}
      >
        ${t("cancel")}
      </button>
      <button
        slot="actions"
        class="btn"
        type="button"
        data-autofocus
        aria-busy=${busy ? "true" : "false"}
        @click=${this._confirmRestart}
      >
        ${busy ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
        ${t("restart")}
      </button>
    </smart-panel-dialog>`;
  }

  private _renderResetDialog(): TemplateResult {
    const busy = this._isPending("factory_reset");
    const matches = this._resetConfirm === this.panel.name;
    return html`<smart-panel-dialog
      confirmation
      .open=${this._dialog === "factory_reset"}
      .heading=${t("reset_title")}
      .guarded=${busy}
      @closed=${this._closeDialog}
    >
      <form id="reset-form" class="dialog-form" novalidate @submit=${this._confirmReset}>
        ${this._renderDialogError()}
        <p>${t("reset_text", { name: this.panel.name })}</p>
        <div class="field">
          <label for="reset-confirm"
            >${t("reset_confirm_label", { name: this.panel.name })}</label
          >
          <input
            id="reset-confirm"
            class="input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            data-autofocus
            .value=${this._resetConfirm}
            @input=${this._onResetConfirmInput}
          />
        </div>
      </form>
      <button
        slot="actions"
        class="btn plain"
        type="button"
        ?disabled=${busy}
        @click=${this._closeDialog}
      >
        ${t("cancel")}
      </button>
      <button
        slot="actions"
        class="btn danger"
        type="submit"
        form="reset-form"
        ?disabled=${!matches}
        aria-busy=${busy ? "true" : "false"}
      >
        ${busy ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
        ${t("factory_reset")}
      </button>
    </smart-panel-dialog>`;
  }

  private _renderRemoveDialog(): TemplateResult {
    const busy = this._isPending("remove");
    return html`<smart-panel-dialog
      confirmation
      .open=${this._dialog === "remove"}
      .heading=${t("remove_title")}
      .guarded=${busy}
      @closed=${this._closeDialog}
    >
      ${this._renderDialogError()}
      <p>${t("remove_text", { name: this.panel.name })}</p>
      <button
        slot="actions"
        class="btn plain"
        type="button"
        data-autofocus
        ?disabled=${busy}
        @click=${this._closeDialog}
      >
        ${t("cancel")}
      </button>
      <button
        slot="actions"
        class="btn danger"
        type="button"
        aria-busy=${busy ? "true" : "false"}
        @click=${this._confirmRemove}
      >
        ${busy ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
        ${t("remove")}
      </button>
    </smart-panel-dialog>`;
  }

  private _isPending(...actions: Action[]): boolean {
    return actions.some((action) => this._pending.has(action));
  }

  private _setPending(action: Action, pending: boolean): void {
    const next = new Set(this._pending);
    if (pending) {
      next.add(action);
    } else {
      next.delete(action);
    }
    this._pending = next;
  }

  /**
   * Send a command. `requested` holds the status values it changes; they show
   * at once and stay until a report arrives or the timeout passes.
   */
  private async _run(
    command: PanelCommand,
    options: CommandOptions = {},
    requested: Requested = {},
  ): Promise<boolean> {
    if (this._pending.has(command)) {
      return false;
    }
    this._setPending(command, true);
    this._error = undefined;
    this._showSuccess(undefined);
    const before = this._requested;
    this._requested = { ...this._requested, ...requested };
    try {
      await sendCommand(this.hass, this.panel.panel_id, command, options);
      this._showSuccess(t(`sent_${command}`));
      if (Object.keys(requested).length) {
        window.clearTimeout(this._requestedTimer);
        this._requestedTimer = window.setTimeout(() => {
          this._requested = {};
        }, REQUESTED_TIMEOUT_MS);
      }
      return true;
    } catch (error) {
      this._requested = before;
      const message = t(`failed_${command}`, { message: errorMessage(error) });
      if (this._dialog) {
        this._dialogError = message;
      } else {
        this._error = message;
      }
      return false;
    } finally {
      this._setPending(command, false);
    }
  }

  private _showSuccess(message: string | undefined): void {
    window.clearTimeout(this._successTimer);
    this._success = message;
    if (message) {
      this._successTimer = window.setTimeout(() => {
        this._success = undefined;
      }, SUCCESS_MESSAGE_MS);
    }
  }

  private _dismissError(): void {
    this._error = undefined;
  }

  private _onBrightnessInput(event: Event): void {
    this._brightnessDraft = Number((event.target as HTMLInputElement).value);
    window.clearTimeout(this._brightnessTimer);
  }

  private _onBrightnessChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this._brightnessDraft = value;
    window.clearTimeout(this._brightnessTimer);
    this._brightnessTimer = window.setTimeout(() => {
      this._brightnessDraft = undefined;
      void this._run(
        "brightness",
        { value },
        { brightness: value, brightness_auto: false },
      );
    }, BRIGHTNESS_DEBOUNCE_MS);
  }

  private _onPathInput(event: Event): void {
    this._path = (event.target as HTMLInputElement).value;
    this._pathError = undefined;
  }

  private async _openPage(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const path = this._path.trim();
    if (!path) {
      this._pathError = "error_path_required";
    } else if (!PATH_PATTERN.test(path)) {
      this._pathError = "error_path_invalid";
    }
    if (this._pathError) {
      this.renderRoot.querySelector<HTMLInputElement>("#path")?.focus();
      return;
    }
    await this._run("navigate", { path });
  }

  private _openDialog(dialog: DialogName): void {
    this._dialogError = undefined;
    this._resetConfirm = "";
    this._dialog = dialog;
  }

  private _closeDialog(): void {
    const action: Action | undefined = this._dialog;
    if (action && this._pending.has(action)) {
      return;
    }
    this._dialog = undefined;
  }

  private _onResetConfirmInput(event: Event): void {
    this._resetConfirm = (event.target as HTMLInputElement).value;
  }

  private async _confirmRestart(): Promise<void> {
    if (await this._run("restart")) {
      this._dialog = undefined;
    }
  }

  private async _confirmReset(event: Event): Promise<void> {
    event.preventDefault();
    if (this._resetConfirm !== this.panel.name) {
      return;
    }
    if (await this._run("factory_reset", { confirm: "wipe" })) {
      this._dialog = undefined;
    }
  }

  private async _confirmRemove(): Promise<void> {
    if (this._pending.has("remove")) {
      return;
    }
    this._setPending("remove", true);
    this._dialogError = undefined;
    const name = this.panel.name;
    try {
      await removePanel(this.hass, this.panel.panel_id);
      this._dialog = undefined;
      this.dispatchEvent(
        new CustomEvent("panel-removed", {
          detail: { name },
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      this._dialogError = t("failed_remove", { message: errorMessage(error) });
    } finally {
      this._setPending("remove", false);
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
        height: 100%;
      }

      .card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .card-header {
        align-items: flex-start;
        gap: var(--ha-space-3);
      }

      .device-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: var(--ha-border-radius-circle);
        background-color: var(--ha-color-fill-neutral-quiet-resting);
        color: var(--secondary-text-color);
      }

      .heading {
        flex: 1;
        min-width: 0;
      }

      .heading h3 {
        font-size: var(--ha-font-size-l);
        font-weight: var(--ha-font-weight-medium);
        line-height: var(--ha-line-height-condensed);
        overflow-wrap: anywhere;
      }

      .heading p {
        font-size: var(--ha-font-size-s);
        margin-top: var(--ha-space-1);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--ha-space-2);
        flex: none;
        height: 28px;
        padding: 0 var(--ha-space-3);
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-border-radius-pill);
        font-size: var(--ha-font-size-s);
        font-weight: var(--ha-font-weight-medium);
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: var(--ha-border-radius-circle);
        background-color: var(--disabled-color);
      }

      .online .dot {
        background-color: var(--success-color);
      }

      .rows {
        display: flex;
        flex-direction: column;
        padding: var(--ha-space-3) var(--ha-space-4) var(--ha-space-2);
      }

      .rows > .alert {
        margin-bottom: var(--ha-space-2);
      }

      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--ha-space-1) var(--ha-space-4);
        min-height: 56px;
        padding: var(--ha-space-2) 0;
      }

      .row + .row {
        border-top: 1px solid var(--divider-color);
      }

      .row-text {
        display: flex;
        flex-direction: column;
        flex: 1 1 160px;
        min-width: 0;
      }

      .row-label {
        font-weight: var(--ha-font-weight-medium);
      }

      .row-description {
        font-size: var(--ha-font-size-s);
      }

      .update-note {
        display: block;
        color: var(--primary-text-color);
        font-weight: var(--ha-font-weight-medium);
      }

      .row-control {
        display: flex;
        align-items: center;
        gap: var(--ha-space-2);
        color: var(--secondary-text-color);
      }

      .slider-control {
        flex: 1 1 200px;
        max-width: 320px;
      }

      .row-note {
        flex-basis: 100%;
        margin-top: var(--ha-space-1);
        font-size: var(--ha-font-size-s);
      }

      .card-actions {
        padding-top: 0;
        padding-bottom: var(--ha-space-2);
        margin-inline-start: calc(-1 * var(--ha-space-3));
        margin-inline-end: 0;
        padding-inline-start: var(--ha-space-4);
      }

      .more {
        margin: 0 var(--ha-space-4);
        border-top: 1px solid var(--divider-color);
      }

      .more summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 48px;
        font-weight: var(--ha-font-weight-medium);
        list-style: none;
        cursor: pointer;
        border-radius: var(--ha-border-radius-sm);
      }

      .more summary::-webkit-details-marker {
        display: none;
      }

      .more summary .icon {
        color: var(--secondary-text-color);
        transition: transform var(--ha-animation-duration-fast) ease-out;
      }

      .more[open] summary .icon {
        transform: rotate(180deg);
      }

      .more summary:focus-visible {
        outline: var(--ha-border-width-md) solid var(--ha-color-focus);
        outline-offset: 2px;
      }

      .more-content {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-4);
        padding-bottom: var(--ha-space-4);
      }

      .open-page-row {
        display: flex;
        gap: var(--ha-space-2);
      }

      .open-page-row .input {
        flex: 1;
        min-width: 0;
      }

      .danger-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ha-space-2);
        margin-inline-start: calc(-1 * var(--ha-space-3));
      }

      .feedback {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-2);
        margin-top: auto;
        padding: 0 var(--ha-space-4) var(--ha-space-4);
      }

      .feedback .success:empty {
        display: none;
      }

      .feedback .success {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s);
      }

      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-4);
      }

      .dialog-error {
        margin-bottom: var(--ha-space-4);
      }

      .dialog-form .dialog-error {
        margin-bottom: 0;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "smart-panel-card": SmartPanelCard;
  }
}
