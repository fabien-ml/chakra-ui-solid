import { Button, Group } from "chakra-ui-solid";

export default function GroupWithGrow() {
  return (
    <Group grow>
      <Button variant="outline">First</Button>
      <Button variant="outline">Second</Button>
      <Button variant="outline">Third</Button>
    </Group>
  );
}
