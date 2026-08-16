import { Box, Portal, Text } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function PortalWithContainer() {
  const [container, setContainer] = createSignal<HTMLDivElement | null>(null);

  return (
    <Box>
      <Portal container={container}>
        <Text>This text is rendered inside the box below.</Text>
      </Portal>

      <Box ref={setContainer} borderWidth="1px" borderRadius="l2" padding="4" />
    </Box>
  );
}
