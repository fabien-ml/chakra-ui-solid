import { Box, Wrap } from "@chakra-ui-solid/components";
import { For } from "solid-js";

export default function WrapResponsive() {
  return (
    <Wrap gap={["12px", "24px"]} justify={["center", "flex-start"]}>
      <For each={Array.from({ length: 11 }, (_, index) => index)}>
        {() => <Box h="12" w="12" bg="bg.emphasized" />}
      </For>
    </Wrap>
  );
}
