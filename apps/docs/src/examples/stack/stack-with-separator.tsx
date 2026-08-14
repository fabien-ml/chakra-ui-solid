import { Stack, StackSeparator } from "chakra-ui-solid";
import { DecorativeBox } from "../decorative-box";

export default function StackWithSeparator() {
  return (
    <Stack separator={StackSeparator}>
      <DecorativeBox h="20" />
      <DecorativeBox h="20" />
      <DecorativeBox h="20" />
    </Stack>
  );
}
