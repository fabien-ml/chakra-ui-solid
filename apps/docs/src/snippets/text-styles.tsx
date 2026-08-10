import { Box } from "@chakra-ui-solid/components";

export function Hero() {
  return (
    <Box as="section" display="flex" flexDirection="column" gap="3">
      <Box as="h1" textStyle="5xl" fontFamily="heading" letterSpacing="tighter" color="fg">
        Ship the whole design system
      </Box>
      <Box as="p" textStyle="lg" color="fg.muted">
        One scale for every heading, label and caption on the page.
      </Box>
    </Box>
  );
}
