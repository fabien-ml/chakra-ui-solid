import {
  createComponentContext,
  createPropsContext,
  type Presence,
  type RenderStrategyProps,
} from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { CreateDialogReturn, DialogRootBaseProps } from "./dialog.types";

/**
 * What a part reads: the machine, plus the three things only a presence family needs.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreateDialogReturn}'s getters) instead of spreading it.
 */
export interface DialogContextValue extends CreateDialogReturn {
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
