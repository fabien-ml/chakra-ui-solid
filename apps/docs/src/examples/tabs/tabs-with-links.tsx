import { Link, type LinkProps, Tabs } from "chakra-ui-solid";

export default function TabsWithLinks() {
  return (
    <Tabs.Root defaultValue="members">
      <Tabs.List>
        <Tabs.Trigger
          value="members"
          // `render` rather than `as="a"`: `TabsTriggerProps` is the button's prop set, so `href`
          // is not on it. The cast is the one composition.mdx describes — the trigger computes a
          // `button`'s DOM props and `LinkProps` re-types some of those names as style props.
          render={(props) => <Link unstyled href="#members" {...(props as LinkProps)} />}
        >
          Members
        </Tabs.Trigger>
        <Tabs.Trigger
          value="projects"
          render={(props) => <Link unstyled href="#projects" {...(props as LinkProps)} />}
        >
          Projects
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="members">Manage your team members</Tabs.Content>
      <Tabs.Content value="projects">Manage your projects</Tabs.Content>
    </Tabs.Root>
  );
}
