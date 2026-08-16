import { Avatar, HStack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function AvatarWithSizes() {
  return (
    <HStack gap="3">
      <For each={["xs", "sm", "md", "lg", "xl", "2xl"] as const}>
        {(size) => (
          <Avatar.Root size={size}>
            <Avatar.Fallback name="Segun Adebayo" />
            <Avatar.Image src="https://bit.ly/sage-adebayo" />
          </Avatar.Root>
        )}
      </For>
    </HStack>
  );
}
