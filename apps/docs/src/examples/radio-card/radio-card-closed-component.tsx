import type { JSX } from "@solidjs/web";
import { RadioCard as ChakraRadioCard, HStack } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";

export interface RadioCardItemProps extends ChakraRadioCard.ItemProps {
  icon?: JSX.Element;
  label?: JSX.Element;
  description?: JSX.Element;
  addon?: JSX.Element;
  /** Pass `null` for a card with no circle at all. */
  indicator?: JSX.Element;
  indicatorPlacement?: "start" | "end" | "inside";
  // The part's own prop type, not the element's: `width` and `height` are style props on a
  // `chakra` element, so the raw `ComponentProps<"input">` disagrees with it on both.
  inputProps?: ChakraRadioCard.ItemHiddenInputProps;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the item on the props it is read from.
function RadioCardItem(props: RadioCardItemProps) {
  // Named rather than spread as an expression: a member access or a call inside a JSX spread
  // compiles to a memo, and the receiving part then reads that memo in its own body —
  // `STRICT_READ_UNTRACKED`, reported against the part with nothing pointing back here.
  const itemProps = omit(
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
  // the **server** build, where the same spread on the client hands it an empty bag.
  const inputProps = props.inputProps ?? {};

  return (
    <ChakraRadioCard.Item {...itemProps}>
      <ChakraRadioCard.ItemHiddenInput {...inputProps} />
      <ChakraRadioCard.ItemControl>
        <CardBody {...props} />
      </ChakraRadioCard.ItemControl>
      <CardAddon {...props} />
    </ChakraRadioCard.Item>
  );
}

/**
 * Everything inside the control, as a component of its own.
 *
 * That is the whole reason it exists: a `children()` allocates in the owner it is *created* in, so
 * resolving these slots in `RadioCardItem`'s body above would build the default
 * `<RadioCard.ItemIndicator />` one owner too high — outside the `RadioCard.Item` whose context it
 * reads — and it would throw. Down here every slot is built inside the card.
 */
function CardBody(props: RadioCardItemProps) {
  const icon = children(() => props.icon);
  const label = children(() => props.label);
  const description = children(() => props.description);

  // One read of `props.indicator`, inside one `children()` call — the prop is a getter that runs
  // `createComponent` on every read, and three gates below ask about it.
  //
  // `!== undefined`, never `??`: `indicator={null}` means *no circle*, and `??` would put the
  // default back.
  const mark = children(() => {
    const provided = props.indicator;
    return provided !== undefined ? provided : <ChakraRadioCard.ItemIndicator />;
  });

  const placement = () => props.indicatorPlacement ?? "end";
  const hasContent = () => icon() != null || label() != null || description() != null;

  const content = () => (
    <>
      {icon()}
      <Show when={label() != null}>
        <ChakraRadioCard.ItemText>{label()}</ChakraRadioCard.ItemText>
      </Show>
      <Show when={description() != null}>
        <ChakraRadioCard.ItemDescription>{description()}</ChakraRadioCard.ItemDescription>
      </Show>
      <Show when={placement() === "inside"}>{mark()}</Show>
    </>
  );

  return (
    <>
      <Show when={placement() === "start"}>{mark()}</Show>
      <Show when={hasContent()}>
        {/* The column exists to hold the circle beside the text, so a card with no circle does not
            need one. */}
        <Show when={mark() != null} fallback={content()}>
          <ChakraRadioCard.ItemContent>{content()}</ChakraRadioCard.ItemContent>
        </Show>
      </Show>
      <Show when={placement() === "end"}>{mark()}</Show>
    </>
  );
}

/** The band under the control, and the same `children()` reasoning as {@link CardBody}. */
function CardAddon(props: RadioCardItemProps) {
  const addon = children(() => props.addon);

  return (
    <Show when={addon() != null}>
      <ChakraRadioCard.ItemAddon>{addon()}</ChakraRadioCard.ItemAddon>
    </Show>
  );
}

const RadioCardRoot = ChakraRadioCard.Root;
const RadioCardLabel = ChakraRadioCard.Label;

export default function RadioCardClosedComponent() {
  return (
    <RadioCardRoot defaultValue="next">
      <RadioCardLabel>Select framework</RadioCardLabel>
      <HStack align="stretch">
        <RadioCardItem value="next" label="Next.js" description="Best for apps" />
        <RadioCardItem value="vite" label="Vite" description="Best for SPAs" />
        <RadioCardItem value="astro" label="Astro" description="Best for static sites" />
      </HStack>
    </RadioCardRoot>
  );
}
