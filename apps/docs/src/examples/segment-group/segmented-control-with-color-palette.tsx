import { SegmentGroup } from "chakra-ui-solid";
import { For } from "solid-js";

export default function SegmentedControlWithColorPalette() {
  return (
    <SegmentGroup.Root bg="colorPalette.50" colorPalette="orange" defaultValue="Monthly">
      <SegmentGroup.Indicator />
      <For each={["Monthly", "Yearly"]}>
        {(item) => (
          <SegmentGroup.Item value={item}>
            <SegmentGroup.ItemText _checked={{ color: "colorPalette.fg", fontWeight: "medium" }}>
              {item}
            </SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        )}
      </For>
    </SegmentGroup.Root>
  );
}
