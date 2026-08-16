import { Button, Stack, Text } from "chakra-ui-solid";

/**
 * The ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss`, so its rules come from Panda
 * reading this file. A palette it can only know at runtime reaches the element as a class with no
 * rule, and every button here renders in the default colour with nothing to say so (`CLAUDE.md`,
 * *The hazard*). A literal forwarded through a wrapper extracts fine, which is what `PaletteRow`
 * is — `icon-button-with-colors` is the precedent.
 */
export default function ButtonWithColors() {
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
  <Stack align="center" direction="row" gap="10">
    <Text minW="8ch">{props.colorPalette}</Text>
    <Button colorPalette={props.colorPalette}>Button</Button>
    <Button colorPalette={props.colorPalette} variant="outline">
      Button
    </Button>
    <Button colorPalette={props.colorPalette} variant="surface">
      Button
    </Button>
    <Button colorPalette={props.colorPalette} variant="subtle">
      Button
    </Button>
  </Stack>
);
