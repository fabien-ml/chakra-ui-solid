import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type {
  CreateRadioGroupProps,
  CreateRadioGroupReturn,
  RadioGroupElementIds,
  RadioGroupItemBaseProps,
  RadioGroupItemState,
  RadioGroupValueChangeDetails,
} from "../radio-group";

/**
 * The machine is `@zag-js/radio-group`, unchanged — a segmented control is a radio group wearing a
 * third slot recipe, so the five names below are the group's types under the names this namespace
 * uses for them.
 *
 * Empty `extends` interfaces rather than aliases, where the shape allows one: the props-table
 * generator folds a heritage clause and cannot follow an alias, so a `type X = Y` here would leave
 * `SegmentGroup.Root`'s table with its one variant and none of the machine props.
 */
export interface CreateSegmentGroupProps extends CreateRadioGroupProps {}

/** The connected machine — reactive getters over `@zag-js/radio-group`, exactly as a RadioGroup gets. */
export interface CreateSegmentGroupReturn extends CreateRadioGroupReturn {}

/** The ids of the elements the machine addresses. Useful for composition. */
export interface SegmentGroupElementIds extends RadioGroupElementIds {}

/** What `onValueChange` receives — the value the group has just moved to, or `null` when cleared. */
export interface SegmentGroupValueChangeDetails extends RadioGroupValueChangeDetails {}

/** What identifies one segment to the machine: its `value`, plus the two states it may carry alone. */
export interface SegmentGroupItemBaseProps extends RadioGroupItemBaseProps {}

/** Everything the machine knows about one segment — the same eight fields a radio's item carries. */
export interface SegmentGroupItemState extends RadioGroupItemState {}

/**
 * The slot recipe's one variant, spelled out rather than inherited from the generated
 * `SegmentGroupVariantProps`, so it carries a description a reader can use and a type they can read.
 * A variant renamed in the recipe is still caught: the `createSlotClasses` call on the Root is typed
 * against the generated one.
 *
 * **No `@default` tag.** The recipe's `defaultVariants` is `{ size: "md" }` and it resolves it
 * itself, so restating it here would be a second source of truth that drifts on a preset bump.
 */
export interface SegmentGroupVariantProps extends PresetVariantProps<"segmentGroup"> {
  /** Each segment's height, horizontal padding, inner gap and text style. */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | PresetVariant<"segmentGroup", "size">>;
}

/**
 * The Root's own props, without the `div`'s — what a `PropsProvider` above it may supply.
 *
 * `unstyled` is not a member: it is one of the three props every component in this library takes
 * from `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them here would list
 * it as a prop this component added.
 */
export interface SegmentGroupRootBaseProps
  extends CreateSegmentGroupProps,
    SegmentGroupVariantProps {}

/**
 * `id` comes from {@link CreateSegmentGroupProps}, not from the `div`: on the Root it seeds the
 * machine's scope rather than naming the element, so it is a `string` where every Solid DOM `id` is
 * `string | false | undefined`. `<SegmentGroup.RootProvider>` is the other way round, and its `id`
 * is the element's.
 */
export interface SegmentGroupRootProps
  extends Omit<HTMLChakraProps<"div">, "id">,
    SegmentGroupRootBaseProps {
  /**
   * Which way the segments run — the machine's keyboard model, the `data-orientation` on every
   * part, and what the recipe's `_horizontal` / `_vertical` blocks select on.
   *
   * **This Root is the one place in the radio-group family that defaults it.** The machine's own
   * default is `vertical` and a `RadioCard.Root` never lets it through at all; Chakra passes this
   * Root `defaultProps: { orientation: "horizontal" }`, because a segmented control is a row.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

/**
 * The variant is repeated here rather than reached through {@link SegmentGroupRootBaseProps},
 * because this Root takes no machine props at all — it is handed a machine instead. That includes
 * `orientation`: this Root defaults nothing, so a machine built with `createSegmentGroup()` keeps
 * the machine's own `vertical` unless it was told otherwise.
 */
export interface SegmentGroupRootProviderProps
  extends HTMLChakraProps<"div">,
    SegmentGroupVariantProps {
  /** A machine built by {@link createSegmentGroup}, so the consumer owns it rather than the Root. */
  value: CreateSegmentGroupReturn;
}

export interface SegmentGroupPropsProviderProps
  extends PropsProviderProps<SegmentGroupRootBaseProps> {}

/**
 * One segment. `value` names it to the machine; `disabled` and `invalid` are this segment's own, on
 * top of whatever the group carries.
 *
 * **It renders a `<label>`**, which is what makes the whole segment clickable — the machine points
 * its `for` at the `<SegmentGroup.ItemHiddenInput>` inside it.
 */
export interface SegmentGroupItemProps
  extends HTMLChakraProps<"label">,
    SegmentGroupItemBaseProps {}

export interface SegmentGroupItemTextProps extends HTMLChakraProps<"span"> {}

/**
 * The sliding highlight behind the checked segment — one element for the whole group, not one per
 * segment.
 *
 * The machine measures the checked segment and writes `--left`, `--top`, `--width` and `--height`
 * onto this element as inline custom properties; the recipe reads all four back through `var()`.
 */
export interface SegmentGroupIndicatorProps extends HTMLChakraProps<"div"> {}

export interface SegmentGroupItemHiddenInputProps extends HTMLChakraProps<"input"> {}

/**
 * One entry of {@link SegmentGroupItemsProps.items} in its long form, for a segment whose label is
 * not its value — or one that is disabled.
 */
interface SegmentGroupItemDescriptor {
  /** What the machine and the form know this segment as. */
  value: string;
  /** What the segment reads, which may be any markup — an icon beside a word, for instance. */
  label: JSX.Element;
  /** Whether this segment alone refuses to be picked. */
  disabled?: boolean;
}

/**
 * The shortcut's props: an `items` list, plus anything a `<SegmentGroup.Item>` takes, applied to
 * every segment it renders.
 */
export interface SegmentGroupItemsProps extends Omit<SegmentGroupItemProps, "value"> {
  /** A bare string is both the value and the label; the long form separates them. */
  items: Array<string | SegmentGroupItemDescriptor>;
}

export interface SegmentGroupContextProps {
  /** Receives the machine, so a consumer can read the group's state without a component of their own. */
  children: (segmentGroup: CreateSegmentGroupReturn) => JSX.Element;
}

export interface SegmentGroupItemContextProps {
  /** Receives one segment's state, for a glyph or a label that changes with it. */
  children: (item: SegmentGroupItemState) => JSX.Element;
}
