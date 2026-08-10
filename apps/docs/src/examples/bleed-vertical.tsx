import { Bleed, Box } from "@chakra-ui-solid/components";

export default function BleedVertical() {
  return (
    <Box padding="10" rounded="sm" borderWidth="1px">
      <Bleed block="10">
        <Box height="20" bg="bg.muted">
          Bleed
        </Box>
      </Bleed>
    </Box>
  );
}
