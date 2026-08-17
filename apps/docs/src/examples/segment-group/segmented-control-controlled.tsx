import { SegmentGroup } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function SegmentedControlControlled() {
  const [value, setValue] = createSignal<string | null>("React");

  return (
    <SegmentGroup.Root value={value()} onValueChange={(details) => setValue(details.value)}>
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={["React", "Vue", "Solid"]} />
    </SegmentGroup.Root>
  );
}
