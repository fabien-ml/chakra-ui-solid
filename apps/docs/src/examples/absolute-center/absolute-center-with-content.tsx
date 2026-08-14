import { AbsoluteCenter, Box } from "chakra-ui-solid";
import { HeartIcon } from "../../components/ui/icons";

export default function AbsoluteCenterWithContent() {
  return (
    <Box position="relative" w="100px" h="100px" bg="bg.muted" borderRadius="md">
      <AbsoluteCenter>
        <Box bg="red.solid" color="red.contrast" p="3" borderRadius="full" fontSize="xl">
          <HeartIcon />
        </Box>
      </AbsoluteCenter>
    </Box>
  );
}
