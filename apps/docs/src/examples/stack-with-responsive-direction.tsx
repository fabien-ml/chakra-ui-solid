import { Stack } from "chakra-ui-solid";
import { DecorativeBox } from "../components/decorative-box";

export default function StackWithResponsiveDirection() {
  return (
    <Stack direction={{ base: "column", md: "row" }} gap="10">
      <DecorativeBox boxSize="20" />
      <DecorativeBox boxSize="20" />
      <DecorativeBox boxSize="20" />
    </Stack>
  );
}
