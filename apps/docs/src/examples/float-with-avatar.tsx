import { Box, Circle, Float } from "chakra-ui-solid";

export default function FloatWithAvatar() {
  return (
    <Box display="inline-block" pos="relative">
      <Circle size="12" bg="bg.emphasized" color="fg" fontWeight="medium">
        FS
      </Circle>
      <Float placement="bottom-end">
        <Box
          bg="teal.subtle"
          color="teal.fg"
          px="2"
          py="0.5"
          borderRadius="l1"
          fontSize="xs"
          fontWeight="medium"
        >
          New
        </Box>
      </Float>
    </Box>
  );
}
