import { Code, Stack } from "chakra-ui-solid";

export default function CodeWithVariants() {
  return (
    <Stack gap="2" align="flex-start">
      <Code variant="solid">console.log()</Code>
      <Code variant="outline">console.log()</Code>
      <Code variant="subtle">console.log()</Code>
      <Code variant="surface">console.log()</Code>
    </Stack>
  );
}
