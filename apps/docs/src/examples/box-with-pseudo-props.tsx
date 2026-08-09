import { Box } from "@chakra-ui-solid/components";

export default function BoxWithPseudoProps() {
  return (
    <Box
      bg="red.solid"
      w="100%"
      p="4"
      color="red.contrast"
      _hover={{ bg: "green.solid", color: "green.contrast" }}
    >
      This is the Box
    </Box>
  );
}
