import { HStack, RadioCard, Stack, Text } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { value: "next", title: "Next.js" },
  { value: "vite", title: "Vite" },
];

/**
 * The ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss`, so its rules come from Panda
 * reading this file. A palette it can only know at runtime reaches the element as a class with no
 * rule, and every card here paints in the default colour with nothing to say so (`CLAUDE.md`, *The
 * hazard*). A literal forwarded through a wrapper extracts fine, which is what `PaletteRow` is.
 */
export default function RadioCardWithColors() {
  return (
    <Stack gap="6" align="stretch">
      <PaletteRow colorPalette="gray" />
      <PaletteRow colorPalette="red" />
      <PaletteRow colorPalette="green" />
      <PaletteRow colorPalette="blue" />
      <PaletteRow colorPalette="teal" />
      <PaletteRow colorPalette="pink" />
      <PaletteRow colorPalette="purple" />
      <PaletteRow colorPalette="cyan" />
      <PaletteRow colorPalette="orange" />
      <PaletteRow colorPalette="yellow" />
    </Stack>
  );
}

const PaletteRow = (props: { colorPalette: string }) => (
  <HStack gap="6" align="stretch">
    <Text minW="8ch" alignSelf="center">
      {props.colorPalette}
    </Text>

    <RadioCard.Root colorPalette={props.colorPalette} defaultValue="next">
      <HStack align="stretch">
        <For each={items}>
          {(item) => (
            <RadioCard.Item value={item.value}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </HStack>
    </RadioCard.Root>
  </HStack>
);
