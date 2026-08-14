import { Stack } from "chakra-ui-solid";
import { DecorativeBox } from "../../components/decorative-box";

export default function StackHorizontal() {
  return (
    <Stack direction="row" h="20">
      <DecorativeBox />
      <DecorativeBox />
      <DecorativeBox />
    </Stack>
  );
}
