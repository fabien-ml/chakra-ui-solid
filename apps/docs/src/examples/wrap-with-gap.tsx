import { Box, Wrap } from "@chakra-ui-solid/components";
import { For } from "solid-js";

export default function WrapWithGap() {
  return (
    <Wrap gap="5">
      <For each={Array.from({ length: 10 }, (_, index) => index)}>
        {() => <Box h="12" w="12" bg="bg.emphasized" />}
      </For>
    </Wrap>
  );
}
