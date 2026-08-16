import { Button, Heading, Stack, Text } from "chakra-ui-solid";
import { ArrowRightIcon } from "../../components/ui/icons";

export default function HeadingWithComposition() {
  return (
    <Stack align="flex-start">
      <Heading size="2xl">Modern payments for Stores</Heading>
      <Text mb="3" fontSize="md" color="fg.muted">
        PayMe helps startups get paid by anyone, anywhere in the world
      </Text>
      <Button>
        Create account <ArrowRightIcon />
      </Button>
    </Stack>
  );
}
