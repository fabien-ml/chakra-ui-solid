import { DataList, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

const stats = [
  { label: "New Users", value: "234" },
  { label: "Sales", value: "£12,340" },
  { label: "Revenue", value: "3,450" },
];

export default function DataListWithOrientation() {
  return (
    <Stack gap="8">
      <DataList.Root orientation="vertical">
        <For each={stats}>
          {(item) => (
            <DataList.Item>
              <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
              <DataList.ItemValue>{item.value}</DataList.ItemValue>
            </DataList.Item>
          )}
        </For>
      </DataList.Root>
      <DataList.Root orientation="horizontal">
        <For each={stats}>
          {(item) => (
            <DataList.Item>
              <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
              <DataList.ItemValue>{item.value}</DataList.ItemValue>
            </DataList.Item>
          )}
        </For>
      </DataList.Root>
    </Stack>
  );
}
