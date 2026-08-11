import { Box, Center, HStack } from "chakra-ui-solid";

/** Chakra's example frames a `react-icons` icon; no Icon component has shipped here yet. */
const Dot = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="6" fill="currentColor" />
  </svg>
);

export default function CenterWithIcons() {
  return (
    <HStack>
      <Center w="40px" h="40px" bg="red.solid" color="red.contrast">
        <Dot />
      </Center>

      <Center w="40px" h="40px" bg="red.solid" color="red.contrast">
        <Box as="span" fontWeight="bold" fontSize="lg">
          1
        </Box>
      </Center>
    </HStack>
  );
}
