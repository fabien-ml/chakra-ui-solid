import { Heading, Stack } from "chakra-ui-solid";

export default function HeadingWithWeights() {
  return (
    <Stack>
      <Heading fontWeight="normal">Normal</Heading>
      <Heading fontWeight="medium">Medium</Heading>
      <Heading fontWeight="semibold">Semibold</Heading>
      <Heading fontWeight="bold">Bold</Heading>
    </Stack>
  );
}
