import { Wrap } from "chakra-ui-solid";
import { For } from "solid-js";
import { DecorativeBox } from "../components/decorative-box";

export default function WrapWithRowColumnGap() {
  return (
    <Wrap rowGap={["0px", "24px"]} columnGap={["4px", "12px"]}>
      <For each={Array.from({ length: 10 }, (_, index) => index)}>
        {() => <DecorativeBox w="12" h="12" />}
      </For>
    </Wrap>
  );
}
