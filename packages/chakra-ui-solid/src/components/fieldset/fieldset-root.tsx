import { mergeProps, renderStyled, withDefaults } from "@chakra-ui-solid/core";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import type { Component } from "solid-js";
import { omit } from "solid-js";
import { createFieldset } from "./create-fieldset";
import type { FieldsetRootProps } from "./fieldset.types";
import {
  FieldsetProvider,
  FieldsetStylesProvider,
  resolveFieldsetSlotClasses,
} from "./fieldset-context";

type FieldsetElementProps = ComponentProps<"fieldset">;

/**
 * The Root's own inputs, which are not the `fieldset`'s.
 *
 * `id` seeds the id scheme and names no element — the `fieldset` carries no `id` at all, upstream
 * included. `invalid` is not an attribute any element has, and forwarded it would reach the DOM as
 * `invalid=""`; the state travels as `data-invalid` off the prop getter instead. `disabled` is
 * absent from this list on purpose: it *is* the native attribute, and `getRootProps()` emits it.
 */
const ROOT_ONLY_KEYS = ["id", "invalid", "size"] as const;

/**
 * Fieldset.Root — a set of controls grouped under one name, and disabled or marked invalid together.
 *
 * It renders a native `<fieldset>`, so `disabled` disables every control inside it without any
 * component needing to cooperate. A `<Field.Root>` below it inherits the flag as a **default**: the
 * field's own `disabled` still wins, and a field outside any fieldset is unaffected.
 *
 * A consumer's `id` seeds the id scheme — the legend becomes `fieldset::{id}::legend` and the two
 * texts `::helper-text` and `::error-text`.
 */
export const FieldsetRoot: Component<FieldsetRootProps> = (props) => {
  // No props context above this: upstream mints no `FieldsetPropsProvider`, so there is nothing to
  // read from and adding one would be an invention.
  //
  // `size` is **not** defaulted here: it is a recipe variant, and the recipe's own `defaultVariants`
  // resolves `"md"` from `undefined`. Restating it would be a second source of truth that drifts on
  // a preset bump.
  const merged = withDefaults(props, { disabled: false, invalid: false });

  // Once, here — never per part: the seam resolves the recipe against these props and publishes one
  // class per slot to everything below, including the Root-level `unstyled` opt-out.
  const slots = resolveFieldsetSlotClasses(merged);

  const store = createFieldset(merged);

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_ONLY_KEYS),
  ) as FieldsetElementProps;

  return (
    <FieldsetProvider value={store}>
      <FieldsetStylesProvider value={slots}>
        {renderStyled<FieldsetElementProps, HTMLFieldSetElement>({
          as: (merged.as ?? "fieldset") as ValidComponent,
          props: elementProps,
          render: merged.render,
          recipeClass: () => slots().root,
        })}
      </FieldsetStylesProvider>
    </FieldsetProvider>
  );
};
