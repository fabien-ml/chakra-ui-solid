import { Box, VisuallyHidden } from "chakra-ui-solid";
import { BellIcon } from "../components/site/icons";

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
      <BellIcon /> 3 <VisuallyHidden>Notifications</VisuallyHidden>
    </Box>
  );
}
