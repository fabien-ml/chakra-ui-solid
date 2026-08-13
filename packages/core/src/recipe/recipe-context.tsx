import type { ValidComponent } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import type { RenderProp } from "../render/render";
import { renderStyled } from "../render-styled/render-styled";
import { withContextDefaults } from "../utils/defaults";
import { createPropsContext, type PropsProviderProps } from "./props-context";
import { createRecipeClass, type RecipeFn } from "./recipe";

/** What `renderStyled` is handed once the variants are split off — keys in, no element type out. */
type ElementPropsBag = Record<string, unknown> & { class?: unknown };

export interface RecipeContextOptions<Props extends object, Variants extends object> {
  /**
   * The generated recipe this component is styled by.
   *
   * **Optional, because a component can have no recipe at all** — `Text`'s key resolves to nothing
   * in Chakra either, and four more (`Clipboard`, `Pagination`, `Toggle`, `DownloadTrigger`) are
   * unstyled-by-key upstream on purpose (`parity-matrix.md` §2.5). With no recipe the returned
   * component is still the props context plus the style-prop pipeline, which is the whole of what
   * those components are.
   */
  recipe?: RecipeFn<Variants>;
  /**
   * The recipe's own inputs, as **literal** keys rather than `recipe.variantKeys` — `omit` narrows
   * the returned props by the keys it is given, and a `string[]` narrows nothing. The two lists are
   * the same list, and the owning component's test asserts it against `recipe.variantKeys`.
   *
   * Never Panda's generated `splitVariantProps`: it destructures the props object eagerly, which in
   * Solid snapshots every value it reads, so a changed `size` stops re-resolving and every style
   * prop passed alongside stops reacting. A fixed key tuple reads nothing at partition time.
   */
  variantKeys?: readonly (keyof Variants & keyof Props & string)[];
}

/** What {@link createRecipeContext} returns — the two halves of Chakra's seam, plus its reader. */
export interface RecipeContext<Props extends object> {
  /** Mint the component: props context, recipe class, and the style-prop pipeline, over `tag`. */
  withContext(tag: ValidComponent): Component<Props>;
  /** The ancestor that pushes props down — `<ButtonGroup>` is nothing but this. */
  PropsProvider: Component<PropsProviderProps<Props>>;
  /** The context on its own, for a component whose body `withContext` cannot express. */
  usePropsContext(): Partial<Props>;
}

/**
 * Chakra's `createRecipeContext` — a component factory bound to one recipe, and the props context
 * an ancestor uses to supply that component's props from above.
 *
 * ```tsx
 * const { withContext, PropsProvider } = createRecipeContext<HeadingProps, HeadingVariantProps>({
 *   recipe: heading,
 *   variantKeys: ["size"],
 * });
 *
 * export const Heading = withContext("h2");
 * export const HeadingPropsProvider = PropsProvider;
 * ```
 *
 * **It adds no styling logic, and it owns no context of its own.** The props context is
 * {@link createPropsContext}, which every machine component reaches for directly; `createRecipeClass`
 * still resolves the recipe into the class `renderStyled` carries under `@layer recipes`, and
 * `renderStyled` still owns style props, `class`, `css`, `unstyled`, `as`/`render` and ref merging.
 * What this composes is a `withContext` over the two, which is why `Container`'s hand-written body
 * and a component minted here produce the same element.
 *
 * `usePropsContext` is re-returned because the second consumer shape does not fit `withContext`:
 * `Button` wraps its children in a `Loader` when `loading`, so it reads the context itself and calls
 * `createRecipeClass` + `renderStyled` directly.
 */
export function createRecipeContext<
  Props extends object,
  Variants extends object = Record<never, never>,
>(options: RecipeContextOptions<Props, Variants> = {}): RecipeContext<Props> {
  const { PropsProvider, usePropsContext } = createPropsContext<Props>();

  const variantKeys = options.variantKeys ?? [];

  const withContext =
    (tag: ValidComponent): Component<Props> =>
    (componentProps) => {
      // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
      // *value*, which is Chakra's too (`packages/react/src/merge-props.ts`). Plain `merge` resolves
      // by presence, so `<Heading size={props.size}>` in a wrapper with nothing set would beat the
      // provider with `undefined` and lose the subtree's size (`CLAUDE.md`, *The third hazard*).
      // Both sides stay lazy either way: the defaults are getters read at read time, so nothing
      // here snapshots a provider value or a style prop.
      const props = withContextDefaults(componentProps, usePropsContext()) as ElementPropsBag & {
        as?: ValidComponent;
        render?: RenderProp<ElementPropsBag>;
      };

      const recipe = options.recipe;

      return renderStyled<ElementPropsBag>({
        as: props.as ?? tag,
        render: props.render,
        // The variant keys are the recipe's inputs, not the element's: forwarded, `size` would
        // reach the DOM as an attribute, and it is not a style prop for `renderStyled` to swallow.
        props: variantKeys.length === 0 ? props : omit(props, ...variantKeys),
        recipeClass:
          recipe === undefined
            ? undefined
            : createRecipeClass(recipe, {
                // Read inside the accessor, so the variant values are tracked rather than
                // snapshotted — the same reason the factory builds its variant bag this way.
                variantProps: () =>
                  Object.fromEntries(variantKeys.map((key) => [key, props[key]])) as Variants,
              }),
      });
    };

  return { withContext, PropsProvider, usePropsContext };
}
