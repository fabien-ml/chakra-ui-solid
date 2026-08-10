import { Box } from "@chakra-ui-solid/components";

export default function AspectRatioResponsive() {
  return (
    <Box maxWidth="300px" bg="bg.muted" aspectRatio={{ base: 1, md: 16 / 9 }}>
      Box
    </Box>
  );
}
