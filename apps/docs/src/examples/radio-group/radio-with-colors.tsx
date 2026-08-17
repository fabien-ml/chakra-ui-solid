import { HStack, RadioGroup, Stack, Text } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
];

/**
 * The ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss`, so its rules come from Panda
 * reading this file. A palette it can only know at runtime reaches the element as a class with no
 * rule, and every circle here paints in the default colour with nothing to say so (`CLAUDE.md`, *The
 * hazard*). A literal forwarded through a wrapper extracts fine, which is what `PaletteRow` is.
 */
export default function RadioWithColors() {
  return (
    <Stack gap="2" align="flex-start">
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
  <HStack gap="10" px="4">
    <Text minW="8ch">{props.colorPalette}</Text>

    <RadioGroup.Root colorPalette={props.colorPalette} defaultValue="react">
      <HStack gap="8">
        <For each={items}>
          {(item) => (
            <RadioGroup.Item value={item.value}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
            </RadioGroup.Item>
          )}
        </For>
      </HStack>
    </RadioGroup.Root>
  </HStack>
);
