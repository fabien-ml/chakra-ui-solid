// Adapted from hope-ui `e9c2f81`, `packages/components/src/box/box.tsx` (34 lines), re-pointed at
// the official Chakra preset. Same author, MIT — ours, forked on copy (`CLAUDE.md`, *Reference use*).

import { type PatchHtmlProps, type RenderProp, renderStyled } from "@chakra-ui-solid/core";
import type { JsxStyleProps } from "@chakra-ui-solid/styled-system/types";
import type { JSX, ValidComponent } from "@solidjs/web";
import type { Component } from "solid-js";

/** The DOM props Box forwards to the rendered element. */
type BoxElementProps = JSX.HTMLAttributes<HTMLElement>;

export interface BoxProps
  extends Omit<PatchHtmlProps<BoxElementProps>, keyof JsxStyleProps>,
    JsxStyleProps {
  /** Render as a different element/component. Defaults to `div`. */
  as?: ValidComponent;
  /** Render-prop override that receives Box's computed DOM props. */
  render?: RenderProp<BoxElementProps>;
}

/**
 * Box — the foundational styled primitive, and the proof that the toolchain works end to end. It
 * takes every Chakra-style style prop (`p`, `bg`, `mt`, `_hover`, `colorPalette`, …) and no recipe.
 *
 * The split-style-props → `css()` → `cx()` work lives in `renderStyled`, the one mechanism every
 * component and part shares; Box hands its props to it and defaults `as` to `div`. The atomic rules
 * `css()` names are emitted by the **consumer's own** `panda codegen` over their source — this
 * library publishes zero CSS — and they are byte-stable across server and client, so Box works
 * under SSR.
 */
export const Box: Component<BoxProps> = (props) =>
  renderStyled<BoxElementProps>({
    as: (props.as ?? "div") as ValidComponent,
    render: props.render,
    props: props as unknown as BoxElementProps,
  });
