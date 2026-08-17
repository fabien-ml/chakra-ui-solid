import type { JSX } from "@solidjs/web";
import { Switch as ChakraSwitch, Icon, Stack } from "chakra-ui-solid";
import { children, createMemo, omit, Show } from "solid-js";
import { MoonIcon, SunIcon } from "../../components/ui/icons";

export interface SwitchProps extends ChakraSwitch.RootProps {
  /** The glyph on the track, one per state. */
  trackLabel?: { on: JSX.Element; off: JSX.Element };
  /** The glyph inside the thumb, one per state. */
  thumbLabel?: { on: JSX.Element; off: JSX.Element };
  // The part's own prop type, not the element's: `width` and `height` are style props on a
  // `chakra` element, so the raw `ComponentProps<"input">` disagrees with it on both.
  inputProps?: ChakraSwitch.HiddenInputProps;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the root on the props it is read from, or to the hidden input on `inputProps`.
function Switch(props: SwitchProps) {
  // Read twice — once by the gate, once by the label — so it is resolved once here. A JSX prop is a
  // getter that runs `createComponent` on every read.
  const label = children(() => props.children);

  // The two pairs go through a memo rather than being read straight off props, for the same reason
  // one level up: an inline `trackLabel={{ on: <Sun />, off: <Moon /> }}` is a getter, so every read
  // rebuilds the object *and* both elements in it.
  const trackLabel = createMemo(() => props.trackLabel);
  const thumbLabel = createMemo(() => props.thumbLabel);

  // Both named, and neither spread as an expression: a member access or a call inside a JSX spread
  // compiles to a memo, and the receiving part then reads that memo in its own body —
  // `STRICT_READ_UNTRACKED`, reported against the part with nothing pointing back here.
  const rootProps = omit(props, "trackLabel", "thumbLabel", "inputProps", "children");
  // `?? {}` is not defensive: a spread of `undefined` reaches the part as `props === undefined` on
  // the **server** build, where the same spread on the client hands it an empty bag — so without it
  // the page renders in a browser and 500s the route.
  const inputProps = props.inputProps ?? {};

  return (
    <ChakraSwitch.Root {...rootProps}>
      <ChakraSwitch.HiddenInput {...inputProps} />
      <ChakraSwitch.Control>
        <ChakraSwitch.Thumb>
          <Show when={thumbLabel() !== undefined}>
            <ChakraSwitch.ThumbIndicator fallback={thumbLabel()?.off}>
              {thumbLabel()?.on}
            </ChakraSwitch.ThumbIndicator>
          </Show>
        </ChakraSwitch.Thumb>
        <Show when={trackLabel() !== undefined}>
          <ChakraSwitch.Indicator fallback={trackLabel()?.off}>
            {trackLabel()?.on}
          </ChakraSwitch.Indicator>
        </Show>
      </ChakraSwitch.Control>
      <Show when={label() != null}>
        <ChakraSwitch.Label>{label()}</ChakraSwitch.Label>
      </Show>
    </ChakraSwitch.Root>
  );
}

export default function SwitchClosedComponent() {
  return (
    <Stack align="flex-start">
      <Switch>Activate Chakra</Switch>
      <Switch
        defaultChecked
        size="lg"
        trackLabel={{
          on: <Icon as={SunIcon} color="yellow.400" />,
          off: <Icon as={MoonIcon} color="gray.400" />,
        }}
      >
        With a track label
      </Switch>
    </Stack>
  );
}
