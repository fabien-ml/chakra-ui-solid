import { Center, Wrap, WrapItem } from "chakra-ui-solid";
import { For } from "solid-js";

export default function WrapWithAlign() {
  return (
    <Wrap gap="30px" align="center">
      <For each={Array.from({ length: 5 }, (_, index) => index)}>
        {(index) => (
          <WrapItem>
            <Center w="180px" h="80px" bg="red.muted">
              Box {index + 1}
            </Center>
          </WrapItem>
        )}
      </For>
    </Wrap>
  );
}
