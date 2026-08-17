import { Checkbox, Stack } from "chakra-ui-solid";
import { createSignal, For } from "solid-js";

const initialValues = [
  { label: "Monday", checked: false, value: "monday" },
  { label: "Tuesday", checked: false, value: "tuesday" },
  { label: "Wednesday", checked: false, value: "wednesday" },
  { label: "Thursday", checked: false, value: "thursday" },
];

export default function CheckboxIndeterminate() {
  const [values, setValues] = createSignal(initialValues);

  const allChecked = () => values().every((value) => value.checked);
  const indeterminate = () => values().some((value) => value.checked) && !allChecked();

  const setChecked = (value: string, checked: boolean) => {
    setValues(values().map((item) => (item.value === value ? { ...item, checked } : item)));
  };

  return (
    <Stack align="flex-start">
      <Checkbox.Root
        checked={indeterminate() ? "indeterminate" : allChecked()}
        onCheckedChange={(details) => {
          setValues(values().map((value) => ({ ...value, checked: !!details.checked })));
        }}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label>Weekdays</Checkbox.Label>
      </Checkbox.Root>

      {/* `keyed={false}`, which is SolidJS 2.0's spelling of `<Index>`: the list is a fixed four
          rows whose *contents* change, and every `setValues` here replaces all four objects — so the
          default identity-keyed `For` would tear down four checkboxes and four machines on every
          tick, and each one would lose its focus ring mid-click. */}
      <For each={values()} keyed={false}>
        {(item) => (
          <Checkbox.Root
            ms="6"
            checked={item().checked}
            onCheckedChange={(details) => setChecked(item().value, !!details.checked)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>{item().label}</Checkbox.Label>
          </Checkbox.Root>
        )}
      </For>
    </Stack>
  );
}
