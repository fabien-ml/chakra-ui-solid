import { chakra } from "@chakra-ui-solid/system";
import type { ComponentProps } from "@solidjs/web";

/**
 * AbsoluteCenter — centres an element against its **positioned ancestor's** box rather than
 * against a flex line, which is what makes it the right tool for an overlay, a badge or a spinner
 * over content. The parent needs a non-`static` `position` for it to have anything to centre in.
 *
 * `translate` pulls the element back by half its own size, so the centring holds whatever the
 * element measures. `_rtl` flips that half-step, because `insetStart: 50%` already resolved to the
 * right-hand edge in a right-to-left document.
 */
export const AbsoluteCenter = chakra("div", {
  base: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  variants: {
    axis: {
      horizontal: {
        insetStart: "50%",
        translate: "-50%",
        _rtl: { translate: "50%" },
      },
      vertical: {
        top: "50%",
        translate: "0 -50%",
      },
      both: {
        insetStart: "50%",
        top: "50%",
        translate: "-50% -50%",
        _rtl: { translate: "50% -50%" },
      },
    },
  },
  defaultVariants: {
    axis: "both",
  },
});

export type AbsoluteCenterProps = ComponentProps<typeof AbsoluteCenter>;
