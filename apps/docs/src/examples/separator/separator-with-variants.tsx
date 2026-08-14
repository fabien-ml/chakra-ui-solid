import { Separator, Stack } from "chakra-ui-solid";

export default function SeparatorWithVariants() {
  return (
    <Stack>
      <Separator variant="solid" />
      <Separator variant="dashed" />
      <Separator variant="dotted" />
    </Stack>
  );
}
