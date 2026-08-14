import { Checkmark, HStack } from "chakra-ui-solid";

/**
 * The ten palettes written out, where the React version maps over a list.
 *
 * `colorPalette` is deliberately absent from the preset's `staticCss` — see the comment on it in
 * `packages/panda-preset/src/preset.ts` — so its rules come from Panda reading this file. A palette
 * it can only know at runtime reaches the element as a class with no rule, and every checkmark here
 * paints in the default colour with nothing to say so (`CLAUDE.md`, *The hazard*). The sizes and
 * variants on the pages either side of this one are safe to loop over for the opposite reason: a
 * recipe's variant values *are* pre-generated, all 488 of them.
 */
export default function CheckmarkWithColors() {
  return (
    <HStack gap="4" wrap="wrap">
      <Checkmark colorPalette="gray" checked />
      <Checkmark colorPalette="red" checked />
      <Checkmark colorPalette="green" checked />
      <Checkmark colorPalette="blue" checked />
      <Checkmark colorPalette="teal" checked />
      <Checkmark colorPalette="pink" checked />
      <Checkmark colorPalette="purple" checked />
      <Checkmark colorPalette="cyan" checked />
      <Checkmark colorPalette="orange" checked />
      <Checkmark colorPalette="yellow" checked />
    </HStack>
  );
}
