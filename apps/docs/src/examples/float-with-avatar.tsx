import { Badge, Box, Circle, Float } from "chakra-ui-solid";

export default function FloatWithAvatar() {
  return (
    <Box display="inline-block" pos="relative">
      <Circle size="12" bg="bg.emphasized" color="fg" fontWeight="medium">
        FS
      </Circle>
      <Float placement="bottom-end">
        <Badge size="sm" variant="solid" colorPalette="teal">
          New
        </Badge>
      </Float>
    </Box>
  );
}
