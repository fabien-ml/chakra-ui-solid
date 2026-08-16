import { Avatar, Code, createAvatar, Stack } from "chakra-ui-solid";

export default function AvatarWithStore() {
  const avatar = createAvatar();

  return (
    <Stack align="flex-start">
      <Avatar.RootProvider value={avatar}>
        <Avatar.Image src="https://bit.ly/sage-adebayo" />
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.RootProvider>
      <Code>{avatar.loaded ? "loaded" : "not loaded"}</Code>
    </Stack>
  );
}
