import { Stack, Switch, Text } from "chakra-ui-solid";

/**
 * The ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss`, so its rules come from Panda
 * reading this file. A palette it can only know at runtime reaches the element as a class with no
 * rule, and every switch here paints in the default colour with nothing to say so (`CLAUDE.md`, *The
 * hazard*). A literal forwarded through a wrapper extracts fine, which is what `PaletteRow` is.
 */
export default function SwitchWithColors() {
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
  <Stack align="center" direction="row" gap="10" px="4">
    <Text minW="8ch">{props.colorPalette}</Text>

    <Switch.Root colorPalette={props.colorPalette}>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>off</Switch.Label>
    </Switch.Root>

    <Switch.Root colorPalette={props.colorPalette} defaultChecked>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>on</Switch.Label>
    </Switch.Root>
  </Stack>
);
