export type {
  CollapsibleContentProps,
  CollapsibleContextProps,
  CollapsibleElementIds,
  CollapsibleIndicatorProps,
  CollapsibleOpenChangeDetails,
  CollapsiblePropsProviderProps,
  CollapsibleRootBaseProps,
  CollapsibleRootProps,
  CollapsibleRootProviderProps,
  CollapsibleTriggerProps,
  CreateCollapsibleProps,
  CreateCollapsibleReturn,
} from "./collapsible.types";
export type { CollapsibleSlot } from "./collapsible-context";
export { useCollapsibleContext, useCollapsibleStyles } from "./collapsible-context";
export {
  CollapsibleContent,
  CollapsibleContext,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from "./collapsible-parts";
export {
  CollapsiblePropsProvider,
  CollapsibleRoot,
  CollapsibleRootProvider,
} from "./collapsible-root";
export { createCollapsible } from "./create-collapsible";
export * as Collapsible from "./namespace";
