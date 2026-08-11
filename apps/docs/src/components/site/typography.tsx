import { Box, type BoxProps } from "chakra-ui-solid";
import { omit, Show } from "solid-js";
import { BlitzFillIcon } from "~/components/site/logo";

/**
 * The three type shapes chakra-ui.com's landing page repeats in every section: a heading with one
 * phrase picked out, the muted line under it, and the small coloured label above it.
 *
 * All three are `Box` and style props, like everything else on this page — the docs site is this
 * library's first consumer, so its own chrome is written the way a reader's app would be.
 *
 * Each forwards the rest of its props to Box, so a caller writes `<Subheading maxW="md">` and
 * Panda extracts that from the **call site**: `jsxStyleProps: "all"` reads style props off any
 * capitalized component, with no factory and no registration (`plan.md` §3.4).
 */

/** `[before, match, after]` — `match` is empty when the query is not in the text. */
function splitOnQuery(text: string, query: string): [string, string, string] {
  const index = text.indexOf(query);
  if (index === -1) {
    return [text, "", ""];
  }
  return [text.slice(0, index), query, text.slice(index + query.length)];
}

/**
 * The picked-out phrase, exactly as chakra-ui.com draws it: palette text over a 10% wash of the
 * same palette, rounded on the **start** side only, and closed by a 2px bar on the **inline end** —
 * a caret sitting where the phrase stops, not an underline.
 *
 * The wash is a `::before` rather than a background on the span, because it has to hang `0.5` below
 * the text box; at 10% alpha the text reads straight through it. `borderInlineEndWidth` is the
 * whole effect — swap it for `borderBottomWidth` and it becomes an underline.
 */
export function HighlightHeading(
  props: BoxProps & { level: "h1" | "h2"; query: string; children: string },
) {
  const rest = omit(props, "level", "query", "children");
  const parts = () => splitOnQuery(props.children, props.query);

  return (
    <Box
      as={props.level}
      fontSize={{ base: "4xl", md: "5xl" }}
      fontWeight="semibold"
      letterSpacing="tighter"
      lineHeight="shorter"
      color="fg"
      textWrap="balance"
      // A `\n` in the string is a hard break. It has to be this rather than a `<br />` child:
      // `children` is split on `query` to place the highlight, and an element among the children
      // makes that split silently miss — the phrase renders with no highlight and no error.
      whiteSpace="pre-line"
      {...rest}
    >
      {parts()[0]}
      <Show when={parts()[1] !== ""}>
        <Box
          as="span"
          position="relative"
          display="inline-block"
          px="2"
          color={{ _light: "colorPalette.600", _dark: "colorPalette.500" }}
          _before={{
            content: '""',
            position: "absolute",
            width: "full",
            height: "full",
            bottom: "-0.5",
            insetInlineStart: "0",
            bg: "colorPalette.500/10",
            borderStartRadius: "md",
            borderInlineEndWidth: "2px",
            borderColor: "currentColor",
            pointerEvents: "none",
          }}
        >
          {parts()[1]}
        </Box>
      </Show>
      {parts()[2]}
    </Box>
  );
}

export function Subheading(props: BoxProps) {
  return (
    <Box
      as="p"
      fontSize={{ base: "lg", md: "xl" }}
      lineHeight="moderate"
      color="fg.muted"
      maxW="2xl"
      {...props}
    />
  );
}

/** The small label above a section heading, marked with the bolt as chakra-ui.com's is. */
export function Eyebrow(props: BoxProps) {
  const rest = omit(props, "children");

  return (
    <Box
      as="p"
      display="flex"
      alignItems="center"
      gap="3"
      color="colorPalette.fg"
      fontSize="sm"
      fontWeight="semibold"
      letterSpacing="wide"
      textTransform="uppercase"
      {...rest}
    >
      <Box as="span" display="inline-flex" flexShrink="0">
        <BlitzFillIcon />
      </Box>
      {props.children}
    </Box>
  );
}
