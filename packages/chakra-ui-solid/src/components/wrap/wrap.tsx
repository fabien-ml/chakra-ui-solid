import { type CssProp, chakra, composeCss, type HTMLChakraProps } from "@chakra-ui-solid/core";
import { css, cx } from "@chakra-ui-solid/styled-system/css";
import type { WrapProperties } from "@chakra-ui-solid/styled-system/patterns";
import { wrap } from "@chakra-ui-solid/styled-system/patterns";
import type { SystemStyleObject } from "@chakra-ui-solid/styled-system/types";
import { type Component, merge, omit } from "solid-js";

export interface WrapOptions extends WrapProperties {
  /** Shorthand for `flexDirection`. */
  direction?: SystemStyleObject["flexDirection"];
}

export interface WrapProps extends Omit<HTMLChakraProps<"div">, "direction">, WrapOptions {}

/**
 * Chakra's default, and it is spelled once because it has to hold in two places: the base below is
 * what makes the value extractable, and the pattern call is what actually emits it.
 */
const DEFAULT_GAP = "0.5rem";

const StyledWrap = chakra("div", {
  base: { display: "flex", flexWrap: "wrap", gap: DEFAULT_GAP },
});

/**
 * Wrap — a flex row whose children flow onto a new line rather than shrinking, with a gap between
 * them on both axes.
 *
 * `align` and `justify` go through Panda's `wrap` pattern, which claims the JSX name `Wrap` and is
 * therefore the mapping a consumer's own extractor runs over `<Wrap align="center">`. Its `gap`
 * **default** is not reused: Panda's is `8px` and Chakra's is `0.5rem`, and letting the pattern
 * supply it would emit a class no source in this library spells — so it is passed in.
 *
 * `direction` has no counterpart in that pattern at all, so its value reaches a stylesheet only
 * because the preset's `staticCss` pre-generates the four `flexDirection` keywords.
 */
export const Wrap: Component<WrapProps> = (props) => {
  const elementProps = merge(omit(props, "align", "justify", "direction", "css", "class"), {
    get css(): CssProp {
      const styles = wrap.raw({
        align: props.align,
        justify: props.justify,
        gap: props.gap ?? DEFAULT_GAP,
      });
      styles.flexDirection = props.direction;
      return composeCss(styles, props.css);
    },
    get class() {
      return cx("chakra-wrap", props.class as string | undefined);
    },
  });

  return <StyledWrap {...elementProps} />;
};

export interface WrapItemProps extends HTMLChakraProps<"div"> {}

/** In the `css` seam rather than a recipe base, which is where Chakra puts it. */
const itemStyle = css.raw({ display: "flex", alignItems: "flex-start" });

/** WrapItem — one child of a {@link Wrap}, kept from stretching to the line's height. */
export const WrapItem: Component<WrapItemProps> = (props) => {
  const elementProps = merge(omit(props, "css", "class"), {
    get css(): CssProp {
      return composeCss(itemStyle, props.css);
    },
    get class() {
      return cx("chakra-wrap__listitem", props.class as string | undefined);
    },
  });

  return <chakra.div {...elementProps} />;
};
