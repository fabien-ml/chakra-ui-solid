import { Tabs } from "chakra-ui-solid";
import { AtSignIcon, CircleCheckIcon, PackageIcon } from "../../components/ui/icons";

export default function TabsWithManualActivation() {
  return (
    <Tabs.Root defaultValue="members" activationMode="manual">
      <Tabs.List>
        <Tabs.Trigger value="members">
          <AtSignIcon />
          Members
        </Tabs.Trigger>
        <Tabs.Trigger value="projects" disabled>
          <PackageIcon />
          Projects
        </Tabs.Trigger>
        <Tabs.Trigger value="tasks">
          <CircleCheckIcon />
          Settings
        </Tabs.Trigger>
      </Tabs.List>
      {/* content */}
    </Tabs.Root>
  );
}
