import { CheckboxCard, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CheckboxCardWithSizes() {
  return (
    <Stack maxW="320px">
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <CheckboxCard.Root size={size}>
            <CheckboxCard.HiddenInput />
            <CheckboxCard.Control>
              <CheckboxCard.Content>
                <CheckboxCard.Label>Checkbox {size}</CheckboxCard.Label>
              </CheckboxCard.Content>
              <CheckboxCard.Indicator />
            </CheckboxCard.Control>
          </CheckboxCard.Root>
        )}
      </For>
    </Stack>
  );
}
