import { Button, Code, Field, Stack, Switch } from "chakra-ui-solid";
import { createSignal } from "solid-js";

/**
 * The React version wires this up with `react-hook-form` and `zod`. There is no Solid equivalent in
 * this app's dependencies and one example does not justify adding one, so the same visible behaviour
 * — a controlled value, a validation message on submit, and the submitted payload — is a signal and
 * a plain `<form>`.
 */
export default function SwitchWithHookForm() {
  const [active, setActive] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);

  const invalid = () => submitted() && !active();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Stack align="flex-start">
        <Field.Root invalid={invalid()}>
          <Switch.Root
            name="active"
            checked={active()}
            onCheckedChange={(details) => setActive(details.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label>Activate Chakra</Switch.Label>
          </Switch.Root>
          <Field.ErrorText>Active is required.</Field.ErrorText>
        </Field.Root>

        <Button size="sm" type="submit" mt="4">
          Submit
        </Button>

        <Code>Active: {JSON.stringify(active())}</Code>
      </Stack>
    </form>
  );
}
