import { HStack, Tag } from "chakra-ui-solid";
import { AtSignIcon, StarIcon } from "../../components/ui/icons";

export default function TagWithIcon() {
  return (
    <HStack>
      <Tag.Root>
        <Tag.StartElement>
          <AtSignIcon />
        </Tag.StartElement>
        <Tag.Label>Tag 1</Tag.Label>
      </Tag.Root>
      <Tag.Root>
        <Tag.StartElement>
          <StarIcon />
        </Tag.StartElement>
        <Tag.Label>Top Rated</Tag.Label>
      </Tag.Root>
      <Tag.Root>
        <Tag.Label>Tag 2</Tag.Label>
        <Tag.EndElement>
          <AtSignIcon />
        </Tag.EndElement>
      </Tag.Root>
    </HStack>
  );
}
