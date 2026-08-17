import type { JSX } from "@solidjs/web";
import { Checkbox as ChakraCheckbox, Stack } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";

export interface CheckboxProps extends ChakraCheckbox.RootProps {
  icon?: JSX.Element;
  // The part's own prop type, not the element's: `width` and `height` are style props on a
  // `chakra` element, so the raw `ComponentProps<"input">` disagrees with it on both.
  inputProps?: ChakraCheckbox.HiddenInputProps;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the root on the props it is read from.
function Checkbox(props: CheckboxProps) {
  // Read twice — once by the gate, once by the label — so it is resolved once here. A JSX prop is a
  // getter that runs `createComponent` on every read.
  const label = children(() => props.children);

  // Both named, and neither spread as an expression: a member access or a call inside a JSX spread
  // compiles to a memo, and the receiving part then reads that memo in its own body —
  // `STRICT_READ_UNTRACKED`, reported against the part with nothing pointing back here.
  const rootProps = omit(props, "icon", "inputProps", "children");
  // `?? {}` is not defensive: a spread of `undefined` reaches the part as `props === undefined` on
  // the **server** build, where the same spread on the client hands it an empty bag — so without it
  // the page renders in a browser and 500s the route.
  const inputProps = props.inputProps ?? {};

  return (
    <ChakraCheckbox.Root {...rootProps}>
      <ChakraCheckbox.HiddenInput {...inputProps} />
      {/* No `icon || <Indicator />`: an absent child is what `Checkbox.Control` already fills with
          its own indicator. */}
      <ChakraCheckbox.Control>{props.icon}</ChakraCheckbox.Control>
      <Show when={label() != null}>
        <ChakraCheckbox.Label>{label()}</ChakraCheckbox.Label>
      </Show>
    </ChakraCheckbox.Root>
  );
}

export default function CheckboxClosedComponent() {
  return (
    <Stack align="flex-start">
      <Checkbox>Accept terms and conditions</Checkbox>
      <Checkbox defaultChecked>Subscribe to the newsletter</Checkbox>
    </Stack>
  );
}
