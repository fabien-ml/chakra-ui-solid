import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { CollapsibleRootBaseProps, CreateCollapsibleReturn } from "./collapsible.types";

/** The four names the machine's anatomy and the slot recipe happen to agree on, exactly. */
export type CollapsibleSlot = "root" | "trigger" | "content" | "indicator";

/**
 * What a part reads: the machine, plus the slot classes the Root resolved once.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreateCollapsibleReturn}'s getters) instead of spreading it, so the styling layer never
 * masquerades as the behavior layer.
 */
export interface CollapsibleContextValue extends CreateCollapsibleReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<CollapsibleSlot, string>>;
}

export const [CollapsibleProvider, useCollapsibleContext] =
  createComponentContext<CollapsibleContextValue>("Collapsible");

/**
 * The slot classes the Root resolved, for an element of your own inside a Collapsible:
 *
 * ```tsx
 * const styles = useCollapsibleStyles();
 * <Box class={styles().content}>…</Box>
 * ```
 *
 * A machine component publishes its class map on the component context rather than through
 * `createSlotRecipeContext`, so this reads `slots` off that context. The value is the accessor the
 * machine-less rows' `useStyles` hands back, and it throws outside a `Collapsible.Root` for the
 * same reason they do.
 */
export const useCollapsibleStyles = (): Accessor<Record<CollapsibleSlot, string>> =>
  useCollapsibleContext().slots;

export const { PropsProvider, usePropsContext } = createPropsContext<CollapsibleRootBaseProps>();
