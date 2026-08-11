import type { JSX } from "@solidjs/web";
import { Box, Center } from "chakra-ui-solid";
import { ArrowRightIcon } from "../components/site/icons";

export default function CenterWithInline() {
  return (
    <Box
      color="fg"
      render={(props) => (
        <a {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} href="#usage">
          {props.children}
        </a>
      )}
    >
      <Center inline gap="4">
        <Box>Visit chakra-ui-solid</Box>
        <ArrowRightIcon />
      </Center>
    </Box>
  );
}
