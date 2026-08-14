import { NativeSelect, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function NativeSelectWithSizes() {
  return (
    <Stack gap="4" width="240px">
      <For each={["xs", "sm", "md", "lg", "xl"] as const}>
        {(size) => (
          <NativeSelect.Root size={size}>
            <NativeSelect.Field placeholder="Select option">
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="angular">Angular</option>
              <option value="svelte">Svelte</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        )}
      </For>
    </Stack>
  );
}
