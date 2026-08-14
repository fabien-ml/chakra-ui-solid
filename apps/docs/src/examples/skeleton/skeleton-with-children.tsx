import { Badge, type BadgeProps, HStack, Skeleton } from "chakra-ui-solid";

export default function SkeletonWithChildren() {
  return (
    <HStack gap="4">
      {/* `render` where the React version writes `asChild`: the placeholder's computed props go to
          the Badge, so there is one element rather than a badge inside a block. The cast is the one
          the composition page describes — Skeleton renders a `div` and Badge a `span`, so their
          `ref` types differ. */}
      <Skeleton loading render={(skeletonProps) => <Badge {...(skeletonProps as BadgeProps)} />}>
        Select
      </Skeleton>

      <Skeleton loading={false}>
        <Badge>Select</Badge>
      </Skeleton>
    </HStack>
  );
}
