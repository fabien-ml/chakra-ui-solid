import { createMachineStore, mergeProps, renderStyled } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, createMemo, omit, Show } from "solid-js";
import { Radiomark, type RadiomarkProps } from "../radiomark";
import type {
  RadioCardContextProps,
  RadioCardItemAddonProps,
  RadioCardItemBaseProps,
  RadioCardItemContentProps,
  RadioCardItemContextProps,
  RadioCardItemControlProps,
  RadioCardItemDescriptionProps,
  RadioCardItemHiddenInputProps,
  RadioCardItemIndicatorProps,
  RadioCardItemProps,
  RadioCardItemTextProps,
  RadioCardLabelProps,
} from "./radio-card.types";
import {
  RadioCardItemProvider,
  useRadioCardContext,
  useRadioCardItemContext,
} from "./radio-card-context";

type DivProps = ComponentProps<"div">;
type InputProps = ComponentProps<"input">;
type LabelProps = ComponentProps<"label">;
type SpanProps = ComponentProps<"span">;

/**
 * The heading over the whole set — what `aria-labelledby` on the `role="radiogroup"` box points at.
 *
 * Clicking it focuses the picked card, which is the machine's behaviour rather than a handler of
 * ours.
 */
export const RadioCardLabel: Component<RadioCardLabelProps> = (props) => {
  const ctx = useRadioCardContext();
  const elementProps = mergeProps(() => ctx.getLabelProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().label,
  });
};

/**
 * One card, and **the repeated part** — the whole reason this family has a second context.
 *
 * It renders a `<label>`, which is what makes the whole card clickable: the machine points its `for`
 * at the `<RadioCard.ItemHiddenInput>` inside it, so a click anywhere on the card picks it without a
 * handler of ours.
 *
 * `value` names the card to the machine; `disabled` and `invalid` are this card's own, on top of
 * whatever the group carries. All three are machine arguments rather than DOM attributes.
 *
 * **What it publishes is the card's identity, never its behaviour.** The parts below read the props
 * bag off this context and hand it straight back to the *group's* getters, so the machine still owns
 * every attribute and this context owns only the argument they need.
 */
export const RadioCardItem: Component<RadioCardItemProps> = (props) => {
  const ctx = useRadioCardContext();

  // Getters, never `{ value: props.value, … }`: this bag is read again on every transition, by every
  // part below and by the memo underneath it, so a copy taken here would pin the whole card to the
  // value it was built with — and a card whose `value` comes from a signal would keep answering with
  // the old one.
  const itemProps: RadioCardItemBaseProps = {
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
  // card rather than each part re-deriving it. The read of `props.value` happens **inside** the memo,
  // which is its own tracking scope — that is what keeps a card built inside a `<For>` callback,
  // which SolidJS 2.0 treats as a strict-read phase, free of an untracked read.
  const state = createMemo(() => ctx.getItemState(itemProps));

  const item = createMachineStore(state, { itemProps });

  const elementProps = mergeProps(
    () => ctx.getItemProps(itemProps),
    omit(props, "value", "disabled", "invalid"),
  ) as LabelProps;

  return (
    <RadioCardItemProvider value={item}>
      {renderStyled<LabelProps, HTMLLabelElement>({
        as: (props.as ?? "label") as ValidComponent,
        props: elementProps,
        render: props.render,
        // Off the Root's map, resolved once for the whole group — every card in a group carries the
        // identical string, and a per-card recipe call would be correct and wasteful.
        recipeClass: () => ctx.slots().item,
      })}
    </RadioCardItemProvider>
  );
};

/**
 * The card's title. It needs no `value` of its own — the surrounding `<RadioCard.Item>` published
 * one — and no `for` either, since the Item is the `<label>`.
 *
 * Its id is what the hidden input's `aria-labelledby` points at, so a card with no ItemText is
 * announced by nothing.
 */
export const RadioCardItemText: Component<RadioCardItemTextProps> = (props) => {
  const ctx = useRadioCardContext();
  const item = useRadioCardItemContext();

  const elementProps = mergeProps(() => ctx.getItemTextProps(item.itemProps), props) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().itemText,
  });
};

