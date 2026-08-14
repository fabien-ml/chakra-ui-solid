import { Badge, Stack } from "chakra-ui-solid";
import { AtSignIcon, StarIcon } from "../../components/site/icons";

export default function BadgeWithIcon() {
  return (
    <Stack align="flex-start">
      <Badge variant="solid" colorPalette="blue">
        <StarIcon />
        New
      </Badge>
      <Badge variant="solid" colorPalette="green">
        New
        <AtSignIcon />
      </Badge>
    </Stack>
  );
}
