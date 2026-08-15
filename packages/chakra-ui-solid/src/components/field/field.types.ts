import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type { IconProps } from "../icon";

/**
 * Chakra's `dataAttr`: present-and-empty when the state is on, absent when it is off. Spelled as a
 * string rather than a boolean because Solid writes `data-x={false}` as no attribute at all and
 * `data-x={true}` as `data-x=""` — the same value, one indirection later.
 */
export type FieldDataAttribute = "" | undefined;

/**
 * Chakra's `ariaAttr`: `"true"` when the state is on, absent when it is off.
 *
 * A **string**, where React ships the boolean and lets its DOM layer stringify. Solid's does not:
 * `aria-invalid={true}` reaches the DOM as `aria-invalid=""`, which is not a valid value for an
 * enumerated ARIA attribute and which axe reports as `aria-valid-attr-value`. The Zag adapter
 * converts booleans for exactly this reason (`normalize-props.ts`); this component has no machine
 * behind it, so it writes the converted form directly.
 */
export type FieldAriaAttribute = "true" | undefined;

/** The `data-scope` / `data-part` pair every part carries, so a recipe selector can find it. */
export interface FieldPartAttributes<Part extends string> {
  "data-scope": "field";
  "data-part": Part;
}

/**
 * The ids of the five elements the field addresses, for pointing an ARIA relationship at a specific
 * one. Each defaults to a scheme over the field's `id`.
 */
export interface FieldElementIds {
  /** The `role="group"` wrapper. @default `field::{id}` */
  root?: string;
  /** The control the label points at — the input, textarea or select. @default `{id}` */
  control?: string;
  /** The label. @default `field::{id}::label` */
  label?: string;
  /** The error text, which the control names through `aria-errormessage`. @default `field::{id}::error-text` */
  errorText?: string;
  /** The helper text, which the control names through `aria-describedby`. @default `field::{id}::helper-text` */
  helperText?: string;
}

/** The five ids resolved — what a part reads instead of re-deriving the scheme. */
export interface FieldIds {
  readonly root: string;
  readonly control: string;
  readonly label: string;
  readonly errorText: string;
  readonly helperText: string;
}

/** The two ids a `<Field.Item value="…">` derives for itself. */
export interface FieldItemIds {
  /** `field::{control}::item::{value}` */
  readonly control: string;
  /** `{itemControlId}::label` */
  readonly label: string;
}

/** Everything {@link createField} takes. */
export interface CreateFieldProps {
  /**
   * Seeds every id the field hands out — the root is `field::{id}`, the label
   * `field::{id}::label`, and the control is the `id` itself. Defaults to a generated id. Pass
   * `ids` to name the elements themselves.
   */
  id?: string;
  /** Override individual element ids, for pointing an ARIA relationship at a specific one. */
  ids?: FieldElementIds;
  /**
   * Whether the control must be filled in — it marks the control `required` and shows the
   * `RequiredIndicator`.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Whether the control ignores input entirely and drops out of the tab order.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the value fails validation — it marks the control `aria-invalid` and lets the
   * `ErrorText` name it through `aria-errormessage`.
   *
   * @default false
   */
  invalid?: boolean;
  /**
   * Whether the control shows its value but refuses edits. Unlike `disabled` it stays focusable
   * and still submits.
   *
   * @default false
   */
  readOnly?: boolean;
  /**
   * The `<Field.Item value="…">` the label points at, for a field whose label heads a set of
   * controls rather than one.
   */
  target?: string;
}

/** What `getRootProps()` returns. */
export interface FieldRootAttributes extends FieldPartAttributes<"root"> {
  id: string;
  role: "group";
  "data-disabled": FieldDataAttribute;
  "data-invalid": FieldDataAttribute;
  "data-readonly": FieldDataAttribute;
}

