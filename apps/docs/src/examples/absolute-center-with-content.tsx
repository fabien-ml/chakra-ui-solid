import { AbsoluteCenter, Box } from "@chakra-ui-solid/components";

const Dot = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="6" fill="currentColor" />
  </svg>
);

export default function AbsoluteCenterWithContent() {
  return (
    <Box position="relative" w="100px" h="100px" bg="bg.muted" borderRadius="md">
      <AbsoluteCenter>
        <Box bg="red.solid" color="red.contrast" p="3" borderRadius="full" fontSize="xl">
          <Dot />
        </Box>
      </AbsoluteCenter>
    </Box>
  );
}
