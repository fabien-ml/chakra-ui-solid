import { Tabs } from "chakra-ui-solid";
import { createSignal, onSettled } from "solid-js";

export default function TabsLazyMounted() {
  return (
    <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1">
      <Tabs.List>
        <Tabs.Trigger value="tab-1">Tab 1</Tabs.Trigger>
        <Tabs.Trigger value="tab-2">Tab 2</Tabs.Trigger>
        <Tabs.Trigger value="tab-3">Tab 3</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab-1">
        Tab 1: Content <TickValue />
      </Tabs.Content>
      <Tabs.Content value="tab-2">
        Tab 2: Content <TickValue />
      </Tabs.Content>
      <Tabs.Content value="tab-3">
        Tab 3: Content <TickValue />
      </Tabs.Content>
    </Tabs.Root>
  );
}

/**
 * A counter that restarts from zero whenever its panel is mounted again — which is what makes
 * `lazyMount` and `unmountOnExit` visible.
 */
function TickValue() {
  const [value, setValue] = createSignal(0);

  // `onSettled` is Solid 2.0's setup-and-teardown pair, and it runs on the client only — a timer
  // started during the docs site's server pass would never be cleared.
  onSettled(() => {
    const intervalId = window.setInterval(() => setValue((current) => current + 1), 1000);
    return () => window.clearInterval(intervalId);
  });

  return <span style={{ "font-weight": "bold", color: "tomato", padding: "4px" }}>{value()}</span>;
}
