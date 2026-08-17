import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { RadioGroupItemContextValue } from "../radio-group";
import type { CreateSegmentGroupReturn, SegmentGroupRootBaseProps } from "./segment-group.types";

/**
 * The six names this slot recipe carries — the machine's anatomy exactly, with nothing added and
 * nothing dropped. `radioGroup` extends the same six with `itemAddon` and `itemIndicator`; this one
 * does not.
 *
 * Two of the six have **no declarations at all**: `label` and `itemControl` are names on the class
 * map and nothing else, and neither has a component here. `indicator` is the opposite — the one
 * recipe in the family that gives that slot a body, which is the sliding highlight this component
 * exists for.
 */
export type SegmentGroupSlot = "root" | "label" | "item" | "itemText" | "itemControl" | "indicator";

/**
 * What a part reads: the machine, plus the resolved slot classes.
 *
 * The machine is the radio group's — one `@zag-js/radio-group` under three names — and the classes
 * are this recipe's. That pairing is the whole of what makes a segmented control a third public
 * component rather than a third machine.
 */
export interface SegmentGroupContextValue extends CreateSegmentGroupReturn {
  /** One class string per slot, resolved once on the Root — never once per segment. */
  slots: Accessor<Record<SegmentGroupSlot, string>>;
}

/**
 * Its own context rather than the radio group's, because the value carries this recipe's slot map
 * and the two maps do not name the same slots. The React version splits the same pair the other way
 * — one Ark context for the machine, one `createSlotRecipeContext` per recipe for the classes — and
 * lands in the same place: a `RadioGroup.ItemText` inside a `SegmentGroup.Item` throws there too.
 */
export const [SegmentGroupProvider, useSegmentGroupContext] =
  createComponentContext<SegmentGroupContextValue>("SegmentGroup");

/**
 * **The repeated part's context — one machine, N of these.**
 *
 * The same shape a `<RadioGroup.Item>` publishes, and deliberately its own provider: the value is
 * identical (the segment's props bag plus the eight states the machine derives from it), but a part
 * that finds no segment around it is owed an error naming `SegmentGroup.Item` rather than one of the
 * other two components'.
 */
export interface SegmentGroupItemContextValue extends RadioGroupItemContextValue {}

export const [SegmentGroupItemProvider, useSegmentGroupItemContext] =
  createComponentContext<SegmentGroupItemContextValue>(
    "SegmentGroupItem",
    "SegmentGroup item parts must be rendered inside a SegmentGroup.Item.",
  );

/**
 * The slot classes the Root resolved, for an element of your own inside a segmented control:
 *
 * ```tsx
 * const styles = useSegmentGroupStyles();
 * <Box class={styles().item}>…</Box>
 * ```
 *
 * It throws outside a `SegmentGroup.Root`.
 */
export const useSegmentGroupStyles = (): Accessor<Record<SegmentGroupSlot, string>> =>
  useSegmentGroupContext().slots;

export const { PropsProvider, usePropsContext } = createPropsContext<SegmentGroupRootBaseProps>();
