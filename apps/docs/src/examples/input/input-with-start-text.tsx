import { Input, InputGroup, Span } from "chakra-ui-solid";

export default function InputWithStartText() {
  return (
    // The muted colour goes on the content rather than on `startElementProps`. A style prop is a
    // value Panda has to read at the call site, and a nested object is one it cannot see — the
    // class would be emitted and the rule behind it would not exist.
    <InputGroup startElement={<Span color="fg.muted">https://</Span>}>
      <Input ps="7ch" placeholder="yoursite.com" />
    </InputGroup>
  );
}
