import { Group } from "chakra-ui-solid";
import { DecorativeBox } from "../components/decorative-box";

export default function GroupBasic() {
  return (
    <Group>
      <DecorativeBox h="20" w="40">
        1
      </DecorativeBox>
      <DecorativeBox h="20" w="40">
        2
      </DecorativeBox>
    </Group>
  );
}
