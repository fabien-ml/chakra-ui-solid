import { Mark, Stack, Text } from "chakra-ui-solid";
import { For } from "solid-js";

export default function MarkWithVariants() {
  // A recipe variant may be a loop variable, where a style prop may not: the preset declares
  // `staticCss: ["*"]` on every recipe it ships, so all four `mark` classes are in the sheet
  // whether or not any file spells them.
  return (
    <Stack gap="6">
      <For each={["subtle", "solid", "text", "plain"] as const}>
        {(variant) => (
          <Text>
            The <Mark variant={variant}>design system</Mark> is a collection of UI elements
          </Text>
        )}
      </For>
    </Stack>
  );
}
