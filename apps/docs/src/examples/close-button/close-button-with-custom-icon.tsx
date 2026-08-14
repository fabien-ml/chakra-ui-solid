import { CloseButton } from "chakra-ui-solid";
import { XIcon } from "../../components/site/icons";

export default function CloseButtonWithCustomIcon() {
  return (
    <CloseButton variant="ghost" aria-label="Close">
      <XIcon />
    </CloseButton>
  );
}
