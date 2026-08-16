import { Avatar, HStack } from "chakra-ui-solid";

// A plain object where the React version calls `defineStyle`. That helper is an identity function
// whose only job is to type its argument, and the `css` prop already types this one — so the object
// is the whole port, and Panda reads it here exactly as it reads an inline `css={{ … }}`.
const ringCss = {
  outlineWidth: "2px",
  outlineColor: "colorPalette.500",
  outlineOffset: "2px",
  outlineStyle: "solid",
};

export default function AvatarWithRing() {
  return (
    <HStack gap="4">
      <Avatar.Root css={ringCss} colorPalette="pink">
        <Avatar.Fallback name="Random" />
        <Avatar.Image src="https://randomuser.me/api/portraits/men/70.jpg" />
      </Avatar.Root>
      <Avatar.Root css={ringCss} colorPalette="green">
        <Avatar.Fallback name="Random" />
        <Avatar.Image src="https://randomuser.me/api/portraits/men/54.jpg" />
      </Avatar.Root>
      <Avatar.Root css={ringCss} colorPalette="blue">
        <Avatar.Fallback name="Random" />
        <Avatar.Image src="https://randomuser.me/api/portraits/men/42.jpg" />
      </Avatar.Root>
    </HStack>
  );
}
