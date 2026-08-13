import { Button, type ButtonProps, Collapsible, Stack, Text } from "chakra-ui-solid";
import { Show } from "solid-js";
import { ChevronDownIcon } from "../components/site/icons";

export default function CollapsiblePartialHeight() {
  return (
    <Collapsible.Root collapsedHeight="100px">
      <Collapsible.Content
        _closed={{
          shadow: "inset 0 -12px 12px -12px var(--shadow-color)",
          shadowColor: "blackAlpha.500",
        }}
      >
        <Stack padding="4" borderWidth="1px" rounded="l2">
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
          <Text>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </Text>
        </Stack>
      </Collapsible.Content>
      <Collapsible.Trigger
        mt="4"
        // The cast composition.mdx describes: the trigger computes a `button`'s DOM props, and
        // `ButtonProps` re-types five of those names — `translate`, `width`, `height`, `content`,
        // `size` — as style props, so the two bags overlap without being assignable.
        render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
      >
        <Collapsible.Context>
          {(collapsible) => (
            // `<Show>`, not a bare ternary: the render prop is called once in the body, so a
            // ternary returning a plain string reads `open` outside any tracking scope and freezes
            // on the label it had at mount. Returning JSX is what puts the read in a memo.
            <Show when={collapsible.open} fallback="Show More">
              Show Less
            </Show>
          )}
        </Collapsible.Context>
        <Collapsible.Indicator transition="transform 0.2s" _open={{ transform: "rotate(180deg)" }}>
          <ChevronDownIcon />
        </Collapsible.Indicator>
      </Collapsible.Trigger>
    </Collapsible.Root>
  );
}
