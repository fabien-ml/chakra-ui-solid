import { Checkbox, Stack, Text } from "chakra-ui-solid";
import { For } from "solid-js";

/**
 * The ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss`, so its rules come from Panda
 * reading this file. A palette it can only know at runtime reaches the element as a class with no
 * rule, and every box here paints in the default colour with nothing to say so (`CLAUDE.md`, *The
 * hazard*). A literal forwarded through a wrapper extracts fine, which is what `PaletteRow` is. The
 * three variants are safe to loop over for the opposite reason: a recipe's variant values *are*
 * pre-generated.
 */
export default function CheckboxWithColors() {
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
  <Stack align="center" direction="row" gap="10" width="full">
    <Text minW="8ch">{props.colorPalette}</Text>
    <For each={["outline", "subtle", "solid"] as const}>
      {(variant) => (
        <Stack mb="4">
          <Checkbox.Root variant={variant} colorPalette={props.colorPalette}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Checkbox</Checkbox.Label>
          </Checkbox.Root>

          <Checkbox.Root defaultChecked variant={variant} colorPalette={props.colorPalette}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Checkbox</Checkbox.Label>
          </Checkbox.Root>
        </Stack>
      )}
    </For>
  </Stack>
);
