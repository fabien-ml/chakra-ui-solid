import { Wrap } from "@chakra-ui-solid/components";
import { For } from "solid-js";
import { DecorativeBox } from "../components/decorative-box";

export default function WrapResponsive() {
  return (
    <Wrap gap={["12px", "24px"]} justify={["center", "flex-start"]}>
      <For each={Array.from({ length: 11 }, (_, index) => index)}>
        {() => <DecorativeBox h="12" w="12" />}
      </For>
    </Wrap>
  );
}