/** What `getLabelProps()` returns. */
export interface FieldLabelAttributes extends FieldPartAttributes<"label"> {
  id: string;
  /** Solid's spelling of `htmlFor`. Points at the control, or at the `target` item's control. */
  for: string;
  "data-disabled": FieldDataAttribute;
  "data-invalid": FieldDataAttribute;
  "data-readonly": FieldDataAttribute;
  "data-required": FieldDataAttribute;
}

/**
 * What `getControlProps()` returns — the ARIA contract the whole component exists for.
 *
 * The two relationships are conditional: `aria-describedby` appears only once a `HelperText` has
 * actually mounted and registered its id, and `aria-errormessage` only when an `ErrorText` has AND
 * the field is `invalid`. An IDREF pointing at an element that is not there is worse than no
 * attribute, which is why neither is emitted optimistically.
 */
export interface FieldControlAttributes {
  id: string;
  required: boolean;
  disabled: boolean;
  /** Solid's spelling of `readOnly`. */
  readonly: boolean;
  "aria-invalid": FieldAriaAttribute;
  "aria-describedby": string | undefined;
  "aria-errormessage": string | undefined;
  "data-invalid": FieldDataAttribute;
  "data-required": FieldDataAttribute;
  "data-readonly": FieldDataAttribute;
}

/** What `getInputProps()` returns — {@link FieldControlAttributes} under the `input` part. */
export interface FieldInputAttributes
  extends FieldControlAttributes,
    FieldPartAttributes<"input"> {}

/** What `getTextareaProps()` returns. */
export interface FieldTextareaAttributes
  extends FieldControlAttributes,
    FieldPartAttributes<"textarea"> {}

/** What `getSelectProps()` returns. */
export interface FieldSelectAttributes
  extends FieldControlAttributes,
    FieldPartAttributes<"select"> {}

/** What `getHelperTextProps()` returns. */
export interface FieldHelperTextAttributes extends FieldPartAttributes<"helper-text"> {
  id: string;
  "data-disabled": FieldDataAttribute;
}

/** What `getErrorTextProps()` returns. */
export interface FieldErrorTextAttributes extends FieldPartAttributes<"error-text"> {
  id: string;
  /** The text is announced when it appears, without stealing the reader's place. */
  "aria-live": "polite";
}

/**
 * What `getRequiredIndicatorProps()` returns — one attribute, with no `data-scope` / `data-part`
 * pair: this is the one part Chakra hand-writes rather than taking from Ark, so it carries none.
 */
export interface FieldRequiredIndicatorAttributes {
  /** The asterisk is decoration — `required` on the control is what a screen reader announces. */
  "aria-hidden": "true";
}

/**
 * What {@link createField} returns: the resolved ids, the four states, and one prop getter per
 * part, as a **stable object of reactive getters** rather than a snapshot. Each read goes back to
 * the live signals, so a part calling `field.getControlProps()` inside its own merge stays current.
 *
 * There is no machine behind any of it — `field` is the first multi-part component in this library
 * with no Zag machine, because upstream has none either. The getters are the whole behaviour.
 */
export interface CreateFieldReturn {
  /** The five resolved element ids. */
  readonly ids: FieldIds;
  readonly disabled: boolean;
  readonly invalid: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
  getRootProps(): FieldRootAttributes;
  getLabelProps(): FieldLabelAttributes;
  getControlProps(): FieldControlAttributes;
  getInputProps(): FieldInputAttributes;
  getTextareaProps(): FieldTextareaAttributes;
  getSelectProps(): FieldSelectAttributes;
  getHelperTextProps(): FieldHelperTextAttributes;
  getErrorTextProps(): FieldErrorTextAttributes;
  getRequiredIndicatorProps(): FieldRequiredIndicatorAttributes;
  /** The ids a `<Field.Item value="…">` renders under. */
  getItemIds(value: string): FieldItemIds;
  /**
   * Publishes the mounted `HelperText`'s id, or `undefined` on its cleanup. Until it is called the
   * control emits no `aria-describedby`.
   */
  registerHelperText(id: string | undefined): void;
  /** The `ErrorText` counterpart of {@link CreateFieldReturn.registerHelperText}. */
  registerErrorText(id: string | undefined): void;
}

