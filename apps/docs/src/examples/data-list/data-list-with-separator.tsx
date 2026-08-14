import { DataList } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { label: "First Name", value: "Jassie" },
  { label: "Last Name", value: "Bhatia" },
  { label: "Email", value: "jassie@jassie.dev" },
  { label: "Phone", value: "1234567890" },
  { label: "Address", value: "1234 Main St, Anytown, USA" },
];

export default function DataListWithSeparator() {
  return (
    <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
      <For each={items}>
        {(item) => (
          <DataList.Item pt="4">
            <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
            <DataList.ItemValue>{item.value}</DataList.ItemValue>
          </DataList.Item>
        )}
      </For>
    </DataList.Root>
  );
}
