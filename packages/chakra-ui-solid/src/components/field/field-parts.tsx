/**
 * @license
 * The glyph below is copied from Chakra UI (`@chakra-ui/react`,
 * `packages/react/src/components/field/field.tsx`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 *
 * Only `FieldErrorIcon`'s path data is derived — a copied path is expression however few bytes it
 * takes, which is why `components/icons.tsx` and `checkmark.tsx` carry the same header. The part
 * components around it are public API shape and owe nothing.
 */

import {
  createRegisteredId,
  mergeProps,
  type RenderProp,
  renderStyled,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { createIcon } from "../icon";
import { deriveFieldItem } from "./create-field";
import type {
  FieldContextProps,
  FieldErrorIconProps,
  FieldErrorTextAttributes,
  FieldErrorTextProps,
  FieldHelperTextAttributes,
  FieldHelperTextProps,
  FieldItemProps,
  FieldLabelProps,
  FieldRequiredIndicatorProps,
} from "./field.types";
import { FieldProvider, type FieldSlot, useFieldContext, useFieldStyles } from "./field-context";

type LabelProps = ComponentProps<"label">;
type SpanProps = ComponentProps<"span">;

/**
 * The field's label. Its `for` is the whole point: it names the control's id, or — when the Root was
 * given a `target` — the id of the `<Field.Item>` that control belongs to, since a `for` can only
 * ever name one element.
 */
export const FieldLabel: Component<FieldLabelProps> = (props) => {
  const ctx = useFieldContext();
  const styles = useFieldStyles();
  const elementProps = mergeProps(() => ctx.getLabelProps(), props) as LabelProps;

  return renderStyled<LabelProps, HTMLLabelElement>({
    as: (props.as ?? "label") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => styles().label,
  });
};

/**
 * Helper and error text differ in three values and nothing else, and the third is what makes them
 * the only parts that talk *back* to the Root: each publishes the id it actually rendered with, and
 * the control's `aria-describedby` / `aria-errormessage` name that id.
 *
 * **The effective id, not the generated one.** `elementProps.id` is what came out of the merge, so a
 * consumer's own `<Field.HelperText id="hint">` still links — pointing the control at the id the
 * field *would* have used would leave the IDREF resolving to nothing.
 *
 * `createRegisteredId` defers the write to `onSettled` because a descendant writing an ancestor's
 * signal from its own render body is `[REACTIVE_WRITE_IN_OWNED_SCOPE]`, and it clears the id again
 * on cleanup — which is how removing the text removes the attribute.
 */
function renderTextPart(
  props: FieldHelperTextProps | FieldErrorTextProps,
  attributes: () => FieldHelperTextAttributes | FieldErrorTextAttributes,
  register: (id: string | undefined) => void,
  slot: FieldSlot,
): JSX.Element {
  const styles = useFieldStyles();
  const elementProps = mergeProps(attributes, props) as SpanProps;

  createRegisteredId({ id: () => elementProps.id, register });

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render as RenderProp<SpanProps>,
    recipeClass: () => styles()[slot],
  });
}

/**
 * The hint under a control — what the field is for, what shape the value takes. Rendering it is what
 * gives the control an `aria-describedby`; removing it takes the attribute away again.
 */
export const FieldHelperText: Component<FieldHelperTextProps> = (props) => {
  const ctx = useFieldContext();

  return renderTextPart(
    props,
    () => ctx.getHelperTextProps(),
    ctx.registerHelperText,
    "helperText",
  );
};

/**
 * Why the value was rejected.
 *
 * **It renders nothing unless the field is `invalid`**, which is upstream's gate rather than a
 * convenience: an error message on a field that is not in error reads to a screen reader as one that
 * is. So a consumer writes it unconditionally and the field decides — and because nothing is
 * rendered, nothing registers, which is the second half of the control's `aria-errormessage`.
 */
export const FieldErrorText: Component<FieldErrorTextProps> = (props) => {
  const ctx = useFieldContext();

  return (
    <Show when={ctx.invalid}>
      {renderTextPart(props, () => ctx.getErrorTextProps(), ctx.registerErrorText, "errorText")}
    </Show>
  );
};

