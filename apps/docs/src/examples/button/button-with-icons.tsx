import { Button, HStack } from "chakra-ui-solid";
import { ArrowRightIcon, AtSignIcon } from "../../components/ui/icons";

/** The React version pulls both glyphs from `react-icons`; these are the site's own equivalents. */
export default function ButtonWithIcons() {
  return (
    <HStack>
      <Button colorPalette="teal" variant="solid">
        <AtSignIcon /> Email
      </Button>
      <Button colorPalette="teal" variant="outline">
        Call us <ArrowRightIcon />
      </Button>
    </HStack>
  );
}
