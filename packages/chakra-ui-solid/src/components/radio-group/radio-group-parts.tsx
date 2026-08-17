import { createMachineStore, mergeProps, renderStyled } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, createMemo, omit } from "solid-js";
import { Radiomark, type RadiomarkProps } from "../radiomark";
import type {
  RadioGroupContextProps,
  RadioGroupItemBaseProps,
  RadioGroupItemContextProps,
  RadioGroupItemControlProps,
  RadioGroupItemHiddenInputProps,
  RadioGroupItemIndicatorProps,
  RadioGroupItemProps,
  RadioGroupItemTextProps,
  RadioGroupLabelProps,
} from "./radio-group.types";
import {
  RadioGroupItemProvider,
  useRadioGroupContext,
  useRadioGroupItemContext,
} from "./radio-group-context";

type DivProps = ComponentProps<"div">;
type InputProps = ComponentProps<"input">;
type LabelProps = ComponentProps<"label">;
type SpanProps = ComponentProps<"span">;

/**
 * The heading over the whole set — what `aria-labelledby` on the `role="radiogroup"` box points at.
 *
 * Clicking it focuses the first enabled radio, which is the machine's behaviour rather than a
 * handler of ours.
 */
export const RadioGroupLabel: Component<RadioGroupLabelProps> = (props) => {
  const ctx = useRadioGroupContext();
  const elementProps = mergeProps(() => ctx.getLabelProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().label,
  });
};

/**
 * One radio's row, and **the repeated part** — the whole reason this family has a second context.
 *
 * It renders a `<label>`, which is what makes the row clickable: the machine points its `for` at the
 * `<RadioGroup.ItemHiddenInput>` inside it, so a click anywhere in the row picks this radio without
 * a handler of ours.
 *
 * `value` names the radio to the machine; `disabled` and `invalid` are this radio's own, on top of
 * whatever the group carries. All three are machine arguments rather than DOM attributes — they come
 * back out of `getItemProps()` as `data-disabled` and `data-invalid`, resolved against the group.
 *
 * **What it publishes is the item's identity, never its behaviour.** The parts below read the props
 * bag off this context and hand it straight back to the *group's* getters, so the machine still owns
 * every attribute and this context owns only the argument they need.
 */
export const RadioGroupItem: Component<RadioGroupItemProps> = (props) => {
  const ctx = useRadioGroupContext();

  // Getters, never `{ value: props.value, … }`: this bag is read again on every transition, by every
  // part below and by the memo underneath it, so a copy taken here would pin the whole item to the
  // value it was built with — and an item whose `value` comes from a signal would keep answering
  // with the old one.
  const itemProps: RadioGroupItemBaseProps = {
    get value() {
      return props.value;
    },
    get disabled() {
      return props.disabled;
    },
    get invalid() {
      return props.invalid;
    },
  };

  // `getItemState` builds a fresh eight-key object on every call, so one memo holds it for the whole
  // item rather than each part re-deriving it. The read of `props.value` happens **inside** the memo,
  // which is its own tracking scope — that is what keeps an item built inside a `<For>` callback,
  // which SolidJS 2.0 treats as a strict-read phase, free of an untracked read.
  const state = createMemo(() => ctx.getItemState(itemProps));

  // The same store the machine itself gets: eight reactive getters over one memo, plus the library's
  // own addition. A part reads `item.checked` and gets the current answer, and a state Zag adds in a
  // minor arrives here without an edit.
  const item = createMachineStore(state, { itemProps });

  const elementProps = mergeProps(
    () => ctx.getItemProps(itemProps),
    omit(props, "value", "disabled", "invalid"),
  ) as LabelProps;

  return (
    <RadioGroupItemProvider value={item}>
      {renderStyled<LabelProps, HTMLLabelElement>({
        as: (props.as ?? "label") as ValidComponent,
        props: elementProps,
        render: props.render,
        // Off the Root's map, resolved once for the whole group — every item in a group carries the
        // identical string, and a per-item recipe call would be correct and wasteful.
        recipeClass: () => ctx.slots().item,
      })}
    </RadioGroupItemProvider>
  );
};

/**
 * The text beside one radio. It needs no `value` of its own — the surrounding `<RadioGroup.Item>`
 * published one — and no `for` either, since the Item is the `<label>`.
 *
 * Its id is what the hidden input's `aria-labelledby` points at, so a radio with no ItemText is
 * announced by nothing.
 */
export const RadioGroupItemText: Component<RadioGroupItemTextProps> = (props) => {
  const ctx = useRadioGroupContext();
  const item = useRadioGroupItemContext();

  const elementProps = mergeProps(() => ctx.getItemTextProps(item.itemProps), props) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().itemText,
  });
};

