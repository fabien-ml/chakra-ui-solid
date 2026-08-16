export type {
  AvatarContextProps,
  AvatarElementIds,
  AvatarFallbackProps,
  AvatarGroupProps,
  AvatarIconProps,
  AvatarImageProps,
  AvatarPropsProviderProps,
  AvatarRootBaseProps,
  AvatarRootProps,
  AvatarRootProviderProps,
  AvatarStatusChangeDetails,
  CreateAvatarProps,
  CreateAvatarReturn,
} from "./avatar.types";
export type { AvatarSlot } from "./avatar-context";
export { useAvatarContext, useAvatarStyles } from "./avatar-context";
export { AvatarGroup } from "./avatar-group";
export { AvatarContext, AvatarFallback, AvatarIcon, AvatarImage } from "./avatar-parts";
export { AvatarPropsProvider, AvatarRoot, AvatarRootProvider } from "./avatar-root";
export { createAvatar } from "./create-avatar";
export * as Avatar from "./namespace";
