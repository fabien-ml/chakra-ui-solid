import { SegmentGroup, Stack, Text, VStack } from "chakra-ui-solid";
import { For } from "solid-js";

const sizes = ["xs", "sm", "md", "lg"] as const;

export default function SegmentedControlWithSizes() {
  return (
    <Stack gap="5" align="flex-start">
      <For each={sizes}>
        {(size) => (
          <VStack align="flex-start">
            <SegmentGroup.Root size={size} defaultValue="React">
              <SegmentGroup.Indicator />
              <SegmentGroup.Items items={["React", "Vue", "Solid"]} />
            </SegmentGroup.Root>
            <Text>size = {size}</Text>
          </VStack>
        )}
      </For>
    </Stack>
  );
}
