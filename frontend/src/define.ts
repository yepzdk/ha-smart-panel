/**
 * Class decorator that registers a custom element once.
 *
 * Home Assistant imports the panel module again when its URL changes, for
 * example after an update changes the bundle's cache-busting query, without a
 * page reload. Defining the same tag twice throws, so a second import leaves
 * the already registered elements in place; a reload picks up the new code.
 */
export const defineOnce =
  (tagName: string) =>
  (target: CustomElementConstructor, context: ClassDecoratorContext): void => {
    context.addInitializer(() => {
      if (!customElements.get(tagName)) {
        customElements.define(tagName, target);
      }
    });
  };
