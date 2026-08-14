import { EmptyState, List, VStack } from "chakra-ui-solid";
import { PaintBucketIcon } from "../../components/ui/icons";

export default function EmptyStateWithList() {
  return (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Indicator>
          <PaintBucketIcon />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>No results found</EmptyState.Title>
          <EmptyState.Description>Try adjusting your search</EmptyState.Description>
        </VStack>
        <List.Root variant="marker">
          <List.Item>Try removing filters</List.Item>
          <List.Item>Try different keywords</List.Item>
        </List.Root>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
