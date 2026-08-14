import type { JSX } from "@solidjs/web";
import { Box, Wrap } from "chakra-ui-solid";

const Badge = (props: { children: JSX.Element }) => (
  <Box
    bg="bg.emphasized"
    color="fg"
    px="2"
    py="0.5"
    borderRadius="l1"
    fontSize="xs"
    fontWeight="medium"
  >
    {props.children}
  </Box>
);

export default function WrapBasic() {
  return (
    <Wrap>
      <Badge>Badge 1</Badge>
      <Badge>Badge 2</Badge>
      <Badge>Badge 3</Badge>
    </Wrap>
  );
}
