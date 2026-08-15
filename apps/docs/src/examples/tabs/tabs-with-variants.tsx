import { SimpleGrid, Tabs } from "chakra-ui-solid";
import { For } from "solid-js";
import { AtSignIcon, CircleCheckIcon, PackageIcon } from "../../components/ui/icons";

export default function TabsWithVariants() {
  return (
    <SimpleGrid columns={2} gap="14" width="full">
      <For each={["line", "subtle", "enclosed", "outline", "plain"] as const}>
        {(variant) => (
          <Tabs.Root defaultValue="members" variant={variant}>
            <Tabs.List>
              <Tabs.Trigger value="members">
                <AtSignIcon />
                Members
              </Tabs.Trigger>
              <Tabs.Trigger value="projects">
                <PackageIcon />
                Projects
              </Tabs.Trigger>
              <Tabs.Trigger value="tasks">
                <CircleCheckIcon />
                Settings
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="members">Manage your team members</Tabs.Content>
            <Tabs.Content value="projects">Manage your projects</Tabs.Content>
            <Tabs.Content value="tasks">Manage your tasks for freelancers</Tabs.Content>
          </Tabs.Root>
        )}
      </For>
    </SimpleGrid>
  );
}
