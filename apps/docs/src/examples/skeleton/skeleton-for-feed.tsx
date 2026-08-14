import { HStack, Skeleton, SkeletonCircle, SkeletonText, Stack } from "chakra-ui-solid";

export default function SkeletonForFeed() {
  return (
    <Stack gap="6" maxW="xs">
      <HStack width="full">
        <SkeletonCircle size="10" />
        <SkeletonText noOfLines={2} />
      </HStack>
      <Skeleton height="200px" />
    </Stack>
  );
}
