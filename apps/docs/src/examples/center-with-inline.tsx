import { Box, Center } from "@chakra-ui-solid/components";
import type { JSX } from "@solidjs/web";

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path d="M8 4l10 8-10 8z" fill="currentColor" />
  </svg>
);

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
        <Arrow />
      </Center>
    </Box>
  );
}
