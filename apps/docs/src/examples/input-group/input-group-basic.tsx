import { Input, InputGroup } from "chakra-ui-solid";
import { SearchIcon } from "../../components/ui/icons";

export default function InputGroupBasic() {
  return (
    <InputGroup startElement={<SearchIcon />}>
      <Input placeholder="Search contacts" />
    </InputGroup>
  );
}
