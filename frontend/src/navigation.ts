/**
 * Go to another path inside Home Assistant, the way the frontend does it: a
 * new history entry, then `location-changed` so the app updates the route.
 */
export const navigate = (path: string): void => {
  history.pushState(null, "", path);
  window.dispatchEvent(
    new CustomEvent("location-changed", { detail: { replace: false } }),
  );
};

/**
 * Click handler for links inside Home Assistant. Plain clicks navigate in
 * place; clicks with a modifier key keep the default, like a new tab.
 */
export const handleLinkClick = (event: MouseEvent): void => {
  const link = event.currentTarget;
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(link instanceof HTMLAnchorElement)
  ) {
    return;
  }
  event.preventDefault();
  navigate(link.getAttribute("href") ?? "");
};
