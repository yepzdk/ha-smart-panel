import { mdiClose } from "@mdi/js";
import { css, html, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { icon } from "./icon";
import { t } from "./strings";
import { baseStyles, buttonStyles } from "./styles";

/** The element that has focus, also when it sits inside shadow roots. */
const deepActiveElement = (): HTMLElement | null => {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active instanceof HTMLElement ? active : null;
};

/**
 * A modal dialog on the native <dialog> element. The owner opens it with
 * `open` and closes it when the `closed` event arrives.
 *
 * - `confirmation`: no close button, and selecting outside does nothing.
 * - `guarded`: Escape and selecting outside do nothing, like while a form has
 *   changes or an action runs.
 *
 * The element with `data-autofocus` in the content gets focus when it opens; focus
 * goes back to where it was when it closes.
 */
@customElement("smart-panel-dialog")
export class SmartPanelDialog extends LitElement {
  @property({ type: Boolean }) accessor open = false;

  @property() accessor heading = "";

  @property({ type: Boolean }) accessor confirmation = false;

  @property({ type: Boolean }) accessor guarded = false;

  @query("dialog") private accessor _dialog!: HTMLDialogElement;

  private _returnFocus: HTMLElement | null = null;

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has("open")) {
      return;
    }
    if (this.open && !this._dialog.open) {
      this._returnFocus = deepActiveElement();
      this._dialog.showModal();
      const target = this.querySelector<HTMLElement>("[data-autofocus]");
      target?.focus();
    } else if (!this.open && this._dialog.open) {
      this._dialog.close();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._restoreFocus();
  }

  protected override render() {
    return html`
      <dialog
        aria-labelledby="title"
        class=${this.confirmation ? "confirmation" : "standard"}
        @cancel=${this._onCancel}
        @close=${this._onClose}
        @click=${this._onClick}
      >
        <div class="surface">
          <header>
            ${this.confirmation
              ? nothing
              : html`<button
                  class="icon-button"
                  type="button"
                  aria-label=${t("close")}
                  title=${t("close")}
                  ?disabled=${this.guarded}
                  @click=${this._requestClose}
                >
                  ${icon(mdiClose)}
                </button>`}
            <h2 id="title">${this.heading}</h2>
          </header>
          <div class="body">
            <slot></slot>
          </div>
          <footer>
            <slot name="actions"></slot>
          </footer>
        </div>
      </dialog>
    `;
  }

  /** Close as if the person dismissed the dialog. */
  private _requestClose(): void {
    this._dialog.close();
  }

  private _onCancel(event: Event): void {
    // Escape. A guarded dialog stays open.
    if (this.guarded) {
      event.preventDefault();
    }
  }

  private _onClick(event: MouseEvent): void {
    // A click on the dialog element itself is a click on the scrim, because
    // the surface fills the whole box of the dialog.
    if (
      event.target === this._dialog &&
      !this.confirmation &&
      !this.guarded
    ) {
      this._dialog.close();
    }
  }

  private _onClose(): void {
    this._restoreFocus();
    this.dispatchEvent(new CustomEvent("closed"));
  }

  private _restoreFocus(): void {
    const target = this._returnFocus;
    this._returnFocus = null;
    if (target?.isConnected) {
      target.focus();
    }
  }

  static override styles = [
    baseStyles,
    buttonStyles,
    css`
      dialog {
        width: min(var(--dialog-width, 580px), calc(100vw - 32px));
        max-width: none;
        max-height: calc(100vh - 80px);
        padding: 0;
        border: none;
        border-radius: var(--ha-dialog-border-radius, var(--ha-border-radius-3xl));
        background: var(--ha-dialog-surface-background, var(--card-background-color));
        color: var(--primary-text-color);
        box-shadow: var(--dialog-box-shadow, var(--wa-shadow-l, none));
        overflow: hidden;
      }

      dialog.confirmation {
        --dialog-width: 420px;
      }

      dialog[open] {
        display: flex;
        animation: dialog-in var(--ha-animation-duration-normal) ease-out;
      }

      dialog::backdrop {
        background-color: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.32));
        backdrop-filter: var(--ha-dialog-scrim-backdrop-filter, none);
      }

      @keyframes dialog-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
      }

      .surface {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: inherit;
      }

      header {
        display: flex;
        align-items: center;
        gap: var(--ha-space-1);
        min-height: 48px;
        padding: var(--ha-space-4) var(--ha-space-2) var(--ha-space-2);
      }

      .confirmation header {
        padding: var(--ha-space-6) var(--ha-space-6) var(--ha-space-2);
      }

      h2 {
        flex: 1;
        min-width: 0;
        font-size: var(--ha-font-size-xl);
        font-weight: var(--ha-font-weight-medium);
        line-height: var(--ha-line-height-condensed);
        overflow-wrap: anywhere;
      }

      .standard h2 {
        padding-inline-end: var(--ha-space-4);
      }

      .body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: var(--ha-space-2) var(--ha-space-6) var(--ha-space-4);
      }

      footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: var(--ha-space-3);
        padding: var(--ha-space-3) var(--ha-space-4) var(--ha-space-4);
      }

      /* Small screens: a standard dialog fills the screen. */
      @media (max-width: 450px), (max-height: 500px) {
        dialog.standard {
          width: 100vw;
          height: 100vh;
          max-height: none;
          border-radius: 0;
          padding-top: var(--safe-area-inset-top, 0px);
          padding-bottom: var(--safe-area-inset-bottom, 0px);
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "smart-panel-dialog": SmartPanelDialog;
  }
}
