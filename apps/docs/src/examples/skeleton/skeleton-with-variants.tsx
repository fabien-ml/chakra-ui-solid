import { HStack, Skeleton, Stack, Text } from "chakra-ui-solid";

export default function SkeletonWithVariants() {
  return (
    <Stack gap="5">
      <HStack gap="5">
        <Text width="8ch">pulse</Text>
        <Skeleton flex="1" height="5" variant="pulse" />
      </HStack>
      <HStack gap="5">
        <Text width="8ch">shine</Text>
        <Skeleton flex="1" height="5" variant="shine" />
      </HStack>
    </Stack>
  );
}
