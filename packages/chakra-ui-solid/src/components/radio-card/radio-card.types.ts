import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
  RenderProp,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, JSX } from "@solidjs/web";
import type {
  CreateRadioGroupProps,
  CreateRadioGroupReturn,
  RadioGroupElementIds,
  RadioGroupItemBaseProps,
  RadioGroupItemState,
  RadioGroupValueChangeDetails,
} from "../radio-group";

/**
 * The machine is `@zag-js/radio-group`, unchanged — a card is a radio group wearing a second slot
 * recipe, so the five names below are the group's types under the names this namespace uses for
 * them.
 *
 * Empty `extends` interfaces rather than aliases, where the shape allows one: the props-table
 * generator folds a heritage clause and cannot follow an alias, so a `type X = Y` here would leave
 * `RadioCard.Root`'s table with its five variants and none of the machine props.
 */
export interface CreateRadioCardProps extends CreateRadioGroupProps {}

/** The connected machine — reactive getters over `@zag-js/radio-group`, exactly as a RadioGroup gets. */
export interface CreateRadioCardReturn extends CreateRadioGroupReturn {}

/** The ids of the elements the machine addresses. Useful for composition. */
export interface RadioCardElementIds extends RadioGroupElementIds {}

/** What `onValueChange` receives — the value the group has just moved to, or `null` when cleared. */
export interface RadioCardValueChangeDetails extends RadioGroupValueChangeDetails {}

/** What identifies one card to the machine: its `value`, plus the two states it may carry alone. */
export interface RadioCardItemBaseProps extends RadioGroupItemBaseProps {}

/** Everything the machine knows about one card — the same eight fields a radio's item carries. */
export interface RadioCardItemState extends RadioGroupItemState {}

/**
 * The slot recipe's five variant keys, spelled out rather than inherited from the generated
 * `RadioCardVariantProps`, so each carries a description a reader can use and a type they can read.
 * A variant renamed in the recipe is still caught: the `createSlotClasses` call on the Root is typed
 * against the generated one.
 *
 * **No `@default` tag on any of them.** The recipe's `defaultVariants` is `{ size: "md", variant:
 * "outline", align: "start", orientation: "horizontal" }` and it resolves them itself, so restating
 * one here would be a second source of truth that drifts on a preset bump. `justify` is the one with
 * no default at all — left unset, `--radio-card-justify` is never written and the control and the
 * content fall back to the browser's own `justify-content`.
 */
export interface RadioCardVariantProps extends PresetVariantProps<"radioCard"> {
  /**
   * The card's padding, its inner gap, the item's text style and the indicator's circle.
   *
   * Three steps here where `radioGroup` has four: a card has no `xs`.
   */
  size?: ConditionalValue<"sm" | "md" | "lg" | PresetVariant<"radioCard", "size">>;
  /** How the card and its circle are painted, at rest and once picked. */
  variant?: ConditionalValue<
    "surface" | "subtle" | "outline" | "solid" | PresetVariant<"radioCard", "variant">
  >;
  /** Where the control's contents sit along the main axis. Unset by default. */
  justify?: ConditionalValue<"start" | "end" | "center" | PresetVariant<"radioCard", "justify">>;
  /** Where they sit across it, and how the control's own text is aligned. */
  align?: ConditionalValue<"start" | "end" | "center" | PresetVariant<"radioCard", "align">>;
  /**
   * Whether the control stacks its children in a row or a column — the card's **layout**, not the
   * machine's keyboard model.
   *
   * This is the one name the two halves of a radio card disagree about, and the recipe wins it:
   * `orientation` is a `radioCard` variant, so it is consumed here and never reaches the machine.
   * The arrow keys and the group's `aria-orientation` stay on the machine's own `vertical` whichever
   * way a card is laid out — which is upstream's behaviour, and it is why {@link
   * CreateRadioCardProps} still carries an `orientation` of its own: build the machine with
   * {@link createRadioCard} and drive a `<RadioCard.RootProvider>` to set that one.
   */
  orientation?: ConditionalValue<
    "vertical" | "horizontal" | PresetVariant<"radioCard", "orientation">
  >;
}

