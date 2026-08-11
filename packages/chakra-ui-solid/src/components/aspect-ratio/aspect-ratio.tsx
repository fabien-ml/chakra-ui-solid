import { cx } from "@chakra-ui-solid/styled-system/css";
import { chakra, composeStyle, type HTMLChakraProps } from "@chakra-ui-solid/system";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

export interface AspectRatioProps extends Omit<HTMLChakraProps<"div">, "aspectRatio"> {
  /** Width over height — `16 / 9`, `4 / 3`, `1`. @default 4 / 3 */
  ratio?: number;
}

/**
 * The padding-bottom trick: a `::before` with a percentage padding — which resolves against the
 * *width* — reserves the height, and the real child is stretched over it absolutely.
 *
 * The percentage is `100 / ratio`, an arbitrary number computed at render time, so it rides a
 * custom property. Pseudo-elements inherit from their originating element, which is why setting it
 * on the element reaches `::before`.
 */
const StyledAspectRatio = chakra("div", {
  base: {
    position: "relative",
    _before: {
      content: '""',
      display: "block",
      height: 0,
      paddingBottom: "var(--aspect-ratio-padding)",
    },
    "& > *:not(style)": {
      overflow: "hidden",
      position: "absolute",
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
    },
    "& > img, & > video": {
      objectFit: "cover",
    },
  },
});

const DEFAULT_RATIO = 4 / 3;

/**
 * AspectRatio — holds its child at a fixed width-to-height ratio however wide it gets.
 *
 * The child is positioned against this element, so it must be the only one; Chakra enforces that
 * with `Children.only`, which Solid has no equivalent for. Extra children stack on top of each
 * other rather than raising anything.
 */
export const AspectRatio: Component<AspectRatioProps> = (props) => {
  const elementProps = merge(omit(props, "ratio", "style", "class"), {
    get style(): JSX.HTMLAttributes<HTMLElement>["style"] {
      const ratio = props.ratio ?? DEFAULT_RATIO;
      return composeStyle({ "--aspect-ratio-padding": `${(1 / ratio) * 100}%` }, props.style);
    },
    get class() {
      return cx("chakra-aspect-ratio", props.class as string | undefined);
    },
  });

  return <StyledAspectRatio {...elementProps} />;
};
