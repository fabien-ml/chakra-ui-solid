import { DataList, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

const stats = [
  { label: "New Users", value: "234" },
  { label: "Sales", value: "£12,340" },
  { label: "Revenue", value: "3,450" },
];

export default function DataListWithVariants() {
  // A recipe variant may be a loop variable, where a style prop may not: the preset declares
  // `staticCss: ["*"]` on every recipe it ships, so both `dataList` variant classes are in the
  // sheet whether or not any file spells them.
  return (
    <Stack gap="8">
      <For each={["subtle", "bold"] as const}>
        {(variant) => (
          <DataList.Root variant={variant}>
            <For each={stats}>
              {(item) => (
                <DataList.Item>
                  <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
                  <DataList.ItemValue>{item.value}</DataList.ItemValue>
                </DataList.Item>
              )}
            </For>
          </DataList.Root>
        )}
      </For>
    </Stack>
  );
}
