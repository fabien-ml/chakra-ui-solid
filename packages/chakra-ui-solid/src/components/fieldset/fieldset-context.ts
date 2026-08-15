import { createComponentContext, createSlotRecipeContext } from "@chakra-ui-solid/core";
import type { FieldsetVariantProps as FieldsetRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { CreateFieldsetReturn, FieldsetRootBaseProps } from "./fieldset.types";

/**
 * The five names the slot recipe carries. Four are anatomy parts; `content` is not — it is a plain
 * `div` the recipe stacks, with no `data-part` of its own, upstream included.
 */
export type FieldsetSlot = "root" | "legend" | "helperText" | "errorText" | "content";

/** What a part reads: the fieldset's state, ids and prop getters. The slot classes travel through
 * the styling seam below instead, so `<Fieldset.Context>` hands a consumer the fieldset alone. */
export type FieldsetContextValue = CreateFieldsetReturn;

/**
 * Three readers, and the third is the one `createField` uses: a `Field.Root` outside any
 * `Fieldset.Root` is not a mistake, so whatever inherits the group's `disabled` has to be able to
 * read "there is none" rather than throw.
 */
export const [FieldsetProvider, useFieldsetContext, useOptionalFieldsetContext] =
  createComponentContext<FieldsetContextValue>("Fieldset");

/**
 * The styling half — one slot recipe resolved on the Root, one class per part below.
 *
 * `withProvider` is unused here for `field`'s reason: this Root owns `createFieldset` as well as an
 * element, so it resolves the classes with `resolveSlotClasses` and publishes them with
 * `StylesProvider` itself. `Content` is the one part `withContext` can mint, because it is the one
 * that merges no prop getter.
 */
export const {
  StylesProvider: FieldsetStylesProvider,
  useStyles: useFieldsetStyles,
  withContext: withFieldsetContext,
  resolveSlotClasses: resolveFieldsetSlotClasses,
} = createSlotRecipeContext<FieldsetSlot, FieldsetRootBaseProps, FieldsetRecipeVariants>({
  name: "Fieldset",
  recipe: "fieldset",
});
