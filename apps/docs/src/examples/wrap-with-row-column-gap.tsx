import { Box, Wrap } from "@chakra-ui-solid/components";
import { For } from "solid-js";

export default function WrapWithRowColumnGap() {
  return (
    <Wrap rowGap={["0px", "24px"]} columnGap={["4px", "12px"]}>
      <For each={Array.from({ length: 10 }, (_, index) => index)}>
        {() => <Box w="12" h="12" bg="bg.emphasized" />}
      </For>
    </Wrap>
  );
}
