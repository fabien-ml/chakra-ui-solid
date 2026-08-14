import { NativeSelect } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function NativeSelectControlled() {
  const [value, setValue] = createSignal("");
  return (
    <NativeSelect.Root size="sm" width="240px">
      <NativeSelect.Field
        placeholder="Select option"
        value={value()}
        onChange={(event) => setValue(event.currentTarget.value)}
      >
        <option value="react">React</option>
        <option value="vue">Vue</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
