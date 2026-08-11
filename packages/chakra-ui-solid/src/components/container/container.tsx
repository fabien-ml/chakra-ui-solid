import { createRecipeClass, type HTMLChakraProps, renderStyled } from "@chakra-ui-solid/core";
import { container } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, omit } from "solid-js";

/**
 * The two variants spelled out rather than inherited from the generated `ContainerVariantProps`,
 * so each carries a description a reader can use and a type they can read — a generated type has
 * neither. A variant renamed in the recipe is still caught: `createRecipeClass` below is typed
 * against the generated one, so the call, not the interface, is what stops drifting silently.
 */
export interface ContainerProps extends HTMLChakraProps<"div"> {
  /** Center the content and stack it in a column, rather than leaving the layout to the children. */
  centerContent?: ConditionalValue<boolean>;
  /** Stretch to fill the width of the parent, dropping the `8xl` maximum. */
  fluid?: ConditionalValue<boolean>;
}

/** The DOM props Container forwards to the rendered element, as Box names its own. */
type ContainerElementProps = ComponentProps<"div">;

/**
 * The recipe's own inputs, as literal keys rather than `container.variantKeys` — `omit` narrows the
 * returned props by the keys it is given, and a `string[]` narrows nothing. The two lists are the
 * same list, and the test asserts it.
 */
const VARIANT_KEYS = ["centerContent", "fluid"] as const;

/**
 * Container — a centred column with a maximum width and responsive horizontal padding, for a page's
 * main content.
 *
 * **The first component resolved through a generated recipe rather than the factory**, and the two
 * seams are not interchangeable. An inline `chakra("div", { base })` config emits *atomic* classes
 * into the same cascade layer as style props, so `px_10` from a recipe and `px_4` from a prop would
 * be decided by whichever rule Panda happened to write first; a generated recipe has a layer of its
 * own — `@layer recipes`, below `@layer utilities` — which is what makes `<Container px="10">`
 * override the recipe's padding rather than race it. `recipeClass` is the seam that carries a class
 * under that layer, and `createRecipeClass` is what keeps its variants reactive.
 *
 * Its recipe is the one body `@chakra-ui-solid/panda-preset` ports rather than inherits, because
 * `@chakra-ui/panda-preset` has no `container` key — see `container-recipe.ts` there.
 */
export const Container: Component<ContainerProps> = (props) => {
  const recipeClass = createRecipeClass(container, {
    variantProps: () => ({ centerContent: props.centerContent, fluid: props.fluid }),
  });

  return renderStyled<ContainerElementProps>({
    as: (props.as ?? "div") as ValidComponent,
    render: props.render,
    // The variant keys are the recipe's inputs, not the element's: forwarded, `centerContent` would
    // reach the DOM as an attribute, and it is not a style prop for `renderStyled` to swallow.
    props: omit(props, ...VARIANT_KEYS) as unknown as ContainerElementProps,
    recipeClass,
  });
};
