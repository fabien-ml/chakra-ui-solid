import { Avatar, HStack, Tag } from "chakra-ui-solid";
import { For } from "solid-js";

export default function TagWithAvatar() {
  return (
    <HStack>
      <For each={["sm", "md", "lg", "xl"] as const}>
        {(size) => (
          <Tag.Root size={size} rounded="full">
            <Tag.StartElement>
              <Avatar.Root size="full">
                <Avatar.Image src="https://i.pravatar.cc/300?u=1" />
                <Avatar.Fallback name="John Doe" />
              </Avatar.Root>
            </Tag.StartElement>
            <Tag.Label>Emily {size}</Tag.Label>
          </Tag.Root>
        )}
      </For>
    </HStack>
  );
}
