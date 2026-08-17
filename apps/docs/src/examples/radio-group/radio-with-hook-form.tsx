import { Button, Code, Fieldset, HStack, RadioGroup, Stack } from "chakra-ui-solid";
import { createSignal, For } from "solid-js";

const items = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
];

/**
 * The React version wires this up with `react-hook-form` and `zod`. There is no Solid equivalent in
 * this app's dependencies and a handful of examples do not justify adding one, so the same visible
 * behaviour — a controlled value, a validation message on submit, and the submitted payload — is a
 * signal and a plain `<form>`.
 *
 * The group is labelled by the `Fieldset.Legend` rather than by a `RadioGroup.Label`: a set of
 * radios is a legend and a group, and the machine takes the legend's id as its own.
 */
export default function RadioWithHookForm() {
  const [value, setValue] = createSignal<string | null>(null);
  const [submitted, setSubmitted] = createSignal(false);

  const invalid = () => submitted() && value() === null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Fieldset.Root invalid={invalid()}>
        <Fieldset.Legend>Select value</Fieldset.Legend>

        <RadioGroup.Root
          name="value"
          value={value()}
          onValueChange={(details) => setValue(details.value)}
        >
          <HStack gap="6">
            <For each={items}>
              {(item) => (
                <RadioGroup.Item value={item.value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
                </RadioGroup.Item>
              )}
            </For>
          </HStack>
        </RadioGroup.Root>

        <Fieldset.ErrorText>Value is required.</Fieldset.ErrorText>

        <Stack align="flex-start">
          <Button size="sm" type="submit" alignSelf="flex-start">
            Submit
          </Button>
          <Code>Value: {JSON.stringify(value())}</Code>
        </Stack>
      </Fieldset.Root>
    </form>
  );
}