/**
 * The dimmer line under the title.
 *
 * A slot with no machine part behind it, and — unlike `CheckboxCard.Description`, which hand-stamps
 * its anatomy pair and two state attributes — **no attributes at all**. That is upstream's shape:
 * the element carries this recipe's class and the style props and nothing else, and what dims it
 * with a disabled card is the `_disabled` block on the `item` above it.
 */
export const RadioCardItemDescription: Component<RadioCardItemDescriptionProps> = (props) => {
  const ctx = useRadioCardContext();

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: props as DivProps,
    render: props.render,
    recipeClass: () => ctx.slots().itemDescription,
  });
};

/**
 * The clickable box the card's contents sit in — the element that takes the `size` padding, reads
 * `--radio-card-justify` and `--radio-card-align`, and turns with `orientation`.
 *
 * **It is not a machine part**, which is Chakra's own shape rather than an omission. The six
 * attributes below are written here out of the card's own state, and the seven the machine's
 * `getItemControlProps()` would have added are deliberately absent: `data-scope`/`data-part`,
 * `aria-hidden`, `dir`, `id`, `data-focus-visible`, `data-readonly`, `data-orientation` and
 * `data-ssr`. `RadioGroup.ItemControl` is the machine part, and it carries all of them — that
 * contrast is the one thing this part exists to show.
 *
 * The absent `id` is the load-bearing one: without it this element is not the machine's
 * `itemControl` node, so a card renders **both** a control and an indicator where a radio renders
 * one or the other.
 */
export const RadioCardItemControl: Component<RadioCardItemControlProps> = (props) => {
  const ctx = useRadioCardContext();
  const item = useRadioCardItemContext();

  // Before the consumer's props, which is the order every machine part uses and upstream's own here:
  // a consumer may override a state attribute, and the six are derived rather than identity.
  //
  // Chakra's `dataAttr`: present-and-empty when true, absent when false.
  const elementProps = mergeProps(
    () => ({
      "data-focus": item.focused ? "" : undefined,
      "data-disabled": item.disabled ? "" : undefined,
      "data-state": item.checked ? "checked" : "unchecked",
      "data-hover": item.hovered ? "" : undefined,
      "data-active": item.active ? "" : undefined,
      "data-invalid": item.invalid ? "" : undefined,
    }),
    props,
  ) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().itemControl,
  });
};

/**
 * The column of text inside the control — an `ItemText`, usually with an `ItemDescription` under it.
 *
 * A slot with no machine part: the anatomy has no `itemContent`, so this element carries the
 * recipe's class and the style props and nothing else. It is what makes the title and the
 * description stack while the circle stays beside them.
 */
export const RadioCardItemContent: Component<RadioCardItemContentProps> = (props) => {
  const ctx = useRadioCardContext();

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: props as DivProps,
    render: props.render,
    recipeClass: () => ctx.slots().itemContent,
  });
};

/**
 * The strip below the control — supporting text, a badge, a price.
 *
 * A slot with no machine part, and the one part that sits **outside** the `RadioCard.ItemControl`:
 * the sizes give it its own padding and a top border, so it reads as a separate band on the card. It
 * is still inside the Item's `<label>`, so a click on it picks the card.
 */
export const RadioCardItemAddon: Component<RadioCardItemAddonProps> = (props) => {
  const ctx = useRadioCardContext();

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: props as DivProps,
    render: props.render,
    recipeClass: () => ctx.slots().itemAddon,
  });
};

/**
 * The circle, and the dot in it once the card is picked.
 *
 * **The whole `radiomark` body is on the `itemIndicator` slot here** — the border, the radius, the
 * size, `cursor: radio` and the `& .dot` rule — where `radioGroup` puts it on `itemControl`. So this
 * is the one part of a card that draws a mark, and it renders a `<Radiomark unstyled>` for the same
 * reason its radio-group counterpart does: leaving the mark's own recipe on would draw a second
 * circle inside the first.
 *
 * **`aria-hidden` is written here, on both branches.** This part is not a machine part — nothing
 * merges `getItemControlProps()` — so unlike `RadioGroup.ItemIndicator` it inherits none, and the
 * hidden input is what a screen reader reads.
 *
 * `checked` replaces the circle while this card is picked, and it is a **function** handed this
 * part's computed props — the composed `class` among them, which is where the whole mark lives.
 * Spread them onto your glyph.
 */
