import { Box, Container } from "chakra-ui-solid";
import { Blob } from "~/components/home/blob";
import { DocLinkButton } from "~/components/home/link-button";
import { Eyebrow, HighlightHeading, Subheading } from "~/components/home/typography";

/**
 * Where chakra-ui.com closes on a product tier, this page closes on what is missing — the positive
 * form of *a page for an unbuilt component is a promise* (`roadmap.md` §9.2). The absence is stated
 * here rather than left for a reader to discover through a 404.
 *
 * **Only one direction of that is true, and the copy used to claim both.** A page never ships ahead
 * of its component, which is §9.2. The converse — that everything shipped has a page — is not:
 * `button` ships `Button`, `ButtonGroup`, `IconButton` and `CloseButton`, and only the last two
 * have pages. So the sidebar is described as a reading list rather than as an inventory of what
 * exists.
 */
export function NextStepsSection() {
  return (
    <Box as="section" position="relative" zIndex="base" py="20" overflow="hidden">
      <Blob width="1400px" height="1400px" bottom="-40%" left="30%" />

      <Container>
        <Box
          borderWidth="1px"
          borderColor="border.muted"
          borderRadius="l3"
          bg="bg.panel"
          px={{ base: "6", md: "12" }}
          py={{ base: "10", md: "16" }}
        >
          <Box display="flex" flexDirection="column" gap="4" maxW="3xl">
            <Eyebrow>What isn’t here yet</Eyebrow>
            <HighlightHeading level="h2" query="one batch at a time">
              This library ships one batch at a time
            </HighlightHeading>
            <Subheading>
              A page never appears before the component does, though a component can ship before its
              page. The sidebar is the reading list, not the inventory.
            </Subheading>
            <Box as="p" color="fg.muted" maxW="2xl">
              Charts are the one deliberate gap, and dependencies are the reason rather than
              styling. Chakra’s chart tier peer-depends on Recharts and React, and Solid has no
              charting substrate to bind to.
            </Box>

            <Box display="flex" flexWrap="wrap" gap="3" mt="6">
              <DocLinkButton slug="get-started/installation">Start building</DocLinkButton>
              <DocLinkButton slug="components/box" variant="outline">
                Browse components
              </DocLinkButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
