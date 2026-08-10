import { Box } from "@chakra-ui-solid/components";
import { Container } from "~/components/container";
import { Blob } from "~/components/site/blob";
import { DocLinkButton } from "~/components/site/link-button";
import { Eyebrow, HighlightHeading, Subheading } from "~/components/site/typography";

/**
 * Where chakra-ui.com closes on a product tier, this page closes on what is missing — the positive
 * form of *a page for an unbuilt component is a promise* (`roadmap.md` §9.2). The absence is stated
 * here rather than left for a reader to discover through a 404.
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
            <Eyebrow>What is not here yet</Eyebrow>
            <HighlightHeading level="h2" query="one batch at a time">
              This library is being built one batch at a time
            </HighlightHeading>
            <Subheading>
              A component gets its docs page in the same phase it ships, so anything missing from
              the sidebar has not been written yet rather than gone undocumented.
            </Subheading>
            <Box as="p" color="fg.muted" maxW="2xl">
              Charts are excluded outright, and on a dependency ground rather than a styling one:
              Chakra's chart tier peer-depends on Recharts and React, and there is no Solid charting
              substrate to bind to.
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
