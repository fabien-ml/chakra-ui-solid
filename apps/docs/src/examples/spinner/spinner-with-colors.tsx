import { Spinner, Stack } from "chakra-ui-solid";

/**
 * The ten palettes written out, where the React version maps over a list.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss` — see the comment on it in
 * `packages/panda-preset/src/preset.ts` — so its rules come from Panda reading this file. A palette
 * it can only know at runtime reaches the element as a class with no rule, and every spinner here
 * renders in the default colour with nothing to say so (`CLAUDE.md`, *The hazard*). A literal
 * forwarded through a wrapper extracts fine, which is what `PaletteRow` is.
 */
export default function SpinnerWithColors() {
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
  <Stack align="center" direction="row" gap="10" px="4" colorPalette={props.colorPalette}>
    <Spinner size="sm" color="colorPalette.600" />
    <Spinner size="md" color="colorPalette.600" />
    <Spinner size="lg" color="colorPalette.600" />
  </Stack>
);
