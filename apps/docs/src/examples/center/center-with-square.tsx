import { Square } from "chakra-ui-solid";
import { PhoneForwardedIcon } from "../../components/ui/icons";

export default function CenterWithSquare() {
  return (
    <Square size="10" bg="purple.700" color="white">
      <PhoneForwardedIcon />
    </Square>
  );
}
