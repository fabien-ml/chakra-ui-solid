import { Box } from "@chakra-ui-solid/components";

export default function BoxBasic() {
  return (
    <Box p="6" bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="l3" color="fg">
      Every one of these values is a literal, so Panda reads them out of this file at build time.
    </Box>
  );
}
