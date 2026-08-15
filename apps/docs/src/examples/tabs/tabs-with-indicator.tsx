import { Tabs } from "chakra-ui-solid";
import { AtSignIcon, CircleCheckIcon, PackageIcon } from "../../components/ui/icons";

export default function TabsWithIndicator() {
  return (
    <Tabs.Root defaultValue="members" variant="plain">
      <Tabs.List bg="bg.muted" rounded="l3" p="1">
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
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
      <Tabs.Content value="members">Manage your team members</Tabs.Content>
      <Tabs.Content value="projects">Manage your projects</Tabs.Content>
      <Tabs.Content value="tasks">Manage your tasks for freelancers</Tabs.Content>
    </Tabs.Root>
  );
}
