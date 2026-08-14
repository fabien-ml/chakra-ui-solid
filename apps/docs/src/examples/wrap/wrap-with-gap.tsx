import { Wrap } from "chakra-ui-solid";
import { For } from "solid-js";
import { DecorativeBox } from "../decorative-box";

export default function WrapWithGap() {
  return (
    <Wrap gap="5">
      <For each={Array.from({ length: 10 }, (_, index) => index)}>
        {() => <DecorativeBox h="12" w="12" />}
      </For>
    </Wrap>
  );
}
