import { Box } from "chakra-ui-solid";
import { For } from "solid-js";
import { Container } from "~/components/container";
import { Eyebrow, HighlightHeading, Subheading } from "~/components/site/typography";
import { PARITY_SENTENCE } from "~/config";

/**
 * The sentence, split at its last space so the final token can be held on one line. It ends in
 * `CSS-in-JS`, whose two hyphens are line-break opportunities the browser takes — and the string is
 * verbatim, so the break is fixed by wrapping the token rather than by rewriting it. Deriving both
 * halves from the constant keeps `~/config` the only place the wording lives.
 */
const PARITY_SENTENCE_LAST_SPACE = PARITY_SENTENCE.lastIndexOf(" ");
const PARITY_SENTENCE_HEAD = PARITY_SENTENCE.slice(0, PARITY_SENTENCE_LAST_SPACE + 1);
const PARITY_SENTENCE_TAIL = PARITY_SENTENCE.slice(PARITY_SENTENCE_LAST_SPACE + 1);

/**
 * The delta, a few items a side (`docs-plan.md` §3.2 section 2). **Not the full parity table** —
 * that lives on the migration page, and the whole of it on a landing page is read by nobody; three
 * items get read.
 *
 * The right-hand column is the reason this page exists at all: a Chakra v3 reader arrives assuming
 * runtime theming, and finding that out on their third day is the expensive way.
 *
 * **`plan.md` §0's sentence lives here, verbatim**, rather than in the hero. Q3 settles its
 * placement as *prominent* (`docs-plan.md` §5.4), and prominent is not the same as first: a reader
 * meets it in the one section that also shows what it costs, instead of in a hero where it is a
 * caveat with nothing attached to it.
 */
const included = [
  "Chakra v3’s component API, part for part",
  "Its design system, through the official Panda preset",
  "Its theming config in panda.config.ts: tokens, semantic tokens, recipes",
  "Zag.js behavior, and the accessibility semantics that come with it",
  "Style props, recipes, variants and colour mode",
];

/**
 * **No `createSystem` row here, deliberately.** It read as *no theming*, which is the one thing a
 * v3 reader arrives worried about and the one thing that is not true — the config is theirs, one
 * file over, and the included column now says so. What that row was actually warning about is the
 * line below it, which survives: values a build cannot know.
 */
const excluded = [
  "Style values computed while the app runs",
  "asChild: polymorphism is a render prop, and it takes a function",
];

export function ParitySection() {
  return (
    <Box as="section" position="relative" zIndex="base" py="20">
      <Container>
        <Box display="flex" flexDirection="column" gap="4" maxW="3xl">
          <Eyebrow>Parity</Eyebrow>
          {/* Every heading on this page lands on its highlight, and the highlight is the claim —
            so this one ends on what the reader gets rather than on what they avoid. *No runtime
            CSS* is a feature list item and *the runtime headache* is an absence; *your own
            stylesheet* is the thing they end up holding, and it is also the literal mechanism —
            Panda runs in their build and writes their sheet.

            The `\n` is a hard break, and it is placed so the second line opens un-highlighted and
            closes on the highlight, which is the shape the hero and the framework grid have.
            Highlighting a whole line instead reads as a caption. */}
          <HighlightHeading level="h2" query="your own stylesheet">
            {"The same API and tokens,\ncompiled into your own stylesheet"}
          </HighlightHeading>
          <Subheading>
            This is{" "}
            <Box as="strong" color="fg" fontWeight="semibold">
              {PARITY_SENTENCE_HEAD}
              {/* `CSS-in-JS` broke as `CSS-` / `in-JS`, because a literal hyphen is a line-break
                opportunity and nothing but `nowrap` suppresses one. The sentence is verbatim
                (`~/config`), so the fix wraps the token instead of editing it — no soft hyphen, no
                U+2011, nothing that depends on the font carrying a glyph. */}
              <Box as="span" whiteSpace="nowrap">
                {PARITY_SENTENCE_TAIL}
              </Box>
            </Box>
            . It isn’t a 1:1 port, and it doesn’t pretend to be one.
          </Subheading>
        </Box>

        <Box
          display="grid"
          gap="6"
          mt="12"
          md={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
          <Column title="You get" items={included} tone="included" />
          <Column title="You don’t get" items={excluded} tone="excluded" />
        </Box>
      </Container>
    </Box>
  );
}

function Column(props: { title: string; items: string[]; tone: "included" | "excluded" }) {
  const isIncluded = () => props.tone === "included";

  return (
    <Box borderWidth="1px" borderColor="border.muted" borderRadius="l3" bg="bg.panel" p="6">
      <Box as="h3" fontWeight="semibold" color="fg" mb="4">
        {props.title}
      </Box>
      <Box as="ul" display="flex" flexDirection="column" gap="3">
        <For each={props.items}>
          {(item) => (
            <Box
              as="li"
              display="flex"
              alignItems="flex-start"
              gap="3"
              fontSize="sm"
              lineHeight="moderate"
              color="fg.muted"
            >
              <Box
                as="span"
                aria-hidden="true"
                color={isIncluded() ? "colorPalette.fg" : "fg.subtle"}
              >
                {isIncluded() ? "✓" : "✕"}
              </Box>
              {item}
            </Box>
          )}
        </For>
      </Box>
    </Box>
  );
}
