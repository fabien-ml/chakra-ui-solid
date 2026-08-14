import { HStack, Stack, Tag } from "chakra-ui-solid";
import { For } from "solid-js";
import { CheckIcon } from "../../components/ui/icons";

export default function TagWithVariants() {
  // A recipe variant may be a loop variable, where a style prop may not: the preset declares
  // `staticCss: ["*"]` on every recipe it ships, so all four `tag` variant classes are in the
  // sheet whether or not any file spells them.
  return (
    <Stack gap="8">
      <For each={["subtle", "solid", "outline", "surface"] as const}>
        {(variant) => (
          <HStack>
            <Tag.Root variant={variant}>
              <Tag.Label>Gray</Tag.Label>
            </Tag.Root>
            <Tag.Root variant={variant}>
              <Tag.Label>Gray</Tag.Label>
              <Tag.EndElement>
                <Tag.CloseTrigger />
              </Tag.EndElement>
            </Tag.Root>
            <Tag.Root variant={variant}>
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
