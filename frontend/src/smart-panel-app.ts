// The Smart panels page of Home Assistant: a header with two tabs, Setup and
// Manage. Home Assistant creates this element and sets hass, narrow, route,
// and panel on it.
import { mdiMenu, mdiQrcode, mdiTabletDashboard } from "@mdi/js";
import { css, html, LitElement, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { icon } from "./icon";
import "./manage-page";
import { handleLinkClick } from "./navigation";
import "./setup-page";
import { t } from "./strings";
import type { StringKey } from "./strings";
import { baseStyles, buttonStyles } from "./styles";
import type { HomeAssistant, PanelInfo, Route } from "./types";

type Page = "setup" | "manage";

const TABS: readonly { page: Page; label: StringKey; icon: string }[] = [
  { page: "setup", label: "tab_setup", icon: mdiQrcode },
  { page: "manage", label: "tab_manage", icon: mdiTabletDashboard },
];

@customElement("smart-panel-app")
export class SmartPanelApp extends LitElement {
  @property({ attribute: false }) accessor hass!: HomeAssistant;

  @property({ type: Boolean, reflect: true }) accessor narrow = false;

  @property({ attribute: false }) accessor route: Route | undefined;

  @property({ attribute: false }) accessor panel: PanelInfo | undefined;

  private get _page(): Page {
    const path = this.route?.path ?? "";
    return path === "/manage" || path.startsWith("/manage/") ? "manage" : "setup";
  }

  private _href(page: Page): string {
    const prefix = this.route?.prefix ?? `/${this.panel?.url_path ?? "smart-panel"}`;
    return `${prefix}/${page}`;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("hass")) {
      // Native controls, like the select menu, follow the dark mode of the theme.
      this.toggleAttribute("dark", Boolean(this.hass?.themes?.darkMode));
    }
  }

  protected override render() {
    if (!this.hass) {
      return nothing;
    }
    const showMenu = this.narrow || this.hass.dockedSidebar === "always_hidden";
    const page = this._page;
    return html`
      <header class="toolbar">
        ${showMenu
          ? html`<button
              class="icon-button menu"
              type="button"
              aria-label=${t("menu")}
              title=${t("menu")}
              @click=${this._toggleMenu}
            >
              ${icon(mdiMenu)}
            </button>`
          : nothing}
        <h1 class="title">${this.panel?.title || t("title")}</h1>
        ${this.narrow ? nothing : this._renderTabs(page, "top-bar")}
        ${this.narrow ? nothing : html`<span class="balance"></span>`}
      </header>
      <main class="content">
        <div class="page">
          ${page === "manage"
            ? html`<smart-panel-manage
                .hass=${this.hass}
                .setupHref=${this._href("setup")}
              ></smart-panel-manage>`
            : html`<smart-panel-setup
                .hass=${this.hass}
                .manageHref=${this._href("manage")}
              ></smart-panel-setup>`}
        </div>
      </main>
      ${this.narrow ? this._renderTabs(page, "bottom-bar") : nothing}
    `;
  }

  private _renderTabs(active: Page, placement: string): TemplateResult {
    return html`<nav class="tabs ${placement}" aria-label=${t("tabs_label")}>
      ${TABS.map(
        (tab) => html`<a
          class="tab"
          href=${this._href(tab.page)}
          aria-current=${tab.page === active ? "page" : "false"}
          @click=${handleLinkClick}
        >
          ${icon(tab.icon)}
          <span class="tab-name">${t(tab.label)}</span>
        </a>`,
      )}
    </nav>`;
  }

  private _toggleMenu(): void {
    this.dispatchEvent(
      new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }),
    );
  }

  static override styles = [
    baseStyles,
    buttonStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: var(--primary-background-color);
        color-scheme: light;
      }

      :host([dark]) {
        color-scheme: dark;
      }

      .toolbar {
        display: flex;
        align-items: center;
        flex: none;
        gap: var(--ha-space-2);
        height: calc(var(--header-height, 56px) + var(--safe-area-inset-top, 0px));
        padding: var(--safe-area-inset-top, 0px)
          calc(var(--ha-space-3) + var(--safe-area-inset-right, 0px)) 0
          calc(var(--ha-space-3) + var(--safe-area-inset-left, 0px));
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color, var(--primary-text-color));
        border-bottom: var(--app-header-border-bottom, 1px solid var(--divider-color));
      }

      :host([narrow]) .toolbar {
        padding-inline: calc(var(--ha-space-1) + var(--safe-area-inset-left, 0px))
          calc(var(--ha-space-1) + var(--safe-area-inset-right, 0px));
      }

      .menu {
        color: var(--sidebar-icon-color, var(--secondary-text-color));
      }

      .title {
        flex: 1;
        min-width: 0;
        margin-inline-start: var(--ha-space-3);
        font-size: var(--ha-font-size-xl);
        font-weight: var(--ha-font-weight-normal);
        line-height: var(--ha-line-height-condensed);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      :host([narrow]) .title {
        margin-inline-start: var(--ha-space-2);
      }

      .balance {
        flex: 1;
      }

      .tabs {
        display: flex;
        align-self: stretch;
      }

      .tab {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--ha-space-2);
        padding: 0 var(--ha-space-8);
        color: var(--app-header-text-color, var(--primary-text-color));
        font-size: var(--ha-font-size-m);
        font-weight: var(--ha-font-weight-medium);
        text-decoration: none;
        white-space: nowrap;
        transition: background-color var(--ha-animation-duration-fast) ease-out;
        -webkit-tap-highlight-color: transparent;
      }

      .tab .icon {
        color: var(--sidebar-icon-color, var(--secondary-text-color));
      }

      .tab:hover {
        background-color: var(--ha-color-fill-neutral-quiet-hover);
      }

      .tab:focus-visible {
        outline: var(--ha-border-width-md) solid var(--ha-color-focus);
        outline-offset: -2px;
        border-radius: 0;
      }

      .tab[aria-current="page"],
      .tab[aria-current="page"] .icon {
        color: var(--primary-color);
      }

      .top-bar .tab[aria-current="page"]::after {
        content: "";
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        height: 2px;
        background-color: var(--primary-color);
      }

      .bottom-bar {
        flex: none;
        justify-content: space-around;
        min-height: var(--header-height, 56px);
        padding: 0 var(--ha-space-4) var(--safe-area-inset-bottom, 0px);
        background-color: var(--app-header-background-color);
        border-top: 1px solid var(--divider-color);
      }

      .bottom-bar .tab {
        flex: 1;
        flex-direction: column;
        gap: var(--ha-space-1);
        min-height: var(--header-height, 56px);
        padding: 0 var(--ha-space-1);
        font-size: var(--ha-font-size-s);
      }

      .content {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: var(--ha-space-6)
          calc(var(--ha-space-6) + var(--safe-area-inset-right, 0px))
          calc(var(--ha-space-6) + var(--safe-area-inset-bottom, 0px))
          calc(var(--ha-space-6) + var(--safe-area-inset-left, 0px));
      }

      :host([narrow]) .content {
        padding: var(--ha-space-4)
          calc(var(--ha-space-4) + var(--safe-area-inset-right, 0px))
          var(--ha-space-4)
          calc(var(--ha-space-4) + var(--safe-area-inset-left, 0px));
      }

      .page {
        max-width: 1680px;
        margin: 0 auto;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "smart-panel-app": SmartPanelApp;
  }
}
