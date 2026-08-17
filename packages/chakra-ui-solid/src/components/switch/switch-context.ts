import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { CreateSwitchReturn, SwitchRootBaseProps } from "./switch.types";

/**
 * The five names the slot recipe carries, where the machine's anatomy carries four: `indicator` is
 * Chakra's own extension, with no machine part behind it, and the recipe styles it through
 * `_checked` off an attribute the component writes by hand.
 */
export type SwitchSlot = "root" | "label" | "control" | "thumb" | "indicator";

/**
 * What a part reads: the machine, plus the resolved slot classes.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreateSwitchReturn}'s getters) instead of spreading it.
 */
export interface SwitchContextValue extends CreateSwitchReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<SwitchSlot, string>>;
}

export const [SwitchProvider, useSwitchContext] =
  createComponentContext<SwitchContextValue>("Switch");

/**
 * The slot classes the Root resolved, for an element of your own inside a switch:
 *
 * ```tsx
 * const styles = useSwitchStyles();
 * <Box class={styles().label}>…</Box>
 * ```
 *
 * A machine component publishes its class map on the component context rather than through
 * `createSlotRecipeContext`, so this reads `slots` off that context. It throws outside a
 * `Switch.Root`.
 */
export const useSwitchStyles = (): Accessor<Record<SwitchSlot, string>> => useSwitchContext().slots;

export const { PropsProvider, usePropsContext } = createPropsContext<SwitchRootBaseProps>();
