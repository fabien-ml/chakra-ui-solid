import { Input, InputGroup, Kbd } from "chakra-ui-solid";
import { SearchIcon } from "../../components/ui/icons";

export default function InputGroupWithElements() {
  return (
    <InputGroup startElement={<SearchIcon />} endElement={<Kbd>⌘K</Kbd>}>
      <Input placeholder="Search contacts" />
    </InputGroup>
  );
}
