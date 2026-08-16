import { Input, InputGroup, Span } from "chakra-ui-solid";
import { createSignal } from "solid-js";

const MAX_CHARACTERS = 20;

export default function InputWithCharacterCounter() {
  const [value, setValue] = createSignal("");

  return (
    <InputGroup
      endElement={
        <Span color="fg.muted" textStyle="xs">
          {value().length} / {MAX_CHARACTERS}
        </Span>
      }
    >
      <Input
        placeholder="Enter your message"
        value={value()}
        maxlength={MAX_CHARACTERS}
        onInput={(event) => setValue(event.currentTarget.value.slice(0, MAX_CHARACTERS))}
      />
    </InputGroup>
  );
}
