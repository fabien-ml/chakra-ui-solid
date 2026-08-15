import {
  type CssProp,
  chakra,
  composeCss,
  type HTMLChakraProps,
  omitProps,
} from "@chakra-ui-solid/core";
import { square } from "@chakra-ui-solid/styled-system/patterns";
import type { SystemProperties } from "@chakra-ui-solid/styled-system/types";
import { type Component, merge } from "solid-js";

export interface SquareProps extends Omit<HTMLChakraProps<"div">, "size"> {
  /** The width and height of the square — one value for both, taking whatever `width` takes. */
  size?: SystemProperties["width"];
}

/**
 * Square — a box that is as tall as it is wide, with its child centred.
 *
 * `size` is mapped by Panda's own `square` **pattern** (`square.raw` — a pure prop → style-object
 * function, nothing to do with Panda's Solid-1.x JSX factory, which stays out). Reusing it is not
 * a shortcut: Panda's pattern also claims the JSX name `Square`, so when a consumer writes
 * `<Square size="10">` **their** extractor runs that same mapping over their source. Runtime and
 * stylesheet therefore agree by construction; a hand-written `size → boxSize` here would compute a
 * class their sheet has no rule for, and the square would render with no size and no error.
 *
 * The mapping is a **getter** rather than an inline JSX expression, so `props.size` is read inside
 * whichever scope reads the class — that is what keeps a signal-backed `size` reactive.
 */
export const Square: Component<SquareProps> = (props) => {
  const elementProps = merge(omitProps(props, "size", "css"), {
    get css(): CssProp {
      return composeCss(square.raw({ size: props.size }), props.css);
    },
  });

  return <chakra.div {...elementProps} />;
};
