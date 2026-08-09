import { Box } from "@chakra-ui-solid/components";

export default function BoxAs() {
  return (
    <Box as="section" display="flex" flexDirection="column" gap="2">
      <Box as="h3" fontSize="lg" fontWeight="semibold" color="fg">
        A section, then a paragraph
      </Box>
      <Box as="p" color="fg.muted">
        <code>as</code> changes the element Box renders. It stays a loose{" "}
        <code>ValidComponent</code> rather than a generic that re-types props from the element.
      </Box>
    </Box>
  );
}
