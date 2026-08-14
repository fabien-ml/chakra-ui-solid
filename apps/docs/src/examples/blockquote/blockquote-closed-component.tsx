import type { JSX } from "@solidjs/web";
import { Blockquote as ChakraBlockquote } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";

interface BlockquoteProps extends ChakraBlockquote.RootProps {
  cite?: JSX.Element;
  citeUrl?: string;
  icon?: JSX.Element;
  showDash?: boolean;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the root on the props it is read from.
function Blockquote(props: BlockquoteProps) {
  // `cite` decides a branch *and* gets rendered in it, so it is read more than once per render —
  // and a JSX prop is a getter, which builds the element again on every read.
  const cite = children(() => props.cite);

  // Named, never spread as a call expression: a call inside a JSX spread compiles to a memo, and
  // the receiving component then reads it untracked.
  const rootProps = omit(props, "children", "cite", "citeUrl", "icon", "showDash");

  return (
    <ChakraBlockquote.Root {...rootProps}>
      {props.icon}
      <ChakraBlockquote.Content cite={props.citeUrl}>{props.children}</ChakraBlockquote.Content>
      <Show when={cite()}>
        <ChakraBlockquote.Caption>
          {props.showDash ? <>&mdash;</> : null} <cite>{cite()}</cite>
        </ChakraBlockquote.Caption>
      </Show>
    </ChakraBlockquote.Root>
  );
}

export default function BlockquoteClosedComponent() {
  return (
    <Blockquote cite="Uzumaki Naruto" showDash>
      If anyone thinks he is something when he is nothing, he deceives himself.
    </Blockquote>
  );
}
