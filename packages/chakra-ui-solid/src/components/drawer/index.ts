// A drawer runs the dialog machine, so this is `createDialog` under a second name rather than a
// second factory — the alias Chakra's own `drawer/index.ts` spells `useDialog as useDrawer`. From
// the module, not from `../dialog`, so this entry does not drag the dialog recipe's CSS into a
// consumer's stylesheet.
export { createDialog as createDrawer } from "../dialog/create-dialog";
export type {
  CreateDrawerProps,
  CreateDrawerReturn,
  DrawerActionTriggerProps,
  DrawerBackdropProps,
  DrawerBodyProps,
  DrawerCloseTriggerProps,
  DrawerContentProps,
  DrawerContextProps,
  DrawerDescriptionProps,
  DrawerElementIds,
  DrawerFocusOutsideEvent,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerInteractOutsideEvent,
  DrawerOpenChangeDetails,
  DrawerPointerDownOutsideEvent,
  DrawerPositionerProps,
  DrawerPresenceProps,
  DrawerPropsProviderProps,
  DrawerRootBaseProps,
  DrawerRootProps,
  DrawerRootProviderProps,
  DrawerTitleProps,
  DrawerTriggerProps,
  DrawerTriggerValueChangeDetails,
  DrawerVariantProps,
} from "./drawer.types";
export type { DrawerSlot } from "./drawer-context";
export { useDrawerContext, useDrawerStyles } from "./drawer-context";
export {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerContext,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer-parts";
export { DrawerPropsProvider, DrawerRoot, DrawerRootProvider } from "./drawer-root";
export * as Drawer from "./namespace";
