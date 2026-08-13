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

export const { PropsProvider, usePropsContext } = createPropsContext<CollapsibleRootBaseProps>();
