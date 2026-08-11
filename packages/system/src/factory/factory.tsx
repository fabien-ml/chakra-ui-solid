/**
 * @license
 * The `exceptionPropMap` table below is derived from Chakra UI (`@chakra-ui/react`,
 * `packages/react/src/styled-system/factory.tsx`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { cva } from "@chakra-ui-solid/styled-system/css";
import type {
  JsxStyleProps,
  RecipeDefinition,
  RecipeSelection,
  RecipeVariantRecord,
} from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { omit } from "solid-js";
import type { RenderProp } from "../render/render";
import type { PatchHtmlProps } from "../render-styled/html-props";
import { type RenderStyledOptions, renderStyled } from "../render-styled/render-styled";
import { withDefaults } from "../utils/defaults";

/**
 * The seven tags whose SVG geometry attributes Panda claims as style props.
 *
 * `d`, `x`, `y`, `cx`, `cy`, `r`, `rx`, `ry`, `transform`, `offset` and `stopOpacity` each answer
 * `true` to `isCssProperty`, so the default forwarding rule folds them into a class and the shape
 * renders with no geometry — an invisible `<circle>` and a green test. Chakra carries the same
 * table for the same reason, so dropping it would be a divergence.
 */
const exceptionPropMap: Record<string, readonly string[]> = {
  path: ["d"],
  text: ["x", "y"],
  circle: ["cx", "cy", "r"],
  rect: ["width", "height", "x", "y", "rx", "ry"],
  ellipse: ["cx", "cy", "rx", "ry"],
  g: ["transform"],
  stop: ["offset", "stopOpacity"],
};

/** The styling surface the factory adds to whatever props the underlying element already takes. */
export interface ChakraStylingProps<ElementProps extends object> extends JsxStyleProps {
  /** Render as a different element/component. Defaults to the element the factory was called with. */
  as?: ValidComponent;
  /** Render-prop override that receives the computed DOM props. */
  render?: RenderProp<ElementProps>;
  /** Drop the recipe's styles. Style props and the `css` prop still apply. */
  unstyled?: boolean;
}

/**
 * Everything a `chakra.*` component accepts: the element's own DOM props with the seven displaced
 * names patched, plus the whole style-prop vocabulary.
 *
 * Chakra v3's public name for this type, and the one Panda itself generates from
 * `jsxFactory: "chakra"`.
 */
export type HTMLChakraProps<Element extends ValidComponent> = Omit<
  PatchHtmlProps<ComponentProps<Element>>,
  keyof JsxStyleProps
> &
  ChakraStylingProps<ComponentProps<Element>>;

/** What the factory returns: the element's props, the style props, and the recipe's variants. */
export type ChakraComponent<
  Element extends ValidComponent,
  Variants extends object = Record<never, never>,
> = (props: HTMLChakraProps<Element> & Variants) => JSX.Element;

/** The third argument — Chakra's three shipped options, and only those. */
export interface ChakraFactoryOptions<Props extends object> {
  /** Values for any prop the caller left `undefined`. */
  defaultProps?: Partial<Props>;
  /**
   * Keys that must reach the DOM even though Panda calls them style props. The SVG geometry
   * attributes in {@link exceptionPropMap} are added to this list for you.
   */
  forwardProps?: string[];
  /**
   * Full control over which keys reach the DOM, replacing both the default rule and
   * `forwardProps`. `children` and `ref` are never asked about.
   */
  shouldForwardProp?: (prop: string, variantKeys: string[]) => boolean;
}

/** The two call forms. */
interface ChakraFactory {
  <Element extends ValidComponent>(element: Element): ChakraComponent<Element>;
  <Element extends ValidComponent, Variants extends RecipeVariantRecord>(
    element: Element,
    config: RecipeDefinition<Variants>,
    options?: ChakraFactoryOptions<HTMLChakraProps<Element>>,
  ): ChakraComponent<Element, RecipeSelection<Variants>>;
}

/** The call forms plus the `chakra.button` namespace over every intrinsic element. */
export type Chakra = ChakraFactory & {
  [Tag in keyof JSX.IntrinsicElements]: ChakraComponent<Tag>;
};

/** What `renderStyled` is handed once the variants are split off — keys in, no element type out. */
type ElementPropsBag = Record<string, unknown> & { class?: unknown };

const componentsByTag = new Map<string, ChakraComponent<ValidComponent>>();

