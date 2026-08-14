import { Bleed, Box, Stack } from "chakra-ui-solid";
import { DecorativeBox } from "../../components/decorative-box";

export default function BleedBasic() {
  return (
    <Box padding="10" rounded="sm" borderWidth="1px">
      <Bleed inline="10">
        <DecorativeBox height="20">Bleed</DecorativeBox>
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