/**
 * The circle, **plain** — the box with the border and the radius, and nothing inside it.
 *
 * `<RadioGroup.ItemIndicator>` renders the same machine element with the mark in it, so use one or
 * the other. This one is for a glyph of your own.
 *
 * `aria-hidden` comes from the machine: the hidden input is what a screen reader reads, and the
 * circle is decoration.
 */
export const RadioGroupItemControl: Component<RadioGroupItemControlProps> = (props) => {
  const ctx = useRadioGroupContext();
  const item = useRadioGroupItemContext();

  const elementProps = mergeProps(() => ctx.getItemControlProps(item.itemProps), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().itemControl,
  });
};

/**
 * The circle **with the dot in it** — what a radio group normally renders.
 *
 * It is the machine's `itemControl` element drawn as a `<Radiomark>`, which is one element and not
 * two: the React version writes `<ItemControl asChild><Radiomark/></ItemControl>`, and `render` is
 * what that spelling is here. So this part and `<RadioGroup.ItemControl>` describe the same element,
 * and rendering both would put the machine's id on two nodes.
 *
 * **The mark's own recipe is switched off.** `radioGroup`'s `itemControl` slot already carries the
 * whole `radiomark` body — the border, the radius, the size, `cursor: radio` and the `& .dot` rule —
 * so leaving it on would draw a second circle inside the first. `unstyled` sits after the spread
 * rather than before it, which is what makes it a decision rather than something a forwarded
 * `undefined` deletes (`CLAUDE.md`, *The third hazard*).
 *
 * `aria-hidden` is the machine's, inherited with the rest of `getItemControlProps()` — nothing here
 * adds one.
 */
export const RadioGroupItemIndicator: Component<RadioGroupItemIndicatorProps> = (props) => {
  const ctx = useRadioGroupContext();
  const item = useRadioGroupItemContext();

  const elementProps = mergeProps(
    () => ctx.getItemControlProps(item.itemProps),
    props,
  ) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    // Never reached — `render` is always supplied below, and it is what decides the element. The
    // Radiomark it renders is a `span`, which is what this names.
    as: "span",
    props: elementProps,
    render: (controlProps) => (
      <Radiomark
        // Every style prop written on this part is already a class by the time `render` is called,
        // so what arrives here is DOM attributes. The cast is the five names Chakra displaces —
        // `translate`, `width`, `height`, `content` and `size` — which are style props going in and
        // real attributes coming out, and no one type is both.
        {...(controlProps as unknown as RadiomarkProps)}
        as={props.as}
        render={props.render}
        unstyled
        checked={item.checked}
        disabled={item.disabled}
      />
    ),
    // The `itemControl` slot, below the style props — which is where the React version's
    // `css={[styles.itemControl, props.css]}` puts it too. Handing it to the Radiomark as a `class`
    // instead would lift it *above* them, and `<RadioGroup.ItemIndicator borderColor="red">` would
    // silently keep the recipe's border.
    recipeClass: () => ctx.slots().itemControl,
  });
};

/**
 * The real `<input type="radio">` for one radio, visually hidden and fully focusable — everything a
 * screen reader, a form submission and a keyboard press actually touch.
 *
 * It is required, not optional: the Item's `for` points at it, so without it a click on the row
 * picks nothing. Every input in one group shares a `name`, which is what makes the arrow keys move
 * between them and what makes the group submit one value.
 *
 * A read-only group serves these `disabled` so the browser refuses the change, and the machine
 * cancels the click as well.
 */
export const RadioGroupItemHiddenInput: Component<RadioGroupItemHiddenInputProps> = (props) => {
  const ctx = useRadioGroupContext();
  const item = useRadioGroupItemContext();

  const elementProps = mergeProps(
    () => ctx.getItemHiddenInputProps(item.itemProps),
    props,
  ) as InputProps;

  return renderStyled<InputProps, HTMLInputElement>({
    as: (props.as ?? "input") as ValidComponent,
    props: elementProps,
    render: props.render,
  });
};

/**
 * Hands the machine to a render prop, for reading the group's state without writing a component:
 * `<RadioGroup.Context>{(g) => <Show when={g.value === "solid"}>picked</Show>}</RadioGroup.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function RadioGroupContext(props: RadioGroupContextProps): JSX.Element {
  return props.children(useRadioGroupContext());
}

/**
 * The same, for **one radio's** state — `checked`, `disabled`, `focused`, `hovered` and the rest,
 * read off the item context its surrounding `<RadioGroup.Item>` published.
 *
 * ```tsx
 * <RadioGroup.ItemContext>
 *   {(item) => <Show when={item.checked} fallback="—">✓</Show>}
 * </RadioGroup.ItemContext>
 * ```
 *
 * Same hazard, same rule: the callback runs in this body, so it must return JSX rather than a bare
 * ternary.
 */
export function RadioGroupItemContext(props: RadioGroupItemContextProps): JSX.Element {
  return props.children(useRadioGroupItemContext());
}
