import { Button, Field, SegmentGroup, Stack } from "chakra-ui-solid";
import { createSignal } from "solid-js";

/**
 * The React version wires this up with `react-hook-form` and `zod`. There is no Solid equivalent in
 * this app's dependencies and a handful of examples do not justify adding one, so the same visible
 * behaviour — a controlled value, a validation message on submit, and a field that reports the error
 * — is a signal and a plain `<form>`.
 */
export default function SegmentedControlWithHookForm() {
  const [fontSize, setFontSize] = createSignal<string | null>(null);
  const [submitted, setSubmitted] = createSignal(false);

  const invalid = () => submitted() && fontSize() === null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Stack gap="4" align="flex-start">
        <Field.Root invalid={invalid()}>
          <Field.Label>Font size</Field.Label>
          <SegmentGroup.Root
            size="sm"
            name="fontSize"
            value={fontSize()}
            onValueChange={(details) => setFontSize(details.value)}
          >
            <SegmentGroup.Items items={["sm", "md", "lg"]} />
            <SegmentGroup.Indicator />
          </SegmentGroup.Root>
          <Field.ErrorText>Font size is required</Field.ErrorText>
        </Field.Root>

        <Button size="sm" type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
}
