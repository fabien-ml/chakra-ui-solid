import { Code, createTabs, Stack, Tabs } from "chakra-ui-solid";
import { AtSignIcon, CircleCheckIcon, PackageIcon } from "../../components/ui/icons";

export default function TabsWithStore() {
  const tabs = createTabs({ defaultValue: "members" });

  return (
    <Stack align="flex-start">
      <Code>selected: {tabs.value}</Code>
      <Tabs.RootProvider value={tabs}>
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
            Tasks
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="members">Manage your team members</Tabs.Content>
        <Tabs.Content value="projects">Manage your projects</Tabs.Content>
        <Tabs.Content value="tasks">Manage your tasks for freelancers</Tabs.Content>
      </Tabs.RootProvider>
    </Stack>
  );
}
