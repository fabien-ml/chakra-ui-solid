import { Button, ButtonGroup, EmptyState, VStack } from "chakra-ui-solid";
import { PaintBucketIcon } from "../../components/ui/icons";

export default function EmptyStateWithAction() {
  return (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Indicator>
          <PaintBucketIcon />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>Start adding tokens</EmptyState.Title>
          <EmptyState.Description>Add a new design token to get started</EmptyState.Description>
        </VStack>
        <ButtonGroup>
          <Button>Create token</Button>
          <Button variant="outline">Import</Button>
        </ButtonGroup>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
