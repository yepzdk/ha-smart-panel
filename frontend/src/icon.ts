import { html } from "lit";
import type { TemplateResult } from "lit";

/** An MDI icon path as inline SVG in the current text color, hidden from screen readers. */
export const icon = (path: string): TemplateResult =>
  html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d=${path}></path></svg>`;
