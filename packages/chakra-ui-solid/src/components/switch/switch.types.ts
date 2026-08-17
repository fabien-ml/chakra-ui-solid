import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
  PropTypes,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type * as zagSwitch from "@zag-js/switch";

/** The ids of the five elements the machine addresses. Useful for composition. */
export interface SwitchElementIds extends zagSwitch.ElementIds {}

/** What `onCheckedChange` receives — the state the switch has just moved to. */
export interface SwitchCheckedChangeDetails extends zagSwitch.CheckedChangeDetails {}

/**
 * Everything {@link createSwitch} takes: the machine's own props, minus the two the library injects.
 *
 * `dir` and `getRootNode` are those two, and they are missing because they come from the locale and
 * environment contexts rather than from the consumer — `@zag-js/switch`'s `props.ts` lists fifteen
 * keys, and these are the other thirteen.
 */
export interface CreateSwitchProps {
  /**
   * Seeds every id the machine hands out — the root is `switch:{id}`, the hidden input
   * `switch:{id}:input`. Defaults to a generated id, and **does not become the root element's own
   * `id`**: pass `ids` to control the attributes themselves.
   */
  id?: string;
  /** Override individual element ids, for pointing an ARIA relationship at a specific one. */
  ids?: SwitchElementIds;
  /**
   * The localized string naming the control for assistive technology.
   *
   * @default "switch"
   */
  label?: string;
  /** The controlled checked state. Pass `undefined` for uncontrolled. */
  checked?: boolean;
  /**
   * The state a fresh, uncontrolled switch starts in.
   *
   * @default false
   */
  defaultChecked?: boolean;
  /** Called whenever the checked state changes, from either side. */
  onCheckedChange?: (details: SwitchCheckedChangeDetails) => void;
  /** Whether the switch can be toggled or focused at all. Inherited from a surrounding Field. */
  disabled?: boolean;
  /** Whether the switch shows its error treatment. Inherited from a surrounding Field. */
  invalid?: boolean;
  /** Whether the switch refuses to change while staying focusable. Inherited from a Field. */
  readOnly?: boolean;
  /** Whether the form requires this switch to be on. Inherited from a surrounding Field. */
  required?: boolean;
  /** The hidden input's `name`, for form submission. */
  name?: string;
  /** The id of a form elsewhere on the page that this switch submits with. */
  form?: string;
  /**
   * The hidden input's `value`, for form submission.
   *
   * @default "on"
   */
  value?: string | number;
}

/**
 * The connected machine, as a **stable object of reactive getters and delegating methods** rather
 * than the snapshot `{ ...api }` React can take. Each read goes back to the live machine, so
 * `<Show when={activate.checked}>` in a consumer's own tree tracks it.
 *
 * The members Zag ships are inherited rather than re-declared, so a member a Zag minor adds arrives
 * here for free and its own JSDoc is what a consumer hovers.
 */
export interface CreateSwitchReturn extends Readonly<zagSwitch.Api<PropTypes>> {}

/**
 * The slot recipe's two variants, spelled out rather than inherited from the generated
 * `SwittchVariantProps`, so each carries a description a reader can use and a type they can read.
 * A variant renamed in the recipe is still caught: the `createSlotClasses` call on the Root is typed
 * against the generated one.
 *
 * **No `@default` tag on either.** The recipe's `defaultVariants` is `{ variant: "solid", size:
 * "md" }` and it resolves them itself, so restating one here would be a second source of truth that
 * drifts on a preset bump.
 */
export interface SwitchVariantProps extends PresetVariantProps<"swittch"> {
  /** The track's width and height, and the indicator's font size. */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | PresetVariant<"swittch", "size">>;
  /**
   * How the track and thumb are drawn — `solid` puts a full-height thumb on a full-height track,
   * `raised` shrinks the track to a rail and lets the thumb sit proud of it.
   */
  variant?: ConditionalValue<"solid" | "raised" | PresetVariant<"swittch", "variant">>;
}

/**
 * The Root's own props, without the label's — what a `PropsProvider` above it may supply.
 *
 * `unstyled` is not a member: it is one of the three props every component in this library takes
 * from `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them here would list
 * it as a prop this component added.
 */
export interface SwitchRootBaseProps extends CreateSwitchProps, SwitchVariantProps {}

/**
 * `id` comes from {@link CreateSwitchProps}, not from the `label`: on the Root it seeds the
 * machine's scope rather than naming the element, so it is a `string` where every Solid DOM `id` is
 * `string | false | undefined`. `<Switch.RootProvider>` is the other way round, and its `id` is the
 * element's.
 */
export interface SwitchRootProps
  extends Omit<HTMLChakraProps<"label">, "id">,
    SwitchRootBaseProps {}

/**
 * The variants are repeated here rather than reached through {@link SwitchRootBaseProps}, because
 * this Root takes no machine props at all — it is handed a machine instead. Chakra splits the two
 * the same way, into `SwitchRootProviderBaseProps`.
 */
export interface SwitchRootProviderProps extends HTMLChakraProps<"label">, SwitchVariantProps {
  /** A machine built by {@link createSwitch}, so the consumer owns it rather than the Root. */
  value: CreateSwitchReturn;
}

export interface SwitchPropsProviderProps extends PropsProviderProps<SwitchRootBaseProps> {}

export interface SwitchLabelProps extends HTMLChakraProps<"span"> {}

/**
 * `children` defaults to `<Switch.Thumb />`, so `<Switch.Control />` is the whole track. Passing
 * `null` renders an empty track, which is what the React version's `defaultProps` does too.
 */
export interface SwitchControlProps extends HTMLChakraProps<"span"> {}

export interface SwitchThumbProps extends HTMLChakraProps<"span"> {}

/**
 * The two halves of a track indicator: `children` is drawn while the switch is on, `fallback` while
 * it is off. Both are ordinary JSX, and either may be left out.
 */
export interface SwitchIndicatorProps extends HTMLChakraProps<"span"> {
  /** Drawn in the indicator's place while the switch is off. */
  fallback?: JSX.Element;
}

/**
 * The same pair, for the glyph inside the thumb. This part carries **no slot of its own** — see
 * {@link SwitchThumbIndicator}.
 */
export interface SwitchThumbIndicatorProps extends HTMLChakraProps<"span"> {
  /** Drawn in the thumb indicator's place while the switch is off. */
  fallback?: JSX.Element;
}

export interface SwitchHiddenInputProps extends HTMLChakraProps<"input"> {}

export interface SwitchContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (switchApi: CreateSwitchReturn) => JSX.Element;
}
