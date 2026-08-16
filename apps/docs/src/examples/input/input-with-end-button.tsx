import { Button, Group, Input } from "chakra-ui-solid";

export default function InputWithEndButton() {
  return (
    <Group attached width="full" maxWidth="sm">
      <Input flex="1" placeholder="Enter your email" />
      <Button bg="bg.subtle" variant="outline">
        Submit
      </Button>
    </Group>
  );
}
