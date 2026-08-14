import type { JSX } from "@solidjs/web";
import { EmptyState as ChakraEmptyState, VStack } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";
import { ShoppingCartIcon } from "../../components/ui/icons";

interface EmptyStateProps extends ChakraEmptyState.RootProps {
  title: string;
  description?: string;
  icon?: JSX.Element;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the root on the props it is read from.
function EmptyState(props: EmptyStateProps) {
  // `icon` decides a branch *and* gets rendered in it, so it is read more than once per render —
  // and a JSX prop is a getter, which builds the element again on every read.
  const icon = children(() => props.icon);

  // Named, never spread as a call expression: a call inside a JSX spread compiles to a memo, and
  // the receiving component then reads it untracked.
  const rootProps = omit(props, "title", "description", "icon", "children");

  return (
    <ChakraEmptyState.Root {...rootProps}>
      <ChakraEmptyState.Content>
        <Show when={icon()}>
          <ChakraEmptyState.Indicator>{icon()}</ChakraEmptyState.Indicator>
        </Show>
        <Show
          when={props.description}
          fallback={<ChakraEmptyState.Title>{props.title}</ChakraEmptyState.Title>}
        >
          <VStack textAlign="center">
            <ChakraEmptyState.Title>{props.title}</ChakraEmptyState.Title>
            <ChakraEmptyState.Description>{props.description}</ChakraEmptyState.Description>
          </VStack>
        </Show>
        {props.children}
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
}

export default function EmptyStateClosedComponent() {
  return (
    <EmptyState
      title="Your cart is empty"
      description="Explore our products and add items to your cart"
      icon={<ShoppingCartIcon />}
    />
  );
}
