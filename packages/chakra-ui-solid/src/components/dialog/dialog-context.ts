import {
  createComponentContext,
  createPropsContext,
  type Presence,
  type RenderStrategyProps,
} from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { CreateDialogReturn, DialogRootBaseProps } from "./dialog.types";

/**
 * The ten names the slot recipe carries, where the machine's anatomy carries seven: `header`,
 * `body` and `footer` are Chakra's own, with no machine part behind them.
 *
 * `dialogSlotNames` lists **eleven** entries — `backdrop` appears twice. The duplicate is
 * source-only: both entries build the same `dialog__backdrop` class into the same key, so the
 * `Object.fromEntries` that assembles the map collapses them and the element carries the class
 * once. Nothing here has to de-duplicate it.
 *
 * `closeTrigger` is the *slot* key. The DOM attribute the machine emits for the same element is
 * `data-part="close-trigger"`, and the two are not interchangeable.
 */
export type DialogSlot =
  | "trigger"
  | "backdrop"
  | "positioner"
  | "content"
  | "title"
  | "description"
  | "closeTrigger"
  | "header"
  | "body"
  | "footer";

/**
 * What a part reads: the machine, plus the four things only a styled presence family needs.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreateDialogReturn}'s getters) instead of spreading it.
 */
export interface DialogContextValue extends CreateDialogReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<DialogSlot, string>>;
  /**
   * The Root's presence — the one Content and Positioner share. Created on the Root and never
   * inside the part it gates: Content mounts lazily, so a presence created there would see
   * `present` already true on its first run and latch to "entered", skipping the enter animation.
   */
  presence: Presence;
  /** Whether the Root's render strategy says Content and Positioner are not in the DOM at all. */
  unmounted: Accessor<boolean>;
  /**
   * The Root's `lazyMount`/`unmountOnExit`, for a part that builds a presence of its own.
   *
   * **A stable object with reactive getters, never a getter returning a fresh one** — the Backdrop
   * reads it to build its presence, and a new identity on every read would rebuild that machine.
   */
  renderStrategy: RenderStrategyProps;
}

export const [DialogProvider, useDialogContext] =
  createComponentContext<DialogContextValue>("Dialog");

export const { PropsProvider, usePropsContext } = createPropsContext<DialogRootBaseProps>();
