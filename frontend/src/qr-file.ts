import { LANGUAGE, t } from "./strings";

/** The SVG of the QR code as a data URL, for an <img> or a download link. */
export const svgDataUrl = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Save the QR code as an SVG file. */
export const downloadQr = (svg: string): void => {
  const link = document.createElement("a");
  link.href = svgDataUrl(svg);
  link.download = t("qr_file_name");
  link.click();
};

const PRINT_STYLES = `
  @page { margin: 20mm; }
  body { font-family: system-ui, sans-serif; color: #000; background: #fff; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 4pt; }
  .network { font-size: 12pt; margin: 0 0 16pt; }
  ol { font-size: 12pt; line-height: 1.5; margin: 0 0 16pt; padding-left: 18pt; }
  img { display: block; width: 80mm; height: 80mm; margin: 0 0 16pt; }
  .secret { font-size: 10pt; }
`;

/**
 * Print a page with only the QR code and short instructions. The page is a
 * document of its own in a hidden frame inside `host`, so nothing else of
 * Home Assistant is printed and its document is not changed.
 */
export const printQr = async (
  host: ParentNode,
  svg: string,
  ssid: string,
): Promise<void> => {
  // A frame stays when the browser sends no afterprint event; replace it.
  host.querySelectorAll("iframe[data-print-frame]").forEach((old) => old.remove());
  const frame = document.createElement("iframe");
  frame.dataset.printFrame = "";
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  host.append(frame);

  const view = frame.contentWindow;
  const doc = frame.contentDocument;
  if (!view || !doc) {
    frame.remove();
    throw new Error("The print frame has no document");
  }

  const add = <K extends keyof HTMLElementTagNameMap>(
    parent: Node,
    tag: K,
    text = "",
  ): HTMLElementTagNameMap[K] => {
    const element = doc.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
    return element;
  };

  doc.documentElement.lang = LANGUAGE;
  doc.title = t("print_title");
  add(doc.head, "style", PRINT_STYLES);
  add(doc.body, "h1", t("print_title"));
  add(doc.body, "p", t("print_network", { ssid })).className = "network";
  const steps = add(doc.body, "ol");
  for (const key of [
    "print_step_reset",
    "print_step_wifi",
    "print_step_tap",
    "print_step_scan",
    "print_step_finish",
  ] as const) {
    add(steps, "li", t(key));
  }
  const image = add(doc.body, "img");
  image.alt = t("qr_alt");
  image.src = svgDataUrl(svg);
  add(doc.body, "p", t("print_secret")).className = "secret";

  try {
    await image.decode();
  } catch (error) {
    frame.remove();
    throw error;
  }
  view.addEventListener("afterprint", () => frame.remove(), { once: true });
  view.focus();
  view.print();
};
