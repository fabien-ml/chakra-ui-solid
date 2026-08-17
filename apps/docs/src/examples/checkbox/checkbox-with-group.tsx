import { Checkbox, CheckboxGroup, Fieldset } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CheckboxWithGroup() {
  return (
    <Fieldset.Root>
      <CheckboxGroup defaultValue={["React"]} name="framework">
        <Fieldset.Legend fontSize="sm" mb="2">
          Select framework
        </Fieldset.Legend>
        <Fieldset.Content>
          <For each={["React", "Solid", "Svelte", "Vue"]}>
            {(value) => (
              <Checkbox.Root value={value}>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{value}</Checkbox.Label>
              </Checkbox.Root>
            )}
          </For>
        </Fieldset.Content>
      </CheckboxGroup>
    </Fieldset.Root>
  );
}
