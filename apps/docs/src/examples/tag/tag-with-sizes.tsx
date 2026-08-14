import { HStack, Stack, Tag } from "chakra-ui-solid";
import { For } from "solid-js";
import { CheckIcon } from "../../components/ui/icons";

export default function TagWithSizes() {
  return (
    <Stack gap="8">
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <HStack>
            <Tag.Root size={size}>
              <Tag.Label>Gray</Tag.Label>
            </Tag.Root>
            <Tag.Root size={size}>
              <Tag.Label>Gray</Tag.Label>
              <Tag.EndElement>
                <Tag.CloseTrigger />
              </Tag.EndElement>
            </Tag.Root>
            <Tag.Root size={size}>
              <Tag.Label>Gray</Tag.Label>
              <Tag.EndElement>
                <CheckIcon />
              </Tag.EndElement>
            </Tag.Root>
          </HStack>
        )}
      </For>
    </Stack>
  );
}
