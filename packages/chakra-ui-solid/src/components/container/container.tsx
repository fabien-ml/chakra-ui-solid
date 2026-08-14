import { createRecipeContext, type HTMLChakraProps } from "@chakra-ui-solid/core";
import { type ContainerVariantProps, container } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The two variants spelled out rather than inherited from the generated `ContainerVariantProps`,
 * so each carries a description a reader can use and a type they can read — a generated type has
 * neither. A variant renamed in the recipe is still caught: the keys handed to the seam below are
 * typed against the generated one, so the call, not the interface, is what stops drifting silently.
 */
export interface ContainerProps extends HTMLChakraProps<"div"> {
  /** Center the content and stack it in a column, rather than leaving the layout to the children. */
  centerContent?: ConditionalValue<boolean>;
  /** Stretch to fill the width of the parent, dropping the `8xl` maximum. */
  fluid?: ConditionalValue<boolean>;
}

const { withContext, PropsProvider } = createRecipeContext<ContainerProps, ContainerVariantProps>({
  recipe: container,
  variantKeys: ["centerContent", "fluid"],
});

/**
 * Container — a centred column with a maximum width and responsive horizontal padding, for a page's
 * main content.
 *
 * **A generated recipe rather than the factory**, and the two seams are not interchangeable. An
 * inline `chakra("div", { base })` config emits *atomic* classes into the same cascade layer as
 * style props, so `px_10` from a recipe and `px_4` from a prop would be decided by whichever rule
 * Panda happened to write first; a generated recipe has a layer of its own — `@layer recipes`,
 * below `@layer utilities` — which is what makes `<Container px="10">` override the recipe's
 * padding rather than race it.
 *
 * Its recipe is the one body `@chakra-ui-solid/panda-preset` ports rather than inherits, because
 * `@chakra-ui/panda-preset` has no `container` key — see `container-recipe.ts` there.
 */
export const Container = withContext("div");

/**
 * Supplies props to every {@link Container} below it — `<ContainerPropsProvider value={{ fluid:
 * true }}>` drops the maximum width for a subtree. A `Container` that passes the prop itself still
 * wins.
 */
export const ContainerPropsProvider = PropsProvider;
