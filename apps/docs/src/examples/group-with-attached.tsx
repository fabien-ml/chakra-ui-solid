import { Box, Group, Stack } from "@chakra-ui-solid/components";

const OutlineButton = (props: { children: string }) => (
  <Box
    as="button"
    px="4"
    py="2"
    borderWidth="1px"
    borderColor="border"
    borderRadius="l2"
    fontWeight="medium"
  >
    {props.children}
  </Box>
);

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
        <OutlineButton>Item 1</OutlineButton>
        <OutlineButton>Item 2</OutlineButton>
      </Group>

      <Group attached>
        <SolidBadge colorPalette="purple">Commit status</SolidBadge>
        <SolidBadge colorPalette="green">90+</SolidBadge>
      </Group>
    </Stack>
  );
}
