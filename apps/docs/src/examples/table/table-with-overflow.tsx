import { Table } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
  { id: 2, name: "Coffee Maker", category: "Home Appliances", price: 49.99 },
  { id: 3, name: "Desk Chair", category: "Furniture", price: 150.0 },
  { id: 4, name: "Smartphone", category: "Electronics", price: 799.99 },
  { id: 5, name: "Headphones", category: "Accessories", price: 199.99 },
];

export default function TableWithOverflow() {
  return (
    <Table.ScrollArea borderWidth="1px" maxW="xl">
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader minW="400px">Product</Table.ColumnHeader>
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
                <Table.Cell>{item.name}</Table.Cell>
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
