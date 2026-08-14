import { HStack, Stack, Status } from "chakra-ui-solid";
import { For } from "solid-js";

export default function StatusWithSizes() {
  // A recipe variant may be a loop variable, where a style prop may not: the preset declares
  // `staticCss: ["*"]` on every recipe it ships, so all three `status` size classes are in the
  // sheet whether or not any file spells them.
  return (
    <Stack gap="2" align="flex-start">
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <HStack gap="10" px="4">
            <Status.Root size={size} width="100px" colorPalette="orange">
              <Status.Indicator />
              In Review
            </Status.Root>
            <Status.Root size={size} width="100px" colorPalette="red">
              <Status.Indicator />
              Error
            </Status.Root>
            <Status.Root size={size} width="100px" colorPalette="green">
              <Status.Indicator />
              Approved
            </Status.Root>
          </HStack>
        )}
      </For>
    </Stack>
  );
}
