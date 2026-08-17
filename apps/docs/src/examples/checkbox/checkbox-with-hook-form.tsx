import { Button, Checkbox, Code, Field, HStack, Stack } from "chakra-ui-solid";
import { createSignal } from "solid-js";

/**
 * The React version wires this up with `react-hook-form` and `zod`. There is no Solid equivalent in
 * this app's dependencies and two examples do not justify adding one, so the same visible behaviour
 * — a controlled value, a validation message, Toggle and Reset, and the submitted payload — is a
 * signal and a plain `<form>`.
 */
export default function CheckboxWithHookForm() {
  const [enabled, setEnabled] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);

  const invalid = () => submitted() && !enabled();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Stack align="flex-start">
        <Field.Root invalid={invalid()}>
          <Checkbox.Root
            checked={enabled()}
            onCheckedChange={(details) => setEnabled(!!details.checked)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Checkbox</Checkbox.Label>
          </Checkbox.Root>
          <Field.ErrorText>You have to tick this box.</Field.ErrorText>
        </Field.Root>

        <HStack>
          <Button size="xs" variant="outline" onClick={() => setEnabled(!enabled())}>
            Toggle
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setEnabled(false);
              setSubmitted(false);
            }}
          >
            Reset
          </Button>
        </HStack>

        <Button size="sm" type="submit" alignSelf="flex-start">
          Submit
        </Button>

        <Code>Checked: {JSON.stringify(enabled())}</Code>
      </Stack>
    </form>
  );
}
