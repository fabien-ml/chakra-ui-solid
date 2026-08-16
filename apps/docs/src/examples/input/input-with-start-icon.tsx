import { Input, InputGroup } from "chakra-ui-solid";
import { UserIcon } from "../../components/ui/icons";

export default function InputWithStartIcon() {
  return (
    <InputGroup startElement={<UserIcon />}>
      <Input placeholder="Username" />
    </InputGroup>
  );
}
