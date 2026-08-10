import { Bleed, Box, Stack } from "@chakra-ui-solid/components";

export default function BleedWithDirection() {
  return (
    <Stack gap="8">
      <Box padding="8" rounded="sm" borderWidth="1px">
        <Bleed inlineStart="8">
          <Box height="8" bg="bg.muted">
            inlineStart
          </Box>
        </Bleed>
      </Box>

      <Box padding="8" rounded="sm" borderWidth="1px">
        <Bleed inlineEnd="8">
          <Box height="8" bg="bg.muted">
            inlineEnd
          </Box>
        </Bleed>
      </Box>

      <Box padding="8" rounded="sm" borderWidth="1px">
        <Bleed blockStart="8">
          <Box height="8" bg="bg.muted">
            blockStart
          </Box>
        </Bleed>
      </Box>

      <Box padding="8" rounded="sm" borderWidth="1px">
        <Bleed blockEnd="8">
          <Box height="8" bg="bg.muted">
            blockEnd
          </Box>
        </Bleed>
      </Box>
    </Stack>
  );
}