/**
 * `chakra` — the styled-element factory every component here is a special case of, in both of
 * Chakra v3's call forms.
 *
 * ```tsx
 * <chakra.button bg="blue.500" px="4" />
 *
 * const Link = chakra("a", {
 *   base: { color: "blue.500" },
 *   variants: { tone: { muted: { color: "fg.muted" } } },
 * }, { defaultProps: { rel: "noreferrer" } })
 * ```
 *
 * **Both forms are extracted at build time and neither writes CSS at runtime.** Panda scans the
 * source for `chakra.*` JSX and for the config object above, generates the rules, and the runtime
 * `cva()` here only recomputes the class names those rules were generated under. That requires
 * `jsxFactory: "chakra"` in the scanning config — `chakra.button` is lowercase, so without it
 * Panda's `isUpperCase` fallback declines the tag and the page renders unstyled with no error.
 * `defineChakraConfig()` carries the setting so a consumer cannot miss it.
 *
 * A value Panda cannot read out of the source — `bg={props.color}` — has no rule and renders
 * nothing. Route those through a CSS custom property (`style={{ "--bg": color() }}` with
 * `bg="var(--bg)"`) or declare them in `staticCss`.
 */
export const chakra = new Proxy(chakraFactory as ChakraFactory, {
  get(target, key) {
    // Two things this must not mint a component for: a symbol probe (`$$typeof`,
    // `Symbol.toPrimitive`), and a name the target function already answers to — `toString` above
    // all, since `String(chakra)` would otherwise call a component with no props. No HTML tag
    // collides with anything on `Function.prototype`.
    if (typeof key !== "string" || key in target) {
      return Reflect.get(target, key);
    }
    let component = componentsByTag.get(key);
    if (component === undefined) {
      // Cached, so that `chakra.div` is the same component on every read and a re-render cannot
      // remount its subtree.
      component = chakraFactory(key as ValidComponent);
      componentsByTag.set(key, component);
    }
    return component;
  },
}) as Chakra;

function chakraFactory<Element extends ValidComponent, Variants extends RecipeVariantRecord>(
  element: Element,
  config?: RecipeDefinition<Variants>,
  options: ChakraFactoryOptions<HTMLChakraProps<Element>> = {},
): ChakraComponent<Element, RecipeSelection<Variants>> {
  const recipe = config === undefined ? undefined : cva(config);
  const variantKeys = (recipe?.variantKeys ?? []) as string[];
  const forwardProp = createForwardProp(element, options, variantKeys);
  const defaultProps = options.defaultProps as Partial<ElementPropsBag> | undefined;

  const variantPropsOf = (props: ElementPropsBag) =>
    Object.fromEntries(variantKeys.map((key) => [key, props[key]])) as RecipeSelection<Variants>;

  return (componentProps) => {
    const props = componentProps as ElementPropsBag;

    // `splitProps`'s Solid 2.0 spelling, and never `recipe.splitVariantProps(props)`: that reads
    // every key of the bag eagerly, which snapshots each one and collapses the reactivity of every
    // style prop passed alongside a variant. `variantKeys` is fixed for a given recipe, so
    // partitioning by it reads nothing.
    const elementProps = variantKeys.length === 0 ? props : omit(props, ...variantKeys);

    return renderStyled<ElementPropsBag>({
      as: (props.as ?? element) as ValidComponent,
      render: props.render as RenderProp<ElementPropsBag> | undefined,
      // Not `merge(defaultProps, elementProps)`: SolidJS 2.0 resolves a key by *presence*, so a
      // forwarded-but-unset `type={props.type}` would beat the default with `undefined`.
      // `withDefaults` resolves with `??`, which is what Chakra's `compact()` buys there.
      props: defaultProps === undefined ? elementProps : withDefaults(elementProps, defaultProps),
      // `raw()` — the merged style OBJECT for the selected variants, compound variants included —
      // rather than `recipe()`, the class. An inline `cva` emits atomic classes into the same
      // cascade layer as style props, so a separate class would be decided by Panda's source
      // order; the object merges and one class comes out. `createRecipeClass` stays the seam for
      // the *generated* recipes, which do have a layer of their own.
      //
      // Read inside the accessor, so the variant values are tracked rather than snapshotted.
      baseStyles: recipe === undefined ? undefined : () => recipe.raw(variantPropsOf(props)),
      forwardProp,
    });
  };
}

/**
 * Chakra's three-way rule, expressed as the one predicate `renderStyled` takes: `shouldForwardProp`
 * replaces everything, otherwise `forwardProps` and the SVG exceptions are added to the default.
 */
function createForwardProp(
  element: ValidComponent,
  options: Pick<ChakraFactoryOptions<object>, "forwardProps" | "shouldForwardProp">,
  variantKeys: string[],
): RenderStyledOptions<ElementPropsBag>["forwardProp"] {
  const shouldForwardProp = options.shouldForwardProp;
  if (shouldForwardProp !== undefined) {
    return (key) => shouldForwardProp(key, variantKeys);
  }

  const exceptions = typeof element === "string" ? exceptionPropMap[element] : undefined;
  if (exceptions === undefined && options.forwardProps === undefined) {
    return undefined;
  }

  const forced = new Set([...(exceptions ?? []), ...(options.forwardProps ?? [])]);
  return (key, isStyleProp) => forced.has(key) || !isStyleProp;
}
