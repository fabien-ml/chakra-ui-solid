import {
  createRecipeClass,
  createRecipeContext,
  type HTMLChakraProps,
  renderStyled,
  withContextDefaults,
  withDefaults,
} from "@chakra-ui-solid/core";
import { type IconVariantProps, icon } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, omit } from "solid-js";

/**
 * The one variant spelled out rather than inherited from the generated `IconVariantProps`, so it
 * carries a description a reader can use and a type they can read — and this is the interface the
 * docs page's props table is built from. Drift is caught by {@link VARIANT_KEYS}, which is typed
 * against the generated variants.
 */
export interface IconProps extends HTMLChakraProps<"svg"> {
  /**
   * The glyph's box, as a scale step. `inherit` takes `1em` from the surrounding font size, which
   * is how an icon inside a button or a menu item matches its label — and it is the default,
   * because an icon almost always belongs to some text.
   *
   * @default "inherit"
   */
  size?: ConditionalValue<"inherit" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl">;
  /**
   * Whether the glyph can take focus. Chakra sets it, so we do — it is the attribute that keeps a
   * decorative `svg` out of the tab order in engines that put it there.
   *
   * Declared here rather than inherited because SolidJS's SVG attribute types do not carry it: it
   * is an SVG 1.1 attribute that SVG 2 dropped, and React's types kept.
   *
   * @default "false"
   */
  focusable?: "true" | "false";
}

/** The DOM props Icon forwards to the rendered element, as Box and Button name their own. */
type IconElementProps = ComponentProps<"svg">;

/**
 * The recipe's own inputs, as literal keys rather than `icon.variantKeys` — `omit` narrows the
 * returned props by the keys it is given, and a `string[]` narrows nothing. `satisfies` keeps the
 * two lists one list at compile time, and the test asserts the same equality at runtime.
 */
const VARIANT_KEYS = ["size"] as const satisfies readonly (keyof IconVariantProps &
  keyof IconProps)[];

/**
 * The props context on its own — no `withContext`, and no recipe handed to the seam.
 *
 * `withContext` mints a component whose body is *only* the recipe class plus the style-prop
 * pipeline, and Icon's is not that: it carries two attribute defaults, and they have to resolve
 * **under** the context so a provider or a caller still wins. So it takes the half of the seam it
 * can use and calls `createRecipeClass` + `renderStyled` itself, which is Button's shape.
 */
const { PropsProvider, usePropsContext } = createRecipeContext<IconProps>();

/**
 * Icon — an `svg` sized and coloured by the style system, for wrapping a glyph from anywhere.
 *
 * We ship no icon set. A glyph comes from the caller, either as a child (`<Icon><HeartIcon /></Icon>`,
 * which nests an `svg` inside this one — legal, and how a third-party icon composes) or through
 * `render`, which hands the computed props to an `svg` the caller writes themselves. {@link createIcon}
 * is the third way, for a glyph reused enough to earn a name.
 *
 * `size="inherit"` and `color` are the two props worth knowing: the first takes `1em` from the
 * surrounding text, the second is what `currentColor` inside the glyph resolves against.
 */
export const Icon: Component<IconProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order, and the seam's.
  //
  // Then the two attributes Chakra writes before its own spread. As defaults rather than JSX
  // attributes they survive a wrapper's `aria-hidden={props["aria-hidden"]}` with nothing set,
  // which the attribute-before-spread form does not (`CLAUDE.md`, *The third hazard*) — and an icon
  // that loses `aria-hidden` starts being announced as an unlabelled graphic beside its own label.
  //
  // `focusable` is the string, where Chakra passes the boolean: Solid drops a `false` attribute
  // value rather than writing it, so the boolean would leave the element with no `focusable` at all
  // and hand IE-era focus behaviour back. React stringifies it for the same DOM, so the markup
  // matches either way.
  const merged = withDefaults(withContextDefaults(props, usePropsContext()), {
    focusable: "false",
    "aria-hidden": "true",
  } satisfies Partial<IconProps>);

  const recipeClass = createRecipeClass(icon, {
    variantProps: () => ({ size: merged.size }),
  });

  // Every read goes to `merged`, never to `props`: `withDefaults` copies nothing, so `omit(props, …)`
  // would hand the element a bag with both defaults missing.
  return renderStyled<IconElementProps>({
    as: (merged.as ?? "svg") as ValidComponent,
    render: merged.render,
    // The variant keys are the recipe's inputs, not the element's: forwarded, `size` would reach the
    // DOM as an attribute, and `svg` has no such attribute for it to mean anything.
    props: omit(merged, ...VARIANT_KEYS) as unknown as IconElementProps,
    recipeClass,
  });
};

/**
 * Supplies props to every {@link Icon} below it — `<IconPropsProvider value={{ size: "sm" }}>` sets
 * the size for a subtree. An `Icon` that passes the prop itself still wins.
 */
export const IconPropsProvider = PropsProvider;
