// Shared styles. Colors, sizes, and spacing come from the theme variables and
// design tokens of Home Assistant, so the panel follows the theme and dark mode.
import { css } from "lit";

export const baseStyles = css`
  :host {
    font-family: var(--ha-font-family-body);
    font-size: var(--ha-font-size-m);
    line-height: var(--ha-line-height-normal);
    color: var(--primary-text-color);
    -webkit-font-smoothing: var(--ha-font-smoothing);
    -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  .icon {
    width: 24px;
    height: 24px;
    flex: none;
    fill: currentColor;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .secondary {
    color: var(--secondary-text-color);
  }

  a {
    color: var(--ha-color-text-link, var(--primary-color));
  }

  a:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
    border-radius: var(--ha-border-radius-sm);
  }
`;

export const cardStyles = css`
  .card {
    background: var(--ha-card-background, var(--card-background-color));
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, var(--divider-color));
    border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
    box-shadow: var(--ha-card-box-shadow, none);
    color: var(--primary-text-color);
    min-width: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--ha-space-2);
    padding: var(--ha-space-4) var(--ha-space-4) 0;
  }

  .card-header h2 {
    flex: 1;
    min-width: 0;
    font-size: var(--ha-card-header-font-size, var(--ha-font-size-xl));
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
    color: var(--ha-card-header-color, var(--primary-text-color));
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-4);
    padding: var(--ha-space-4);
  }

  .card-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ha-space-2);
    padding: var(--ha-space-2) var(--ha-space-4) var(--ha-space-4);
  }
`;

export const buttonStyles = css`
  .btn {
    --btn-fill: var(--ha-color-fill-primary-loud-resting);
    --btn-fill-hover: var(--ha-color-fill-primary-loud-hover);
    --btn-fill-active: var(--ha-color-fill-primary-loud-active);
    --btn-text: var(--ha-color-on-primary-loud);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ha-space-2);
    min-height: 40px;
    padding: var(--ha-space-1) var(--ha-space-4);
    border: var(--ha-border-width-sm) solid transparent;
    border-radius: var(--ha-button-border-radius, var(--ha-border-radius-pill));
    background-color: var(--btn-fill);
    color: var(--btn-text);
    font-family: inherit;
    font-size: var(--ha-font-size-m);
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--ha-animation-duration-fast) ease-out;
    -webkit-tap-highlight-color: transparent;
  }

  .btn .icon {
    width: 18px;
    height: 18px;
  }

  .btn:hover {
    background-color: var(--btn-fill-hover);
  }

  .btn:active {
    background-color: var(--btn-fill-active);
  }

  .btn:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .btn.danger {
    --btn-fill: var(--ha-color-fill-danger-loud-resting);
    --btn-fill-hover: var(--ha-color-fill-danger-loud-hover);
    --btn-fill-active: var(--ha-color-fill-danger-loud-active);
    --btn-text: var(--ha-color-on-danger-loud);
  }

  .btn.filled {
    --btn-fill: var(--ha-color-fill-primary-normal-resting);
    --btn-fill-hover: var(--ha-color-fill-primary-normal-hover);
    --btn-fill-active: var(--ha-color-fill-primary-normal-active);
    --btn-text: var(--ha-color-on-primary-normal);
  }

  .btn.plain {
    --btn-fill: transparent;
    --btn-fill-hover: var(--ha-color-fill-primary-quiet-hover);
    --btn-fill-active: var(--ha-color-fill-primary-quiet-active);
    --btn-text: var(--ha-color-on-primary-normal);
  }

  .btn.plain.danger {
    --btn-fill: transparent;
    --btn-fill-hover: var(--ha-color-fill-danger-quiet-hover);
    --btn-fill-active: var(--ha-color-fill-danger-quiet-active);
    --btn-text: var(--ha-color-on-danger-normal);
  }

  .btn.small {
    min-height: 32px;
    padding: var(--ha-space-1) var(--ha-space-3);
  }

  .btn:disabled,
  .btn[aria-disabled="true"] {
    --btn-fill: var(--ha-color-fill-disabled-loud-resting);
    --btn-fill-hover: var(--btn-fill);
    --btn-fill-active: var(--btn-fill);
    --btn-text: var(--ha-color-on-disabled-loud);
    cursor: default;
  }

  .btn.plain:disabled,
  .btn.plain[aria-disabled="true"] {
    --btn-fill: transparent;
    --btn-text: var(--ha-color-on-disabled-quiet);
  }

  /* A running action keeps its look; only the spinner says it is busy. */
  .btn[aria-busy="true"] {
    cursor: progress;
  }

  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 48px;
    height: 48px;
    padding: 0;
    border: none;
    border-radius: var(--ha-border-radius-circle);
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background-color var(--ha-animation-duration-fast) ease-out;
    -webkit-tap-highlight-color: transparent;
  }

  .icon-button.small {
    width: 40px;
    height: 40px;
  }

  .icon-button:hover {
    background-color: var(--ha-color-fill-neutral-quiet-hover);
  }

  .icon-button:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: -2px;
  }
`;

