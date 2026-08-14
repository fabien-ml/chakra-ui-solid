import { Box, type BoxProps } from "chakra-ui-solid";

/**
 * Chakra's `Container`: a centred `8xl` column with the same responsive gutter.
 *
 * **A component rather than the class it used to be.** This site is the library's first consumer,
 * and a page frame written as `css()` beside a native `<div>` is the one place that claim quietly
 * stops being true (`docs-site.md` §1.1). Chakra's own `Container` ships at step 6 (`roadmap.md`
 * §4); this is Box until it does, and one import when it lands.
 *
 * Every prop is forwarded, so a caller writes `<Container display="flex" gap="8">` and Panda
 * extracts those two style props from the **call site** — `jsxStyleProps: "all"` reads style props
 * off any capitalized component, with no factory and no registration (`plan.md` §3.4).
 */
export function Container(props: BoxProps) {
  return <Box width="full" maxW="8xl" mx="auto" px={{ base: "4", md: "6" }} {...props} />;
}
