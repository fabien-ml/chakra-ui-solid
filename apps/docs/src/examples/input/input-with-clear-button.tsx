import { CloseButton, Input, InputGroup } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function InputWithClearButton() {
  const [value, setValue] = createSignal("Initial value");
  let inputRef: HTMLInputElement | undefined;

  const clear = () => {
    setValue("");
    inputRef?.focus();
  };

  return (
    <InputGroup
      endElement={value() ? <CloseButton size="xs" me="-2" onClick={clear} /> : undefined}
    >
      <Input
        ref={inputRef}
        placeholder="Email"
        value={value()}
        onInput={(event) => setValue(event.currentTarget.value)}
      />
    </InputGroup>
  );
}
