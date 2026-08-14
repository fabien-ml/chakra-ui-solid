import type { JSX } from "@solidjs/web";
import { Tag as ChakraTag, HStack } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";

interface TagProps extends ChakraTag.RootProps {
  startElement?: JSX.Element;
  endElement?: JSX.Element;
  onClose?: VoidFunction;
  closable?: boolean;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the root on the props it is read from.
function Tag(props: TagProps) {
  // Each slot decides a branch *and* gets rendered in it, so each is read more than once per render
  // — and a JSX prop is a getter, which builds the element again on every read.
  const startElement = children(() => props.startElement);
  const endElement = children(() => props.endElement);
  const closable = () => props.closable ?? props.onClose !== undefined;

  // Named, never spread as a call expression: a call inside a JSX spread compiles to a memo, and
  // the receiving component then reads it untracked.
  const rootProps = omit(props, "startElement", "endElement", "onClose", "closable", "children");

  return (
    <ChakraTag.Root {...rootProps}>
      <Show when={startElement()}>
        <ChakraTag.StartElement>{startElement()}</ChakraTag.StartElement>
      </Show>
      <ChakraTag.Label>{props.children}</ChakraTag.Label>
      <Show when={endElement()}>
        <ChakraTag.EndElement>{endElement()}</ChakraTag.EndElement>
      </Show>
      <Show when={closable()}>
        <ChakraTag.EndElement>
          <ChakraTag.CloseTrigger onClick={props.onClose} />
        </ChakraTag.EndElement>
      </Show>
    </ChakraTag.Root>
  );
}

export default function TagClosedComponent() {
  return (
    <HStack>
      <Tag>Plain</Tag>
      <Tag onClose={() => undefined}>Closable</Tag>
    </HStack>
  );
}
