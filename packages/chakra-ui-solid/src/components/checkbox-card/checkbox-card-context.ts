import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { CheckboxCardRootBaseProps, CreateCheckboxCardReturn } from "./checkbox-card.types";

/**
 * The seven names this slot recipe carries, where the machine's anatomy carries four.
 *
 * It is `checkbox`'s list with `group` dropped and `description`, `addon` and `content` added — the
 * three that turn a box beside a label into a card. Only `control` and `label` have a machine part
 * behind them; `indicator` is Chakra's own (the anatomy names it, the component never calls
 * `getIndicatorProps()`), and the other three are Chakra-only slots with no counterpart at all.
 */
export type CheckboxCardSlot =
  | "root"
  | "control"
  | "label"
  | "description"
  | "addon"
  | "indicator"
  | "content";

/**
 * What a part reads: the machine, plus the resolved slot classes.
 *
 * The machine is the checkbox's — one `@zag-js/checkbox` under two names — and the
 * classes are this recipe's. That pairing is the whole of what makes a card a second public
 * component rather than a second machine.
 */
export interface CheckboxCardContextValue extends CreateCheckboxCardReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<CheckboxCardSlot, string>>;
}

/**
 * Its own context rather than the checkbox's, because the value carries this recipe's slot map and
 * the two maps do not name the same slots. The React version splits the same pair the other way —
 * one Ark context for the machine, one `createSlotRecipeContext` per recipe for the classes — and
 * lands in the same place: a `Checkbox.Label` inside a `CheckboxCard.Root` throws there too, because
 * the checkbox styles context is the half that is missing.
 */
export const [CheckboxCardProvider, useCheckboxCardContext] =
  createComponentContext<CheckboxCardContextValue>("CheckboxCard");

/**
 * The slot classes the Root resolved, for an element of your own inside a checkbox card:
 *
 * ```tsx
 * const styles = useCheckboxCardStyles();
 * <Box class={styles().addon}>…</Box>
 * ```
 *
 * It throws outside a `CheckboxCard.Root`.
 */
export const useCheckboxCardStyles = (): Accessor<Record<CheckboxCardSlot, string>> =>
  useCheckboxCardContext().slots;

export const { PropsProvider, usePropsContext } = createPropsContext<CheckboxCardRootBaseProps>();
