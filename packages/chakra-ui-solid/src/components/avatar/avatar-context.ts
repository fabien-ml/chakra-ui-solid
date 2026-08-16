import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { AvatarRootBaseProps, CreateAvatarReturn } from "./avatar.types";

/** The three names the machine's anatomy and the slot recipe happen to agree on, exactly. */
export type AvatarSlot = "root" | "image" | "fallback";

/**
 * What a part reads: the machine, plus the slot classes the Root resolved once.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreateAvatarReturn}'s getters) instead of spreading it, so the styling layer never
 * masquerades as the behavior layer.
 */
export interface AvatarContextValue extends CreateAvatarReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<AvatarSlot, string>>;
}

export const [AvatarProvider, useAvatarContext] =
  createComponentContext<AvatarContextValue>("Avatar");

/**
 * The slot classes the Root resolved, for an element of your own inside an Avatar:
 *
 * ```tsx
 * const styles = useAvatarStyles();
 * <Box class={styles().fallback}>…</Box>
 * ```
 *
 * A machine component publishes its class map on the component context rather than through
 * `createSlotRecipeContext`, so this reads `slots` off that context. The value is the accessor the
 * machine-less rows' `useStyles` hands back, and it throws outside an `Avatar.Root` for the same
 * reason they do.
 */
export const useAvatarStyles = (): Accessor<Record<AvatarSlot, string>> => useAvatarContext().slots;

export const { PropsProvider, usePropsContext } = createPropsContext<AvatarRootBaseProps>();
