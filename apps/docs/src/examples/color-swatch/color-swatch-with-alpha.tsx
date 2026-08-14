import { ColorSwatch, HStack } from "chakra-ui-solid";
import { For } from "solid-js";

/**
 * **The one page on this site where looping over runtime values is safe**, and it is worth saying
 * why, because the rule everywhere else is the opposite. `checkmark-with-colors.tsx` writes its ten
 * palettes out by hand: `colorPalette` becomes a *class*, so a value Panda cannot see in the source
 * has no rule and the mark paints in the default colour with nothing to say so. A swatch's `value`
 * never becomes a class at all — it is written into the element's inline `style` as `--color`, and
 * an inline style is not CSS a build has to generate. So these four can come from an array, and so
 * could four thousand read from a server.
 */
export default function ColorSwatchWithAlpha() {
  return (
    <HStack>
      <For each={colors}>{(color) => <ColorSwatch value={color} size="xl" />}</For>
    </HStack>
  );
}

const colors = [
  "rgba(255, 0, 0, 0.5)",
  "rgba(0, 0, 255, 0.7)",
  "rgba(0, 255, 0, 0.4)",
  "rgba(255, 192, 203, 0.6)",
];
