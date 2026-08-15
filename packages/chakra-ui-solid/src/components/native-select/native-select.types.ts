import type { HTMLChakraProps, PropsProviderProps, SkinVariant } from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/** The two states the Root resolves once and the two parts below it read. */
export interface NativeSelectStates {
  readonly disabled: boolean;
  readonly invalid: boolean;
}

/**
 * The recipe's two variants, spelled out rather than inherited from the generated
 * `NativeSelectVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tags.** The recipe's `defaultVariants` resolves `outline`/`md` from `undefined`
 * itself, so restating them here would be a second source of truth that drifts on a preset bump.
 */
export interface NativeSelectVariantProps {
  /** How the control is drawn — `outline` is a full border, `subtle` fills it, `plain` and `ghost`
   * drop the box. */
  variant?: ConditionalValue<
    "outline" | "subtle" | "plain" | "ghost" | SkinVariant<"nativeSelect", "variant">
  >;
  /** The height, horizontal padding and text style together. */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | "xl" | SkinVariant<"nativeSelect", "size">>;
}

/** The Root's own props, without the `div`'s — what a `NativeSelect.PropsProvider` may supply. */
export interface NativeSelectRootBaseProps extends NativeSelectVariantProps {
  /**
   * Whether the control is disabled. A surrounding `<Field.Root disabled>` supplies it, and this
   * prop is the standalone spelling.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the value fails validation — it paints the invalid border on the control and the
   * indicator. A surrounding `<Field.Root invalid>` supplies it too.
   *
   * @default false
   */
  invalid?: boolean;
}

export interface NativeSelectRootProps extends HTMLChakraProps<"div">, NativeSelectRootBaseProps {}

export interface NativeSelectPropsProviderProps
  extends PropsProviderProps<NativeSelectRootBaseProps> {}

/**
 * The `select` itself. `disabled` and `size` come from the Root — `size` is the recipe's variant
 * rather than the element's row count, and `disabled` is resolved once against the surrounding
 * field — so neither is accepted here, which is upstream's `Omitted` list.
 */
export interface NativeSelectFieldProps
  extends Omit<HTMLChakraProps<"select">, "disabled" | "required" | "readonly" | "size"> {
  /** Rendered as a leading `<option value="">`, so the control can start on nothing chosen. */
  placeholder?: string;
}

/** The chevron. It renders `ChevronDownIcon` when given no children of its own. */
export interface NativeSelectIndicatorProps extends HTMLChakraProps<"div"> {}
