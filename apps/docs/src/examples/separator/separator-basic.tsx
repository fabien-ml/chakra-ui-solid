import { Separator, Stack, Text } from "chakra-ui-solid";

export default function SeparatorBasic() {
  return (
    <Stack>
      <Text>First</Text>
      <Separator />
      <Text>Second</Text>
      <Separator />
      <Text>Third</Text>
    </Stack>
  );
}
