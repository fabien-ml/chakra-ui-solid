import { Circle } from "chakra-ui-solid";
import { PhoneForwardedIcon } from "../../components/site/icons";

export default function CenterWithCircle() {
  return (
    <Circle size="10" bg="blue.700" color="white">
      <PhoneForwardedIcon />
    </Circle>
  );
}
