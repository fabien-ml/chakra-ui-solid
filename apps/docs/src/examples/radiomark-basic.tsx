import { Radiomark, Stack } from "chakra-ui-solid";

export default function RadiomarkBasic() {
  return (
    <Stack align="flex-start">
      <Radiomark />
      <Radiomark checked />
      <Radiomark disabled />
      <Radiomark checked disabled />
    </Stack>
  );
}
