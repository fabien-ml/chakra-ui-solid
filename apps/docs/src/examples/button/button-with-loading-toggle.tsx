import { Button, VStack } from "chakra-ui-solid";
import { createSignal } from "solid-js";
import { StarIcon } from "../../components/ui/icons";

export default function ButtonWithLoadingToggle() {
  const [loading, setLoading] = createSignal(false);

  return (
    <VStack gap="4">
      <Button loading={loading()} onClick={() => setLoading(!loading())}>
        <StarIcon /> Click me
      </Button>
      {/* The React version turns the state back off with a `Checkbox`; that row has not shipped
          here yet, so a second Button stands in. What the example shows is the first one: it keeps
          the width it had while the spinner is up. */}
      <Button variant="outline" size="sm" onClick={() => setLoading(!loading())}>
        Toggle loading
      </Button>
    </VStack>
  );
}
