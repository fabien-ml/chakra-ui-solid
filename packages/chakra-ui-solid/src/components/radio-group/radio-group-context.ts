import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type {
  CreateRadioGroupReturn,
  RadioGroupItemBaseProps,
  RadioGroupItemState,
  RadioGroupRootBaseProps,
} from "./radio-group.types";

/**
 * The eight names the slot recipe carries, where the machine's anatomy carries six: `itemAddon` and
 * `itemIndicator` are Chakra's own extensions. Neither has a recipe body **in this recipe** — the
 * `radioCard` one is what gives them declarations — so they exist here as names on the class map and
 * nothing else.
 */
export type RadioGroupSlot =
  | "root"
  | "label"
  | "item"
  | "itemText"
  | "itemControl"
  | "indicator"
  | "itemAddon"
  | "itemIndicator";

/**
 * What a part reads: the machine, plus the resolved slot classes.
 *
 * Composition rather than inheritance — this **holds** the connected machine (as
 * {@link CreateRadioGroupReturn}'s getters) instead of spreading it.
 */
export interface RadioGroupContextValue extends CreateRadioGroupReturn {
  /** One class string per slot, resolved once on the Root — never once per item. */
  slots: Accessor<Record<RadioGroupSlot, string>>;
}

export const [RadioGroupProvider, useRadioGroupContext] =
  createComponentContext<RadioGroupContextValue>("RadioGroup");

/**
 * **The repeated part's context — one machine, N of these.**
 *
 * It carries **who I am**, never what I do: the item's own props bag, plus the eight states the
 * machine derives from it. Every part inside a `<RadioGroup.Item>` reads {@link itemProps} off here
 * and hands it straight back to the *group's* getters — `getItemTextProps(item.itemProps)` — so the
 * machine still owns every attribute and this context owns only the identity it needs to be asked
 * about.
 *
 * The eight state members are reactive getters over one memo, so a part reads `item.checked` and
 * gets the current answer rather than the one the item was built with. The React version needs two
 * contexts for this — a snapshot `ItemState` it re-provides on every render, and the props bag
 * beside it — because a snapshot is the only shape React can put on a context. Solid re-reads
 * instead of re-rendering, so one context carries both.
 */
export interface RadioGroupItemContextValue extends Readonly<RadioGroupItemState> {
  /**
   * The item's own props, **exactly as the group's getters take them back**. A reactive bag, not a
   * copy: an item whose `value` comes from a signal keeps every part in step with it.
   */
  readonly itemProps: RadioGroupItemBaseProps;
}

export const [RadioGroupItemProvider, useRadioGroupItemContext] =
  createComponentContext<RadioGroupItemContextValue>(
    "RadioGroupItem",
    "RadioGroup item parts must be rendered inside a RadioGroup.Item.",
  );

/**
 * The slot classes the Root resolved, for an element of your own inside a radio group:
 *
 * ```tsx
 * const styles = useRadioGroupStyles();
 * <Box class={styles().itemText}>…</Box>
 * ```
 *
 * A machine component publishes its class map on the component context rather than through
 * `createSlotRecipeContext`, so this reads `slots` off that context. It throws outside a
 * `RadioGroup.Root`.
 */
export const useRadioGroupStyles = (): Accessor<Record<RadioGroupSlot, string>> =>
  useRadioGroupContext().slots;

export const { PropsProvider, usePropsContext } = createPropsContext<RadioGroupRootBaseProps>();