export const fieldStyles = css`
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-1);
    min-width: 0;
  }

  .field > label,
  .field .label,
  .check-text .label {
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
  }

  .required::after {
    content: " *";
  }

  .control {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input {
    width: 100%;
    min-height: 40px;
    padding: var(--ha-space-2) var(--ha-space-3);
    border: var(--ha-border-width-sm) solid var(--ha-color-border-neutral-normal);
    border-radius: var(--ha-border-radius-md);
    background-color: var(--card-background-color);
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: var(--ha-font-size-l);
    line-height: var(--ha-line-height-condensed);
    transition: border-color var(--ha-animation-duration-fast) ease-out;
  }

  .input::placeholder {
    color: var(--secondary-text-color);
    opacity: 1;
  }

  .input:hover {
    border-color: var(--ha-color-border-neutral-loud);
  }

  .input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: inset 0 0 0 1px var(--primary-color);
  }

  .input[aria-invalid="true"] {
    border-color: var(--ha-color-border-danger-normal);
  }

  .input[aria-invalid="true"]:focus {
    box-shadow: inset 0 0 0 1px var(--ha-color-border-danger-normal);
  }

  .input:disabled {
    background-color: var(--ha-color-form-background-disabled);
    color: var(--ha-color-text-disabled);
  }

  .control .input.has-end {
    padding-inline-end: 48px;
  }

  .control .end {
    position: absolute;
    inset-inline-end: 0;
    color: var(--secondary-text-color);
  }

  select.input {
    appearance: none;
    padding-inline-end: 40px;
    cursor: pointer;
  }

  .control .chevron {
    position: absolute;
    inset-inline-end: var(--ha-space-3);
    pointer-events: none;
    color: var(--secondary-text-color);
  }

  .helper {
    font-size: var(--ha-font-size-s);
    line-height: var(--ha-line-height-normal);
    color: var(--secondary-text-color);
  }

  .field-error {
    display: flex;
    align-items: flex-start;
    gap: var(--ha-space-1);
    font-size: var(--ha-font-size-s);
    line-height: var(--ha-line-height-normal);
    color: var(--ha-color-on-danger-quiet, var(--error-color));
  }

  .field-error .icon {
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }

  .check {
    display: flex;
    align-items: flex-start;
    gap: var(--ha-space-3);
    cursor: pointer;
  }

  .check input {
    flex: none;
    width: 18px;
    height: 18px;
    margin: 1px 0 0;
    accent-color: var(--primary-color);
    cursor: pointer;
  }

  .check input:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .check-text {
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-1);
  }

  /* Switch: a checkbox with role="switch", for settings that apply at once. */
  .switch {
    appearance: none;
    position: relative;
    flex: none;
    width: 48px;
    height: 24px;
    margin: 8px 0;
    border: var(--ha-border-width-sm) solid var(--ha-color-border-neutral-normal);
    border-radius: var(--ha-border-radius-pill);
    background-color: var(--ha-color-fill-disabled-quiet-resting);
    cursor: pointer;
    transition: background-color var(--ha-animation-duration-fast) ease;
  }

  .switch::before {
    content: "";
    position: absolute;
    top: 2px;
    inset-inline-start: 2px;
    width: 18px;
    height: 18px;
    border-radius: var(--ha-border-radius-circle);
    background-color: var(--ha-color-on-neutral-normal);
    transition: inset-inline-start var(--ha-animation-duration-fast) ease;
  }

  .switch:hover {
    background-color: var(--ha-color-fill-disabled-quiet-hover);
  }

  .switch:checked {
    border-color: var(--ha-color-border-primary-loud);
    background-color: var(--ha-color-fill-primary-normal-resting);
  }

  .switch:checked:hover {
    background-color: var(--ha-color-fill-primary-normal-hover);
  }

  .switch:checked::before {
    inset-inline-start: 26px;
    background-color: var(--ha-color-on-primary-normal);
  }

  .switch:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .switch:disabled {
    opacity: 0.3;
    cursor: default;
  }

  /* Slider */
  .slider {
    --slider-fill: var(--primary-color);
    --slider-track: var(--disabled-color);
    appearance: none;
    width: 100%;
    min-width: 100px;
    height: 24px;
    margin: 0;
    background: transparent;
    cursor: pointer;
  }

  .slider::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: var(--ha-border-radius-pill);
    background: linear-gradient(
      to right,
      var(--slider-fill) var(--slider-percent, 0%),
      var(--slider-track) var(--slider-percent, 0%)
    );
  }

  .slider::-moz-range-track {
    height: 4px;
    border-radius: var(--ha-border-radius-pill);
    background: var(--slider-track);
  }

  .slider::-moz-range-progress {
    height: 4px;
    border-radius: var(--ha-border-radius-pill);
    background: var(--slider-fill);
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    margin-top: -8px;
    border: none;
    border-radius: var(--ha-border-radius-circle);
    background: var(--slider-fill);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border: none;
    border-radius: var(--ha-border-radius-circle);
    background: var(--slider-fill);
  }

  .slider:focus {
    outline: none;
  }

  .slider:focus-visible::-webkit-slider-thumb {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .slider:focus-visible::-moz-range-thumb {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .slider:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const alertStyles = css`
  .alert {
    --alert-color: var(--info-color);
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--ha-space-2);
    padding: var(--ha-space-2);
    border-radius: var(--ha-border-radius-sm);
    color: var(--primary-text-color);
    overflow-wrap: anywhere;
  }

  .alert::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--alert-color);
    opacity: 0.12;
    pointer-events: none;
  }

  .alert > .icon {
    color: var(--alert-color);
  }

  .alert .message {
    flex: 1;
    min-width: 0;
  }

  .alert .alert-action {
    position: relative;
    flex: none;
  }

  .alert.error {
    --alert-color: var(--error-color);
  }

  .alert.warning {
    --alert-color: var(--warning-color);
  }

  .alert.success {
    --alert-color: var(--success-color);
  }
`;

export const spinnerStyles = css`
  .spinner {
    display: inline-block;
    flex: none;
    width: var(--spinner-size, 18px);
    height: var(--spinner-size, 18px);
    border: var(--spinner-width, 2px) solid currentColor;
    border-inline-end-color: transparent;
    border-radius: var(--ha-border-radius-circle);
    animation: spin 750ms linear infinite;
  }

  .spinner.large {
    --spinner-size: 48px;
    --spinner-width: 4px;
    color: var(--primary-color);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 2s;
    }
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--ha-space-8) var(--ha-space-4);
  }
`;
