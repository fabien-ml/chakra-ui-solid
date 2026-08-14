import { HStack, Radiomark } from "chakra-ui-solid";

/**
 * The ten palettes written out, where the React version maps over a list.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss` — see the comment on it in
 * `packages/panda-preset/src/preset.ts` — so its rules come from Panda reading this file. A palette
 * it can only know at runtime reaches the element as a class with no rule, and every radiomark here
 * paints in the default colour with nothing to say so (`CLAUDE.md`, *The hazard*). The sizes and
 * variants on the pages either side of this one are safe to loop over for the opposite reason: a
 * recipe's variant values *are* pre-generated.
 */
export default function RadiomarkWithColors() {
  return (
    <HStack gap="4" wrap="wrap">
      <Radiomark colorPalette="gray" checked />
      <Radiomark colorPalette="red" checked />
      <Radiomark colorPalette="green" checked />
      <Radiomark colorPalette="blue" checked />
      <Radiomark colorPalette="teal" checked />
      <Radiomark colorPalette="pink" checked />
      <Radiomark colorPalette="purple" checked />
      <Radiomark colorPalette="cyan" checked />
      <Radiomark colorPalette="orange" checked />
      <Radiomark colorPalette="yellow" checked />
    </HStack>
  );
}
