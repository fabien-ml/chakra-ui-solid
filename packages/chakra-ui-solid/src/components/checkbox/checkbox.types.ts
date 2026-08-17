import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
  PropTypes,
  RenderProp,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, JSX } from "@solidjs/web";
import type * as checkbox from "@zag-js/checkbox";

/** The ids of the four elements the machine addresses. Useful for composition. */
export interface CheckboxElementIds extends checkbox.ElementIds {}

/** `true`, `false`, or `"indeterminate"` — the third state a parent checkbox shows over a set. */
export type CheckboxCheckedState = checkbox.CheckedState;

/** What `onCheckedChange` receives — the state the checkbox has just moved to. */
export interface CheckboxCheckedChangeDetails extends checkbox.CheckedChangeDetails {}

/**
 * Everything {@link createCheckbox} takes: the machine's own props, minus the two the library
 * injects.
 *
 * `dir` and `getRootNode` are those two, and they are missing because they come from the locale and
 * environment contexts rather than from the consumer — `@zag-js/checkbox`'s `props.ts` lists fifteen
 * keys, and these are the other thirteen.
 */
export interface CreateCheckboxProps {
  /**
   * Seeds every id the machine hands out — the root is `checkbox:{id}`, the hidden input
   * `checkbox:{id}:input`. Defaults to a generated id, and **does not become the root element's own
   * `id`**: pass `ids` to control the attributes themselves.
   */
  id?: string;
  /** Override individual element ids, for pointing an ARIA relationship at a specific one. */
  ids?: CheckboxElementIds;
  /** The controlled checked state. Pass `undefined` for uncontrolled. */
  checked?: CheckboxCheckedState;
  /** The state a fresh, uncontrolled checkbox starts in. */
  defaultChecked?: CheckboxCheckedState;
  /** Called whenever the checked state changes, from either side. */
  onCheckedChange?: (details: CheckboxCheckedChangeDetails) => void;
  /** Whether the checkbox can be toggled or focused at all. Inherited from a surrounding Field. */
  disabled?: boolean;
  /** Whether the checkbox shows its error treatment. Inherited from a surrounding Field. */
  invalid?: boolean;
  /** Whether the checkbox refuses to change while staying focusable. Inherited from a Field. */
  readOnly?: boolean;
  /** Whether the form requires this box to be ticked. Inherited from a surrounding Field. */
  required?: boolean;
  /** The hidden input's `name`, for form submission. */
  name?: string;
  /** The id of a form elsewhere on the page that this checkbox submits with. */
  form?: string;
  /**
   * The hidden input's `value`, for form submission — and the key a `<CheckboxGroup>` tracks this
   * box by.
   *
   * @default "on"
   */
  value?: string;
}

/**
 * The connected machine, as a **stable object of reactive getters and delegating methods** rather
 * than the snapshot `{ ...api }` React can take. Each read goes back to the live machine, so
 * `<Show when={checkbox.checked}>` in a consumer's own tree tracks it.
 *
 * The members Zag ships are inherited rather than re-declared, so a member a Zag minor adds arrives
 * here for free and its own JSDoc is what a consumer hovers.
 */
export interface CreateCheckboxReturn extends Readonly<checkbox.Api<PropTypes>> {}

/**
 * The slot recipe's two variants, spelled out rather than inherited from the generated
 * `CheckboxVariantProps`, so each carries a description a reader can use and a type they can read.
 * A variant renamed in the recipe is still caught: the `createSlotClasses` call on the Root is typed
 * against the generated one.
 *
 * **No `@default` tag on either.** The recipe's `defaultVariants` is `{ variant: "solid", size:
 * "md" }` and it resolves them itself, so restating one here would be a second source of truth that
 * drifts on a preset bump.
 */
export interface CheckboxVariantProps extends PresetVariantProps<"checkbox"> {
  /** The box's size, its gap to the label, and the label's text style. */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | PresetVariant<"checkbox", "size">>;
  /** How the box is painted once it is ticked. */
  variant?: ConditionalValue<"outline" | "solid" | "subtle" | PresetVariant<"checkbox", "variant">>;
}

/**
 * The Root's own props, without the label's — what a `PropsProvider` above it may supply.
 *
 * `unstyled` is not a member: it is one of the three props every component in this library takes
 * from `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them here would list
 * it as a prop this component added.
 */
export interface CheckboxRootBaseProps extends CreateCheckboxProps, CheckboxVariantProps {}

/**
 * `id` comes from {@link CreateCheckboxProps}, not from the `label`: on the Root it seeds the
 * machine's scope rather than naming the element, so it is a `string` where every Solid DOM `id` is
 * `string | false | undefined`. `<Checkbox.RootProvider>` is the other way round, and its `id` is
 * the element's.
 */
export interface CheckboxRootProps
  extends Omit<HTMLChakraProps<"label">, "id">,
    CheckboxRootBaseProps {}

