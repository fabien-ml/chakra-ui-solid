import { createRecipeContext, type HTMLChakraProps } from "@chakra-ui-solid/core";

export interface TextProps extends HTMLChakraProps<"p"> {}

const { withContext, PropsProvider } = createRecipeContext<TextProps>();

/**
 * Text — a paragraph, styled entirely by `textStyle` and style props.
 *
 * **It has no recipe, and that is Chakra's answer rather than a gap here.** The `text` key exists in
 * neither `@chakra-ui/panda-preset` nor Chakra's own theme, so upstream `<Text>` is a `<p>` carrying
 * whatever the caller passes and nothing else (`parity-matrix.md` §2.5). Size and weight come from
 * `textStyle` / `fontSize` / `fontWeight`, which are style props like any other.
 *
 * That makes it the degenerate case of {@link createRecipeContext} on purpose: the props context and
 * the style-prop pipeline, with no recipe resolution in between.
 */
export const Text = withContext("p");

/**
 * Supplies props to every {@link Text} below it — `<TextPropsProvider value={{ textStyle: "sm" }}>`
 * sets the size for a subtree. A `Text` that passes the prop itself still wins.
 */
export const TextPropsProvider = PropsProvider;
