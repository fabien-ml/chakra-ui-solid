import { Box } from "@chakra-ui-solid/components";
import { For } from "solid-js";
import { Container } from "~/components/container";
import { Eyebrow, HighlightHeading, Subheading } from "~/components/site/typography";
import { PARITY_SENTENCE } from "~/config";

/**
 * The delta, a few items a side (`docs-plan.md` §3.2 section 3). **Not the full parity table** —
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
  "Chakra v3's component API, part for part",
  "Its design system, through the official Panda preset",
  "Zag.js behavior and the ARIA that comes with it",
  "Style props, recipes, variants and colour mode",
];

const excluded = [
  "Runtime theming — no createSystem, no Theme component",
  "Style values computed while the app runs",
  "asChild — polymorphism is a render prop, and it takes a function",
];

export function ParitySection() {
  return (
    <Box as="section" position="relative" zIndex="base" py="20">
      <Container>
        <Box display="flex" flexDirection="column" gap="4" maxW="3xl">
          <Eyebrow>Parity</Eyebrow>
          {/* Every heading on this page lands on its highlight, and the highlight is the claim —
            so this one ends on the relief rather than on the absence. *No runtime CSS* is a feature
            list item; *without the runtime headache* is what the reader actually gets, and the
            precise version is one scroll away in the right-hand column. */}
          <HighlightHeading level="h2" query="without the runtime headache">
            The same API and tokens, without the runtime headache
          </HighlightHeading>
          <Subheading>
            This is{" "}
            <Box as="strong" color="fg" fontWeight="semibold">
              {PARITY_SENTENCE}
            </Box>{" "}
            — not a 1:1 port, and it does not pretend to be one.
          </Subheading>
        </Box>

        <Box
          display="grid"
          gap="6"
          mt="12"
          md={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
          <Column title="You get" items={included} tone="included" />
          <Column title="You do not get" items={excluded} tone="excluded" />
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
