import { DataList } from "chakra-ui-solid";
import { For } from "solid-js";

const stats = [
  { label: "New Users", value: "234" },
  { label: "Sales", value: "£12,340" },
  { label: "Revenue", value: "3,450" },
];

export default function DataListBasic() {
  return (
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
  );
}