export const RadioCardItemIndicator: Component<RadioCardItemIndicatorProps> = (props) => {
  const ctx = useRadioCardContext();
  const item = useRadioCardItemContext();

  // `aria-hidden` after the props rather than before, so nothing a consumer forwards can take it off
  // — which is where the React version writes it too. `checked` is this component's own input and
  // never an attribute: forwarded, it would reach the DOM as `checked="() => …"` until the next line
  // overwrote it, which is exactly what upstream's `{...props}` on the fallback branch does.
  const elementProps = mergeProps(omit(props, "checked"), {
    "aria-hidden": "true",
  }) as SpanProps;

  // The `itemIndicator` slot rides `recipeClass`, which sits **below** the style props — where the
  // React version's `css={[styles.itemIndicator, props.css]}` puts it too. Handing it to the
  // Radiomark as a `class` instead would lift it above them, and the documented
  // `<RadioCard.ItemIndicator borderWidth="0" checked={…} />` would silently keep the slot's border.
  const recipeClass = () => ctx.slots().itemIndicator;

  // A `<Show>` rather than a ternary inside one `render`: `render` is called once, in the element's
  // own body, so a ternary there would freeze on the state the card had at mount. No `children()`
  // anywhere either — `checked` is a function now, not a JSX prop, so reading it in the gate and
  // again in the branch constructs nothing (`CLAUDE.md`, *The second hazard*).
  return (
    <Show
      when={props.checked !== undefined && item.checked}
      fallback={renderStyled<SpanProps, HTMLSpanElement>({
        // Never reached — `render` is always supplied below, and it is what decides the element. The
        // Radiomark it renders is a `span`, which is what this names.
        as: "span",
        props: elementProps,
        render: (indicatorProps) => (
          <Radiomark
            // Every style prop written on this part is already a class by the time `render` is
            // called, so what arrives here is DOM attributes. The cast is the five names Chakra
            // displaces — `translate`, `width`, `height`, `content` and `size` — which are style
            // props going in and real attributes coming out, and no one type is both.
            {...(indicatorProps as unknown as RadiomarkProps)}
            as={props.as}
            render={props.render}
            unstyled
            checked={item.checked}
            disabled={item.disabled}
          />
        ),
        recipeClass,
      })}
    >
      {renderStyled<SpanProps, HTMLSpanElement>({
        // Never reached either: `checked` is the render prop for this branch, and the gate above
        // only opens when it is set.
        as: "span",
        props: elementProps,
        render: props.checked,
        recipeClass,
      })}
    </Show>
  );
};

/**
 * The real `<input type="radio">` for one card, visually hidden and fully focusable — everything a
 * screen reader, a form submission and a keyboard press actually touch.
 *
 * It is required, not optional: the Item's `for` points at it, so without it a click on the card
 * picks nothing. Every input in one group shares a `name`, which is what makes the arrow keys move
 * between them and what makes the group submit one value.
 *
 * A read-only group serves these `disabled` so the browser refuses the change, and the machine
 * cancels the click as well.
 */
export const RadioCardItemHiddenInput: Component<RadioCardItemHiddenInputProps> = (props) => {
  const ctx = useRadioCardContext();
  const item = useRadioCardItemContext();

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
 * `<RadioCard.Context>{(g) => <Show when={g.value === "next"}>picked</Show>}</RadioCard.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function RadioCardContext(props: RadioCardContextProps): JSX.Element {
  return props.children(useRadioCardContext());
}

/**
 * The same, for **one card's** state — `checked`, `disabled`, `focused`, `hovered` and the rest,
 * read off the item context its surrounding `<RadioCard.Item>` published.
 *
 * ```tsx
 * <RadioCard.ItemContext>
 *   {(item) => <Show when={item.checked} fallback="—">✓</Show>}
 * </RadioCard.ItemContext>
 * ```
 *
 * Same hazard, same rule: the callback runs in this body, so it must return JSX rather than a bare
 * ternary.
 */
export function RadioCardItemContext(props: RadioCardItemContextProps): JSX.Element {
  return props.children(useRadioCardItemContext());
}
