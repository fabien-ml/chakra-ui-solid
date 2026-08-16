import { Avatar, HStack } from "chakra-ui-solid";

const palettes = ["red", "blue", "green", "yellow", "purple", "orange"];

const pickPalette = (name: string) => palettes[name.charCodeAt(0) % palettes.length];

/**
 * The one place a `colorPalette` is chosen at runtime rather than written at the call site.
 *
 * Nothing in this file is a literal `colorPalette` a build could scan, so the six palettes have to
 * be declared instead — `staticCss: { css: [{ properties: { colorPalette: palettes } }] }` in the
 * consumer's Panda config. Without that the computed class has no rule behind it and every avatar
 * renders in the default colour, with no error to say why.
 */
export default function AvatarWithRandomColor() {
  return (
    <HStack>
      <Avatar.Root colorPalette={pickPalette("Shane Nelson")}>
        <Avatar.Fallback name="Shane Nelson" />
      </Avatar.Root>
      <Avatar.Root colorPalette={pickPalette("Brook Lesnar")}>
        <Avatar.Fallback name="Brook Lesnar" />
      </Avatar.Root>
      <Avatar.Root colorPalette={pickPalette("John Lennon")}>
        <Avatar.Fallback name="John Lennon" />
      </Avatar.Root>
    </HStack>
  );
}
