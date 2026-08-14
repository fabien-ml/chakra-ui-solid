import { EmptyState, VStack } from "chakra-ui-solid";
import { ShoppingCartIcon } from "../../components/ui/icons";

export default function EmptyStateBasic() {
  return (
    <EmptyState.Root>
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
  );
}
