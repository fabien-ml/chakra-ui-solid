import { ColorSwatch, Group } from "chakra-ui-solid";
import { For } from "solid-js";

export default function ColorSwatchPalette() {
  return (
    <Group attached width="full" maxW="sm" grow>
      <For each={swatches}>{(color) => <ColorSwatch value={color} size="2xl" />}</For>
    </Group>
  );
}

const swatches = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];
