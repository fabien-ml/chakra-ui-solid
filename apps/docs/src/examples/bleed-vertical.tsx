import { Bleed, Box } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function BleedVertical() {
  return (
    <Box padding="10" rounded="sm" borderWidth="1px">
      <Bleed block="10">
        <DecorativeBox height="20">Bleed</DecorativeBox>
      </Bleed>
    </Box>
  );
}
