import { Avatar, Stack, Text } from "chakra-ui-solid";

/**
 * The ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is a style prop whose rules come from Panda reading this file, so a palette it can
 * only know at runtime reaches the element as a class with no rule behind it — every avatar renders
 * in the default colour, with nothing to say so. A literal forwarded through a wrapper extracts
 * fine, which is what `PaletteRow` is.
 */
export default function AvatarWithColors() {
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
    <Avatar.Root colorPalette={props.colorPalette}>
      <Avatar.Fallback name="Segun Adebayo" />
      <Avatar.Image src="https://bit.ly/sage-adebayo" />
    </Avatar.Root>
    <Avatar.Root colorPalette={props.colorPalette}>
      <Avatar.Fallback name="Segun Adebayo" />
    </Avatar.Root>
    <Avatar.Root colorPalette={props.colorPalette}>
      <Avatar.Fallback />
    </Avatar.Root>
  </Stack>
);
