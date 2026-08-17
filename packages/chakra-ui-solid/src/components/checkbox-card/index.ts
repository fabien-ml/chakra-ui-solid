// The store hook is the checkbox's, under the name this namespace uses for it — one machine, two
// public components. `createCheckboxCard()` and `createCheckbox()` are the same function, so a
// machine built with either drives either Root.
export { createCheckbox as createCheckboxCard } from "../checkbox";
export type {
  CheckboxCardAddonProps,
  CheckboxCardCheckedChangeDetails,
  CheckboxCardCheckedState,
  CheckboxCardContentProps,
  CheckboxCardContextProps,
  CheckboxCardControlProps,
  CheckboxCardDescriptionProps,
  CheckboxCardElementIds,
  CheckboxCardHiddenInputProps,
  CheckboxCardIndicatorProps,
  CheckboxCardLabelProps,
  CheckboxCardRootBaseProps,
  CheckboxCardRootProps,
  CheckboxCardRootPropsProviderProps,
  CheckboxCardRootProviderProps,
  CheckboxCardVariantProps,
  CreateCheckboxCardProps,
  CreateCheckboxCardReturn,
} from "./checkbox-card.types";
export type { CheckboxCardSlot } from "./checkbox-card-context";
export { useCheckboxCardContext, useCheckboxCardStyles } from "./checkbox-card-context";
export {
  CheckboxCardAddon,
  CheckboxCardContent,
  CheckboxCardContext,
  CheckboxCardControl,
  CheckboxCardDescription,
  CheckboxCardHiddenInput,
  CheckboxCardIndicator,
  CheckboxCardLabel,
} from "./checkbox-card-parts";
export {
  CheckboxCardRoot,
  CheckboxCardRootPropsProvider,
  CheckboxCardRootProvider,
} from "./checkbox-card-root";
export * as CheckboxCard from "./namespace";
