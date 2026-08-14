import type { JSX, ValidComponent } from "@solidjs/web";
import { type Accessor, type Component, type Context, omit } from "solid-js";
import { createComponentContext } from "../internal/create-component-context";
import type { RenderProp } from "../render/render";
import { renderStyled } from "../render-styled/render-styled";
import { withContextDefaults } from "../utils/defaults";
import { createPropsContext, type PropsProviderProps } from "./props-context";
import { createSlotClasses, type SlotRecipeFn } from "./recipe";

/** What `renderStyled` is handed once the variants are split off — keys in, no element type out. */
type ElementPropsBag = Record<string, unknown> & { class?: unknown };

/** The two keys every part accepts on top of its element's own, both consumed by `renderStyled`. */
type PolymorphicProps = {
  as?: ValidComponent;
  render?: RenderProp<ElementPropsBag>;
};

export interface SlotRecipeContextOptions<
  Slot extends string,
  Props extends object,
  Variants extends object,
> {
  /**
   * The component family's name — `"Card"`, `"Field"`. It is the one in the error a part throws when
   * it is rendered with no Root above it, so it reads as the component a consumer forgot.
   */
  name: string;
  /**
   * The generated slot recipe the family is styled by. Optional for the same reason
   * {@link createRecipeContext}'s is: a key can resolve to nothing upstream, and the seam is still
   * the props context plus the style-prop pipeline.
   */
  recipe?: SlotRecipeFn<Slot, Variants>;
  /**
   * The recipe's own inputs, as **literal** keys rather than `recipe.variantKeys` — `omit` narrows
   * by the keys it is given, and a `string[]` narrows nothing. Never Panda's `splitVariantProps`,
   * which destructures eagerly and so snapshots every style prop passed beside the variant.
   */
  variantKeys?: readonly (keyof Variants & keyof Props & string)[];
}

export interface WithProviderOptions<Props extends object> {
  /**
   * Wraps the Root's element in a context of the family's own — Chakra's `wrapElement`, and
   * `Alert.Root` is what it exists for: the recipe gives it every slot it needs, and the one thing
   * `withProvider` cannot supply is the `status` its indicator reads.
   *
   * The element arrives as a **function**, and it has to: `renderStyled` builds the element *and
   * its children* on the call, so an element passed as a resolved value would have run every part
   * below it before the wrapper's context existed — `Alert.Indicator` then throws the "no Root"
   * error from directly under its own Root (measured). Write it as a JSX child —
   * `<StatusProvider …>{element()}</StatusProvider>` — which compiles to a getter, so the call
   * happens inside the provider and happens once.
   */
  wrapElement?(element: () => JSX.Element, props: Props): JSX.Element;
}

/** What {@link createSlotRecipeContext} returns — Chakra's multi-part seam, in Solid's expression. */
export interface SlotRecipeContext<Slot extends string, Props extends object> {
  /** Mint the Root: resolve the recipe once, publish the classes, render the `slot` element. */
  withProvider(
    tag: ValidComponent,
    slot: Slot,
    options?: WithProviderOptions<Props>,
  ): Component<Props>;
  /**
   * Mint a part: read the published classes, render the `slot` element. A part with no `slot` reads
   * no context at all — `Field.ErrorIcon` and `Alert.Indicator` are elements the recipe has no slot
   * for, and requiring a Root for a class that does not exist would be an error with no cause.
   */
  withContext<PartProps extends object>(tag: ValidComponent, slot?: Slot): Component<PartProps>;
  /**
   * The classes the nearest Root resolved, one per slot. For a part whose body `withContext` cannot
   * express: `recipeClass: () => styles().label`.
   */
  useStyles(): Accessor<Record<Slot, string>>;
  /**
   * Publishes a class map to the parts below — for a Root that `withProvider` cannot mint because it
   * owns a store as well as an element (`Field.Root`, `Fieldset.Root`).
   */
  StylesProvider: Context<Accessor<Record<Slot, string>>>;
  /**
   * The recipe resolved against one Root's props, so a hand-written Root states the recipe and its
   * variant keys nowhere: `const slots = resolveSlotClasses(merged)`.
   */
  resolveSlotClasses(props: Props): Accessor<Record<Slot, string>>;
  /** The ancestor that supplies Root props from above — `<Card.PropsProvider value={{ size }}>`. */
  PropsProvider: Component<PropsProviderProps<Props>>;
  /** The props context on its own, for a Root that reads it before doing anything else. */
  usePropsContext(): Partial<Props>;
}

/** An empty class map, for a family whose recipe key resolves to nothing. */
const NO_SLOTS = <Slot extends string>() => ({}) as Record<Slot, string>;

