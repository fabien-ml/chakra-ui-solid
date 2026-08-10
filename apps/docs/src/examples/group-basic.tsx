import { Box, Group } from "@chakra-ui-solid/components";

export default function GroupBasic() {
  return (
    <Group>
      <Box h="20" w="40" bg="bg.emphasized">
        1
      </Box>
      <Box h="20" w="40" bg="bg.emphasized">
        2
      </Box>
    </Group>
  );
}