/**
 * The Root's own props, without the `div`'s — what a `PropsProvider` above it may supply.
 *
 * The machine half is {@link CreateRadioCardProps} **minus `orientation`**, which
 * {@link RadioCardVariantProps} claims for the recipe.
 */
export interface RadioCardRootBaseProps
  extends Omit<CreateRadioCardProps, "orientation">,
    RadioCardVariantProps {}

/**
 * `id` comes from the machine props, not from the `div`: on the Root it seeds the machine's scope
 * rather than naming the element, so it is a `string` where every Solid DOM `id` is `string | false
 * | undefined`. `<RadioCard.RootProvider>` is the other way round, and its `id` is the element's.
 */
export interface RadioCardRootProps
  extends Omit<HTMLChakraProps<"div">, "id">,
    RadioCardRootBaseProps {}

/**
 * The variants are repeated here rather than reached through {@link RadioCardRootBaseProps}, because
 * this Root takes no machine props at all — it is handed a machine instead.
 */
export interface RadioCardRootProviderProps extends HTMLChakraProps<"div">, RadioCardVariantProps {
  /** A machine built by {@link createRadioCard}, so the consumer owns it rather than the Root. */
  value: CreateRadioCardReturn;
}

export interface RadioCardPropsProviderProps extends PropsProviderProps<RadioCardRootBaseProps> {}

export interface RadioCardLabelProps extends HTMLChakraProps<"div"> {}

/**
 * One card. `value` names it to the machine; `disabled` and `invalid` are this card's own, on top of
 * whatever the group carries.
 *
 * **It renders a `<label>`**, which is what makes the whole card clickable — the machine points its
 * `for` at the `<RadioCard.ItemHiddenInput>` inside it. The React version types this one `"div"`
 * while Zag hands it `htmlFor`; the element has always been a label, so ours is typed as one.
 */
export interface RadioCardItemProps extends HTMLChakraProps<"label">, RadioCardItemBaseProps {}

export interface RadioCardItemTextProps extends HTMLChakraProps<"span"> {}

/** The dimmer line under the title. A slot with no machine part and no state attributes of its own. */
export interface RadioCardItemDescriptionProps extends HTMLChakraProps<"div"> {}

/**
 * The clickable box the card's contents sit in.
 *
 * **Not a machine part**, unlike `RadioGroup.ItemControl` — the component writes six `data-*`
 * attributes off the item's own state and deliberately carries none of the seven others the
 * machine's `getItemControlProps()` would have added.
 */
export interface RadioCardItemControlProps extends HTMLChakraProps<"div"> {}

/** The column of text inside the control — an `ItemText`, usually with an `ItemDescription` under it. */
export interface RadioCardItemContentProps extends HTMLChakraProps<"div"> {}

/** The strip below the control — supporting text, a badge, a price. Inside the card's `<label>`. */
export interface RadioCardItemAddonProps extends HTMLChakraProps<"div"> {}

/**
 * The circle, drawn as a `<Radiomark unstyled>` on the `itemIndicator` slot — which is where this
 * recipe puts the whole `radiomark` body, one slot over from `radioGroup`'s `itemControl`.
 */
export interface RadioCardItemIndicatorProps extends HTMLChakraProps<"span"> {
  /**
   * Draws instead of the circle while this card is picked — a tick, a logo, whatever the card wants.
   *
   * A **function** handed this part's computed props: the composed `class` (which carries the
   * `itemIndicator` slot, and with it the whole mark), `aria-hidden`, and every other prop written
   * on the `RadioCard.ItemIndicator`. Spread them onto your glyph, or the mark's styles land
   * nowhere.
   */
  checked?: RenderProp<ComponentProps<"span">>;
}

export interface RadioCardItemHiddenInputProps extends HTMLChakraProps<"input"> {}

export interface RadioCardContextProps {
  /** Receives the machine, so a consumer can read the group's state without a component of their own. */
  children: (radioCard: CreateRadioCardReturn) => JSX.Element;
}

export interface RadioCardItemContextProps {
  /** Receives one card's state, for a glyph or a label that changes with it. */
  children: (item: RadioCardItemState) => JSX.Element;
}
