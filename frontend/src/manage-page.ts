import {
  mdiAlertCircleOutline,
  mdiPlus,
  mdiTabletDashboard,
} from "@mdi/js";
import { css, html, LitElement, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./dialog";
import "./panel-card";
import {
  addPanel,
  errorMessage,
  fetchCandidates,
  subscribePanels,
} from "./data";
import { icon } from "./icon";
import { handleLinkClick } from "./navigation";
import { t } from "./strings";
import {
  alertStyles,
  baseStyles,
  buttonStyles,
  cardStyles,
  spinnerStyles,
} from "./styles";
import type { Candidate, HomeAssistant, Panel, UnsubscribeFunc } from "./types";

/** How often relative times like "Last seen 5 minutes ago" move on. */
const CLOCK_INTERVAL_MS = 30_000;

@customElement("smart-panel-manage")
export class SmartPanelManage extends LitElement {
  @property({ attribute: false }) accessor hass!: HomeAssistant;

  /** URL of the Setup tab, for the empty state. */
  @property({ attribute: false }) accessor setupHref = "";

  @state() private accessor _panels: Panel[] | undefined;

  @state() private accessor _subscribeError: string | undefined;

  @state() private accessor _now = new Date();

  @state() private accessor _announcement = "";

  @state() private accessor _addOpen = false;

  @state() private accessor _candidates: Candidate[] | undefined;

  @state() private accessor _candidatesError: string | undefined;

  @state() private accessor _selected: string | undefined;

  @state() private accessor _adding = false;

  @state() private accessor _addError: string | undefined;

  private _unsubscribe: Promise<UnsubscribeFunc> | undefined;

  private _clock: number | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.hass) {
      this._subscribe();
    }
    this._clock = window.setInterval(() => {
      this._now = new Date();
    }, CLOCK_INTERVAL_MS);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._clock);
    this._unsubscribeNow();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("hass") && this.hass && !this._unsubscribe && this.isConnected) {
      this._subscribe();
    }
  }

  private _subscribe(): void {
    if (this._unsubscribe) {
      return;
    }
    this._subscribeError = undefined;
    const subscription = subscribePanels(this.hass, (message) => {
      this._panels = message.panels;
      this._now = new Date();
    });
    this._unsubscribe = subscription;
    subscription.catch((error: unknown) => {
      if (this._unsubscribe === subscription) {
        this._unsubscribe = undefined;
        this._subscribeError = errorMessage(error);
      }
    });
  }

  private _unsubscribeNow(): void {
    const subscription = this._unsubscribe;
    this._unsubscribe = undefined;
    // The subscription may still be starting; stop it once it has.
    subscription?.then((unsubscribe) => unsubscribe()).catch(() => {
      // It never started, or the connection is gone: nothing to stop.
    });
  }

  private _retry(): void {
    this._subscribe();
  }

  protected override render() {
    return html`
      <div class="header">
        <h2>${t("panels_title")}</h2>
        ${this._panels?.length
          ? html`<button class="btn" type="button" @click=${this._openAdd}>
              ${icon(mdiPlus)} ${t("add_panel")}
            </button>`
          : nothing}
      </div>
      <p class="visually-hidden" role="status">${this._announcement}</p>
      ${this._renderContent()} ${this._renderAddDialog()}
    `;
  }

  private _renderContent(): TemplateResult {
    if (this._subscribeError) {
      return html`<div class="alert error" role="alert">
        ${icon(mdiAlertCircleOutline)}
        <span class="message"
          >${t("panels_load_error", { message: this._subscribeError })}</span
        >
        <button class="btn plain small alert-action" type="button" @click=${this._retry}>
          ${t("retry")}
        </button>
      </div>`;
    }
    if (!this._panels) {
      return html`<div class="loading">
        <span class="spinner large" role="progressbar" aria-label=${t("loading")}></span>
      </div>`;
    }
    if (this._panels.length === 0) {
      return html`<div class="empty">
        <span class="empty-icon">${icon(mdiTabletDashboard)}</span>
        <h3>${t("empty_title")}</h3>
        <p class="secondary">${t("empty_description")}</p>
        <div class="empty-actions">
          <a class="btn plain" href=${this.setupHref} @click=${handleLinkClick}
            >${t("go_to_setup")}</a
          >
          <button class="btn" type="button" @click=${this._openAdd}>
            ${icon(mdiPlus)} ${t("add_panel")}
          </button>
        </div>
      </div>`;
    }
    return html`<ul class="panels">
      ${this._panels.map(
        (panel) => html`<li>
          <smart-panel-card
            .hass=${this.hass}
            .panel=${panel}
            .now=${this._now}
            @panel-removed=${this._onRemoved}
          ></smart-panel-card>
        </li>`,
      )}
    </ul>`;
  }

  private _renderAddDialog(): TemplateResult {
    return html`<smart-panel-dialog
      .open=${this._addOpen}
      .heading=${t("add_title")}
      .guarded=${this._adding}
      @closed=${this._closeAdd}
    >
      <form id="add-form" class="add-form" novalidate @submit=${this._add}>
        ${this._renderCandidates()}
      </form>
      <button
        slot="actions"
        class="btn plain"
        type="button"
        ?disabled=${this._adding}
        @click=${this._closeAdd}
      >
        ${t("cancel")}
      </button>
      <button
        slot="actions"
        class="btn"
        type="submit"
        form="add-form"
        ?disabled=${!this._selected}
        aria-busy=${this._adding ? "true" : "false"}
      >
        ${this._adding ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
        ${t("add")}
      </button>
    </smart-panel-dialog>`;
  }

  private _renderCandidates(): TemplateResult {
    if (this._candidatesError) {
      return html`<div class="alert error" role="alert">
        ${icon(mdiAlertCircleOutline)}
        <span class="message"
          >${t("add_load_error", { message: this._candidatesError })}</span
        >
        <button
          class="btn plain small alert-action"
          type="button"
          @click=${this._loadCandidates}
        >
          ${t("retry")}
        </button>
      </div>`;
    }
    if (!this._candidates) {
      return html`<div class="loading">
        <span class="spinner large" role="progressbar" aria-label=${t("loading")}></span>
      </div>`;
    }
    if (this._candidates.length === 0) {
      return html`<div class="empty small">
        <h3>${t("add_empty_title")}</h3>
        <p class="secondary">${t("add_empty")}</p>
      </div>`;
    }
    return html`
      ${this._addError
        ? html`<div class="alert error" role="alert">
            ${icon(mdiAlertCircleOutline)}
            <span class="message">${this._addError}</span>
          </div>`
        : nothing}
      <fieldset>
        <legend class="secondary">${t("add_intro")}</legend>
        ${this._candidates.map(
          (candidate) => html`<label class="candidate">
            <input
              type="radio"
              name="candidate"
              .value=${candidate.mobile_app_entry_id}
              .checked=${this._selected === candidate.mobile_app_entry_id}
              @change=${this._onSelect}
            />
            <span class="candidate-text">
              <span class="candidate-name">${candidate.name}</span>
              <span class="secondary"
                >${t("add_device_details", {
                  model: candidate.model,
                  version: candidate.app_version,
                })}</span
              >
            </span>
            ${candidate.likely_panel
              ? html`<span class="likely">${t("add_likely")}</span>`
              : nothing}
          </label>`,
        )}
      </fieldset>
    `;
  }

  private _openAdd(): void {
    this._addOpen = true;
    this._addError = undefined;
    this._selected = undefined;
    void this._loadCandidates();
  }

  private async _loadCandidates(): Promise<void> {
    this._candidates = undefined;
    this._candidatesError = undefined;
    try {
      const candidates = await fetchCandidates(this.hass);
      this._candidates = candidates;
      // Preselect the first likely panel, so one click adds it.
      this._selected = candidates.find((candidate) => candidate.likely_panel)
        ?.mobile_app_entry_id;
      await this.updateComplete;
      const radios = this.renderRoot.querySelectorAll<HTMLInputElement>(
        'input[name="candidate"]',
      );
      const checked = Array.from(radios).find((radio) => radio.checked);
      (checked ?? radios[0])?.focus();
    } catch (error) {
      this._candidatesError = errorMessage(error);
    }
  }

  private _closeAdd(): void {
    if (!this._adding) {
      this._addOpen = false;
    }
  }

  private _onSelect(event: Event): void {
    this._selected = (event.target as HTMLInputElement).value;
    this._addError = undefined;
  }

  private async _add(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const selected = this._candidates?.find(
      (candidate) => candidate.mobile_app_entry_id === this._selected,
    );
    if (!selected || this._adding) {
      return;
    }
    this._adding = true;
    this._addError = undefined;
    try {
      await addPanel(this.hass, selected.mobile_app_entry_id);
      this._addOpen = false;
      this._announcement = t("added", { name: selected.name });
    } catch (error) {
      this._addError = t("add_error", { message: errorMessage(error) });
    } finally {
      this._adding = false;
    }
  }

  private _onRemoved(event: CustomEvent<{ name: string }>): void {
    this._announcement = t("removed", { name: event.detail.name });
  }

  static override styles = [
    baseStyles,
    cardStyles,
    buttonStyles,
    alertStyles,
    spinnerStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }

      .header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--ha-space-2) var(--ha-space-4);
        min-height: 40px;
        margin-bottom: var(--ha-space-4);
      }

      .header h2 {
        font-size: var(--ha-font-size-xl);
        font-weight: var(--ha-font-weight-medium);
        line-height: var(--ha-line-height-condensed);
      }

      .panels {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: var(--ha-space-4);
        /* Each card keeps its own height: opening "More actions" on one card
           must not stretch its neighbour into what looks like an open card. */
        align-items: start;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      @container (min-width: 880px) {
        .panels {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--ha-space-6);
        }
      }

      @container (min-width: 1400px) {
        .panels {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ha-space-2);
        max-width: 500px;
        margin: 0 auto;
        padding: var(--ha-space-12) var(--ha-space-4);
        text-align: center;
      }

      .empty.small {
        padding: var(--ha-space-6) 0;
      }

      .empty-icon .icon {
        width: 64px;
        height: 64px;
        color: var(--secondary-text-color);
      }

      .empty h3 {
        font-size: var(--ha-font-size-xl);
        font-weight: var(--ha-font-weight-medium);
        line-height: var(--ha-line-height-condensed);
      }

      .empty-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--ha-space-2);
        margin-top: var(--ha-space-4);
      }

      .add-form {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-4);
      }

      fieldset {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-2);
        min-width: 0;
        margin: 0;
        padding: 0;
        border: none;
      }

      legend {
        margin-bottom: var(--ha-space-2);
        padding: 0;
      }

      .candidate {
        display: flex;
        align-items: center;
        gap: var(--ha-space-3);
        padding: var(--ha-space-3);
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-border-radius-md);
        cursor: pointer;
      }

      .candidate:has(input:checked) {
        border-color: var(--primary-color);
        box-shadow: inset 0 0 0 1px var(--primary-color);
      }

      .candidate input {
        flex: none;
        width: 18px;
        height: 18px;
        margin: 0;
        accent-color: var(--primary-color);
        cursor: pointer;
      }

      .candidate input:focus-visible {
        outline: var(--ha-border-width-md) solid var(--ha-color-focus);
        outline-offset: 2px;
      }

      .candidate-text {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .candidate-text .secondary {
        font-size: var(--ha-font-size-s);
      }

      .candidate-name {
        font-weight: var(--ha-font-weight-medium);
      }

      .likely {
        flex: none;
        padding: 2px var(--ha-space-2);
        border-radius: var(--ha-border-radius-pill);
        background-color: var(--ha-color-fill-primary-normal-resting);
        color: var(--ha-color-on-primary-normal);
        font-size: var(--ha-font-size-s);
        font-weight: var(--ha-font-weight-medium);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "smart-panel-manage": SmartPanelManage;
  }
}
