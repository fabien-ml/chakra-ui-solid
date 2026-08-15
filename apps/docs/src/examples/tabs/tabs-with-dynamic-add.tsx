import { Button, CloseButton, Heading, Tabs, Text } from "chakra-ui-solid";
import { createSignal, For } from "solid-js";
import { PlusIcon } from "../../components/ui/icons";

interface Item {
  id: string;
  title: string;
  content: string;
}

const items: Item[] = [
  { id: "1", title: "Tab", content: "Tab Content" },
  { id: "2", title: "Tab", content: "Tab Content" },
  { id: "3", title: "Tab", content: "Tab Content" },
  { id: "4", title: "Tab", content: "Tab Content" },
];

const uuid = () => Math.random().toString(36).substring(2, 15);

export default function TabsWithDynamicAdd() {
  const [tabs, setTabs] = createSignal<Item[]>(items);
  const [selectedTab, setSelectedTab] = createSignal<string | null>(items[0]?.id ?? null);

  const addTab = () => {
    const added: Item = { id: uuid(), title: "Tab", content: "Tab Body" };
    setTabs([...tabs(), added]);
    setSelectedTab(added.id);
  };

  const removeTab = (id: string) => {
    if (tabs().length > 1) {
      setTabs(tabs().filter((tab) => tab.id !== id));
    }
  };

  return (
    <Tabs.Root
      value={selectedTab()}
      variant="outline"
      size="sm"
      onValueChange={(details) => setSelectedTab(details.value)}
    >
      <Tabs.List flex="1 1 auto">
        <For each={tabs()}>
          {(item) => (
            <Tabs.Trigger value={item.id}>
              {item.title}{" "}
              <CloseButton
                as="span"
                role="button"
                size="2xs"
                me="-2"
                onClick={(event) => {
                  event.stopPropagation();
                  removeTab(item.id);
                }}
              />
            </Tabs.Trigger>
          )}
        </For>
        <Button alignSelf="center" ms="2" size="2xs" variant="ghost" onClick={addTab}>
          <PlusIcon /> Add Tab
        </Button>
      </Tabs.List>

      <Tabs.ContentGroup>
        <For each={tabs()}>
          {(item) => (
            <Tabs.Content value={item.id}>
              <Heading size="xl" my="6">
                {item.content} {item.id}
              </Heading>
              <Text>
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat
                do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation
                ea qui adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur.
                Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis
                cillum mollit.
              </Text>
            </Tabs.Content>
          )}
        </For>
      </Tabs.ContentGroup>
    </Tabs.Root>
  );
}
