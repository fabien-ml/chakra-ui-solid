// The store hook is the radio group's, under the name this namespace uses for it — one machine,
// three public components. `createSegmentGroup()` and `createRadioGroup()` are the same function, so
// a machine built with either drives either Root. Imported from the hook's own module rather than
// the `../radio-group` barrel, which would drag `Radiomark`'s recipe into this entry's stylesheet.
export { createRadioGroup as createSegmentGroup } from "../radio-group/create-radio-group";
export * as SegmentGroup from "./namespace";
export type {
  CreateSegmentGroupProps,
  CreateSegmentGroupReturn,
  SegmentGroupContextProps,
  SegmentGroupElementIds,
  SegmentGroupIndicatorProps,
  SegmentGroupItemBaseProps,
  SegmentGroupItemContextProps,
  SegmentGroupItemHiddenInputProps,
  SegmentGroupItemProps,
  SegmentGroupItemState,
  SegmentGroupItemsProps,
  SegmentGroupItemTextProps,
  SegmentGroupPropsProviderProps,
  SegmentGroupRootBaseProps,
  SegmentGroupRootProps,
  SegmentGroupRootProviderProps,
  SegmentGroupValueChangeDetails,
  SegmentGroupVariantProps,
} from "./segment-group.types";
export type { SegmentGroupItemContextValue, SegmentGroupSlot } from "./segment-group-context";
export {
  useSegmentGroupContext,
  useSegmentGroupItemContext,
  useSegmentGroupStyles,
} from "./segment-group-context";
export {
  SegmentGroupContext,
  SegmentGroupIndicator,
  SegmentGroupItem,
  SegmentGroupItemContext,
  SegmentGroupItemHiddenInput,
  SegmentGroupItems,
  SegmentGroupItemText,
} from "./segment-group-parts";
export {
  SegmentGroupPropsProvider,
  SegmentGroupRoot,
  SegmentGroupRootProvider,
} from "./segment-group-root";
