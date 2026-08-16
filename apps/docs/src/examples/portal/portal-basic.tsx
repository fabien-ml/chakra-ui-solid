import { Portal, Text } from "chakra-ui-solid";

export default function PortalBasic() {
  return (
    <Text>
      This text is rendered here.
      <Portal>
        <Text
          position="fixed"
          bottom="4"
          insetStart="4"
          padding="2"
          bg="bg.panel"
          borderRadius="l2"
        >
          This text is rendered at the end of the document body.
        </Text>
      </Portal>
    </Text>
  );
}
