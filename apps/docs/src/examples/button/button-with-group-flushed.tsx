import { Button, ButtonGroup, IconButton } from "chakra-ui-solid";
import { ChevronDownIcon } from "../../components/ui/icons";

export default function ButtonWithGroupFlushed() {
  return (
    <ButtonGroup size="sm" variant="outline" attached>
      <Button variant="outline">Button</Button>
      <IconButton aria-label="Open menu" variant="outline">
        <ChevronDownIcon />
      </IconButton>
    </ButtonGroup>
  );
}
