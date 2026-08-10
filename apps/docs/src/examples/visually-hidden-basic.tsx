import { Box, VisuallyHidden } from "@chakra-ui-solid/components";

const Dot = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <circle cx="12" cy="12" r="6" fill="currentColor" />
  </svg>
);

export default function VisuallyHiddenBasic() {
  return (
    <Box
      as="button"
      display="inline-flex"
      alignItems="center"
      gap="2"
      px="4"
      py="2"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l2"
      fontWeight="medium"
    >
      <Dot /> 3 <VisuallyHidden>Notifications</VisuallyHidden>
    </Box>
  );
}
