import { createComponentContext, createPropsContext, type Presence } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { CreatePopoverReturn, PopoverRootBaseProps } from "./popover.types";

/**
 * The thirteen names the slot recipe carries, where the machine's anatomy carries ten: `header`,
 * `body` and `footer` are Chakra's own, with no machine part behind them.
 *
 * Two of the thirteen are never asked for. `indicator` has a slot and a machine part but no
 * exported component — `PopoverIndicator` is defined upstream and appears in neither `index.ts`
 * nor `namespace.ts`, and the port keeps the omission. `anchor` has both a slot and a component,
 * and the component asks for no class: upstream wires it with `withContext(…, undefined)`.
 *
 * `closeTrigger` is the *slot* key. The DOM attribute the machine emits for the same element is
 * `data-part="close-trigger"`, and the two are not interchangeable.
 */
export type PopoverSlot =
  | "arrow"
  | "arrowTip"
  | "anchor"
  | "trigger"
  | "indicator"
  | "positioner"
  | "content"
  | "title"
  | "description"
  | "closeTrigger"
  | "header"
  | "body"
  | "footer";

/**
 * What a part reads: the machine, plus the three things only a styled presence family needs.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreatePopoverReturn}'s getters) instead of spreading it.
 *
 * It carries no `renderStrategy`, where Dialog's context does: that member exists there for the
 * Backdrop, which builds a presence machine of its own and needs the Root's `lazyMount` /
 * `unmountOnExit` to resolve it. No Popover part builds one — Content and Positioner share the
 * Root's — so nothing below would read it.
 */
export interface PopoverContextValue extends CreatePopoverReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<PopoverSlot, string>>;
  /**
   * The Root's presence — the one Content and Positioner share. Created on the Root and never
   * inside the part it gates: under `lazyMount` the Content mounts late, so a presence created
   * there would see `present` already true on its first run and latch to "entered", skipping the
   * enter animation.
   */
  presence: Presence;
  /** Whether the Root's render strategy says Content and Positioner are not in the DOM at all. */
  unmounted: Accessor<boolean>;
}

export const [PopoverProvider, usePopoverContext] =
  createComponentContext<PopoverContextValue>("Popover");

export const { PropsProvider, usePropsContext } = createPropsContext<PopoverRootBaseProps>();
