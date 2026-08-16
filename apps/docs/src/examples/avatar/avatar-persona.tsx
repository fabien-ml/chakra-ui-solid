import { Avatar, HStack, Stack, Text } from "chakra-ui-solid";
import { For } from "solid-js";

const users = [
  {
    id: "1",
    name: "John Mason",
    email: "john.mason@example.com",
    avatar: "https://i.pravatar.cc/300?u=iu",
  },
  {
    id: "2",
    name: "Melissa Jones",
    email: "melissa.jones@example.com",
    avatar: "https://i.pravatar.cc/300?u=po",
  },
];

export default function AvatarPersona() {
  return (
    <Stack gap="8">
      <For each={users}>
        {(user) => (
          <HStack gap="4">
            <Avatar.Root>
              <Avatar.Fallback name={user.name} />
              <Avatar.Image src={user.avatar} />
            </Avatar.Root>
            <Stack gap="0">
              <Text fontWeight="medium">{user.name}</Text>
              <Text color="fg.muted" textStyle="sm">
                {user.email}
              </Text>
            </Stack>
          </HStack>
        )}
      </For>
    </Stack>
  );
}
