import { Box } from "@chakra-ui-solid/components";

export default function BoxWithAsProp() {
  return (
    <Box as="section" color="fg.muted">
      This is a Box rendered as a section
    </Box>
  );
}
