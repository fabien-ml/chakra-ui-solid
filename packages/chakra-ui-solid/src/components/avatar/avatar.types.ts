import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
  PropTypes,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type * as avatar from "@zag-js/avatar";
import type { GroupProps } from "../group";

/** The ids of the three elements the machine addresses. Useful for composition. */
export interface AvatarElementIds extends avatar.ElementIds {}

/** What `onStatusChange` receives — `loaded` once the image decodes, `error` if it never does. */
export interface AvatarStatusChangeDetails extends avatar.StatusChangeDetails {}

/**
 * Everything {@link createAvatar} takes: the machine's own props, minus the two the library injects.
 *
 * `dir` and `getRootNode` are those two, and they are missing because they come from the locale and
 * environment contexts rather than from the consumer — `@zag-js/avatar`'s `props.ts` lists five
 * keys, and these are the other three.
 */
export interface CreateAvatarProps {
  /**
   * Seeds every id the machine hands out — the root is `avatar:{id}`, the image `avatar:{id}:image`,
   * the fallback `avatar:{id}:fallback`. Defaults to a generated id, and **does not become the root
   * element's own `id`**: pass `ids` to control the attributes themselves.
   */
  id?: string;
  /** Override individual element ids, for pointing an ARIA relationship at a specific one. */
  ids?: AvatarElementIds;
  /** Called when the image finishes loading, or gives up. */
  onStatusChange?: (details: AvatarStatusChangeDetails) => void;
}

/**
 * The connected machine, as a **stable object of reactive getters and delegating methods** rather
 * than the snapshot `{ ...api }` React can take. Each read goes back to the live machine, so
 * `<Show when={avatar.loaded}>` in a consumer's own tree tracks it.
 *
 * **Nothing is added to it**, where `CreateCollapsibleReturn` adds `unmounted`: an avatar has no
 * presence and no render strategy. The machine shows one of the image and the fallback by putting
 * `hidden` on the other, and both stay in the DOM either way.
 *
 * The members Zag ships are inherited rather than re-declared, so a member a Zag minor adds arrives
 * here for free and its own JSDoc is what a consumer hovers.
 */
export interface CreateAvatarReturn extends Readonly<avatar.Api<PropTypes>> {}

/**
 * The slot recipe's four variants, spelled out rather than inherited from the generated
 * `AvatarVariantProps`, so each carries a description a reader can use and a type they can read — a
 * generated type has neither. A variant renamed in the recipe is still caught: the
 * `createSlotClasses` call on the Root is typed against the generated one, so the call, not this
 * interface, is what stops drifting silently.
 *
 * **No `@default` tag on any of the four.** The recipe's `defaultVariants` is
 * `{ size: "md", shape: "full", variant: "subtle" }` and it resolves them itself, so restating one
 * here would be a second source of truth that drifts on a preset bump.
 */
export interface AvatarVariantProps extends PresetVariantProps<"avatar"> {
  /**
   * How big the avatar is, and the type size its initials take with it. `full` takes the size of
   * whatever box it is placed in instead of a scale step.
   */
  size?: ConditionalValue<
    "full" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | PresetVariant<"avatar", "size">
  >;
  /** How the area behind the fallback is filled, for the avatars that have no image. */
  variant?: ConditionalValue<"solid" | "subtle" | "outline" | PresetVariant<"avatar", "variant">>;
  /** How far the corners are rounded — `full` is the circle. */
  shape?: ConditionalValue<"square" | "rounded" | "full" | PresetVariant<"avatar", "shape">>;
  /** Drops the ring an avatar draws around itself when it sits in a row of them. */
  borderless?: ConditionalValue<boolean>;
}

/**
 * The Root's own props, without the div's — what a `PropsProvider` above it may supply, and what
 * {@link AvatarGroupProps} passes down for a whole row.
 *
 * `unstyled` is **not** here, where Chakra's `AvatarRootBaseProps` carries it through
 * `UnstyledProp`. It is one of the three props every component in this library takes from
 * `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them on a component's own
 * interface puts it on that component's props table as though the component added it.
 */
export interface AvatarRootBaseProps extends CreateAvatarProps, AvatarVariantProps {}

/**
 * `id` comes from {@link CreateAvatarProps}, not from the `div`: on the Root it seeds the machine's
 * scope rather than naming the element, so it is a `string` where every Solid DOM `id` is
 * `string | false | undefined`. `<Avatar.RootProvider>` is the other way round, and its `id` is the
 * element's.
 */
export interface AvatarRootProps extends Omit<HTMLChakraProps<"div">, "id">, AvatarRootBaseProps {}

/**
 * The variants are repeated here rather than reached through {@link AvatarRootBaseProps}, because
 * this Root takes no machine props at all — it is handed a machine instead. Chakra splits the two
 * the same way, into `AvatarRootProviderBaseProps`.
 */
export interface AvatarRootProviderProps extends HTMLChakraProps<"div">, AvatarVariantProps {
  /** A machine built by {@link createAvatar}, so the consumer owns it rather than the Root. */
  value: CreateAvatarReturn;
}

export interface AvatarPropsProviderProps extends PropsProviderProps<AvatarRootBaseProps> {}

export interface AvatarImageProps extends HTMLChakraProps<"img"> {}

export interface AvatarFallbackProps extends HTMLChakraProps<"div"> {
  /**
   * A name to take the initials from — `"Segun Adebayo"` shows `SA`, a single word shows its first
   * letter. Children of your own win over it, and an {@link AvatarIconProps Avatar.Icon} is what
   * shows when there is neither.
   */
  name?: string;
}

export interface AvatarIconProps extends HTMLChakraProps<"svg"> {}

export interface AvatarContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (avatar: CreateAvatarReturn) => JSX.Element;
}

/**
 * A `Group`'s props plus the avatar variants, which the group supplies to every avatar under it
 * rather than applying to itself.
 */
export interface AvatarGroupProps extends GroupProps, AvatarVariantProps {}
