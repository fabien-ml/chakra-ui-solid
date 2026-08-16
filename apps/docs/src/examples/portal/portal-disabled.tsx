import { Portal, Text } from "chakra-ui-solid";

export default function PortalDisabled() {
  return (
    <Portal disabled>
      <Text>Will render the content in place</Text>
    </Portal>
  );
}
