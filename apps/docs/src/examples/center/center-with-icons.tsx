import { Box, Center, HStack } from "chakra-ui-solid";
import { PhoneIcon } from "../../components/ui/icons";

export default function CenterWithIcons() {
  return (
    <HStack>
      <Center w="40px" h="40px" bg="red.solid" color="red.contrast">
        <PhoneIcon />
      </Center>

      <Center w="40px" h="40px" bg="red.solid" color="red.contrast">
        <Box as="span" fontWeight="bold" fontSize="lg">
          1
        </Box>
      </Center>
    </HStack>
  );
}
