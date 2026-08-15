import {
  createRecipeClass,
  createRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  pickVariantProps,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { ButtonVariantProps } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, children, merge, omit, Show } from "solid-js";
import { Loader } from "../loader";

// An alias rather than an inline union because {@link CloseButtonProps} re-declares this prop to
// change its default without changing its values, and two spellings of one union drift apart in
// silence: TypeScript accepts a derived interface that lists *fewer* variants than its base. The
// props table prints what an alias resolves to, so both pages still show all six.
/**
 * How much of the colour palette a button spends — `solid` is the filled one, `plain` carries no
 * background or border at all.
 */
export type ButtonVariant = ConditionalValue<
  | "solid"
  | "subtle"
  | "surface"
  | "outline"
  | "ghost"
  | "plain"
  | PresetVariant<"button", "variant">
>;

/**
 * The two variants spelled out rather than inherited from the generated `ButtonVariantProps`, so
 * each carries a description a reader can use and a type they can read — and this is the interface
 * the docs page's props table is built from. It names Chakra's own variants; what the body actually
 * partitions by is whatever the system's `button` recipe accepts, so a consumer who adds one gets
 * it passed to the recipe rather than onto the element.
 */
export interface ButtonProps extends HTMLChakraProps<"button"> {
  /**
   * The control's height, padding, gap and type scale together.
   *
   * @default "md"
   */
  size?: ConditionalValue<
    "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | PresetVariant<"button", "size">
  >;
  /**
   * How much of the colour palette the button spends — `solid` is the filled one, `plain` carries
   * no background or border at all.
   *
   * @default "solid"
   */
  variant?: ButtonVariant;
  /**
   * Show a spinner and disable the control. The button keeps the width it had, because the
   * {@link Loader} hides the children in place rather than removing them.
   *
   * @default false
   */
  loading?: boolean;
  /** Shown in place of the children while loading, with the spinner beside it. */
  loadingText?: JSX.Element;
  /** What to spin. Defaults to a Spinner sized and coloured off the button's own label. */
  spinner?: JSX.Element;
  /**
   * Which side of `loadingText` the spinner sits on. Only read when `loadingText` is passed.
   *
   * @default "start"
   */
  spinnerPlacement?: "start" | "end";
}

/** The DOM props Button forwards to the rendered element, as Box names its own. */
type ButtonElementProps = ComponentProps<"button">;

/** The four props that drive the Loader. Not style props, so they need omitting by name. */
const LOADING_KEYS = ["loading", "loadingText", "spinner", "spinnerPlacement"] as const;

/**
 * The props context on its own — no `withContext`, and no recipe handed to the seam.
 *
 * `withContext` mints a component whose body is *only* the recipe class plus the style-prop
 * pipeline, and Button's body is not that: it wraps its children in a {@link Loader}. So it takes
 * the half of the seam it can use — the context an ancestor writes to — and calls
 * `createRecipeClass` + `renderStyled` itself, which is `Container`'s shape with a props context in
 * front. Passing `recipe` here would configure a `withContext` nobody calls, and read as though
 * changing it changed what Button resolves.
 */
const { PropsProvider, usePropsContext } = createRecipeContext<ButtonProps>();

/**
 * Button — the control, styled by the `button` recipe, with the loading state Chakra gives it.
 *
 * **`loading` disables the element and swaps the children for a {@link Loader}**, which either
 * replaces them with `loadingText` and a spinner or hides them in place under a centred one. The
 * width does not change either way, which is the whole reason the Loader has a hidden wrapper.
 *
 * Chakra guards that swap with `!props.asChild && loading`, and **the guard does not port**. Its
 * subject is `asChild`, which merges the button's props onto the caller's single child element; a
 * Loader wrapper would break that one-child contract, so React has to skip it. Our analogues are
 * `as` and `render`, and neither has that shape — `as="a"` renders our children into a different
 * tag, and `render` is handed the computed props (children included) to place itself. There is no
 * arrangement here where wrapping the children breaks the element, so there is nothing to guard.
 */
export const Button: Component<ButtonProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order, and the seam's. By
  // *value*, not by presence: `merge` would let a wrapper's unset `size={props.size}` beat the
  // `ButtonGroup` above it, since the key is there to win with (`CLAUDE.md`, *The third hazard*).
  //
  // `type` is a default here rather than a JSX attribute before the spread, which is how Chakra
  // spells it: that form loses to a forwarded `type={props.type}` that is unset, and a button with
  // no `type` submits the form around it. An explicit `type="submit"` still wins.
  const merged = withDefaults(withContextDefaults(props, usePropsContext()), {
    type: "button",
    loading: false,
  } satisfies Partial<ButtonProps>);

  // The recipe's own variant names, off the system above — never Panda's generated
  // `splitVariantProps`, which is how Chakra spells this in `ButtonGroup`: it destructures the props
  // object eagerly, so in Solid a changed `size` stops re-resolving.
  const variantKeys = useRecipeVariantKeys<ButtonProps>("button");

  const recipeClass = createRecipeClass("button", {
    // Read inside the accessor, so the variant values are tracked rather than snapshotted.
    variantProps: () => pickVariantProps<ButtonVariantProps>(merged, variantKeys),
  });

  // **Resolved once, read in both arms.** `props.children` compiles to a lazy getter, and the two
  // branches below each read it — so read raw, toggling `loading` would rebuild the whole child
  // subtree and throw the previous one away, taking any state it held with it. `children()`
  // resolves it once in this owner and hands the *same nodes* to whichever arm is live.
  //
  // `loadingText` and `spinner` deliberately get no such treatment: they are passed straight to the
  // Loader, which reads each exactly once (through a `children()` of its own, because *it* gates on
  // them). A reflexive `children()` on a single read only adds a memo and moves the subtree's
  // hydration key — `CLAUDE.md`, *The second hazard*.
  const content = children(() => merged.children);

  // Every read below goes to `merged`, never to `props`: `withDefaults` copies nothing, so
  // `omit(props, …)` would hand the element a bag with the defaults missing.
  const elementProps = merge(omit(merged, ...variantKeys, ...LOADING_KEYS, "children"), {
    /** Chakra's `dataAttr`: present-and-empty when loading, absent when not. */
    get "data-loading"() {
      return merged.loading ? "" : undefined;
    },
    get disabled() {
      return merged.loading || merged.disabled === true;
    },
    children: (
      <Show when={merged.loading} fallback={content()}>
        <Loader
          spinner={merged.spinner}
          text={merged.loadingText}
          spinnerPlacement={merged.spinnerPlacement}
        >
          {content()}
        </Loader>
      </Show>
    ),
  });

  return renderStyled<ButtonElementProps>({
    as: (merged.as ?? "button") as ValidComponent,
    render: merged.render,
    // The variant keys are the recipe's inputs, not the element's, and the loading keys are this
    // component's: forwarded, `size` and `spinnerPlacement` would both reach the DOM as attributes.
    props: elementProps as unknown as ButtonElementProps,
    recipeClass,
  });
};

/**
 * Supplies props to every {@link Button} below it — `<ButtonPropsProvider value={{ size: "sm" }}>`
 * sets the size for a subtree. A `Button` that passes the prop itself still wins.
 *
 * {@link ButtonGroup} is this provider plus a `Group`, and it is the only writer to a props context
 * in the library.
 */
export const ButtonPropsProvider = PropsProvider;
