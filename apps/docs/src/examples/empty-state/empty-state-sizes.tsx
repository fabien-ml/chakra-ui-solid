import { EmptyState, Stack, VStack } from "chakra-ui-solid";
import { For } from "solid-js";
import { ShoppingCartIcon } from "../../components/ui/icons";

export default function EmptyStateSizes() {
  return (
    <Stack>
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <EmptyState.Root size={size}>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <ShoppingCartIcon />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>Your cart is empty</EmptyState.Title>
                <EmptyState.Description>
                  Explore our products and add items to your cart
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        )}
      </For>
    </Stack>
  );
}
