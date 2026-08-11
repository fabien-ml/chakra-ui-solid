import { Box, Group } from "chakra-ui-solid";

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

export default function GroupWithGrow() {
  return (
    <Group grow>
      <OutlineButton>First</OutlineButton>
      <OutlineButton>Second</OutlineButton>
      <OutlineButton>Third</OutlineButton>
    </Group>
  );
}
