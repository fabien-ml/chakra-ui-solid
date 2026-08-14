// `createField` and `deriveFieldItem` are **not** here, and deliberately: upstream ships no
// `Field.RootProvider` and exports no `useField`, so a consumer never owns the field themselves.
export type {
  FieldContextProps,
  FieldControlAttributes,
  FieldElementIds,
  FieldErrorIconProps,
  FieldErrorTextProps,
  FieldHelperTextProps,
  FieldIds,
  FieldItemIds,
  FieldItemProps,
  FieldLabelProps,
  FieldPropsProviderProps,
  FieldRequiredIndicatorProps,
  FieldRootBaseProps,
  FieldRootProps,
  FieldVariantProps,
} from "./field.types";
export type { FieldContextValue, FieldSlot } from "./field-context";
// `useOptionalFieldContext` stays package-internal: upstream exports one reader, and the second one
// exists for the form controls in this package that adopt a surrounding field without requiring one.
export { useFieldContext, useFieldStyles } from "./field-context";
export {
  FieldContext,
  FieldErrorIcon,
  FieldErrorText,
  FieldHelperText,
  FieldItem,
  FieldLabel,
  FieldRequiredIndicator,
} from "./field-parts";
export { FieldPropsProvider, FieldRoot } from "./field-root";
export * as Field from "./namespace";
