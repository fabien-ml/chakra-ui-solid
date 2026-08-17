import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type {
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
  CheckboxElementIds,
  CreateCheckboxProps,
  CreateCheckboxReturn,
} from "../checkbox";

/**
 * The machine is `@zag-js/checkbox`, unchanged — a card is a checkbox wearing a second slot recipe,
 * so the five names below are the checkbox's types under the names this namespace uses for them.
 *
 * Empty `extends` interfaces rather than aliases, where the shape allows one: the props-table
 * generator folds a heritage clause and cannot follow an alias, so a `type X = Y` here would leave
 * `CheckboxCard.Root`'s table with its five variants and none of the thirteen machine props.
 */
export interface CreateCheckboxCardProps extends CreateCheckboxProps {}

/** The connected machine — reactive getters over `@zag-js/checkbox`, exactly as a Checkbox gets. */
export interface CreateCheckboxCardReturn extends CreateCheckboxReturn {}

/** The ids of the four elements the machine addresses. Useful for composition. */
export interface CheckboxCardElementIds extends CheckboxElementIds {}

/** What `onCheckedChange` receives — the state the card has just moved to. */
export interface CheckboxCardCheckedChangeDetails extends CheckboxCheckedChangeDetails {}

/** `true`, `false`, or `"indeterminate"` — the third state a parent card shows over a set. */
export type CheckboxCardCheckedState = CheckboxCheckedState;

/**
 * The slot recipe's five variant keys, spelled out rather than inherited from the generated
 * `CheckboxCardVariantProps`, so each carries a description a reader can use and a type they can
 * read. A variant renamed in the recipe is still caught: the `createSlotClasses` call on the Root is
 * typed against the generated one.
 *
 * **No `@default` tag on any of them.** The recipe's `defaultVariants` is `{ size: "md", variant:
 * "outline", align: "start", orientation: "horizontal" }` and it resolves them itself, so restating
 * one here would be a second source of truth that drifts on a preset bump. `justify` is the one with
 * no default at all — left unset, `--checkbox-card-justify` is never written and the control and the
 * content fall back to their own `justify-content: normal`.
 */
export interface CheckboxCardVariantProps extends PresetVariantProps<"checkboxCard"> {
  /** The card's padding, its inner gap, the label's text style and the indicator's box. */
  size?: ConditionalValue<"sm" | "md" | "lg" | PresetVariant<"checkboxCard", "size">>;
  /** How the card and its indicator are painted, at rest and once ticked. */
  variant?: ConditionalValue<
    "surface" | "subtle" | "outline" | "solid" | PresetVariant<"checkboxCard", "variant">
  >;
  /** Where the control and the content sit along the main axis. Unset by default. */
  justify?: ConditionalValue<"start" | "end" | "center" | PresetVariant<"checkboxCard", "justify">>;
  /** Where they sit across it, and how the content's own text is aligned. */
  align?: ConditionalValue<"start" | "end" | "center" | PresetVariant<"checkboxCard", "align">>;
  /** Whether the control stacks its children in a row or a column. */
  orientation?: ConditionalValue<
    "vertical" | "horizontal" | PresetVariant<"checkboxCard", "orientation">
  >;
}

/**
 * The Root's own props, without the label's — what a `RootPropsProvider` above it may supply.
 *
 * The machine half is {@link CreateCheckboxCardProps}, reached through the checkbox row rather
 * than re-declared: the two components take the same machine and the same thirteen keys.
 */
export interface CheckboxCardRootBaseProps
  extends CreateCheckboxCardProps,
    CheckboxCardVariantProps {}

/**
 * `id` comes from the machine props, not from the `label`: on the Root it seeds the machine's scope
 * rather than naming the element, so it is a `string` where every Solid DOM `id` is `string | false
 * | undefined`. `<CheckboxCard.RootProvider>` is the other way round, and its `id` is the element's.
 */
export interface CheckboxCardRootProps
  extends Omit<HTMLChakraProps<"label">, "id">,
    CheckboxCardRootBaseProps {}

/**
 * The variants are repeated here rather than reached through {@link CheckboxCardRootBaseProps},
 * because this Root takes no machine props at all — it is handed a machine instead.
 */
export interface CheckboxCardRootProviderProps
  extends HTMLChakraProps<"label">,
    CheckboxCardVariantProps {
  /** A machine built by {@link createCheckboxCard}, so the consumer owns it rather than the Root. */
  value: CreateCheckboxCardReturn;
}

export interface CheckboxCardRootPropsProviderProps
  extends PropsProviderProps<CheckboxCardRootBaseProps> {}

/**
 * The box the card's contents live in — the element that reads `--checkbox-card-justify` and
 * `--checkbox-card-align`, takes the `size` padding, and turns with `orientation`.
 *
 * **Its children are not defaulted**, unlike `Checkbox.Control`: a card is composed out of
 * `Content`, `Label`, `Description` and `Indicator`, and there is no one-element shorthand for it.
 */
export interface CheckboxCardControlProps extends HTMLChakraProps<"div"> {}

/** The column of text inside the control — a `Label`, usually with a `Description` under it. */
export interface CheckboxCardContentProps extends HTMLChakraProps<"div"> {}

export interface CheckboxCardLabelProps extends HTMLChakraProps<"span"> {}

/**
 * The dimmer line under the label. It is **not** a machine part — the anatomy has no `description`
 * — so this element's `data-scope`, `data-part`, `data-disabled` and `data-state` are written by the
 * component out of context rather than merged from a prop getter.
 */
export interface CheckboxCardDescriptionProps extends HTMLChakraProps<"div"> {}

/**
 * Plain `HTMLChakraProps<"svg">`, and the absence is the point: `Checkbox.Indicator` takes `checked`
 * and `indeterminate` render props to replace the glyph for one state each, and this one takes
 * neither — upstream's `CheckboxCardIndicatorProps` declares no overrides. To draw something else,
 * leave the `CheckboxCard.Indicator` out and put your own element in the control.
 */
export interface CheckboxCardIndicatorProps extends HTMLChakraProps<"svg"> {}

/** The strip below the control — supporting text, a badge, a price. Outside the clickable box. */
export interface CheckboxCardAddonProps extends HTMLChakraProps<"div"> {}

export interface CheckboxCardHiddenInputProps extends HTMLChakraProps<"input"> {}

export interface CheckboxCardContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (checkboxCard: CreateCheckboxCardReturn) => JSX.Element;
}
