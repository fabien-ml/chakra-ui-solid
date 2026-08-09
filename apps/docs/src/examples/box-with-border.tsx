import { Box } from "@chakra-ui-solid/components";

export default function BoxWithBorder() {
  return (
    <Box p="4" borderWidth="1px" borderColor="border.emphasized" color="fg.muted">
      Box with a border
    </Box>
  );
}
