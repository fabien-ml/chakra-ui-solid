import { chakra, type HTMLChakraProps } from "@chakra-ui-solid/core";
import type { ComponentProps } from "@solidjs/web";
import type { Component } from "solid-js";

/**
 * The overlay itself. `position: absolute` takes it out of flow, so the control keeps the whole
 * width of the row and the icon or label sits *on top of* the field rather than beside it — which
 * is why the control, not this, is what carries the padding that clears it.
 *
 * With no `placement` the element stays at its static position, the start of the containing block's
 * content box. That is Chakra's shape: neither inset is a default, and `placement="start"` differs
 * from omitting it wherever the containing block is padded.
 */
const StyledInputElement = chakra("div", {
  base: {
    position: "absolute",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "full",
    paddingInline: "3",
    color: "fg.muted",
    fontSize: "sm",
  },
  variants: {
    placement: {
      start: { insetInlineStart: "0" },
      end: { insetInlineEnd: "0" },
    },
  },
});

type InputElementVariantProps = Omit<
  ComponentProps<typeof StyledInputElement>,
  keyof HTMLChakraProps<"div">
>;

export interface InputElementProps extends HTMLChakraProps<"div">, InputElementVariantProps {}

/**
 * InputElement — an icon, a unit or a small button drawn *inside* an input, at either end.
 *
 * ```tsx
 * <Group>
 *   <InputElement pointerEvents="none">@</InputElement>
 *   <Input ps="10" placeholder="username" />
 * </Group>
 * ```
 *
 * `placement="end"` pins it to the trailing edge; with no `placement` it sits where it falls. It is
 * absolutely positioned, so it never takes width from the control — the control needs padding of
 * its own to keep its text clear of it.
 *
 * Decorative content wants `pointerEvents="none"` so clicks reach the field underneath; an element
 * that *is* interactive, a clear button say, leaves pointer events alone.
 */
export const InputElement: Component<InputElementProps> = (props) => (
  // `data-group-skip` **after** the spread, so it survives a consumer forwarding an unset value —
  // `merge` resolves a key by presence, and the later source is the one that is present. It is not a
  // default a consumer may take back: `Group` reads a child's position structurally
  // (`:nth-child(1 of :not([data-group-skip]))`), and this element is not in the row at all, so an
  // element that let itself be counted would collect a collapsed corner of its own and push the
  // addons on either side out of first and last place. Chakra asks the *parent* for a `skip`
  // predicate over React element identity; here the child says it, and CSS reads it.
  <StyledInputElement {...props} data-group-skip="" />
);
