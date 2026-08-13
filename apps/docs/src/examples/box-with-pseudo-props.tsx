import { Box } from "chakra-ui-solid";

export default function BoxWithPseudoProps() {
  return (
    <Box bg="tomato" w="100%" p="4" color="white" _hover={{ bg: "green" }}>
      This is the Box
    </Box>
  );
}
