import { Stack, StackSeparator } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function StackWithSeparator() {
  return (
    <Stack separator={StackSeparator}>
      <DecorativeBox h="20" />
      <DecorativeBox h="20" />
      <DecorativeBox h="20" />
    </Stack>
  );
}
