import type {
  HTMLChakraProps,
  PropsProviderProps,
  PropTypes,
  RenderStrategyProps,
  SkinVariant,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type * as tabs from "@zag-js/tabs";

/** The ids of the five elements the machine addresses. Useful for composition. */
export interface TabsElementIds extends tabs.ElementIds {}

/** What `onValueChange` receives — the value of the tab that is now selected. */
export interface TabsValueChangeDetails extends tabs.ValueChangeDetails {}

/** What `onFocusChange` receives — the value of the tab that now has focus. */
export interface TabsFocusChangeDetails extends tabs.FocusChangeDetails {}

/** What `navigate` receives when a trigger is an anchor: the value, the element and its `href`. */
export interface TabsNavigateDetails extends tabs.NavigateDetails {}

/** The strings the machine puts on the DOM — today just the tablist's `aria-label`. */
export interface TabsIntlTranslations extends tabs.IntlTranslations {}

/**
 * Everything {@link createTabs} takes: the machine's own props, minus the two the library injects.
 *
 * `dir` and `getRootNode` are those two, and they are missing because they come from the locale and
 * environment contexts rather than from the consumer — `@zag-js/tabs`'s `props.ts` lists fifteen
 * keys, and these are the other thirteen.
 */
export interface CreateTabsProps {
  /**
   * Seeds every id the machine hands out — the root is `tabs:{id}`, a trigger
   * `tabs:{id}:trigger-{value}`, a panel `tabs:{id}:content-{value}`. Defaults to a generated id,
   * and **does not become the root element's own `id`**: pass `ids` to control the attributes
   * themselves.
   */
  id?: string;
  /** Override individual element ids, for pointing an ARIA relationship at a specific one. */
  ids?: TabsElementIds;
  /** The controlled selected value. Pass `undefined` for uncontrolled. */
  value?: string | null;
  /** The tab a fresh, uncontrolled set of tabs starts on. */
  defaultValue?: string | null;
  /** Called whenever the selected tab changes, from either side. */
  onValueChange?: (details: TabsValueChangeDetails) => void;
  /** Called whenever the focused tab changes, which under `manual` is not the selected one. */
  onFocusChange?: (details: TabsFocusChangeDetails) => void;
  /**
   * Whether an arrow key selects the tab it moves to, or only focuses it.
   *
   * @default "automatic"
   */
  activationMode?: "manual" | "automatic";
  /**
   * Which arrow keys move between triggers. `horizontal` uses ←/→, `vertical` uses ↑/↓.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether arrow-key focus wraps from the last trigger back to the first.
   *
   * @default true
   */
  loopFocus?: boolean;
  /**
   * Whether the tabs form a composite widget — one tab stop for the whole list, and a focusable
   * panel. Turning it off takes the triggers and the panels out of the tab order, for tabs nested
   * inside another widget that owns the focus.
   *
   * @default true
   */
  composite?: boolean;
  /** Whether clicking the selected trigger clears the selection instead of doing nothing. */
  deselectable?: boolean;
  /** The `aria-label` the tablist carries. */
  translations?: TabsIntlTranslations;
  /**
   * What to do when a selected trigger is an anchor — by default the machine clicks the link. Pass
   * `null` to select the tab and navigate nowhere.
   */
  navigate?: ((details: TabsNavigateDetails) => void) | null;
}

/**
 * The connected machine, as a **stable object of reactive getters and delegating methods** rather
 * than the snapshot `{ ...api }` React can take. Each read goes back to the live machine, so
 * `<Show when={tabs.value === "one"}>` in a consumer's own tree tracks it.
 *
 * **Nothing is added to it**, where `CreateCollapsibleReturn` adds `unmounted`: a set of tabs has
 * one panel per value and each mounts on its own schedule, so "is it in the DOM" is a fact about a
 * `Tabs.Content`, not about the machine. Each Content resolves it from the Root's render strategy.
 *
 * The members Zag ships are inherited rather than re-declared, so a member a Zag minor adds arrives
 * here for free and its own JSDoc is what a consumer hovers.
 */
export interface CreateTabsReturn extends Readonly<tabs.Api<PropTypes>> {}

/**
 * The slot recipe's four variants, spelled out rather than inherited from the generated
 * `TabsVariantProps`, so each carries a description a reader can use and a type they can read — a
 * generated type has neither. A variant renamed in the recipe is still caught: the
 * `createSlotClasses` call on the Root is typed against the generated one, so the call, not this
 * interface, is what stops drifting silently.
 *
 * **No `@default` tag on any of the four.** The recipe's `defaultVariants` is
 * `{ size: "md", variant: "line" }` and it resolves them itself, so restating one here would be a
 * second source of truth that drifts on a preset bump.
 */
export interface TabsVariantProps {
  /** Whether the triggers stretch to fill the list. */
  fitted?: ConditionalValue<boolean>;
  /** Where the triggers sit along the list when they do not fill it. */
  justify?: ConditionalValue<"start" | "center" | "end" | SkinVariant<"tabs", "justify">>;
  /** How much padding and type size the triggers carry. */
  size?: ConditionalValue<"sm" | "md" | "lg" | SkinVariant<"tabs", "size">>;
  /** Which visual treatment marks the selected tab. */
  variant?: ConditionalValue<
    "line" | "subtle" | "enclosed" | "outline" | "plain" | SkinVariant<"tabs", "variant">
  >;
}

/**
 * The Root's own props, without the div's — what a `PropsProvider` above it may supply.
 *
 * `RenderStrategyProps` is **inherited** here where Dialog's writes the same two props out, and the
 * difference is the `@default` a docs table prints: Chakra passes Tabs no `defaultProps` at all, so
 * `lazyMount` and `unmountOnExit` keep the shared interface's own `false`/`false`.
 *
 * `unstyled` is not a member for the reason Collapsible's is not: it is one of the three props every
 * component in this library takes from `ChakraStylingProps` (`as`, `render`, `unstyled`), and
 * declaring one of them here would list it as a prop this component added.
 */
export interface TabsRootBaseProps extends CreateTabsProps, RenderStrategyProps, TabsVariantProps {}

/**
 * `id` comes from {@link CreateTabsProps}, not from the `div`: on the Root it seeds the machine's
 * scope rather than naming the element, so it is a `string` where every Solid DOM `id` is
 * `string | false | undefined`. `<Tabs.RootProvider>` is the other way round, and its `id` is the
 * element's.
 */
export interface TabsRootProps extends Omit<HTMLChakraProps<"div">, "id">, TabsRootBaseProps {}

/**
 * The render strategy and the variants are repeated here rather than reached through
 * {@link TabsRootBaseProps}, because this Root takes no machine props at all — it is handed a
 * machine instead. Chakra splits the two the same way, into `TabsRootProviderBaseProps`.
 */
export interface TabsRootProviderProps
  extends HTMLChakraProps<"div">,
    RenderStrategyProps,
    TabsVariantProps {
  /** A machine built by {@link createTabs}, so the consumer owns it rather than the Root. */
  value: CreateTabsReturn;
}

export interface TabsPropsProviderProps extends PropsProviderProps<TabsRootBaseProps> {}

export interface TabsListProps extends HTMLChakraProps<"div"> {}

/**
 * Both members shadow a `button` attribute of the same name, which is Ark's split too — they are
 * machine arguments, and what reaches the DOM is whatever `getTriggerProps()` makes of them:
 * `value` comes back as `data-value`, `disabled` as the real attribute plus `aria-disabled`.
 *
 * Shadowing is what narrows `disabled` from Solid's `boolean | "" | undefined` to the machine's
 * `boolean`. Chakra narrows it identically, through the `Assign` in
 * `HTMLChakraProps<"button", ArkTabs.TriggerBaseProps>`.
 */
export interface TabsTriggerProps extends Omit<HTMLChakraProps<"button">, "value" | "disabled"> {
  /**
   * Which tab this trigger selects — it pairs the trigger with the `Tabs.Content` of the same
   * value, and both ARIA relationships are built from it.
   */
  value: string;
  /** Whether this tab can be selected or focused at all. */
  disabled?: boolean;
}

export interface TabsContentProps extends HTMLChakraProps<"div"> {
  /** Which tab shows this panel — it must match a `Tabs.Trigger`'s `value`. */
  value: string;
}

/**
 * A plain styled `div` with no machine part behind it and so **no `data-part`** — the slot recipe
 * carries six names where the machine's anatomy carries five. Wrap the panels in one to give them a
 * shared box a `Tabs.Content` can size itself against.
 */
export interface TabsContentGroupProps extends HTMLChakraProps<"div"> {}

/**
 * Typed against the `div` it renders. Chakra's own `TabsIndicatorProps` extends
 * `ArkTabs.ListBaseProps`, which is a copy-paste of the line above it — the two interfaces are
 * identical anyway, since neither part takes a prop of its own.
 */
export interface TabsIndicatorProps extends HTMLChakraProps<"div"> {}

export interface TabsContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (tabs: CreateTabsReturn) => JSX.Element;
}
