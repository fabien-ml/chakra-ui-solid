import { Box } from "@chakra-ui-solid/components";
import type { JSX } from "@solidjs/web";

export default function BoxWithRenderProp() {
  return (
    <Box
      px="4"
      py="2"
      borderRadius="l2"
      bg="colorPalette.solid"
      color="colorPalette.contrast"
      textDecoration="none"
      render={(props) => (
        <a {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} href="https://panda-css.com">
          {props.children}
        </a>
      )}
    >
      A styled anchor
    </Box>
  );
}
