import { chakra } from "@chakra-ui-solid/system";
import type { ComponentProps } from "@solidjs/web";

/** Quote — a short inline quotation. `<q>` is the element that supplies the quotation marks. */
export const Quote = chakra("q", {
  base: {
    fontWeight: "bold",
    lineHeight: "1.2",
  },
});

export type QuoteProps = ComponentProps<typeof Quote>;
