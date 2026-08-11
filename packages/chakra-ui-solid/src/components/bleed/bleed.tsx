import { css } from "@chakra-ui-solid/styled-system/css";
import { token } from "@chakra-ui-solid/styled-system/tokens";
import {
  type CssProp,
  chakra,
  composeCss,
  composeStyle,
  type HTMLChakraProps,
} from "@chakra-ui-solid/system";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

export interface BleedOptions {
  /** How far to break out on both inline edges — a spacing token like `"10"`, or a CSS length. */
  inline?: string | number;
  /** How far to break out on both block edges — a spacing token like `"10"`, or a CSS length. */
  block?: string | number;
  /** How far to break out on the inline-start edge (left in a left-to-right document). */
  inlineStart?: string | number;
  /** How far to break out on the inline-end edge (right in a left-to-right document). */
  inlineEnd?: string | number;
  /** How far to break out on the block-start edge (the top). */
  blockStart?: string | number;
  /** How far to break out on the block-end edge (the bottom). */
  blockEnd?: string | number;
}

export interface BleedProps
  extends Omit<HTMLChakraProps<"div">, keyof BleedOptions>,
    BleedOptions {}

/**
 * The four margins, each `-1 ×` whatever its custom property holds, defaulting to zero.
 *
 * Chakra writes these into `css` rather than as style props, so they outrank a `marginInlineStart`
 * passed alongside; the placement is kept.
 */
const bleedStyle = css.raw({
  marginInlineStart: "calc(var(--bleed-inline-start, 0) * -1)",
  marginInlineEnd: "calc(var(--bleed-inline-end, 0) * -1)",
  marginBlockStart: "calc(var(--bleed-block-start, 0) * -1)",
  marginBlockEnd: "calc(var(--bleed-block-end, 0) * -1)",
});

const OPTIONS = ["inline", "block", "inlineStart", "inlineEnd", "blockStart", "blockEnd"] as const;

/**
 * A spacing token resolves to the custom property the stylesheet declares; anything else is already
 * a length and passes through.
 *
 * Chakra decides this with an `isCssUnit` regex over the value. Asking the generated token map
 * instead answers the same question against the build's own output rather than a heuristic — and a
 * `var(--…)` a consumer hands in falls through the same miss branch.
 */
function resolveSpacing(value: string | number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return token.var(`spacing.${value}` as Parameters<typeof token.var>[0]) ?? String(value);
}

/**
 * Bleed — lets a child escape its parent's padding, so a full-width image or banner reaches the
 * edge of a container that everything else is inset from.
 *
 * The negative margins are a fixed `calc()` in the stylesheet and the *amounts* are inline custom
 * properties, which is Chakra's own shape rather than an adaptation. It is also what lets the
 * component take a token name and a raw length through one prop.
 */
export const Bleed: Component<BleedProps> = (props) => {
  const elementProps = merge(omit(props, ...OPTIONS, "css", "style"), {
    get css(): CssProp {
      return composeCss(bleedStyle, props.css);
    },
    get style(): JSX.HTMLAttributes<HTMLElement>["style"] {
      return composeStyle(
        {
          "--bleed-inline-start": resolveSpacing(props.inline ?? props.inlineStart),
          "--bleed-inline-end": resolveSpacing(props.inline ?? props.inlineEnd),
          "--bleed-block-start": resolveSpacing(props.block ?? props.blockStart),
          "--bleed-block-end": resolveSpacing(props.block ?? props.blockEnd),
        },
        props.style,
      );
    },
  });

  return <chakra.div {...elementProps} />;
};
