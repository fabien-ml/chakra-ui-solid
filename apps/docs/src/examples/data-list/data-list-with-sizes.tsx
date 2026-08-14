import { DataList, Stack } from "chakra-ui-solid";

export default function DataListWithSizes() {
  return (
    <Stack gap="4">
      <DataList.Root size="sm">
        <DataList.Item>
          <DataList.ItemLabel>Name</DataList.ItemLabel>
          <DataList.ItemValue>John Doe</DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
      <DataList.Root size="md">
        <DataList.Item>
          <DataList.ItemLabel>Name</DataList.ItemLabel>
          <DataList.ItemValue>John Doe</DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
      <DataList.Root size="lg">
        <DataList.Item>
          <DataList.ItemLabel>Name</DataList.ItemLabel>
          <DataList.ItemValue>John Doe</DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    </Stack>
  );
}
