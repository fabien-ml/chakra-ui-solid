import { Box, Circle, Float } from "chakra-ui-solid";

export default function FloatBasic() {
  return (
    <Box position="relative" w="80px" h="80px" bg="bg.emphasized">
      <Float>
        <Circle size="5" bg="red.solid" color="red.contrast">
          3
        </Circle>
      </Float>
    </Box>
  );
}
