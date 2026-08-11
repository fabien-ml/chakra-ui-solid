import { chakra } from "@chakra-ui-solid/core";
import type { ComponentProps } from "@solidjs/web";

/** Em — emphasised inline text. `<em>` already italicises; the declaration makes it explicit. */
export const Em = chakra("em", {
  base: { fontStyle: "italic" },
});

export type EmProps = ComponentProps<typeof Em>;