/**
 * Chakra's `createSlotRecipeContext` — the whole of what a **multi-part** component is when it has
 * no machine: one slot recipe resolved on the Root, and every part below wearing its own slot's
 * class.
 *
 * ```tsx
 * const { withProvider, withContext, useStyles, PropsProvider } =
 *   createSlotRecipeContext<CardSlot, CardRootProps, CardVariantProps>({
 *     name: "Card",
 *     recipe: card,
 *     variantKeys: ["size", "variant"],
 *   });
 *
 * export const CardRoot = withProvider("div", "root");
 * export const CardBody = withContext<CardBodyProps>("div", "body");
 * export const useCardStyles = useStyles;
 * ```
 *
 * **`useStyles` yields class strings, where Chakra's yields style objects.** Upstream resolves a
 * recipe into `SystemStyleObject`s at runtime and hands them to `css=`; we have no runtime style
 * system, so the Root resolves the generated `sva()` into one class per slot and publishes those.
 * The consumer-visible shape is the same — a part's styles come from the Root, a consumer's own
 * element can wear a slot's styles — and only the value's type differs.
 *
 * Resolved **once, on the Root**, never per part: N parts each calling `sva()` is N times the work
 * for one answer, and it puts N copies of the variant-reading logic in the tree where they can
 * disagree. A memo, because a variant prop is a prop like any other.
 */
export function createSlotRecipeContext<
  Slot extends string,
  Props extends object,
  Variants extends object = Record<never, never>,
>(options: SlotRecipeContextOptions<Slot, Props, Variants>): SlotRecipeContext<Slot, Props> {
  const { PropsProvider, usePropsContext } = createPropsContext<Props>();

  // The named error is the whole reason this is `createComponentContext` rather than a bare context:
  // a part rendered outside its Root says so by name instead of failing on an undefined read.
  const [StylesProvider, useStyles] = createComponentContext<Accessor<Record<Slot, string>>>(
    options.name,
  );

  const variantKeys = options.variantKeys ?? [];
  const recipe = options.recipe;

  const resolveSlotClasses = (props: Props): Accessor<Record<Slot, string>> => {
    if (recipe === undefined) {
      return NO_SLOTS<Slot>;
    }
    const bag = props as Record<string, unknown>;
    return createSlotClasses<Slot, Variants>(recipe, {
      // Read inside the accessor, so a changed variant re-resolves rather than being snapshotted.
      variantProps: () => Object.fromEntries(variantKeys.map((key) => [key, bag[key]])) as Variants,
      unstyled: () => bag.unstyled as boolean | undefined,
    });
  };

  const withProvider = (
    tag: ValidComponent,
    slot: Slot,
    providerOptions: WithProviderOptions<Props> = {},
  ): Component<Props> => {
    return (componentProps) => {
      // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
      // *value*: `merge` resolves by presence, so a wrapper forwarding an unset `size` would beat
      // the provider with `undefined` (`CLAUDE.md`, *The third hazard*).
      const props = withContextDefaults(componentProps, usePropsContext());
      const bag = props as ElementPropsBag & PolymorphicProps;
      const slots = resolveSlotClasses(props);

      // Built **inside** the provider, never before it. `renderStyled` constructs the element and its
      // children there and then, so an element built in this body would run every part below it
      // outside the context and each one would throw the "no Root" error from under its own Root.
      // A component's JSX children compile to a getter, which is what defers it.
      const buildElement = () =>
        renderStyled<ElementPropsBag>({
          as: bag.as ?? tag,
          render: bag.render,
          // The variant keys are the recipe's inputs, not the element's: forwarded, `size` would
          // reach the DOM as an attribute, and it is not a style prop for `renderStyled` to swallow.
          props: variantKeys.length === 0 ? bag : (omit(bag, ...variantKeys) as ElementPropsBag),
          recipeClass: () => slots()[slot],
        });

      const renderElementInContext = () =>
        providerOptions.wrapElement === undefined
          ? buildElement()
          : providerOptions.wrapElement(buildElement, props);

      return <StylesProvider value={slots}>{renderElementInContext()}</StylesProvider>;
    };
  };

  const withContext = <PartProps extends object>(
    tag: ValidComponent,
    slot?: Slot,
  ): Component<PartProps> => {
    return (componentProps) => {
      const bag = componentProps as ElementPropsBag & PolymorphicProps;
      // Read outside the accessor below: a context read belongs in the component body, and the part
      // needs the Root's classes for as long as it lives.
      const slots = slot === undefined ? undefined : useStyles();

      return renderStyled<ElementPropsBag>({
        as: bag.as ?? tag,
        render: bag.render,
        props: bag,
        recipeClass: slots === undefined ? undefined : () => slots()[slot as Slot],
      });
    };
  };

  return {
    withProvider,
    withContext,
    useStyles,
    StylesProvider,
    resolveSlotClasses,
    PropsProvider,
    usePropsContext,
  };
}
