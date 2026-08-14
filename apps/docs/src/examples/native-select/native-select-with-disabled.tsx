import { NativeSelect } from "chakra-ui-solid";

export default function NativeSelectWithDisabled() {
  return (
    <NativeSelect.Root disabled>
      <NativeSelect.Field placeholder="Select option">
        <option value="react">React</option>
        <option value="vue">Vue</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