const ErrorCircleIcon = createIcon({
  displayName: "FieldErrorIcon",
  d: "M11.983,0a12.206,12.206,0,0,0-8.51,3.653A11.8,11.8,0,0,0,0,12.207,11.779,11.779,0,0,0,11.8,24h.214A12.111,12.111,0,0,0,24,11.791h0A11.766,11.766,0,0,0,11.983,0ZM10.5,16.542a1.476,1.476,0,0,1,1.449-1.53h.027a1.527,1.527,0,0,1,1.523,1.47,1.475,1.475,0,0,1-1.449,1.53h-.027A1.529,1.529,0,0,1,10.5,16.542ZM11,12.5v-6a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Z",
});

/**
 * The ⓘ beside an error message.
 *
 * **The one part with no slot**: the `field` recipe carries no `errorIcon`, and upstream sizes it
 * with `boxSize: "1em"` alone — so it takes the surrounding text's size and inherits the `ErrorText`
 * slot's `fg.error` colour, exactly like an {@link Icon} anywhere else.
 */
export const FieldErrorIcon: Component<FieldErrorIconProps> = (props) => {
  // A `withDefaults` entry, where upstream passes `boxSize` through `createIcon`'s `defaultProps`.
  // Not a JSX attribute before the spread: that spelling is a presence merge, so a wrapper
  // forwarding an unset `boxSize` deletes it and the icon renders at the browser's default `svg`
  // size (`CLAUDE.md`, *The third hazard*). A value in an object literal inside a function call
  // reaches no extractor either, so the preset carries a `boxSize: ["1em"]` `staticCss` row.
  const merged = withDefaults(props, {
    boxSize: "1em",
  } satisfies Partial<FieldErrorIconProps>);

  return <ErrorCircleIcon {...merged} />;
};

/**
 * The `*` after a required field's label — decoration, since `required` on the control is what a
 * screen reader announces, which is why it is `aria-hidden`.
 *
 * When the field is not `required` it renders `fallback` instead, so a form can keep the label row
 * the same height either way: `<Field.RequiredIndicator fallback={<Badge>Optional</Badge>} />`.
 *
 * **Neither slot is wrapped in `children()`, and that is measured rather than assumed.** A
 * JSX-element prop is a getter that runs `createComponent` on every read, so a slot read by a gate
 * *and* by the body it feeds has to be resolved once — but each of these is read exactly once per
 * branch here, by the one `Show` arm that uses it, and a reflexive `children()` would only move a
 * hydration key. `field.browser.test.tsx` counts the constructions, which is the only thing that can
 * see either answer.
 *
 * The `*` default sits in the merged bag's own getter for the same reason it would otherwise sit
 * inside a `children()` call: a `withDefaults` bag builds its defaults eagerly, for every indicator
 * including the ones that already have children.
 */
export const FieldRequiredIndicator: Component<FieldRequiredIndicatorProps> = (props) => {
  const ctx = useFieldContext();
  const styles = useFieldStyles();

  const elementProps = mergeProps(() => ctx.getRequiredIndicatorProps(), omit(props, "fallback"), {
    get children() {
      return props.children ?? "*";
    },
  }) as SpanProps;

  return (
    <Show when={ctx.required} fallback={props.fallback}>
      {renderStyled<SpanProps, HTMLSpanElement>({
        as: (props.as ?? "span") as ValidComponent,
        props: elementProps,
        render: props.render,
        recipeClass: () => styles().requiredIndicator,
      })}
    </Show>
  );
};

/**
 * One control among several under a single label — a set of radios, a pair of date inputs. Everything
 * that *names* a control is re-pointed at this item's own ids, so each gets a label of its own while
 * the states, the texts and the slot classes stay the parent's.
 *
 * It renders no element: it is the ids that are per-item, not a box around them.
 *
 * `merge`, never a spread — the field is getters over live signals, and a spread would read each one
 * here and freeze this item's context at whatever the state was when it mounted.
 */
export function FieldItem(props: FieldItemProps): JSX.Element {
  // Outside a `Field.Root` this throws `Field sub-components must be rendered inside a Field root
  // component.`, which is the named error upstream raises by hand; nothing more is owed.
  const field = useFieldContext();
  const item = merge(
    field,
    deriveFieldItem(field, () => props.value),
  );

  return <FieldProvider value={item}>{props.children}</FieldProvider>;
}

/**
 * Hands the field to a render prop, for reading its state without writing a component:
 * `<Field.Context>{(field) => <Show when={field.invalid}>…</Show>}</Field.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the field untracked and
 * freezes on the value it had at mount.
 */
export function FieldContext(props: FieldContextProps): JSX.Element {
  return props.children(useFieldContext());
}
