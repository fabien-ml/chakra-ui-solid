import { Box } from "chakra-ui-solid";

export default function BoxWithBorder() {
  // The React version's page reaches for `border.disabled` and `fg.disabled` here. Neither is in
  // the Chakra preset we both depend on, and a token that does not exist renders no declaration and
  // raises no error — so these are the nearest two that do.
  return (
    <Box p="4" borderWidth="1px" borderColor="border.muted" color="fg.subtle">
      Somewhat disabled box
    </Box>
  );
}