/**
 * The members a `<Field.Item>` replaces on the field it inherits — everything that names the
 * control, since an Item's control is its own element and its label points at that.
 *
 * Layered over the parent with `merge`, so every other member (the states, the texts, the slot
 * classes on the context value) is inherited live rather than copied.
 */
export interface FieldItemOverrides
  extends Pick<
    CreateFieldReturn,
    | "ids"
    | "getLabelProps"
    | "getControlProps"
    | "getInputProps"
    | "getTextareaProps"
    | "getSelectProps"
  > {}

/**
 * The slot recipe's one variant, spelled out rather than inherited from the generated
 * `FieldVariantProps`, so it carries a description a reader can use and a type they can read.
 *
 * **No `@default` tag.** The recipe's `defaultVariants` is `{ orientation: "vertical" }` and it
 * resolves that itself, so restating it here would be a second source of truth that drifts on a
 * preset bump.
 */
export interface FieldVariantProps extends PresetVariantProps<"field"> {
  /** Whether the label sits above the control or beside it. */
  orientation?: ConditionalValue<"vertical" | "horizontal" | PresetVariant<"field", "orientation">>;
}

/**
 * The Root's own props, without the div's — what a `Field.PropsProvider` above it may supply.
 *
 * `unstyled` is not here: it is one of the three props every component in this library takes from
 * `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them on a component's own
 * interface would list it as a prop this component added. It reaches the Root through
 * {@link FieldRootProps} instead.
 */
export interface FieldRootBaseProps extends CreateFieldProps, FieldVariantProps {}

/**
 * `id` comes from {@link CreateFieldProps}, not from the `div`: on the Root it seeds the id scheme
 * rather than naming the element — the element's own id is `field::{id}` — so it is a `string`
 * where every Solid DOM `id` is `string | false | undefined`.
 */
export interface FieldRootProps extends Omit<HTMLChakraProps<"div">, "id">, FieldRootBaseProps {}

export interface FieldPropsProviderProps extends PropsProviderProps<FieldRootBaseProps> {}

export interface FieldLabelProps extends HTMLChakraProps<"label"> {}

/**
 * A **`span`**, where Chakra's own type says `HTMLChakraProps<"div">`.
 *
 * The type is the half that is wrong upstream: `FieldHelperText` is `withContext(ArkField.HelperText,
 * …)` over a component that renders `ark.span`, and the `div` in the generic never reaches the DOM.
 * Parity is what a consumer observes, so the element follows the element and the type follows the
 * element too.
 */
export interface FieldHelperTextProps extends HTMLChakraProps<"span"> {}

/** A `span`, for the same reason {@link FieldHelperTextProps} is. */
export interface FieldErrorTextProps extends HTMLChakraProps<"span"> {}

/**
 * Every {@link IconProps}, not the `HTMLChakraProps<"svg">` upstream declares: the component is
 * built with `createIcon`, so `size` and `focusable` work on it exactly as they do on `Icon`.
 */
export interface FieldErrorIconProps extends IconProps {}

export interface FieldRequiredIndicatorProps extends HTMLChakraProps<"span"> {
  /** Rendered in place of the indicator when the field is not `required`. */
  fallback?: JSX.Element;
}

/**
 * One control among several under a single label — a set of radios, a pair of date inputs. The
 * Item re-points the ids at its own control so each has a label of its own.
 */
export interface FieldItemProps {
  /** Names this item. Its control becomes `field::{control}::item::{value}`. */
  value: string;
  children?: JSX.Element;
}

export interface FieldContextProps {
  /** Receives the field, so a consumer can read its state without a component of their own. */
  children: (field: CreateFieldReturn) => JSX.Element;
}
