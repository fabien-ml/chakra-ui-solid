import { Button, VisuallyHidden } from "chakra-ui-solid";
import { BellIcon } from "../../components/ui/icons";

export default function VisuallyHiddenBasic() {
  return (
    <Button>
      <BellIcon /> 3 <VisuallyHidden>Notifications</VisuallyHidden>
    </Button>
  );
}
