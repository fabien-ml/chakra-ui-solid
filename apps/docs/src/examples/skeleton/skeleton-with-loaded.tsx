import { Button, Skeleton, Stack, Text } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function SkeletonWithLoaded() {
  const [loading, setLoading] = createSignal(true);

  return (
    <Stack align="flex-start" gap="4">
      <Skeleton height="6" loading={loading()}>
        <Text>Chakra UI is cool</Text>
      </Skeleton>
      <Button size="sm" onClick={() => setLoading((current) => !current)}>
        Toggle
      </Button>
    </Stack>
  );
}
