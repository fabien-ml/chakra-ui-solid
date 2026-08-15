import {
  createRecipeClass,
  type HTMLChakraProps,
  type PresetVariant,
  type PresetVariantProps,
  pickVariantProps,
  renderStyled,
  useRecipeVariantKeys,
} from "@chakra-ui-solid/core";
import type { RadiomarkVariantProps } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";

/**
 * The three variants spelled out rather than inherited from the generated `RadiomarkVariantProps`,
 * so each carries a description a reader can use and a type they can read — a generated type has
 * neither, and this is the interface the docs page's props table is built from. It names Chakra's
 * own variants; what the body partitions by is whatever the system's `radiomark` recipe accepts.
 */
export interface RadiomarkProps extends HTMLChakraProps<"span">, PresetVariantProps<"radiomark"> {
  /**
   * The circle's size, as a scale step.
   *
   * @default "md"
   */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | PresetVariant<"radiomark", "size">>;
  /**
   * How the circle is painted once it is checked — `solid` fills it with the palette, `outline` and
   * `inverted` only recolour the border, and `subtle` tints it. There is no `plain` here, where
   * Checkmark has one.
   *
   * @default "solid"
   */
  variant?: ConditionalValue<
    "solid" | "subtle" | "outline" | "inverted" | PresetVariant<"radiomark", "variant">
  >;
  /**
   * Give the circle an opaque background, so it covers whatever it sits on rather than letting it
   * through. Meant for `variant="outline"`, which otherwise has no fill of its own.
   */
  filled?: ConditionalValue<boolean>;
  /** Whether the radiomark is checked — the dot is drawn only when it is. */
  checked?: boolean;
  /** Whether the radiomark is disabled — dims it and takes the cursor with it. */
  disabled?: boolean;
}

/** The DOM props Radiomark forwards to the rendered element. */
type RadiomarkElementProps = ComponentProps<"span">;

/** This component's own inputs — state it reports through `data-*`, never as DOM attributes. */
const STATE_KEYS = ["checked", "disabled"] as const;

/**
 * Radiomark — the circle, and the dot inside it when it is selected.
 *
 * It is not a radio: no machine, no input, no click handling. Two booleans in, one `span` out, with
 * the state on `data-checked` and `data-disabled` where the recipe's variants select on it. A
 * `RadioGroup` supplies those from its machine and passes `unstyled` to swap the recipe for its own
 * slot styles; on its own it is a display element, which is what the docs page shows.
 *
 * **`class="dot"` is load-bearing**, and it is the only literal class name in this package. The dot
 * has no styles of its own: the parent's recipe gives it `background: currentColor`, a full radius
 * and `scale: 0.4` through a `.radiomark .dot` descendant rule, which `variant="outline"` widens to
 * `0.6`. Under `unstyled` the `.radiomark` class is gone and so is that rule — but the two consumers
 * that pass `unstyled` hand it a slot whose styles carry the same `& .dot` block (the preset inlines
 * `radiomarkRecipe.base` into `radioGroup.itemControl` and `radioCard.itemIndicator`), so the class
 * is what the styles find on the way back in.
 */
export const Radiomark: Component<RadiomarkProps> = (props) => {
  // The recipe's own variant names, off the system above.
  const variantKeys = useRecipeVariantKeys<RadiomarkProps>("radiomark");

  const recipeClass = createRecipeClass("radiomark", {
    // Read inside the accessor, so the variant values are tracked rather than snapshotted.
    variantProps: () => pickVariantProps<RadiomarkVariantProps>(props, variantKeys),
    // No `unstyled` accessor, unlike Checkmark's: this recipe reaches the element through
    // `renderStyled`'s `recipeClass` seam, which suppresses itself under `unstyled` already.
    // Checkmark bypasses that seam because its five presentation attributes would be suppressed
    // with it; there are none here, so the ordinary route is available.
  });

  // Resolved once here rather than in a `children` getter below. A getter is read inside the
  // element's own effect, so `props.checked` changing would re-run it and build a **second** `Show`
  // — `CLAUDE.md`, *The second hazard*. `Show` reads the flag lazily, so one construction is enough.
  const dot = (
    <Show when={props.checked === true}>
      <span class="dot" />
    </Show>
  );

  // `merge` resolves a key by presence and the later source wins, which is Chakra's prop order
  // written out: the `data-*` attributes come first so a caller can override them, and the dot comes
  // last, which is how a caller's `children` is dropped — the dot is this component's, not theirs.
  const elementProps = merge(
    {
      /** Chakra's `dataAttr`: present-and-empty when true, absent when false. */
      get "data-checked"() {
        return props.checked === true ? "" : undefined;
      },
      get "data-disabled"() {
        return props.disabled === true ? "" : undefined;
      },
    },
    omit(props, ...variantKeys, ...STATE_KEYS),
    { children: dot },
  );

  return renderStyled<RadiomarkElementProps>({
    as: (props.as ?? "span") as ValidComponent,
    render: props.render,
    props: elementProps as unknown as RadiomarkElementProps,
    recipeClass,
  });
};
