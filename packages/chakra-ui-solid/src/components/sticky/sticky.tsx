import { chakra } from "@chakra-ui-solid/system";
import type { ComponentProps } from "@solidjs/web";

/** Sticky — sticks to the top of its scroll container. Move it with the `top` style prop. */
export const Sticky = chakra("div", {
  base: {
    position: "sticky",
    top: 0,
  },
});

export type StickyProps = ComponentProps<typeof Sticky>;
