import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
  PropTypes,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type * as zagRadioGroup from "@zag-js/radio-group";

/** The ids of the elements the machine addresses. Useful for composition. */
export interface RadioGroupElementIds extends zagRadioGroup.ElementIds {}

/** What `onValueChange` receives — the value the group has just moved to, or `null` when cleared. */
export interface RadioGroupValueChangeDetails extends zagRadioGroup.ValueChangeDetails {}

/**
 * What identifies one radio to the machine: its `value`, plus the two states it may carry on its
 * own. Every part inside a `<RadioGroup.Item>` hands this bag straight back to the group's own
 * getters, which is what lets `<RadioGroup.ItemText>` need no `value` of its own.
 */
export interface RadioGroupItemBaseProps extends zagRadioGroup.ItemProps {}

/**
 * Everything the machine knows about one radio: its identity, the two states it inherits from the
 * group, and the four pointer/focus states the machine tracks for it.
 *
 * `disabled` and `invalid` are the *resolved* states — an item is disabled when it says so **or**
 * the group does — which is why they are not the same booleans as {@link RadioGroupItemProps}'.
 */
export interface RadioGroupItemState extends zagRadioGroup.ItemState {}

/**
 * Everything {@link createRadioGroup} takes: the machine's own props, minus the two the library
 * injects.
 *
 * `dir` and `getRootNode` are those two, and they are missing because they come from the locale and
 * environment contexts rather than from the consumer — `@zag-js/radio-group`'s `props.ts` lists
 * fourteen keys, and these are the other twelve.
 */
