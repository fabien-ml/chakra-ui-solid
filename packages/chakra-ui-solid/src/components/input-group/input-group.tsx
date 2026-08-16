import {
  composeStyle,
  type HTMLChakraProps,
  mergeProps,
  type PlainCssValue,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { CssProperties } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import { type Component, children, merge, omit, Show } from "solid-js";
import { Group } from "../group";
import { InputAddon, type InputAddonProps } from "../input-addon";
import { InputElement, type InputElementProps } from "../input-element";
import { type InputGroupContextValue, InputGroupProvider } from "./input-group-context";

export interface InputGroupProps extends HTMLChakraProps<"div"> {
  /** The element drawn over the inner leading edge of the control — an icon, a unit, a prefix. */
  startElement?: JSX.Element;
  /** The props to pass to the start element. */
  startElementProps?: InputElementProps;
  /** The element drawn over the inner trailing edge of the control. */
  endElement?: JSX.Element;
  /** The props to pass to the end element. */
  endElementProps?: InputElementProps;
  /** The addon welded to the leading edge of the group, outside the control. */
  startAddon?: JSX.Element;
  /** The props to pass to the start addon. */
  startAddonProps?: InputAddonProps;
  /** The addon welded to the trailing edge of the group, outside the control. */
  endAddon?: JSX.Element;
  /** The props to pass to the end addon. */
  endAddonProps?: InputAddonProps;
  /**
   * How much to give back from the padding the start element earns the control, as a CSS length.
   * The control is padded by the field's own height less this, so a smaller element leaves less
   * dead space before the text.
   *
   * A plain length rather than Panda's conditional form: it rides an inline custom property, which
   * has no breakpoints, so a responsive spelling is a type error here instead of a prop that
   * silently does nothing.
   *
   * @default "0px"
   */
  startOffset?: PlainCssValue<CssProperties["paddingInlineStart"]>;
  /**
   * The same, for the end element.
   *
   * @default "0px"
   */
  endOffset?: PlainCssValue<CssProperties["paddingInlineEnd"]>;
}

/** The group's own inputs, which are not the `div`'s. */
const OWN_KEYS = [
  "startElement",
  "startElementProps",
  "endElement",
  "endElementProps",
  "startAddon",
  "startAddonProps",
  "endAddon",
  "endAddonProps",
  "startOffset",
  "endOffset",
  "children",
] as const;

/**
 * InputGroup — a field with something drawn inside it, welded to it, or both.
 *
 * ```tsx
 * <InputGroup startElement={<SearchIcon />} endAddon=".com">
 *   <Input placeholder="yoursite" />
 * </InputGroup>
 * ```
 *
 * An **element** is an overlay: it sits on top of the field and the field is padded to keep its
 * text clear of it. An **addon** is a neighbour: it takes width of its own, and the group collapses
 * the seam between the two so they read as one control.
 *
 * The control takes that padding by **reading this group's context**, so it may be nested, wrapped
 * or absent — anything that renders an `Input`, a `NativeSelect.Field` or another opted-in control
 * somewhere below works, and a control that has not opted in keeps its own recipe's padding rather
 * than losing it. Chakra reaches the child directly (`cloneElement`) and so can only ever pad an
 * immediate one.
 *
 * `startOffset` / `endOffset` give some of that padding back, for an element narrower than the
 * field is tall.
 */
export const InputGroup: Component<InputGroupProps> = (props) => {
  // `width` is a style prop and therefore a default that has to be resolved by *value*: written as
  // `<Group width="full" {...rest}>` the compiled spread is a presence merge, so a wrapper
  // forwarding an unset `width` would delete it and the group would shrink to its content
  // (`CLAUDE.md`, *The third hazard*). The `width: ["full"]` `staticCss` row in the preset is what
  // keeps the rule behind the class in existence once the literal is no longer in anyone's JSX.
  const merged = withDefaults(props, {
    width: "full",
    startOffset: "0px",
    endOffset: "0px",
  } satisfies Partial<InputGroupProps>);

  // **Four JSX-valued props, each read three times** — the gate, the body, and the derived value
  // below it. A JSX prop compiles to a lazy getter that runs `createComponent` on every read, so
  // read raw a `startElement={<Icon />}` would be built three times and two thrown away, taking
  // whatever state they had set up with them. `children()` collapses that to one construction, and
  // its memo is lazy, so a slot nobody passed builds nothing (`CLAUDE.md`, *The second hazard*).
  const startAddon = children(() => merged.startAddon);
  const startElement = children(() => merged.startElement);
  const endElement = children(() => merged.endElement);
  const endAddon = children(() => merged.endAddon);

  // Read off the resolved slots rather than off the props again, which is the same rule once more:
  // `merged.startElement !== undefined` here would be a fourth construction.
  const context: InputGroupContextValue = {
    hasStartElement: () => Boolean(startElement()),
    hasEndElement: () => Boolean(endElement()),
  };

  // Each of the four prop bags is **bound to a name**, and that is not tidiness: a JSX spread of a
  // *member expression* (`{...merged.startAddonProps}`) compiles to a memo, and the untracked read
  // then lands in the component receiving it rather than here — measured, three
  // `STRICT_READ_UNTRACKED` diagnostics from one such spread, because a factory component reads
  // `as` and `render` in its body. The adapter's `mergeProps`, not Solid's `merge`, is what makes an
  // accessor source legal: any bag with a dynamic key set is enumerated by `renderStyled`'s
  // `Object.keys` in the receiving body, and only this proxy answers a structural question without
  // subscribing to it. SkeletonText's `rootProps` is the same shape for the same reason.
  const startAddonProps = mergeProps(() => merged.startAddonProps ?? {});
  const startElementProps = mergeProps(() => merged.startElementProps ?? {});
  const endElementProps = mergeProps(() => merged.endElementProps ?? {});
  const endAddonProps = mergeProps(() => merged.endAddonProps ?? {});

  const elementProps = merge(omit(merged, ...OWN_KEYS, "style"), {
    // Derived from the markup, so it goes **after** the consumer's props rather than before them:
    // whether the row has a seam to collapse is a fact about what was passed, not a default.
    get attached() {
      return Boolean(startAddon() || endAddon());
    },
    get style(): JSX.HTMLAttributes<HTMLElement>["style"] {
      return composeStyle(
        {
          "--input-group-start-offset": merged.startOffset,
          "--input-group-end-offset": merged.endOffset,
        },
        merged.style,
      );
    },
  });

  return (
    <InputGroupProvider value={context}>
      <Group {...elementProps}>
        <Show when={startAddon()}>
          <InputAddon {...startAddonProps}>{startAddon()}</InputAddon>
        </Show>
        <Show when={startElement()}>
          {/* Before the spread, so `startElementProps` can take it back — Chakra's order. It stays
              a JSX attribute rather than a `withDefaults` key because it is a *style prop*: written
              here it is a literal Panda extracts, and moved into an object literal it would need a
              `staticCss` row to exist at all. */}
          <InputElement pointerEvents="none" {...startElementProps}>
            {startElement()}
          </InputElement>
        </Show>
        {merged.children}
        <Show when={endElement()}>
          <InputElement placement="end" {...endElementProps}>
            {endElement()}
          </InputElement>
        </Show>
        <Show when={endAddon()}>
          <InputAddon {...endAddonProps}>{endAddon()}</InputAddon>
        </Show>
      </Group>
    </InputGroupProvider>
  );
};
