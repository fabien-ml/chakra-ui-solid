import { Bleed, Box, Stack } from "chakra-ui-solid";
import { DecorativeBox } from "../../components/decorative-box";

export default function BleedWithDirection() {
  return (
    <Stack gap="8">
      <Box padding="8" rounded="sm" borderWidth="1px">
        <Bleed inlineStart="8">
          <DecorativeBox height="8">inlineStart</DecorativeBox>
        </Bleed>
      </Box>

      <Box padding="8" rounded="sm" borderWidth="1px">
        <Bleed inlineEnd="8">
          <DecorativeBox height="8">inlineEnd</DecorativeBox>
        </Bleed>
      </Box>

      <Box padding="8" rounded="sm" borderWidth="1px">
        <Bleed blockStart="8">
          <DecorativeBox height="8">blockStart</DecorativeBox>
        </Bleed>
      </Box>

      <Box padding="8" rounded="sm" borderWidth="1px">
        <Bleed blockEnd="8">
          <DecorativeBox height="8">blockEnd</DecorativeBox>
        </Bleed>
      </Box>
    </Stack>
  );
}
