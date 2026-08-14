// `createFieldset` is **not** here, and deliberately: Chakra re-exports Ark's `useFieldsetContext`
// but neither `Fieldset.RootProvider` nor `useFieldset`, so a consumer never owns the fieldset.
export type {
  CreateFieldsetReturn,
  FieldsetContentProps,
  FieldsetContextProps,
  FieldsetErrorTextProps,
  FieldsetHelperTextProps,
  FieldsetIds,
  FieldsetLegendProps,
  FieldsetPropsProviderProps,
  FieldsetRootBaseProps,
  FieldsetRootProps,
  FieldsetVariantProps,
} from "./fieldset.types";
export type { FieldsetContextValue, FieldsetSlot } from "./fieldset-context";
// `useOptionalFieldsetContext` stays package-internal: upstream exports one reader, and the second
// one exists for `createField`, which inherits the group's `disabled` without requiring a group.
export { useFieldsetContext } from "./fieldset-context";
export {
  FieldsetContent,
  FieldsetContext,
  FieldsetErrorText,
  FieldsetHelperText,
  FieldsetLegend,
} from "./fieldset-parts";
export { FieldsetPropsProvider, FieldsetRoot } from "./fieldset-root";
export * as Fieldset from "./namespace";
