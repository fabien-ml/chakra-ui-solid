import { HStack, Tag } from "chakra-ui-solid";
import { HeartIcon } from "../../components/ui/icons";

export default function TagWithClose() {
  return (
    <HStack>
      <Tag.Root>
        <Tag.StartElement>
          <HeartIcon />
        </Tag.StartElement>
        <Tag.Label>Tag 1</Tag.Label>
        <Tag.EndElement>
          <Tag.CloseTrigger />
        </Tag.EndElement>
      </Tag.Root>
      <Tag.Root>
        <Tag.Label>Tag 2</Tag.Label>
        <Tag.EndElement>
          <Tag.CloseTrigger />
        </Tag.EndElement>
      </Tag.Root>
    </HStack>
  );
}
