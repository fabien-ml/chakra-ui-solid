import { Table } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { id: 1, name: "Headphones", category: "Electronics", price: 834.12 },
  { id: 2, name: "Desk Chair", category: "Furniture", price: 245.88 },
  { id: 3, name: "Microwave", category: "Home Appliances", price: 379.26 },
  { id: 4, name: "Backpack", category: "Accessories", price: 112.47 },
  { id: 5, name: "Football", category: "Sports", price: 95.14 },
  { id: 6, name: "Smartphone", category: "Electronics", price: 921.63 },
  { id: 7, name: "Wrist Watch", category: "Accessories", price: 418.52 },
  { id: 8, name: "T-Shirt", category: "Clothing", price: 35.29 },
  { id: 9, name: "Vacuum Cleaner", category: "Home Appliances", price: 601.22 },
  { id: 10, name: "Lamp", category: "Furniture", price: 157.88 },
  { id: 11, name: "Drone", category: "Electronics", price: 836.15 },
  { id: 12, name: "Perfume", category: "Beauty", price: 128.9 },
  { id: 13, name: "Camping Tent", category: "Outdoors", price: 458.4 },
];

export default function TableWithStickyHeaderAndColumn() {
  return (
    <Table.ScrollArea h="500px" borderWidth="1px" rounded="md" maxW="2xl">
      <Table.Root
        size="sm"
        stickyHeader
        css={{
          "& [data-sticky]": {
            position: "sticky",
            zIndex: 1,
            bg: "bg",

            _after: {
              content: '""',
              position: "absolute",
              pointerEvents: "none",
              top: "0",
              bottom: "-1px",
              width: "32px",
            },
          },

          "& [data-sticky=end]": {
            _after: {
              insetInlineEnd: "0",
              translate: "100% 0",
              shadow: "inset 8px 0px 8px -8px rgba(0, 0, 0, 0.16)",
            },
          },

          "& [data-sticky=start]": {
            _after: {
              insetInlineStart: "0",
              translate: "-100% 0",
              shadow: "inset -8px 0px 8px -8px rgba(0, 0, 0, 0.16)",
            },
          },

          "& thead tr": {
            shadow: "0 1px 0 0 {colors.border}",
            "&:has(th[data-sticky])": {
              zIndex: 2,
            },
          },
        }}
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader data-sticky="end" minW="160px" left="0">
              Product
            </Table.ColumnHeader>
            <Table.ColumnHeader minW="400px">Category</Table.ColumnHeader>
            <Table.ColumnHeader minW="200px" textAlign="end">
              Price
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <For each={items}>
            {(item) => (
              <Table.Row>
                <Table.Cell data-sticky="end" left="0">
                  {item.name}
                </Table.Cell>
                <Table.Cell>{item.category}</Table.Cell>
                <Table.Cell textAlign="end">{item.price}</Table.Cell>
              </Table.Row>
            )}
          </For>
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
