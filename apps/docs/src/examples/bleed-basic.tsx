import { Bleed, Box, Stack } from "@chakra-ui-solid/components";

export default function BleedBasic() {
  return (
    <Box padding="10" rounded="sm" borderWidth="1px">
      <Bleed inline="10">
        <Box height="20" bg="bg.muted">
          Bleed
        </Box>
      </Bleed>

      <Stack mt="6">
        <Box as="h3" fontSize="lg" fontWeight="semibold">
          Some Heading
        </Box>
        <Box as="p">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Box>
      </Stack>
    </Box>
  );
}
