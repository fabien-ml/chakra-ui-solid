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
 * A component's own style object placed **first** in the `css` prop, with the consumer's spread
 * after it so theirs still wins.
 *
 * This is the seam a layout component's shorthand mapping uses — `flex.raw({ direction })`,
 * `square.raw({ size })` — and it is deliberately `css` rather than
 * {@link RenderStyledOptions.baseStyles}: Chakra puts those mappings in `css` too, which is what
 * makes `direction` beat a `flexDirection` style prop passed alongside it. `baseStyles` sits under
 * the style props and would answer the other way.
 */
export function composeCss(own: SystemStyleObject, consumer: CssProp | undefined): CssProp {
  if (consumer === undefined) {
    return own;
  }
  return Array.isArray(consumer) ? [own, ...consumer] : [own, consumer];
}

/** Whatever an element accepts as inline `style` — Solid takes an object, a declaration string, or neither. */
type StyleProp = JSX.HTMLAttributes<HTMLElement>["style"];

/**
 * A CSS value narrowed to what an inline custom property can carry.
 *
 * It drops three things Panda's own property types allow and a `style` attribute cannot express: a
 * responsive object, csstype's array fallback form, and the boxed `String`/`Number` that Panda's
 * length parameter introduces. A component prop typed this way makes
 * `templateColumns={{ base: "1fr", md: "1fr 1fr" }}` a **type error** rather than a prop that
 * type-checks and silently does nothing, which is the failure mode this whole route trades against.
 */
export type PlainCssValue<Value> = Extract<Value, string | number>;

/**
 * A component's own inline **CSS custom properties**, with the consumer's `style` layered over
 * them.
 *
 * This is the route for a value Panda cannot see: `style={{ "--col-span": n }}` against a static
 * rule that reads `var(--col-span)`. The rule is extractable because it is a literal in the
 * component's own style config; the value is arbitrary because an inline style is not CSS the
 * build has to generate.
 *
 * The string branch is not defensive coding — `style` genuinely accepts a declaration string, and
 * an object spread over one would drop it silently, which on this route means dropping the
 * component's entire layout.
 */
export function composeStyle(own: JSX.CSSProperties, consumer: StyleProp): StyleProp {
  if (consumer === undefined || consumer === false) {
    return own;
  }
  if (typeof consumer !== "string") {
    return { ...own, ...consumer };
  }
  const declarations = Object.entries(own)
    .filter(([, value]) => value !== undefined)
    .map(([property, value]) => `${property}:${value}`);
  return [...declarations, consumer].join(";");
}

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
   * everything else is forwarded verbatim, unless {@link RenderStyledOptions.forwardProp} says
   * otherwise.
   */
  props: Props;
  /** Consumer render-prop override; receives the computed props. */
  render?: RenderProp<Props>;
  /** A component-internal ref setter; `renderElement` merges it with the consumer's own `ref`. */
  ref?: JSX.RefCallback<El>;
  /**
   * Class(es) placed *below* style props in the cascade — the seam the **generated recipes** plug
   * into. `createSlotClasses(...)().content` is the usual argument. Suppressed when the caller
   * passes `unstyled`.
   *
   * It works because Panda emits those recipes into `@layer recipes` and style props into `@layer
   * utilities`, and the layer order decides. A class with no layer of its own is not below anything
   * — see {@link RenderStyledOptions.baseStyles}.
   */
  recipeClass?: Accessor<string | undefined>;
  /**
   * A style **object** merged underneath the style props in one `css()` call, rather than composed
   * beside them as a second class. Suppressed by `unstyled`, like `recipeClass`.
   *
   * The distinction from `recipeClass` is a cascade fact, not a preference. An inline `cva()`
   * config — what the `chakra` factory takes — emits *atomic* classes into the same `@layer
   * utilities` as style props, so an element carrying both `px_5` (the recipe) and `px_1` (the
   * style prop) is decided by which rule Panda happened to write first, which is the order the two
   * appear in the *source*. Merging the objects first collapses them to one class and one answer.
   */
  baseStyles?: Accessor<SystemStyleObject | undefined>;
  /**
   * Whether a key reaches the DOM, given whether Panda considers it a style prop. Default:
   * `!isStyleProp`.
   *
   * The decision belongs here because this is what knows a key is a style prop. Overriding it in
   * the forwarding direction is what makes `<chakra.circle r="40">` render a circle: `r` — like
   * every SVG geometry attribute — answers `true` to `isCssProperty`, so the default swallows it
   * into a class and the shape has no radius, silently. Overriding it in the withholding direction
   * is `shouldForwardProp`, which keeps a transient prop off the element.
   *
   * `children` and `ref` are never asked about. They are how the element gets its content and how
   * a caller reaches it, and a predicate written to filter one prop would otherwise take both with
   * it.
   */
  forwardProp?: (key: string, isStyleProp: boolean) => boolean;
}

/** @see RenderStyledOptions.forwardProp */
const ALWAYS_FORWARDED = new Set(["children", "ref"]);

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

  // Addition 3 — the five `html*` renames. `htmlSize` reaches the element as `size`, and so on for
  // `width`, `height`, `translate` and `content`, all of which are style props here and would
  // otherwise be swallowed into a class with nothing to say so. Decided before `forwardProp` is
  // consulted, so an escape hatch cannot be filtered out by a predicate aimed at the style prop it
  // stands in for.
  const htmlKeys = Object.keys(props).filter((key) => key in HTML_PROP_RENAMES);

  // Which passed keys are style props is stable for a given render — the KEY (`p`, `bg`) is static;
  // only its VALUE is reactive — so partition the keys once and read the values lazily in the
  // `class` getter below. That is what preserves style-prop reactivity. `isCssProperty("css")` is
  // true, but the `css` escape hatch is a *nested* style object, not a per-prop value: Panda's
  // `css()` does not flatten a `css` KEY, so folding it in with the others emits garbage
  // (`color:css_red`). Exclude it here and pass its value as a sibling `css()` argument in the
  // getter below, which is how Panda merges it (and lets it win ties — the documented escape-hatch
  // precedence).
  const styleKeys: string[] = [];
  const withheldKeys: string[] = [];

  for (const key of Object.keys(props)) {
    if (key === "css" || key in HTML_PROP_RENAMES || ALWAYS_FORWARDED.has(key)) {
      continue;
    }
    const isStyleProp = isCssProperty(key);
    // `??` rather than `||`: a predicate answering `false` is a decision, and only an absent
    // predicate falls back to the default.
    if (options.forwardProp?.(key, isStyleProp) ?? !isStyleProp) {
      continue;
    }
    (isStyleProp ? styleKeys : withheldKeys).push(key);
  }

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
    ...withheldKeys,
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
      // array form is a spread rather than a manual merge — and it is the same variadic call that
      // puts `baseStyles` underneath the style props.
      const cssProp = props.css;
      const cssArguments = Array.isArray(cssProp) ? cssProp : [cssProp];

      // Addition 2 — `unstyled` opts the element out of the theme styles, whichever seam supplied
      // them. Style props and the `css` prop still apply: the opt-out is of the recipe, not of
      // styling.
      const unstyled = props.unstyled === true;

      return cx(
        unstyled ? undefined : options.recipeClass?.(),
        css(
          unstyled ? undefined : options.baseStyles?.(),
          styles as SystemStyleObject,
          ...cssArguments,
        ),
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
