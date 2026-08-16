import { Dynamic } from "@solidjs/web";
import { Box, Tabs } from "chakra-ui-solid";
import { For } from "solid-js";
import { Eyebrow, HighlightHeading, Subheading } from "~/components/home/typography";
import { embeddedCodePaneClass } from "~/components/mdx/code-pane";
import { Container } from "~/components/ui/container";
import { BoxIcon, PaintBucketIcon, TypeIcon } from "~/components/ui/icons";

// Highlighted at build time by the `?highlight` plugin, the same way an example's source pane is —
// a snippet nobody can run is a snippet that drifts, so these are real files that `tsc --noEmit`
// compiles rather than strings in a template.
//
// **Every one of them names this library or the styled-system its own Panda run generated.** An
// earlier set showed `defineTokens`, `defineTextStyles` and `defineRecipe` — all of them Panda's,
// none of them ours — under a heading that says *build your design system on top of
// chakra-ui-solid*. A code panel that demonstrates a dependency is an advert for the dependency.
const snippetHtml = import.meta.glob<string>("../../snippets/*.tsx", {
  eager: true,
  query: "?highlight",
  import: "default",
});

const highlighted = (name: string): string =>
  snippetHtml[`../../snippets/${name}.tsx`] ??
  `<pre>No snippet named “${name}” under src/snippets/.</pre>`;

// Each `icon` is the component, never `<BoxIcon />`: a JSX element at module scope is evaluated on
// import and 500s the route under SSR.
const items = [
  {
    id: "design-tokens",
    icon: BoxIcon,
    label: "Tokens",
    lead: "Tokens.",
    description: "Streamline design decisions with semantic tokens",
  },
  {
    id: "text-styles",
    icon: TypeIcon,
    label: "Typography",
    lead: "Typography.",
    description: "Set your font properties once and use them everywhere",
  },
  {
    id: "recipes",
    icon: PaintBucketIcon,
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
            which would make the highlight split miss (`~/components/home/typography`). */}
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
                  {/* Chakra marks each item with the section's own icon rather than a bullet — it
                    is their `List.Indicator`, which is why it takes the accent colour and not the
                    text colour. `mt` is optical alignment to the first line, not the box. */}
                  <Box
                    as="span"
                    display="inline-flex"
                    color="colorPalette.fg"
                    fontSize="lg"
                    mt="0.5"
                    flexShrink="0"
                  >
                    <Dynamic component={item.icon} />
                  </Box>
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
          {/* No `lazyMount`: every panel is in the prerendered HTML, hidden rather than unmounted,
            so the code is readable before hydration and indexable after it. The opposite call to
            the one an `<Example>` takes, and for the opposite reason — there are three panels here,
            they are the section's content, and a reader who lands on `/` has not asked for
            anything yet.

            `colorPalette` is scoped to this tree rather than inherited from the page: a selected
            tab that silently turned gray the first time these tabs were reused elsewhere is the
            failure the hand-rolled version was written around. */}
          <Tabs.Root
            defaultValue={items[0]?.id}
            translations={{ listLabel: "Design system examples" }}
            variant="subtle"
            size="sm"
            colorPalette="teal"
            borderWidth="1px"
            borderColor="border.muted"
            borderRadius="l3"
            bg="bg.panel"
            p="2"
          >
            <Tabs.List width="full" p="1">
              <For each={items}>
                {(item) => (
                  <Tabs.Trigger value={item.id}>
                    <Dynamic component={item.icon} />
                    {item.label}
                  </Tabs.Trigger>
                )}
              </For>
            </Tabs.List>
            <Tabs.ContentGroup mt="1">
              <For each={items}>
                {(item) => (
                  // `p="0"` because the panel *is* the code pane here: the `content` slot's own
                  // `padding-top` would draw a band of `bg.subtle` above the first line.
                  <Tabs.Content
                    value={item.id}
                    p="0"
                    borderRadius="l2"
                    bg="bg.subtle"
                    overflow="hidden"
                  >
                    <Box class={embeddedCodePaneClass} innerHTML={highlighted(item.id)} />
                  </Tabs.Content>
                )}
              </For>
            </Tabs.ContentGroup>
          </Tabs.Root>
        </Box>
      </Container>
    </Box>
  );
}
