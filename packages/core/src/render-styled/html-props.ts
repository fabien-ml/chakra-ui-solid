/**
 * Seven HTML attribute names that are style props here, and the five escape hatches Chakra ships
 * for the ones that are also real attributes.
 *
 * `color`, `size`, `translate`, `transition`, `width`, `height` and `content` are all CSS
 * properties, so a styled element folds them into a class and they never reach the DOM. For five
 * of them that loses a genuine HTML attribute — `<input size>`, `<img width height>`,
 * `<span translate>`, `<meta content>` — and losing it is silent, which is the failure shape this
 * repo is built to avoid. Chakra's answer is a renamed prop, and it is API shape, so we adopt it
 * (`plan.md` §2.3).
 */
export const HTML_PROP_RENAMES = {
  htmlSize: "size",
  htmlWidth: "width",
  htmlHeight: "height",
  htmlTranslate: "translate",
  htmlContent: "content",
} as const;

/** The style-prop names that displace an HTML attribute. `color` and `transition` have no escape hatch, in Chakra either. */
export type DisplacedHtmlProp =
  | "color"
  | "size"
  | "translate"
  | "transition"
  | "width"
  | "height"
  | "content";

export interface HtmlProps {
  /** `<input size>` / `<select size>` — the visible-character or row count, not the CSS `size` shorthand. */
  htmlSize?: number | undefined;
  /** `<img width>` / `<canvas width>` — the intrinsic attribute, not the CSS `width`. */
  htmlWidth?: string | number | undefined;
  /** `<img height>` / `<canvas height>` — the intrinsic attribute, not the CSS `height`. */
  htmlHeight?: string | number | undefined;
  /** The global `translate` attribute, which tells a translation tool to skip a subtree. */
  htmlTranslate?: "yes" | "no" | undefined;
  /** `<meta content>` — the attribute, not the CSS `content` of a pseudo-element. */
  htmlContent?: string | undefined;
}

/**
 * An element's own props with the seven displaced names removed and the five escape hatches added.
 * The removal is what makes `<Box as="input" size={20}>` a **type error** rather than a style prop
 * that silently swallows the attribute.
 */
export type PatchHtmlProps<Props> = Omit<Props, DisplacedHtmlProp> & HtmlProps;
