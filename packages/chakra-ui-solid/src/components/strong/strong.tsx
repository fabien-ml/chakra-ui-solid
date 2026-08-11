import { chakra } from "@chakra-ui-solid/core";
import type { ComponentProps } from "@solidjs/web";

/** Strong — important inline text, at the theme's `semibold` rather than the UA's `bold`. */
export const Strong = chakra("strong", {
  base: { fontWeight: "semibold" },
});

export type StrongProps = ComponentProps<typeof Strong>;
