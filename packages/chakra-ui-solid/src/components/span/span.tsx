import { chakra } from "@chakra-ui-solid/core";
import type { ComponentProps } from "@solidjs/web";

/** Span — Box's inline twin. No styles of its own; every style prop, on a `<span>`. */
export const Span = chakra("span");

export type SpanProps = ComponentProps<typeof Span>;
