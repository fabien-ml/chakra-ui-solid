import { Button, ButtonGroup } from "chakra-ui-solid";

export default function ButtonWithGroup() {
  return (
    <ButtonGroup size="sm" variant="outline">
      <Button colorPalette="blue">Save</Button>
      <Button>Cancel</Button>
    </ButtonGroup>
  );
}
