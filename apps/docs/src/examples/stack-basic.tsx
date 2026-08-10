import { Stack } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function StackBasic() {
  return (
    <Stack>
      <DecorativeBox h="20" />
      <DecorativeBox h="20" />
      <DecorativeBox h="20" />
    </Stack>
  );
}
