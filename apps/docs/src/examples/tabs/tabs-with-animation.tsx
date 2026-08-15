import { Box, Tabs } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  {
    title: "1",
    content: "Dolore ex esse laboris elit magna esse sunt",
  },
  {
    title: "2",
    content:
      "Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex.",
  },
];

export default function TabsWithAnimation() {
  return (
    <Tabs.Root defaultValue="1" width="full">
      <Tabs.List>
        <For each={items}>
          {(item) => <Tabs.Trigger value={item.title}>Tab {item.title}</Tabs.Trigger>}
        </For>
      </Tabs.List>
      <Box pos="relative" minH="200px" width="full">
        <For each={items}>
          {(item) => (
            <Tabs.Content
              value={item.title}
              position="absolute"
              inset="0"
              _open={{
                animationName: "fade-in, scale-in",
                animationDuration: "300ms",
              }}
              _closed={{
                animationName: "fade-out, scale-out",
                animationDuration: "120ms",
              }}
            >
              {item.content}
            </Tabs.Content>
          )}
        </For>
      </Box>
    </Tabs.Root>
  );
}
