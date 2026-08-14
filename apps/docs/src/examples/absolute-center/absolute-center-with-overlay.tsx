import { AbsoluteCenter, Box, Circle, HStack } from "chakra-ui-solid";

const Overlay = () => (
  <AbsoluteCenter bg="bg/80" backdropFilter="blur(2px)" rounded="md" p="4">
    <HStack gap="3">
      <Circle size="4" borderWidth="2px" borderColor="blue.solid" borderTopColor="transparent" />
      <Box as="p" fontSize="sm" color="fg.muted">
        Loading...
      </Box>
    </HStack>
  </AbsoluteCenter>
);

export default function AbsoluteCenterWithOverlay() {
  return (
    <Box position="relative" h="120px" bg="bg.muted" rounded="md" p="10">
      <Box opacity="0.5" aria-busy="true">
        Some content that is being loaded...
      </Box>
      <Overlay />
    </Box>
  );
}
