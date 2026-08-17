import { Checkbox, Code, createCheckbox, Stack } from "chakra-ui-solid";

export default function CheckboxWithStore() {
  const terms = createCheckbox();

  return (
    <Stack align="flex-start">
      <Code>checked: {terms.checked.toString()}</Code>
      {/* The parts go straight inside the provider: it *is* a Root over a machine you already own,
          so nesting a `Checkbox.Root` under it would start a second machine and label a second
          input. */}
      <Checkbox.RootProvider value={terms}>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
      </Checkbox.RootProvider>
    </Stack>
  );
}
