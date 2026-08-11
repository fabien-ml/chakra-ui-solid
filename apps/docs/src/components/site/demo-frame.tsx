import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";

/**
 * One cell of the hero's demo strip: a hairline frame, a centred live component, a mono caption.
 *
 * Chakra makes every frame focusable so Tab walks the strip. Ours makes the **scroll container**
 * focusable instead (`DemoStrip` below) — one stop, arrow keys scroll it, and no focusable `div`
 * that announces nothing.
 */
export function DemoFrame(props: { label: string; children: JSX.Element }) {
  return (
    <Box
      flexShrink="0"
      width="320px"
      borderWidth="1px"
      borderColor="border.muted"
      bg="bg.panel"
      pb="4"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="56"
        px="8"
        py="6"
        textAlign="center"
      >
        {props.children}
      </Box>
      <Box as="p" fontSize="sm" fontFamily="mono" color="fg.muted" textAlign="center">
        {props.label}
      </Box>
    </Box>
  );
}

/**
 * The strip itself — full-bleed and horizontally scrollable, with its first frame aligned to the
 * page gutter so it reads as a continuation of the hero rather than a separate band. The padding
 * expression is Chakra's: the gutter, or half the difference between the viewport and the content
 * column, whichever is larger.
 */
export function DemoStrip(props: { children: JSX.Element }) {
  return (
    <Box
      role="group"
      aria-label="Component demos"
      tabindex="0"
      display="flex"
      gap="4"
      flexWrap="nowrap"
      overflowX="auto"
      maxW="100%"
      scrollbarWidth="none"
      overscrollBehaviorInline="contain"
      ps="max(1rem, calc(50% - 96rem / 2))"
      pe="6"
      focusRing="outside"
    >
      {props.children}
    </Box>
  );
}
