import { mergeProps, renderStyled, withContextDefaults, withDefaults } from "@chakra-ui-solid/core";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import type { Component } from "solid-js";
import { omit } from "solid-js";
import { createField } from "./create-field";
import type { FieldRootProps } from "./field.types";
import {
  FieldProvider,
  FieldStylesProvider,
  PropsProvider,
  resolveFieldSlotClasses,
  usePropsContext,
} from "./field-context";

type DivProps = ComponentProps<"div">;

/**
 * The Root's own inputs, which are not the `div`'s. `id` is the first of them and the one that
 * would be wrong rather than merely noisy: on this component it *seeds* the id scheme, and the
 * element's own id is `field::{id}` — forwarded, it would land after `getRootProps()` in the merge
 * and rename the root to the control's id.
 */
const ROOT_ONLY_KEYS = [
  "id",
  "ids",
  "orientation",
  "invalid",
  "disabled",
  "readOnly",
  "required",
  "target",
] as const;

/**
 * Field.Root — holds the field's state and ids, and shares them with every part below.
 *
 * Unlike Dialog's and Popover's, this Root **does render an element**: `field.anatomy` has a `root`
 * part, and it is the `role="group"` that makes the label, the control and the two texts one thing
 * to a screen reader.
 *
 * A consumer's `id` seeds the id scheme — the root becomes `field::{id}`, the label
 * `field::{id}::label`, and the control is the `id` itself, so an `<Input id={id}>` inside needs no
 * wiring. Pass `ids` to name the elements themselves.
 */
export const FieldRoot: Component<FieldRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `invalid={props.invalid}` would otherwise
  // beat the provider above it with `undefined`.
  const fromContext = withContextDefaults<FieldRootProps>(props, usePropsContext());

  // Three of the four states, resolved with `??` rather than by presence, for the same reason — and
  // here it is the difference between a valid field and one that never stops being invalid.
  //
  // **`disabled` is not one of them, and that is load-bearing.** A default resolved here would land
  // as `false` before `createField` ever sees it, and `createField` inherits a surrounding
  // `<Fieldset.Root disabled>` by *absence* — so defaulting it here would delete the inheritance
  // upstream ships, silently. `createField` resolves it, against the fieldset.
  //
  // `orientation` is **not** here either: it is a recipe variant, and the recipe's own
  // `defaultVariants` resolves `"vertical"` from `undefined`. Restating it would be a second source
  // of truth that drifts on a preset bump.
  const merged = withDefaults(fromContext, {
    invalid: false,
    readOnly: false,
    required: false,
  });

  // Once, here — never per part: the seam resolves the recipe against these props and publishes one
  // class per slot to everything below, including the Root-level `unstyled` opt-out, which empties
  // every one of them. A part opting out for itself is `renderStyled`'s job, and it already
  // suppresses its own `recipeClass` on `unstyled`.
  const slots = resolveFieldSlotClasses(merged);

  const store = createField(merged);

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_ONLY_KEYS),
  ) as DivProps;

  return (
    <FieldProvider value={store}>
      <FieldStylesProvider value={slots}>
        {renderStyled<DivProps, HTMLDivElement>({
          as: (merged.as ?? "div") as ValidComponent,
          props: elementProps,
          render: merged.render,
          recipeClass: () => slots().root,
        })}
      </FieldStylesProvider>
    </FieldProvider>
  );
};

/**
 * Supplies props to every {@link FieldRoot} below it — `<Field.PropsProvider value={{ orientation:
 * "horizontal" }}>` lays out a whole form the same way. A Root that passes the prop itself still
 * wins.
 */
export const FieldPropsProvider = PropsProvider;
