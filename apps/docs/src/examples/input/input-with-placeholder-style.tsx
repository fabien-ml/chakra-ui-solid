import { Input } from "chakra-ui-solid";

export default function InputWithPlaceholderStyle() {
  return (
    <Input color="teal" placeholder="custom placeholder" _placeholder={{ color: "inherit" }} />
  );
}
