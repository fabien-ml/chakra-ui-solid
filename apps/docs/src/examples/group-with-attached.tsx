import { Box, Button, Group, Stack } from "chakra-ui-solid";

/** Chakra's version uses its `Badge`, which has not shipped here yet. */
const SolidBadge = (props: { colorPalette: string; children: string }) => (
  <Box
    colorPalette={props.colorPalette}
    bg="colorPalette.subtle"
    color="colorPalette.fg"
    px="2"
    py="0.5"
    borderRadius="l1"
    fontSize="xs"
    fontWeight="medium"
  >
    {props.children}
  </Box>
);

export default function GroupWithAttached() {
  return (
    <Stack gap="4">
      <Group attached>
        <Button variant="outline">Item 1</Button>
        <Button variant="outline">Item 2</Button>
      </Group>

      <Group attached>
        <SolidBadge colorPalette="purple">Commit status</SolidBadge>
        <SolidBadge colorPalette="green">90+</SolidBadge>
      </Group>
    </Stack>
  );
}
