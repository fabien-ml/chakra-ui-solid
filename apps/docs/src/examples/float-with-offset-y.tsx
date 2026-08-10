import { Box, Circle, Float } from "@chakra-ui-solid/components";

export default function FloatWithOffsetY() {
  return (
    <Box position="relative" w="80px" h="80px" bg="bg.emphasized">
      <Float offsetY="-4">
        <Circle size="5" bg="red.solid" color="red.contrast">
          3
        </Circle>
      </Float>
    </Box>
  );
}
