import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { RadioGroupItemContextValue } from "../radio-group";
import type { CreateRadioCardReturn, RadioCardRootBaseProps } from "./radio-card.types";

/**
 * The ten names this slot recipe carries, where the machine's anatomy carries six.
 *
 * It is `radioGroup`'s list plus `itemContent` and `itemDescription` — and it is the recipe that
 * gives `itemAddon` and `itemIndicator` their declarations, which the `radioGroup` one withholds.
 * `indicator` is the one name with **no body here at all**: it is a real anatomy part (the sliding
 * highlight a segmented control draws) and a card has no component for it.
 */
export type RadioCardSlot =
  | "root"
  | "label"
  | "item"
  | "itemText"
  | "itemControl"
  | "indicator"
  | "itemAddon"
  | "itemIndicator"
  | "itemContent"
  | "itemDescription";

/**
 * What a part reads: the machine, plus the resolved slot classes.
 *
 * The machine is the radio group's — one `@zag-js/radio-group` under two names — and the classes are
 * this recipe's. That pairing is the whole of what makes a card a second public component rather
 * than a second machine.
 */
export interface RadioCardContextValue extends CreateRadioCardReturn {
  /** One class string per slot, resolved once on the Root — never once per card. */
  slots: Accessor<Record<RadioCardSlot, string>>;
}

/**
 * Its own context rather than the radio group's, because the value carries this recipe's slot map
 * and the two maps do not name the same slots. The React version splits the same pair the other way
 * — one Ark context for the machine, one `createSlotRecipeContext` per recipe for the classes — and
 * lands in the same place: a `RadioGroup.ItemText` inside a `RadioCard.Item` throws there too.
 */
export const [RadioCardProvider, useRadioCardContext] =
  createComponentContext<RadioCardContextValue>("RadioCard");

/**
 * **The repeated part's context — one machine, N of these.**
 *
 * The same shape a `<RadioGroup.Item>` publishes, and deliberately its own provider: the value is
 * identical (the card's props bag plus the eight states the machine derives from it), but a part
 * that finds no card around it is owed an error naming `RadioCard.Item` rather than the other
 * component's.
 */
export interface RadioCardItemContextValue extends RadioGroupItemContextValue {}

export const [RadioCardItemProvider, useRadioCardItemContext] =
  createComponentContext<RadioCardItemContextValue>(
    "RadioCardItem",
    "RadioCard item parts must be rendered inside a RadioCard.Item.",
  );

/**
 * The slot classes the Root resolved, for an element of your own inside a radio card:
 *
 * ```tsx
 * const styles = useRadioCardStyles();
 * <Box class={styles().itemAddon}>…</Box>
 * ```
 *
 * It throws outside a `RadioCard.Root`.
 */
export const useRadioCardStyles = (): Accessor<Record<RadioCardSlot, string>> =>
  useRadioCardContext().slots;

export const { PropsProvider, usePropsContext } = createPropsContext<RadioCardRootBaseProps>();
