import { Tabs } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function TabsControlled() {
  const [value, setValue] = createSignal<string | null>("first");

  return (
    <Tabs.Root value={value()} onValueChange={(details) => setValue(details.value)}>
      <Tabs.List>
        <Tabs.Trigger value="first">First tab</Tabs.Trigger>
        <Tabs.Trigger value="second">Second tab</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="first">First panel</Tabs.Content>
      <Tabs.Content value="second">Second panel</Tabs.Content>
    </Tabs.Root>
  );
}
