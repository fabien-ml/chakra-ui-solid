import { chakra } from "@chakra-ui-solid/core";
import type { ComponentProps } from "@solidjs/web";

/**
 * Spacer — an empty flex child that eats whatever room is left, pushing its siblings apart.
 *
 * `flex: 1` is Panda's named value for `1 1 0%`, so the element grows and shrinks from a zero
 * basis; the two `stretch`es make it fill the cross axis in a flex *or* a grid parent.
 */
export const Spacer = chakra("div", {
  base: {
    flex: 1,
    justifySelf: "stretch",
    alignSelf: "stretch",
  },
});

export type SpacerProps = ComponentProps<typeof Spacer>;
