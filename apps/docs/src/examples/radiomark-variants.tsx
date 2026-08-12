import { Radiomark, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function RadiomarkVariants() {
  return (
    <Stack align="flex-start">
      <For each={["outline", "subtle", "solid", "inverted"] as const}>
        {(variant) => <Radiomark variant={variant} checked />}
      </For>
    </Stack>
  );
}
