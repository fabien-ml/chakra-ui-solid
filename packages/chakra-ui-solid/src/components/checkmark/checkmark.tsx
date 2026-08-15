/**
 * @license
 * The two glyphs below are copied from Chakra UI (`@chakra-ui/react`,
 * `packages/react/src/components/checkmark/checkmark.tsx`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 *
 * The tick is the same shape `components/icons.tsx` already draws as `CheckIcon` — `M20 6 9 17l-5-5`
 * and `20 6 9 17 4 12` trace the same three points — but it is taken from a different upstream file
 * and expressed as a polyline, so it is declared here rather than borrowed from that row. The dash
 * has no counterpart there at all. The component around them is public API shape and owes nothing;
 * only the two glyphs do.
 */

import {
  chakra,
  createRecipeClass,
  type HTMLChakraProps,
  omitProps,
  type PresetVariant,
} from "@chakra-ui-solid/core";
import { cx } from "@chakra-ui-solid/styled-system/css";
import { type CheckmarkVariantProps, checkmark } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import { type Component, Match, Switch } from "solid-js";

/**
 * The three variants spelled out rather than inherited from the generated `CheckmarkVariantProps`,
 * so each carries a description a reader can use and a type they can read — a generated type has
 * neither, and this is the interface the docs page's props table is built from. Drift is caught by
 * {@link VARIANT_KEYS}, which is typed against the generated variants.
 */
export interface CheckmarkProps extends HTMLChakraProps<"svg"> {
  /**
   * The box's size, as a scale step. `md` and `lg` inset the glyph with a little padding; `xs` and
   * `sm` are too small to spare it.
   *
   * @default "md"
   */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | PresetVariant<"checkmark", "size">>;
  /**
   * How the box is painted once it is checked — `solid` fills it with the palette, `outline` and
   * `inverted` only recolour the border, `subtle` tints it, and `plain` draws no box at all.
   *
   * @default "solid"
   */
  variant?: ConditionalValue<
    "solid" | "outline" | "subtle" | "plain" | "inverted" | PresetVariant<"checkmark", "variant">
  >;
  /**
   * Give the box an opaque background, so it covers whatever it sits on rather than letting it
   * through. Meant for `variant="outline"`, which otherwise has no fill of its own.
   */
  filled?: ConditionalValue<boolean>;
  /** Whether the checkmark is checked. */
  checked?: boolean;
  /** Whether the checkmark is indeterminate. Beats `checked` when both are set, as Chakra's does. */
  indeterminate?: boolean;
  /** Whether the checkmark is disabled — dims it and takes the cursor with it. */
  disabled?: boolean;
}

/**
 * The recipe's own inputs, as literal keys typed against the generated variants. A variant renamed
 * upstream stops the build here rather than reaching the DOM as an attribute, and the test asserts
 * the same equality at runtime against `checkmark.variantKeys`.
 */
const VARIANT_KEYS = [
  "size",
  "variant",
  "filled",
] as const satisfies readonly (keyof CheckmarkVariantProps & keyof CheckmarkProps)[];

/** This component's own inputs — state it reports through `data-*`, never as DOM attributes. */
const STATE_KEYS = ["checked", "indeterminate", "disabled"] as const;

/**
 * Checkmark — the tick, dash or empty box that shows a checked, indeterminate or unchecked state.
 *
 * It is not a checkbox: no machine, no input, no click handling. Three booleans in, one `svg` out,
 * with the state on `data-state` and `data-disabled` where the recipe's variants select on it. A
 * `Checkbox` supplies those from its machine and passes `unstyled` to swap the recipe for its own
 * slot styles; on its own it is a display element, which is what the docs page shows.
 *
 * **No `aria-hidden` and no `focusable`**, where every glyph in `components/icons.tsx` carries both.
 * Chakra's Checkmark sets neither, and a checkbox labels the control rather than the mark inside it.
 */
export const Checkmark: Component<CheckmarkProps> = (props) => {
  const recipeClass = createRecipeClass(checkmark, {
    variantProps: () => ({ size: props.size, variant: props.variant, filled: props.filled }),
    // Honoured here rather than by `renderStyled`, because the recipe reaches the element through
    // `class` below rather than through the `recipeClass` seam — see the note on the element.
    unstyled: () => props.unstyled,
  });

  const state = () =>
    props.indeterminate === true
      ? "indeterminate"
      : props.checked === true
        ? "checked"
        : "unchecked";

  // Named rather than spread inline. A **call expression** in a JSX spread is compiled to a memo,
  // and the receiving component then reads a reactive value in its own body — `STRICT_READ_UNTRACKED`,
  // reported against `<Anonymous>` with nothing pointing back here.
  const elementProps = omitProps(props, ...VARIANT_KEYS, ...STATE_KEYS);

  // The five presentation attributes are **style props** on this stack — `isCssProperty` claims
  // `fill`, `stroke` and the three `stroke*` — so they have to be literal attributes on a `chakra.*`
  // element to be statically extractable. Moved into a `withDefaults` object or a `baseStyles`
  // accessor they are an object literal inside a function call, which generates nothing and renders
  // an invisible checkmark with no error (`CLAUDE.md`, *The hazard*). `icons.tsx` carries its own
  // for the same reason. That is also why the recipe rides on `class` rather than `renderStyled`'s
  // `recipeClass`: that seam is suppressed by `unstyled`, and so is `baseStyles` beside it — a
  // Checkbox indicator passes `unstyled` and would lose the stroke that draws the tick.
  //
  // `data-state` and `data-disabled` sit before the spread so a caller can override them, which is
  // Chakra's order — `data-disabled` being Chakra's `dataAttr`, present-and-empty or absent. The
  // written children sit after it, which is how a caller's `children` is dropped: the glyph is this
  // component's, not theirs.
  return (
    <chakra.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3px"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-state={state()}
      data-disabled={props.disabled === true ? "" : undefined}
      {...elementProps}
      class={cx(recipeClass(), props.class as string | undefined)}
    >
      <Switch>
        <Match when={props.indeterminate}>
          <path d="M5 12h14" />
        </Match>
        <Match when={props.checked}>
          <polyline points="20 6 9 17 4 12" />
        </Match>
      </Switch>
    </chakra.svg>
  );
};
