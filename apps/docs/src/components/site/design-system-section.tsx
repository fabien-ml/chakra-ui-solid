import { Box } from "chakra-ui-solid";
import { For } from "solid-js";
import { Container } from "~/components/container";
import { CodeTabs } from "~/components/site/code-tabs";
import { Eyebrow, HighlightHeading, Subheading } from "~/components/site/typography";

// Highlighted at build time by the `?highlight` plugin, the same way an example's source pane is —
// a snippet nobody can run is a snippet that drifts, so these are real files that `tsc --noEmit`
// compiles rather than strings in a template.
//
// **Every one of them imports from `@chakra-ui-solid/*`.** An earlier set showed `defineTokens`,
// `defineTextStyles` and `defineRecipe` — all of them Panda's, none of them ours — under a heading
// that says *build your design system on top of chakra-ui-solid*. A code panel that demonstrates a
// dependency is an advert for the dependency.
const snippetHtml = import.meta.glob<string>("../../snippets/*.tsx", {
  eager: true,
  query: "?highlight",
  import: "default",
});

const highlighted = (name: string): string =>
  snippetHtml[`../../snippets/${name}.tsx`] ??
  `<pre>No snippet named “${name}” under src/snippets/.</pre>`;

const items = [
  {
    id: "design-tokens",
    label: "Tokens",
    lead: "Tokens.",
    description: "Streamline design decisions with semantic tokens",
  },
  {
    id: "text-styles",
    label: "Typography",
    lead: "Typography.",
    description: "Set your font properties once and use them everywhere",
  },
  {
    id: "recipes",
    label: "Recipes",
    lead: "Recipes.",
    description: "Design component variants with ease",
  },
];

/**
 * chakra-ui.com's design-system section, ported: the pitch on the left, a tabbed code panel on the
 * right, three items that are also the three tabs.
 *
 * **Their register, deliberately.** An earlier draft explained where the CSS comes from and what
 * Panda does with it — accurate, and the wrong section for it. Someone reading this far wants to
 * know what they can build, not how the toolchain works; the prerequisite has its own section above
 * and `/docs/styling/static-extraction` is the whole page about the mechanism.
 */
export function DesignSystemSection() {
  return (
    <Box as="section" position="relative" zIndex="base" py="20">
      <Container
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: "10", md: "20" }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="4"
          flex="1"
          minW="0"
        >
          <Eyebrow>Design system</Eyebrow>

          {/* Broken explicitly so “Build your design system” always survives as one line — left to
            wrap, the column splits it mid-phrase. The `\n` is a hard break rather than a `<br />`,
            which would make the highlight split miss (`~/components/site/typography`). */}
          <HighlightHeading level="h2" query="chakra-ui-solid">
            {"Build your design system\non top of chakra-ui-solid"}
          </HighlightHeading>

          <Subheading>
            Spend less time writing UI code and more time building a great experience for your
            customers.
          </Subheading>

          <Box as="ul" display="flex" flexDirection="column" gap="4" mt="4">
            <For each={items}>
              {(item) => (
                <Box as="li" display="flex" alignItems="flex-start" gap="3">
                  <Box
                    as="span"
                    aria-hidden="true"
                    width="1.5"
                    height="1.5"
                    mt="2.5"
                    borderRadius="full"
                    bg="colorPalette.solid"
                    flexShrink="0"
                  />
                  <Box as="p" color="fg.muted">
                    <Box as="span" color="fg" fontWeight="medium">
                      {item.lead}
                    </Box>{" "}
                    {item.description}
                  </Box>
                </Box>
              )}
            </For>
          </Box>
        </Box>

        <Box flex="1" minW="0">
          <CodeTabs
            label="Design system examples"
            items={items.map((item) => ({
              id: item.id,
              label: item.label,
              html: highlighted(item.id),
            }))}
          />
        </Box>
      </Container>
    </Box>
  );
}
