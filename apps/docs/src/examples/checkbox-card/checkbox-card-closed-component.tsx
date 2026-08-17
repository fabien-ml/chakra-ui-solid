import type { JSX } from "@solidjs/web";
import { Dynamic } from "@solidjs/web";
import { CheckboxCard as ChakraCheckboxCard, Stack } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";

export interface CheckboxCardProps extends ChakraCheckboxCard.RootProps {
  icon?: JSX.Element;
  label?: JSX.Element;
  description?: JSX.Element;
  addon?: JSX.Element;
  indicator?: JSX.Element | null;
  indicatorPlacement?: "start" | "end" | "inside";
  // The part's own prop type, not the element's: `width` and `height` are style props on a
  // `chakra` element, so the raw `ComponentProps<"input">` disagrees with it on both.
  inputProps?: ChakraCheckboxCard.HiddenInputProps;
}

/** Stands in for React's `Fragment` when there is no indicator to lay the content out against. */
function Passthrough(props: { children?: JSX.Element }) {
  return props.children;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the hidden input on `inputProps`.
function CheckboxCard(props: CheckboxCardProps) {
  // Each of these is read by a gate and again by a body, and a JSX prop is a getter that runs
  // `createComponent` on every read — so each is resolved once here.
  const icon = children(() => props.icon);
  const label = children(() => props.label);
  const description = children(() => props.description);
  const addon = children(() => props.addon);

  // Only what the *caller* passed. The default `<CheckboxCard.Indicator />` is deliberately not
  // resolved here: a `children()` memo runs under the owner it was created in, which is this body —
  // outside `CheckboxCard.Root` — and the part would throw for want of the context it reads.
  const provided = children(() => props.indicator);

  const placement = () => props.indicatorPlacement ?? "end";
  // `!== null`, so an unset prop takes the default and an explicit `indicator={null}` takes none.
  const hasIndicator = () => provided() !== null;
  const hasContent = () =>
    label() !== undefined || description() !== undefined || icon() !== undefined;

  /** Built where it renders, which is what puts it under the Root's context. */
  function Indicator() {
    return (
      <Show when={provided() !== undefined} fallback={<ChakraCheckboxCard.Indicator />}>
        {provided()}
      </Show>
    );
  }

  const rootProps = omit(
    props,
    "icon",
    "label",
    "description",
    "addon",
    "indicator",
    "indicatorPlacement",
    "inputProps",
  );
  // `?? {}` is not defensive: a spread of `undefined` reaches the part as `props === undefined` on
  // the **server** build, where the same spread on the client hands it an empty bag — so without it
  // the page renders in a browser and 500s the route.
  const inputProps = props.inputProps ?? {};

  return (
    <ChakraCheckboxCard.Root {...rootProps}>
      <ChakraCheckboxCard.HiddenInput {...inputProps} />
      <ChakraCheckboxCard.Control>
        <Show when={hasIndicator() && placement() === "start"}>
          <Indicator />
        </Show>
        <Show when={hasContent()}>
          {/* No `Content` around a card with no indicator: there is nothing to lay the text out
              against, and the extra column would only add a gap. */}
          <Dynamic
            component={hasIndicator() ? ChakraCheckboxCard.Content : Passthrough}
            children={
              <>
                {icon()}
                <Show when={label() !== undefined}>
                  <ChakraCheckboxCard.Label>{label()}</ChakraCheckboxCard.Label>
                </Show>
                <Show when={description() !== undefined}>
                  <ChakraCheckboxCard.Description>{description()}</ChakraCheckboxCard.Description>
                </Show>
                <Show when={hasIndicator() && placement() === "inside"}>
                  <Indicator />
                </Show>
              </>
            }
          />
        </Show>
        <Show when={hasIndicator() && placement() === "end"}>
          <Indicator />
        </Show>
      </ChakraCheckboxCard.Control>
      <Show when={addon() !== undefined}>
        <ChakraCheckboxCard.Addon>{addon()}</ChakraCheckboxCard.Addon>
      </Show>
    </ChakraCheckboxCard.Root>
  );
}

export default function CheckboxCardClosedComponent() {
  return (
    <Stack maxW="320px">
      <CheckboxCard label="Next.js" description="Best for apps" />
      <CheckboxCard defaultChecked label="Vite" description="Best for SPAs" addon="No config" />
    </Stack>
  );
}
