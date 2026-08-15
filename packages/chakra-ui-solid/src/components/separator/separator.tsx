import {
  createRecipeClass,
  createRecipeContext,
  type HTMLChakraProps,
  renderStyled,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import { type SeparatorVariantProps, separator } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

/**
 * The three variants spelled out rather than inherited from the generated `SeparatorVariantProps`,
 * so each carries a description a reader can use and a type they can read — Badge's precedent, and
 * this is the interface the docs page's props table is built from. Drift is caught by
 * {@link VARIANT_KEYS} below, which is typed against the generated variants.
 */
export interface SeparatorProps extends Omit<HTMLChakraProps<"span">, "orientation"> {
  /**
   * The border style of the line.
   *
   * @default "solid"
   */
  variant?: ConditionalValue<"solid" | "dashed" | "dotted">;
  /**
   * Which way the line runs. A **vertical** separator has no height of its own — give it one
   * (`<Separator orientation="vertical" height="4" />`) or let a stretching flex row supply it.
   *
   * @default "horizontal"
   */
  orientation?: ConditionalValue<"vertical" | "horizontal">;
  /**
   * How thick the line is, through the `--separator-thickness` custom property the recipe sets.
   *
   * @default "sm"
   */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg">;
}

/** The DOM props Separator forwards to the rendered element, as Box names its own. */
type SeparatorElementProps = ComponentProps<"span">;

/**
 * The recipe's own inputs, as literal keys rather than `separator.variantKeys` — `omit` narrows the
 * returned props by the keys it is given, and a `string[]` narrows nothing. `satisfies` keeps the
 * two lists one list at compile time, and the test asserts the same equality at runtime.
 */
const VARIANT_KEYS = [
  "variant",
  "orientation",
  "size",
] as const satisfies readonly (keyof SeparatorVariantProps & keyof SeparatorProps)[];

/**
 * The props context on its own — no `withContext`, and no recipe handed to the seam, because
 * Separator's body is not what `withContext` mints: it decides a `role` and an `aria-orientation`
 * from the same prop the recipe styles from. Button's shape, with `createRecipeClass` +
 * `renderStyled` called directly.
 */
const { PropsProvider, usePropsContext } = createRecipeContext<SeparatorProps>();

/**
 * Separator — a rule between two runs of content, styled by the `separator` recipe.
 *
 * **A responsive `orientation` makes it decorative.** `aria-orientation` takes one value and a
 * breakpoint-conditional orientation has several, so rather than announce whichever one happened to
 * be written first the element drops to `role="presentation"` with no orientation at all. That is
 * Chakra's own rule, and its docs page says so.
 *
 * `orientation` is a recipe variant *and* a decision this body makes, which is why the element is
 * built here: a `withContext` component has no seam to put a computed `role` on.
 */
export const Separator: Component<SeparatorProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order, resolved by *value*
  // rather than by presence (`CLAUDE.md`, *The third hazard*).
  //
  // **Chakra reads its raw props here and we read the merged bag**, which is a divergence and the
  // repairing kind: upstream's `useRecipeResult` never consults the props context at all — only its
  // `withContext` does — so `SeparatorPropsProvider` is an export that changes nothing on the React
  // side, styles included. Ours honours it (`roadmap.md`, the `separator` row).
  const merged = withContextDefaults(props, usePropsContext());

  const recipeClass = createRecipeClass(separator, {
    variantProps: () => ({
      variant: merged.variant,
      orientation: merged.orientation,
      size: merged.size,
    }),
  });

  /** The plain orientation, or `undefined` when it is a responsive value with no single answer. */
  const plainOrientation = (): "vertical" | "horizontal" | undefined => {
    const orientation = merged.orientation ?? "horizontal";
    return typeof orientation === "string" ? orientation : undefined;
  };

  // The two computed attributes come **first**, so a consumer's own `role="presentation"` or
  // `aria-orientation` lands last and wins — upstream writes them before its props spread for the
  // same reason. `merge` resolves by presence, so an unpassed `role` is not a key on the omitted bag
  // and the getter below still answers.
  const elementProps = merge(
    {
      get role() {
        return plainOrientation() === undefined ? "presentation" : "separator";
      },
      get "aria-orientation"() {
        return plainOrientation();
      },
    },
    omit(merged, ...VARIANT_KEYS),
  );

  return renderStyled<SeparatorElementProps>({
    as: (merged.as ?? "span") as ValidComponent,
    render: merged.render,
    // The variant keys are the recipe's inputs, not the element's: forwarded, `orientation` would
    // reach the DOM as an attribute, and it is not a style prop for `renderStyled` to swallow.
    props: elementProps as unknown as SeparatorElementProps,
    recipeClass,
  });
};

/**
 * Supplies props to every {@link Separator} below it — `<SeparatorPropsProvider value={{ size: "lg" }}>`
 * sets the thickness for a subtree. A `Separator` that passes the prop itself still wins.
 */
export const SeparatorPropsProvider = PropsProvider;
