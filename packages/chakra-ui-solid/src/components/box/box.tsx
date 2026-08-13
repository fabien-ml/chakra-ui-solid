import { chakra } from "@chakra-ui-solid/core";
import type { ComponentProps } from "@solidjs/web";

/**
 * Box — the most abstract component, on top of which the others here are built. No styles of its
 * own; every style prop, on a `<div>`.
 */
export const Box = chakra("div");

export type BoxProps = ComponentProps<typeof Box>;
