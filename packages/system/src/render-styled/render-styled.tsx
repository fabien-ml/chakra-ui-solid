// Carried from hope-ui `e9c2f81`, `packages/components/src/system/style-props.tsx` (104 lines).
// Same author, MIT — ours, forked on copy (`CLAUDE.md`, *Reference use*). Three prop-surface additions on top of
// it, each named below and each `plan.md` §2.3's. Renamed after what it exports: style props are
// one of `renderStyled`'s inputs, not the thing this file is.

import { css, cx } from "@chakra-ui-solid/styled-system/css";
import { isCssProperty } from "@chakra-ui-solid/styled-system/is-valid-prop";
import type { SystemStyleObject } from "@chakra-ui-solid/styled-system/types";
import type { JSX, ValidComponent } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";
import { type RenderProp, renderElement } from "../render/render";
import { HTML_PROP_RENAMES } from "./html-props";

/**
 * The `css` escape hatch, in both the single and the array form Chakra accepts.
 *
 * Panda's generated `JsxStyleProps` already declares this shape, so a component that spreads it
 * inherits the array form for free and must not redeclare `css` — only the *runtime* half was
 * missing, and that is the spread in the class getter below.
 */
export type CssProp = SystemStyleObject | SystemStyleObject[];

/**
 * Options for {@link renderStyled} — a superset of what `renderElement` needs, plus the
 * `recipeClass` seam. `Props` is the element's fixed prop shape (e.g.
 * `JSX.HTMLAttributes<HTMLElement>`), not a type that morphs by `as` — see the note in
 * {@link renderStyled}.
 */
export interface RenderStyledOptions<
  Props extends { class?: unknown },
  El extends Element = Element,
> {
  /** The element/component to render. Polymorphism is delegated to `renderElement`. */
  as: ValidComponent;
  /**
   * The full incoming props bag: DOM props + style props (`p`, `bg`, `_hover`, …) + `class` /
   * `style` / the `css` escape hatch. Style props, `class`, `css` and `unstyled` are consumed here;
   * everything else is forwarded verbatim.
   */
  props: Props;
  /** Consumer render-prop override; receives the computed props. */
  render?: RenderProp<Props>;
  /** A component-internal ref setter; `renderElement` merges it with the consumer's own `ref`. */
  ref?: JSX.RefCallback<El>;
  /**
   * Class(es) placed *below* style props in the cascade — the seam the recipe layer plugs into.
   * `createSlotClasses(...)().content` is the usual argument. Suppressed when the caller passes
   * `unstyled`.
   */
  recipeClass?: Accessor<string | undefined>;
}

/**
 * The one reusable style-props mechanism every component and part opts into — `renderElement`
 * (`as` / render-prop polymorphism + ref merging) plus style-prop extraction and class
 * composition.
 *
 * Class precedence, low → high: `recipeClass` → style props + the `css` prop → the consumer's
 * `class` (appended last, so it wins ties). Consumer inline `style` is forwarded untouched and
 * always beats a class, which is what makes the CSS-custom-property route work for genuinely
 * dynamic values.
 *
 * SSR-safe by construction: the `class` getter is pure render-time computation — no DOM access, no
 * effects, no generated ids — and `css()` emits stable unhashed names, so server and client agree.
 *
 * `as` is a loose `ValidComponent`, never a generic that re-types `Props` from the element, so this
 * carries none of the deep-conditional polymorphic-type cost that wrecks IntelliSense in that other
 * SolidJS overlay library — `renderStyled<Props>` is as cheap to type-check as
 * `renderElement<Props>`.
 */
export function renderStyled<Props extends { class?: unknown }, El extends Element = Element>(
  options: RenderStyledOptions<Props, El>,
): JSX.Element {
  const props = options.props as Props & {
    css?: CssProp;
    unstyled?: boolean;
  };

  // Which passed keys are style props is stable for a given render — the KEY (`p`, `bg`) is static;
  // only its VALUE is reactive — so compute the list once and read the values lazily in the `class`
  // getter below. That is what preserves style-prop reactivity. `isCssProperty("css")` is true, but
  // the `css` escape hatch is a *nested* style object, not a per-prop value: Panda's `css()` does
  // not flatten a `css` KEY, so folding it in with the others emits garbage (`color:css_red`).
  // Exclude it here and pass its value as a sibling `css()` argument in the getter below, which is
  // how Panda merges it (and lets it win ties — the documented escape-hatch precedence).
  const styleKeys = Object.keys(props).filter((key) => isCssProperty(key) && key !== "css");

  // Addition 3 — the five `html*` renames. `htmlSize` reaches the element as `size`, and so on for
  // `width`, `height`, `translate` and `content`, all of which are style props here and would
  // otherwise be swallowed into a class with nothing to say so.
  const htmlKeys = Object.keys(props).filter((key) => key in HTML_PROP_RENAMES);

  // `as`/`render`/`class`/`css`/`unstyled` and the style props never reach the element as
  // attributes: `as`/`render` are handled by `renderElement`, `class`/`css` and the style props
  // become the computed class, and `unstyled` is a styling opt-out rather than an attribute.
  // `omit` keeps the rest reactive. Stripping `as`/`render` defensively lets callers hand us a raw
  // component props bag (Box) or a machine part's merged bag with no ceremony.
  const rest = omit(
    props as Record<string, unknown>,
    "as",
    "render",
    "class",
    "css",
    "unstyled",
    ...htmlKeys,
    ...styleKeys,
  ) as Props;

  // Getters rather than a plain object, so a rename stays as reactive as the prop it renames.
  const renamedHtmlProps = Object.defineProperties(
    {},
    Object.fromEntries(
      htmlKeys.map((key) => [
        HTML_PROP_RENAMES[key as keyof typeof HTML_PROP_RENAMES],
        {
          get: () => (props as Record<string, unknown>)[key],
          enumerable: true,
          configurable: true,
        },
      ]),
    ),
  );

  const elementProps = merge(rest, renamedHtmlProps, {
    get class() {
      const styles: Record<string, unknown> = {};
      for (const key of styleKeys) {
        styles[key] = (props as Record<string, unknown>)[key];
      }

      // Addition 1 — `css` accepts an array. `css()` is variadic and merges left to right, so the
      // array form is a spread rather than a manual merge.
      const cssProp = props.css;
      const cssArguments = Array.isArray(cssProp) ? cssProp : [cssProp];

      return cx(
        // Addition 2 — `unstyled` opts the element out of the theme styles by suppressing the
        // recipe class. Style props and the `css` prop still apply: the opt-out is of the recipe,
        // not of styling.
        props.unstyled === true ? undefined : options.recipeClass?.(),
        css(styles as SystemStyleObject, ...cssArguments),
        props.class as string | undefined,
      );
    },
  }) as Props;

  return renderElement<Props, El>({
    as: options.as,
    render: options.render,
    ref: options.ref,
    props: elementProps,
  });
}