export interface CreateRadioGroupProps {
  /**
   * Seeds every id the machine hands out — the root is `radio-group:{id}`, one item's hidden input
   * `radio-group:{id}:radio:input:{value}`. Defaults to a generated id, and **does not become the
   * root element's own `id`**: pass `ids` to control the attributes themselves.
   *
   * It is also the fallback `name` on every hidden input, so a group with no `name` still submits
   * under something stable.
   */
  id?: string;
  /**
   * Override individual element ids. The four item-level entries are **functions of the item's
   * value**, because one machine addresses N of each.
   */
  ids?: RadioGroupElementIds;
  /**
   * The controlled value — the `value` of the checked radio, or `null` for none.
   *
   * `null` means *controlled, and empty*; use `undefined` for uncontrolled.
   */
  value?: string | null;
  /** The radio checked when a fresh, uncontrolled group is rendered. */
  defaultValue?: string | null;
  /** Called whenever the checked radio changes, from either side. */
  onValueChange?: (details: RadioGroupValueChangeDetails) => void;
  /** Whether every radio in the group is disabled. Inherited from a surrounding Fieldset. */
  disabled?: boolean;
  /** Whether every radio shows its error treatment. Inherited from a surrounding Fieldset. */
  invalid?: boolean;
  /** Whether the group refuses to change while staying focusable. */
  readOnly?: boolean;
  /** Whether the form requires one of these radios to be picked. */
  required?: boolean;
  /** The `name` every hidden input submits under. Defaults to {@link CreateRadioGroupProps.id}. */
  name?: string;
  /** The id of a form elsewhere on the page that this group submits with. */
  form?: string;
  /**
   * Which way the radios run, for the arrow keys and for `data-orientation`.
   *
   * The `radioGroup` recipe styles neither value — a row of radios is laid out by whatever you put
   * them in — so this is the machine's keyboard model and an attribute to write your own rules
   * against.
   *
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
}

/**
 * The connected machine, as a **stable object of reactive getters and delegating methods** rather
 * than the snapshot `{ ...api }` React can take. Each read goes back to the live machine, so
 * `<Show when={framework.value === "solid"}>` in a consumer's own tree tracks it.
 *
 * The members Zag ships are inherited rather than re-declared, so a member a Zag minor adds arrives
 * here for free and its own JSDoc is what a consumer hovers.
 */
export interface CreateRadioGroupReturn extends Readonly<zagRadioGroup.Api<PropTypes>> {}

/**
 * The slot recipe's two variants, spelled out rather than inherited from the generated
 * `RadioGroupVariantProps`, so each carries a description a reader can use and a type they can read.
 * A variant renamed in the recipe is still caught: the `createSlotClasses` call on the Root is typed
 * against the generated one.
 *
 * **No `@default` tag on either.** The recipe's `defaultVariants` is `{ variant: "solid", size:
 * "md" }` and it resolves them itself, so restating one here would be a second source of truth that
 * drifts on a preset bump.
 */
export interface RadioGroupVariantProps extends PresetVariantProps<"radioGroup"> {
  /** The circle's size, and the gap and text size of the row it sits in. */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | PresetVariant<"radioGroup", "size">>;
  /**
   * How the circle is painted once it is checked — `solid` fills it with the palette, `outline` only
   * recolours the border and widens the dot, and `subtle` tints it.
   */
  variant?: ConditionalValue<
    "outline" | "subtle" | "solid" | PresetVariant<"radioGroup", "variant">
  >;
}

/**
 * The Root's own props, without the `div`'s — what a `PropsProvider` above it may supply.
 *
 * `unstyled` is not a member: it is one of the three props every component in this library takes
 * from `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them here would list
 * it as a prop this component added.
 */
export interface RadioGroupRootBaseProps extends CreateRadioGroupProps, RadioGroupVariantProps {}

/**
 * `id` comes from {@link CreateRadioGroupProps}, not from the `div`: on the Root it seeds the
 * machine's scope rather than naming the element, so it is a `string` where every Solid DOM `id` is
 * `string | false | undefined`. `<RadioGroup.RootProvider>` is the other way round, and its `id` is
 * the element's.
 */
export interface RadioGroupRootProps
  extends Omit<HTMLChakraProps<"div">, "id">,
    RadioGroupRootBaseProps {}

/**
 * The variants are repeated here rather than reached through {@link RadioGroupRootBaseProps},
 * because this Root takes no machine props at all — it is handed a machine instead. Chakra splits
 * the two the same way, into `RadioGroupRootProviderBaseProps`.
 */
export interface RadioGroupRootProviderProps
  extends HTMLChakraProps<"div">,
    RadioGroupVariantProps {
  /** A machine built by {@link createRadioGroup}, so the consumer owns it rather than the Root. */
  value: CreateRadioGroupReturn;
}

export interface RadioGroupPropsProviderProps extends PropsProviderProps<RadioGroupRootBaseProps> {}

export interface RadioGroupLabelProps extends HTMLChakraProps<"div"> {}

/**
 * One radio's row. `value` names it to the machine; `disabled` and `invalid` are this radio's own,
 * on top of whatever the group carries.
 *
 * **It renders a `<label>`**, which is what makes the whole row clickable — the machine points its
 * `for` at the `<RadioGroup.ItemHiddenInput>` inside it. The React version types this one `"div"`
 * while Zag hands it `htmlFor`; the element has always been a label, so ours is typed as one.
 */
export interface RadioGroupItemProps extends HTMLChakraProps<"label">, RadioGroupItemBaseProps {}

export interface RadioGroupItemTextProps extends HTMLChakraProps<"span"> {}

export interface RadioGroupItemControlProps extends HTMLChakraProps<"div"> {}

/**
 * The circle, drawn as a `<Radiomark unstyled>` on the machine's `itemControl` element — so this
 * part and {@link RadioGroupItemControlProps} describe **the same element**, one plain and one with
 * the mark inside it. Use one or the other, never both.
 */
export interface RadioGroupItemIndicatorProps extends HTMLChakraProps<"span"> {}

export interface RadioGroupItemHiddenInputProps extends HTMLChakraProps<"input"> {}

export interface RadioGroupContextProps {
  /** Receives the machine, so a consumer can read the group's state without a component of their own. */
  children: (radioGroup: CreateRadioGroupReturn) => JSX.Element;
}

export interface RadioGroupItemContextProps {
  /** Receives one radio's state, for a glyph or a label that changes with it. */
  children: (item: RadioGroupItemState) => JSX.Element;
}
