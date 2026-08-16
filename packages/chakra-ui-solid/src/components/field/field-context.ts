import { createComponentContext, createSlotRecipeContext } from "@chakra-ui-solid/core";
import type { FieldVariantProps as FieldRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { CreateFieldReturn, FieldRootBaseProps } from "./field.types";

/**
 * The eight names the slot recipe carries, one per anatomy part.
 *
 * `helperText` and `errorText` are the *slot* keys; the DOM attributes the matching elements wear
 * are `data-part="helper-text"` and `"error-text"`, and the two are not interchangeable.
 * `requiredIndicator` is a slot key with no part attribute at all — upstream hand-writes that one
 * element rather than taking it from Ark, so nothing scopes it.
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
 * What a part reads: the field's state, ids and prop getters.
 *
 * The slot classes are **not** here — they travel through the styling seam below, which is what
 * every other machine-less multi-part component uses. So `<Field.Context>` hands a consumer the
 * field and nothing else, which is what Chakra's hands them too.
 */
export type FieldContextValue = CreateFieldReturn;

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

/**
 * The styling half — one slot recipe resolved on the Root, one class per part below.
 *
 * `withProvider` is unused here and cannot be: this Root owns `createField` as well as an element,
 * so it resolves the classes with `resolveSlotClasses` and publishes them with `StylesProvider`
 * itself. The parts stay hand-written for the same reason — each one merges a prop getter off the
 * field — and read their slot through `useFieldStyles`.
 */
export const {
  StylesProvider: FieldStylesProvider,
  useStyles: useFieldStyles,
  resolveSlotClasses: resolveFieldSlotClasses,
  useVariantKeys: useFieldVariantKeys,
  PropsProvider,
  usePropsContext,
} = createSlotRecipeContext<FieldSlot, FieldRootBaseProps, FieldRecipeVariants>({
  name: "Field",
  recipe: "field",
});
