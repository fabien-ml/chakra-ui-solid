import {
  createComponentContext,
  createPropsContext,
  type RenderStrategyProps,
} from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { CreateTabsReturn, TabsRootBaseProps } from "./tabs.types";

/**
 * The six names the slot recipe carries, where the machine's anatomy carries five: `contentGroup` is
 * Chakra's own, with no machine part behind it.
 */
export type TabsSlot = "root" | "list" | "trigger" | "content" | "contentGroup" | "indicator";

/**
 * What a part reads: the machine, plus the two things a family of independently-gated panels needs.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreateTabsReturn}'s getters) instead of spreading it.
 */
export interface TabsContextValue extends CreateTabsReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<TabsSlot, string>>;
  /**
   * The Root's `lazyMount`/`unmountOnExit`, which every `Tabs.Content` resolves for itself.
   *
   * This is the inversion of Dialog's rule that a presence is created on the Root: N panels need N
   * presence machines, so the Root can only hand down the two props they are resolved against.
   *
   * **A stable object with reactive getters, never a getter returning a fresh one** — a new identity
   * on every read would rebuild every panel's presence machine each time the strategy is consulted.
   */
  renderStrategy: RenderStrategyProps;
}

export const [TabsProvider, useTabsContext] = createComponentContext<TabsContextValue>("Tabs");

/**
 * The slot classes the Root resolved, for an element of your own inside a set of tabs:
 *
 * ```tsx
 * const styles = useTabsStyles();
 * <Box class={styles().content}>…</Box>
 * ```
 *
 * A machine component publishes its class map on the component context rather than through
 * `createSlotRecipeContext`, so this reads `slots` off that context. The value is the accessor the
 * machine-less rows' `useStyles` hands back, and it throws outside a `Tabs.Root` for the same reason
 * they do.
 */
export const useTabsStyles = (): Accessor<Record<TabsSlot, string>> => useTabsContext().slots;

export const { PropsProvider, usePropsContext } = createPropsContext<TabsRootBaseProps>();
