import { Separator, Stack } from "chakra-ui-solid";
import { DecorativeBox } from "../decorative-box";

export default function SeparatorWithResponsiveOrientation() {
  return (
    <Stack direction={{ base: "row", md: "column" }} align="stretch">
      <DecorativeBox>First</DecorativeBox>
      <Separator orientation={{ base: "vertical", sm: "horizontal" }} />
      <DecorativeBox>Second</DecorativeBox>
    </Stack>
  );
}
