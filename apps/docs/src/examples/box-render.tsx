import { Box } from "@chakra-ui-solid/components";
import type { JSX } from "@solidjs/web";

export default function BoxRender() {
  return (
    <Box
      px="4"
      py="2"
      borderRadius="l2"
      bg="colorPalette.solid"
      color="colorPalette.contrast"
      textDecoration="none"
      // `render` is a **function**, never a JSX element: it receives the computed props and
      // returns the node. A Solid JSX element is already constructed by the time it reaches us
      // and there is no `cloneElement`, so accepting one could only mean dropping every prop
      // above.
      //
      // The cast is not decoration. Box types its element props against `HTMLElement`, and Solid's
      // `Ref<HTMLElement>` is not assignable to `Ref<HTMLAnchorElement>` — so any host element
      // narrower than `HTMLElement` needs one. That is the price of `as` staying a loose
      // `ValidComponent` instead of a generic that re-types props from the element; the note under
      // this example says why that trade was taken.
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
