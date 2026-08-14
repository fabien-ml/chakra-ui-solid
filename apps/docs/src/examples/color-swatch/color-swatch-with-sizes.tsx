import { ColorSwatch, HStack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function ColorSwatchWithSizes() {
  return (
    <HStack>
      <For each={["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const}>
        {(size) => <ColorSwatch value="#bada55" size={size} />}
      </For>
    </HStack>
  );
}
