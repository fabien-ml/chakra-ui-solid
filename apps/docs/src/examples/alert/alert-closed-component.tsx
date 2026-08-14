import type { JSX } from "@solidjs/web";
import { Alert as ChakraAlert } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";

interface AlertProps extends Omit<ChakraAlert.RootProps, "title"> {
  startElement?: JSX.Element;
  endElement?: JSX.Element;
  title?: JSX.Element;
  icon?: JSX.Element;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the root on the props it is read from.
function Alert(props: AlertProps) {
  // Both slots decide a branch *and* get rendered in it, so each is read more than once per render
  // — and a JSX prop is a getter, which builds the element again on every read. `children()`
  // resolves each one once.
  const startElement = children(() => props.startElement);
  const body = children(() => props.children);

  // Named, never spread as a call expression: a call inside a JSX spread compiles to a memo, and
  // the receiving component then reads it untracked.
  const rootProps = omit(props, "title", "children", "icon", "startElement", "endElement");

  return (
    <ChakraAlert.Root {...rootProps}>
      <Show
        when={startElement()}
        fallback={<ChakraAlert.Indicator>{props.icon}</ChakraAlert.Indicator>}
      >
        {startElement()}
      </Show>
      <Show when={body()} fallback={<ChakraAlert.Title flex="1">{props.title}</ChakraAlert.Title>}>
        <ChakraAlert.Content>
          <ChakraAlert.Title>{props.title}</ChakraAlert.Title>
          <ChakraAlert.Description>{body()}</ChakraAlert.Description>
        </ChakraAlert.Content>
      </Show>
      {props.endElement}
    </ChakraAlert.Root>
  );
}

export default function AlertClosedComponent() {
  return (
    <Alert status="success" title="Success!">
      Your application has been received.
    </Alert>
  );
}
