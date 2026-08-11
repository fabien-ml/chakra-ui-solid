import { chakra } from "@chakra-ui-solid/core";
import type { ComponentProps } from "@solidjs/web";

/**
 * The declarations that take an element out of the visual page while leaving it in the
 * accessibility tree — exported because a consumer needs them on an element this component does
 * not render, most often a native `<input>` a custom control draws over.
 *
 * Not `display: none` and not `visibility: hidden`: both remove the element from the accessibility
 * tree too, which is the opposite of the point. It is clipped to a 1px box instead.
 */
export const visuallyHiddenStyle = {
  border: "0",
  clip: "rect(0, 0, 0, 0)",
  height: "1px",
  width: "1px",
  margin: "-1px",
  padding: "0",
  overflow: "hidden",
  whiteSpace: "nowrap",
  position: "absolute",
} as const;

/** VisuallyHidden — content for screen readers only. */
export const VisuallyHidden = chakra("span", { base: visuallyHiddenStyle });

export type VisuallyHiddenProps = ComponentProps<typeof VisuallyHidden>;
