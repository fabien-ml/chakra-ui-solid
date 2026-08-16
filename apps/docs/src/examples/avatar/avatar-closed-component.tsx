import type { ComponentProps, JSX } from "@solidjs/web";
import { Avatar as ChakraAvatar, HStack } from "chakra-ui-solid";
import { omit } from "solid-js";

// The group needs no wrapper of its own, and is re-exported so the snippet is a single import.
export { AvatarGroup } from "chakra-ui-solid";

export interface AvatarProps extends ChakraAvatar.RootProps {
  name?: string;
  src?: string;
  srcset?: string;
  loading?: ComponentProps<"img">["loading"];
  icon?: JSX.Element;
  fallback?: JSX.Element;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the root on the props it is read from.
function Avatar(props: AvatarProps) {
  // Named, never spread as a call expression: a call inside a JSX spread compiles to a memo, and
  // the receiving component then reads it untracked.
  const rootProps = omit(props, "name", "src", "srcset", "loading", "icon", "fallback", "children");

  return (
    <ChakraAvatar.Root {...rootProps}>
      <ChakraAvatar.Fallback name={props.name}>
        {props.fallback || props.icon}
      </ChakraAvatar.Fallback>
      <ChakraAvatar.Image src={props.src} srcset={props.srcset} loading={props.loading} />
      {props.children}
    </ChakraAvatar.Root>
  );
}

export default function AvatarClosedComponent() {
  return (
    <HStack>
      <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
      <Avatar name="Ryan Florence" />
      <Avatar />
    </HStack>
  );
}
