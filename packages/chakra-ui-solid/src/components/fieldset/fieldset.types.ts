import type { HTMLChakraProps, PresetVariant, PresetVariantProps } from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";

/**
 * Chakra's `dataAttr`: present-and-empty when the state is on, absent when it is off. Spelled as a
 * string rather than a boolean because Solid writes `data-x={false}` as no attribute at all and
 * `data-x={true}` as `data-x=""` — the same value, one indirection later.
 */
export type FieldsetDataAttribute = "" | undefined;

/** The `data-scope` / `data-part` pair every part carries, so a recipe selector can find it. */
export interface FieldsetPartAttributes<Part extends string> {
  "data-scope": "fieldset";
  "data-part": Part;
}

/** The three ids the fieldset addresses, each a scheme over the fieldset's `id`. */
export interface FieldsetIds {
  /** The legend, which the `fieldset` names through `aria-labelledby`. */
  readonly legend: string;
  /** The error text, which the `fieldset` names through `aria-describedby` when invalid. */
  readonly errorText: string;
  /** The helper text, which the `fieldset` names through `aria-describedby`. */
  readonly helperText: string;
}

/** Everything {@link createFieldset} takes. */
export interface CreateFieldsetProps {
  /**
   * Seeds every id the fieldset hands out — the legend is `fieldset::{id}::legend`, the two texts
   * `fieldset::{id}::helper-text` and `::error-text`. Defaults to a generated id.
   *
   * It names no element itself: the `fieldset` carries no `id` of its own, upstream included.
   */
  id?: string;
  /**
   * Whether every control inside is disabled. It is the native `fieldset` attribute, so the
   * browser disables the controls; the `Field`s below also read it and mark themselves disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the group as a whole failed validation — it is what makes the `ErrorText` render, and
   * what adds that text to the group's `aria-describedby`.
   *
   * Each control inside stays valid until *it* is told otherwise: pass `invalid` to the
   * `Field.Root`s that are actually in error.
   *
   * @default false
   */
  invalid?: boolean;
}

/** What `getRootProps()` returns. */
export interface FieldsetRootAttributes extends FieldsetPartAttributes<"root"> {
  /** The native attribute — the browser disables every control in the set. */
  disabled: boolean;
  "data-disabled": FieldsetDataAttribute;
  "data-invalid": FieldsetDataAttribute;
  /** Names the legend, whether or not one is rendered — upstream emits it unconditionally too. */
  "aria-labelledby": string;
  /** The two texts that have actually mounted, error first, or absent when neither has. */
  "aria-describedby": string | undefined;
}

/** What `getLegendProps()` returns. */
export interface FieldsetLegendAttributes extends FieldsetPartAttributes<"legend"> {
  id: string;
  "data-disabled": FieldsetDataAttribute;
  "data-invalid": FieldsetDataAttribute;
}

/** What `getHelperTextProps()` returns. */
export interface FieldsetHelperTextAttributes extends FieldsetPartAttributes<"helper-text"> {
  id: string;
}

/** What `getErrorTextProps()` returns. */
export interface FieldsetErrorTextAttributes extends FieldsetPartAttributes<"error-text"> {
  id: string;
  /** The text is announced when it appears, without stealing the reader's place. */
  "aria-live": "polite";
}

/**
 * What {@link createFieldset} returns: the three ids, the two states and one prop getter per part,
 * as a **stable object of reactive getters** rather than a snapshot. Each read goes back to the
 * live signals, so a part calling `fieldset.getRootProps()` inside its own merge stays current.
 */
export interface CreateFieldsetReturn {
  readonly ids: FieldsetIds;
  readonly disabled: boolean;
  readonly invalid: boolean;
  getRootProps(): FieldsetRootAttributes;
  getLegendProps(): FieldsetLegendAttributes;
  getHelperTextProps(): FieldsetHelperTextAttributes;
  getErrorTextProps(): FieldsetErrorTextAttributes;
  /**
   * Publishes the mounted `HelperText`'s id, or `undefined` on its cleanup. Until it is called the
   * group's `aria-describedby` does not name it.
   */
  registerHelperText(id: string | undefined): void;
  /** The `ErrorText` counterpart of {@link CreateFieldsetReturn.registerHelperText}. */
  registerErrorText(id: string | undefined): void;
}

/**
 * The slot recipe's one variant, spelled out rather than inherited from the generated
 * `FieldsetVariantProps`, so it carries a description a reader can use and a type they can read.
 *
 * **No `@default` tag.** The recipe's `defaultVariants` resolves `"md"` from `undefined` itself, so
 * restating it here would be a second source of truth that drifts on a preset bump.
 */
export interface FieldsetVariantProps extends PresetVariantProps<"fieldset"> {
  /** The gap between the legend, the texts and the content, and the two texts' type scale. */
  size?: ConditionalValue<"sm" | "md" | "lg" | PresetVariant<"fieldset", "size">>;
}

/** The Root's own props, without the `fieldset`'s — the recipe's variant plus the store's inputs. */
export interface FieldsetRootBaseProps extends CreateFieldsetProps, FieldsetVariantProps {}

/**
 * Two keys come from {@link CreateFieldsetProps} rather than from the `fieldset` element, and both
 * are narrower than the DOM's.
 *
 * `id` seeds the id scheme rather than naming the element, so it is a `string` where every Solid DOM
 * `id` is `string | false | undefined`. `disabled` is the group's state — the store writes the
 * native attribute from it — so it is a `boolean` where Solid's is `boolean | "" | undefined`.
 */
export interface FieldsetRootProps
  extends Omit<HTMLChakraProps<"fieldset">, "id" | "disabled">,
    FieldsetRootBaseProps {}

export interface FieldsetLegendProps extends HTMLChakraProps<"legend"> {}

/** A `span`, for the reason {@link FieldsetErrorTextProps} is. */
export interface FieldsetHelperTextProps extends HTMLChakraProps<"span"> {}

/**
 * A **`span`**, where Chakra's own type says `HTMLChakraProps<"span", …>` over an element that is
 * one — the two agree here, unlike `Field`'s, whose type claims a `div`.
 */
export interface FieldsetErrorTextProps extends HTMLChakraProps<"span"> {}

/** The box the fields sit in — a plain `div` the recipe stacks, with no part attributes of its own. */
export interface FieldsetContentProps extends HTMLChakraProps<"div"> {}

export interface FieldsetContextProps {
  /** Receives the fieldset, so a consumer can read its state without a component of their own. */
  children: (fieldset: CreateFieldsetReturn) => JSX.Element;
}