/**
 * The variants are repeated here rather than reached through {@link CheckboxRootBaseProps}, because
 * this Root takes no machine props at all — it is handed a machine instead. Chakra splits the two
 * the same way, into `CheckboxRootProviderBaseProps`.
 */
export interface CheckboxRootProviderProps extends HTMLChakraProps<"label">, CheckboxVariantProps {
  /** A machine built by {@link createCheckbox}, so the consumer owns it rather than the Root. */
  value: CreateCheckboxReturn;
}

export interface CheckboxPropsProviderProps extends PropsProviderProps<CheckboxRootBaseProps> {}

export interface CheckboxLabelProps extends HTMLChakraProps<"span"> {}

/**
 * `children` defaults to `<Checkbox.Indicator />`, so `<Checkbox.Control />` is the whole box.
 * Passing `null` renders an empty box, which is what the React version's `defaultProps` does too.
 */
export interface CheckboxControlProps extends HTMLChakraProps<"div"> {}

/**
 * Both escape hatches replace the glyph for **one** state, and each is a **function** — the same
 * shape as `render`. It receives this part's computed props (the `indicator` slot's class, your
 * style props resolved into it, and every other prop written on the `Checkbox.Indicator`) and
 * returns the element to draw. Spread them onto your glyph, or nothing this part computed reaches
 * it.
 *
 * A JSX element is a **type error**, deliberately. SolidJS has no `cloneElement`, so an element
 * arrives already built and there is nowhere to put the computed props — it would render bare, with
 * the slot's class missing and nothing to say so.
 *
 * To style the default mark instead, pass `css` or a style prop and leave both unset.
 */
export interface CheckboxIndicatorProps extends HTMLChakraProps<"svg"> {
  /** Draws instead of the tick while the box is checked. */
  checked?: RenderProp<ComponentProps<"svg">>;
  /** Draws instead of the dash while the box is indeterminate. */
  indeterminate?: RenderProp<ComponentProps<"svg">>;
}

export interface CheckboxHiddenInputProps extends HTMLChakraProps<"input"> {}

export interface CheckboxContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (checkbox: CreateCheckboxReturn) => JSX.Element;
}

/** Everything {@link createCheckboxGroup} takes. */
export interface CreateCheckboxGroupProps {
  /** The values ticked in a fresh, uncontrolled group. */
  defaultValue?: string[];
  /** The controlled set of ticked values. Pass `undefined` for uncontrolled. */
  value?: string[];
  /** The `name` every checkbox in the group submits under. */
  name?: string;
  /** Called with the whole new set whenever any box in the group changes. */
  onValueChange?: (value: string[]) => void;
  /** Disables every checkbox in the group. Inherited from a surrounding Fieldset. */
  disabled?: boolean;
  /** Makes every checkbox in the group read-only. */
  readOnly?: boolean;
  /** Marks every checkbox in the group invalid. Inherited from a surrounding Fieldset. */
  invalid?: boolean;
  /** How many boxes may be ticked at once — the unticked ones disable themselves at the ceiling. */
  maxSelectedValues?: number;
}

/** What a checkbox asks the group for, by the value it submits. */
export interface CheckboxGroupItemProps {
  value?: string;
}

/** The machine props a group supplies to one of its checkboxes. */
export interface CheckboxGroupItemState {
  checked: boolean | undefined;
  onCheckedChange: () => void;
  name: string | undefined;
  disabled: boolean | undefined;
  readOnly: boolean | undefined;
  invalid: boolean | undefined;
}

/**
 * The group's state and its two ways of changing it, as a **stable object of reactive getters** — so
 * `<Show when={group.isChecked("react")}>` in a consumer's own tree tracks it.
 *
 * There is no machine behind this one: a group of checkboxes is an array of strings, a controlled
 * predicate and a ceiling, and Zag ships no `checkbox-group`.
 */
export interface CreateCheckboxGroupReturn {
  /** Whether a value is currently ticked. */
  isChecked(value: string | undefined): boolean;
  /** Every ticked value, in the order the group holds them. */
  readonly value: string[];
  readonly name: string | undefined;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly invalid: boolean;
  /** Replaces the whole set. */
  setValue(value: string[]): void;
  /** Ticks one value, unless the group is uninteractive or already at `maxSelectedValues`. */
  addValue(value: string): void;
  /** Ticks a value that is unticked, and unticks one that is ticked. */
  toggleValue(value: string): void;
  /** What a `<Checkbox.Root value="…">` inside the group is driven by. */
  getItemProps(props: CheckboxGroupItemProps): CheckboxGroupItemState;
}

/**
 * A column of checkboxes that share a `name` and one array of values.
 *
 * It is **not** part of the `Checkbox` namespace's machine — it starts none — and it is exported
 * standalone as well as as `<Checkbox.Group>`, which is Chakra's own split.
 */
export interface CheckboxGroupProps extends HTMLChakraProps<"div">, CreateCheckboxGroupProps {}
