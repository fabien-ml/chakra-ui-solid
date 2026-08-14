import { createComponentContext, createPropsContext } from "@chakra-ui-solid/core";
import type { Accessor } from "solid-js";
import type { CreateFieldReturn, FieldRootBaseProps } from "./field.types";

/**
 * The eight names the slot recipe carries, one per anatomy part.
 *
 * `helperText`, `errorText` and `requiredIndicator` are the *slot* keys. The DOM attributes the
 * matching elements wear are `data-part="helper-text"`, `"error-text"` and `"required-indicator"`,
 * and the two are not interchangeable.
 *
 * `input`, `textarea` and `select` have slots and prop getters but no part component: upstream
 * exports none — a consumer puts a plain `<Input>` inside `<Field.Root>` — so the port exports none
 * either. `errorIcon` is the other way round: Chakra ships a `Field.ErrorIcon` and the recipe has
 * no slot for it, because it is a plain icon rather than a part.
 */
export type FieldSlot =
  | "root"
  | "label"
  | "helperText"
  | "errorText"
  | "requiredIndicator"
  | "input"
  | "textarea"
  | "select";

/**
 * What a part reads: the field, plus the slot classes the Root resolved once.
 *
 * Composition rather than inheritance — the context value **holds** the field (as
 * {@link CreateFieldReturn}'s getters) instead of spreading it, so every read goes back to the live
 * signals.
 */
export interface FieldContextValue extends CreateFieldReturn {
  /** One class string per slot, resolved once on the Root. */
  slots: Accessor<Record<FieldSlot, string>>;
}

/**
 * Three members where every other component here destructures two, and the third is the point.
 *
 * A form control is *usable* outside a `Field.Root` and only enriched inside one — an `<Input>` on
 * its own page is not a mistake — so whatever adopts the surrounding field has to be able to read
 * "there is none" rather than throw. `useFieldContext` is for the parts that genuinely require a
 * Root (Label, HelperText, ErrorText, RequiredIndicator, Item); `useOptionalFieldContext` is for
 * anything that merely takes advantage of one.
 */
export const [FieldProvider, useFieldContext, useOptionalFieldContext] =
  createComponentContext<FieldContextValue>("Field");

export const { PropsProvider, usePropsContext } = createPropsContext<FieldRootBaseProps>();
