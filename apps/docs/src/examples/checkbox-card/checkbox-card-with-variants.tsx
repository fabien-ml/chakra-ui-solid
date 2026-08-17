import { CheckboxCard, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CheckboxCardWithVariants() {
  return (
    <Stack maxW="320px">
      <For each={["subtle", "surface", "outline"] as const}>
        {(variant) => (
          <CheckboxCard.Root defaultChecked variant={variant} colorPalette="teal">
            <CheckboxCard.HiddenInput />
            <CheckboxCard.Control>
              <CheckboxCard.Label>Checkbox {variant}</CheckboxCard.Label>
              <CheckboxCard.Indicator />
            </CheckboxCard.Control>
          </CheckboxCard.Root>
        )}
      </For>
    </Stack>
  );
}
