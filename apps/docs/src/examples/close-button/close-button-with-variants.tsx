import { CloseButton, HStack } from "chakra-ui-solid";

export default function CloseButtonWithVariants() {
  return (
    <HStack>
      <CloseButton variant="ghost" />
      <CloseButton variant="outline" />
      <CloseButton variant="subtle" />
      <CloseButton variant="solid" />
    </HStack>
  );
}
