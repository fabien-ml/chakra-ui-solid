import { Checkmark, Stack } from "chakra-ui-solid";

export default function CheckmarkBasic() {
  return (
    <Stack align="flex-start">
      <Checkmark />
      <Checkmark checked />
      <Checkmark indeterminate />
      <Checkmark disabled />
      <Checkmark checked disabled />
      <Checkmark indeterminate disabled />
    </Stack>
  );
}
