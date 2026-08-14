import { NativeSelect, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function NativeSelectWithVariants() {
  return (
    <Stack gap="4" width="240px">
      <For each={["outline", "subtle", "plain"] as const}>
        {(variant) => (
          <NativeSelect.Root variant={variant}>
            <NativeSelect.Field placeholder={`variant (${variant})`}>
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
