import { IconButton } from "chakra-ui-solid";
import { VoicemailIcon } from "../components/site/icons";

export default function IconButtonRounded() {
  return (
    <IconButton aria-label="Call support" rounded="full">
      <VoicemailIcon />
    </IconButton>
  );
}
