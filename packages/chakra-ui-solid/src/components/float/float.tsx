import { type CssProp, chakra, composeCss, type HTMLChakraProps } from "@chakra-ui-solid/core";
import type { FloatProperties } from "@chakra-ui-solid/styled-system/patterns";
import { float } from "@chakra-ui-solid/styled-system/patterns";
import { type Component, merge, omit } from "solid-js";

export interface FloatOptions extends FloatProperties {}

export interface FloatProps
  extends Omit<HTMLChakraProps<"div">, keyof FloatOptions>,
    FloatOptions {}

const OPTIONS = ["offset", "offsetX", "offsetY", "placement"] as const;

/**
 * Float — anchors a small element to a corner or edge of its positioned parent, half-overlapping
 * it. A notification count on a button, a status dot on an avatar.
 *
 * The nine placements each resolve to four insets and a `translate`, and Panda's `float` pattern
 * computes exactly what Chakra's Float does — same nine names, the same `offsetX ?? offset`
 * fallback, the same `"top-end"` and `"0"` defaults. So this is the pattern reused whole rather
 * than the CSS-custom-property route the roadmap pencilled in: since the pattern claims the JSX
 * name `Float`, a consumer's `<Float placement="bottom-start" offset="2">` is mapped through the
 * same code on their side, and there is nothing left over for a stylesheet to be missing.
 *
 * That also keeps the conditional value form working, which the custom-property route cannot:
 * `placement={{ base: "top-end", md: "middle-end" }}` is mapped per breakpoint by the pattern.
 */
export const Float: Component<FloatProps> = (props) => {
  const elementProps = merge(omit(props, ...OPTIONS, "css"), {
    get css(): CssProp {
      return composeCss(
        float.raw({
          offset: props.offset,
          offsetX: props.offsetX,
          offsetY: props.offsetY,
          placement: props.placement,
        }),
        props.css,
      );
    },
  });

  return <chakra.div {...elementProps} />;
};
