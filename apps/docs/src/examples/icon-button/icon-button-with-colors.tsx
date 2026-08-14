import { HStack, IconButton } from "chakra-ui-solid";
import { SearchIcon } from "../../components/ui/icons";

/**
 * The ten palettes written out, where the React version maps over a list.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss` — see the comment on it in
 * `packages/panda-preset/src/preset.ts` — so its rules come from Panda reading this file. A palette
 * it can only know at runtime reaches the element as a class with no rule, and every button here
 * renders in the default colour with nothing to say so (`CLAUDE.md`, *The hazard*). A literal
 * forwarded through a wrapper extracts fine, which is what `PaletteButton` is.
 */
export default function IconButtonWithColors() {
  return (
    <HStack wrap="wrap">
      <PaletteButton colorPalette="gray" />
      <PaletteButton colorPalette="red" />
      <PaletteButton colorPalette="green" />
      <PaletteButton colorPalette="blue" />
      <PaletteButton colorPalette="teal" />
      <PaletteButton colorPalette="pink" />
      <PaletteButton colorPalette="purple" />
      <PaletteButton colorPalette="cyan" />
      <PaletteButton colorPalette="orange" />
      <PaletteButton colorPalette="yellow" />
    </HStack>
  );
}

const PaletteButton = (props: { colorPalette: string }) => (
  <IconButton aria-label="Search database" colorPalette={props.colorPalette}>
    <SearchIcon />
  </IconButton>
);
