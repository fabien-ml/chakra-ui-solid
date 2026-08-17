import { RadioGroup as ChakraRadioGroup, HStack } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";

export interface RadioProps extends ChakraRadioGroup.ItemProps {
  // The part's own prop type, not the element's: `width` and `height` are style props on a
  // `chakra` element, so the raw `ComponentProps<"input">` disagrees with it on both.
  inputProps?: ChakraRadioGroup.ItemHiddenInputProps;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the item on the props it is read from.
function Radio(props: RadioProps) {
  // Read twice — once by the gate, once by the text — so it is resolved once here. A JSX prop is a
  // getter that runs `createComponent` on every read.
  const label = children(() => props.children);

  // Both named, and neither spread as an expression: a member access or a call inside a JSX spread
  // compiles to a memo, and the receiving part then reads that memo in its own body —
  // `STRICT_READ_UNTRACKED`, reported against the part with nothing pointing back here.
  const itemProps = omit(props, "inputProps", "children");
  // `?? {}` is not defensive: a spread of `undefined` reaches the part as `props === undefined` on
  // the **server** build, where the same spread on the client hands it an empty bag — so without it
  // the page renders in a browser and 500s the route.
  const inputProps = props.inputProps ?? {};

  return (
    <ChakraRadioGroup.Item {...itemProps}>
      <ChakraRadioGroup.ItemHiddenInput {...inputProps} />
      <ChakraRadioGroup.ItemIndicator />
      <Show when={label() != null}>
        <ChakraRadioGroup.ItemText>{label()}</ChakraRadioGroup.ItemText>
      </Show>
    </ChakraRadioGroup.Item>
  );
}

const RadioGroup = ChakraRadioGroup.Root;

export default function RadioClosedComponent() {
  return (
    <RadioGroup defaultValue="1">
      <HStack gap="6">
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
        <Radio value="3">Option 3</Radio>
      </HStack>
    </RadioGroup>
  );
}
