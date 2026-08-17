import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type {
  CheckboxRootBaseProps,
  CreateCheckboxGroupReturn,
  CreateCheckboxReturn,
} from "./checkbox.types";

/**
 * The five names the slot recipe carries, where the machine's anatomy carries four: `group` is
 * Ark's own extension, with no machine part behind it and no recipe body. `checkboxCard` — the other
 * public component on this machine — does not name the slot at all.
 */
export type CheckboxSlot = "root" | "label" | "control" | "indicator" | "group";

/**
 * What a part reads: the machine, plus the resolved slot classes.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreateCheckboxReturn}'s getters) instead of spreading it.
 */
export interface CheckboxContextValue extends CreateCheckboxReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<CheckboxSlot, string>>;
}

export const [CheckboxProvider, useCheckboxContext] =
  createComponentContext<CheckboxContextValue>("Checkbox");

/**
 * The slot classes the Root resolved, for an element of your own inside a checkbox:
 *
 * ```tsx
 * const styles = useCheckboxStyles();
 * <Box class={styles().label}>…</Box>
 * ```
 *
 * A machine component publishes its class map on the component context rather than through
 * `createSlotRecipeContext`, so this reads `slots` off that context. It throws outside a
 * `Checkbox.Root`.
 */
export const useCheckboxStyles = (): Accessor<Record<CheckboxSlot, string>> =>
  useCheckboxContext().slots;

/**
 * The surrounding `<CheckboxGroup>`, or `undefined`.
 *
 * **Only the non-strict reader is bound, and the hole in the middle is the point**: a checkbox
 * outside any group is the ordinary case rather than a mistake, so nothing here may throw. That is
 * Chakra's own `strict: false` on this one context, where every other context in the family raises.
 */
export const [CheckboxGroupProvider, , useCheckboxGroupContext] =
  createComponentContext<CreateCheckboxGroupReturn>("CheckboxGroup");

export const { PropsProvider, usePropsContext } = createPropsContext<CheckboxRootBaseProps>();
