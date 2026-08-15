export { createTabs } from "./create-tabs";
export * as Tabs from "./namespace";
export type {
  CreateTabsProps,
  CreateTabsReturn,
  TabsContentGroupProps,
  TabsContentProps,
  TabsContextProps,
  TabsElementIds,
  TabsFocusChangeDetails,
  TabsIndicatorProps,
  TabsIntlTranslations,
  TabsListProps,
  TabsNavigateDetails,
  TabsPropsProviderProps,
  TabsRootBaseProps,
  TabsRootProps,
  TabsRootProviderProps,
  TabsTriggerProps,
  TabsValueChangeDetails,
  TabsVariantProps,
} from "./tabs.types";
export type { TabsSlot } from "./tabs-context";
export { useTabsContext, useTabsStyles } from "./tabs-context";
export {
  TabsContent,
  TabsContentGroup,
  TabsContext,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "./tabs-parts";
export { TabsPropsProvider, TabsRoot, TabsRootProvider } from "./tabs-root";
