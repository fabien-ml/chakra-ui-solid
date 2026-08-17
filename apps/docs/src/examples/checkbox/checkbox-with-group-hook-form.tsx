import { Button, Checkbox, CheckboxGroup, Code, Fieldset } from "chakra-ui-solid";
import { createSignal, For, Show } from "solid-js";

const items = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Svelte", value: "svelte" },
  { label: "Vue", value: "vue" },
];

/**
 * The React version wires this up with `react-hook-form` and `zod`. The same visible behaviour — a
 * controlled array, a group-level validation message, and the submitted payload — is a signal and a
 * plain `<form>` here, rather than a Solid form dependency for two examples.
 */
export default function CheckboxWithGroupHookForm() {
  const [value, setValue] = createSignal<string[]>([]);
  const [submitted, setSubmitted] = createSignal(false);

  const invalid = () => submitted() && value().length === 0;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Fieldset.Root invalid={invalid()}>
        <Fieldset.Legend>Select your framework</Fieldset.Legend>
        <CheckboxGroup
          invalid={invalid()}
          value={value()}
          onValueChange={setValue}
          name="framework"
        >
          <Fieldset.Content>
            <For each={items}>
              {(item) => (
                <Checkbox.Root value={item.value}>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{item.label}</Checkbox.Label>
                </Checkbox.Root>
              )}
            </For>
          </Fieldset.Content>
        </CheckboxGroup>

        <Show when={invalid()}>
          <Fieldset.ErrorText>You must select at least one framework.</Fieldset.ErrorText>
        </Show>

        <Button size="sm" type="submit" alignSelf="flex-start">
          Submit
        </Button>

        <Code>Values: {JSON.stringify(value())}</Code>
      </Fieldset.Root>
    </form>
  );
}
