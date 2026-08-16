import { Avatar, HStack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function AvatarWithVariants() {
  return (
    <HStack gap="3">
      <For each={["solid", "outline", "subtle"] as const}>
        {(variant) => (
          <Avatar.Root variant={variant}>
            <Avatar.Fallback name="Segun Adebayo" />
          </Avatar.Root>
        )}
      </For>
    </HStack>
  );
}
