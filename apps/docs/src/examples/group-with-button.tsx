import { Box, Group } from "@chakra-ui-solid/components";

/** Chakra's Button has not shipped here yet — see the note under this example. */
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

export default function GroupWithButton() {
  return (
    <Group>
      <OutlineButton>Item 1</OutlineButton>
      <OutlineButton>Item 2</OutlineButton>
    </Group>
  );
}
