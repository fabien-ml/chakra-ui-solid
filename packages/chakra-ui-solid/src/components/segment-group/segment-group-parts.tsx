import { createMachineStore, mergeProps, renderStyled } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, createMemo, For, omit } from "solid-js";
import type {
  SegmentGroupContextProps,
  SegmentGroupIndicatorProps,
  SegmentGroupItemBaseProps,
  SegmentGroupItemContextProps,
  SegmentGroupItemHiddenInputProps,
  SegmentGroupItemProps,
  SegmentGroupItemsProps,
  SegmentGroupItemTextProps,
} from "./segment-group.types";
import { parts } from "./segment-group-anatomy";
import {
  SegmentGroupItemProvider,
  useSegmentGroupContext,
  useSegmentGroupItemContext,
} from "./segment-group-context";

type DivProps = ComponentProps<"div">;
type InputProps = ComponentProps<"input">;
type LabelProps = ComponentProps<"label">;
type SpanProps = ComponentProps<"span">;

/**
 * One segment, and **the repeated part** — the whole reason this family has a second context.
 *
 * It renders a `<label>`, which is what makes the whole segment clickable: the machine points its
 * `for` at the `<SegmentGroup.ItemHiddenInput>` inside it, so a click anywhere on the segment picks
 * it without a handler of ours.
 *
 * `value` names the segment to the machine; `disabled` and `invalid` are this segment's own, on top
 * of whatever the group carries. All three are machine arguments rather than DOM attributes.
 *
 * **What it publishes is the segment's identity, never its behaviour.** The parts below read the
 * props bag off this context and hand it straight back to the *group's* getters, so the machine
 * still owns every attribute and this context owns only the argument they need.
 *
 * It is also the element the machine measures: `--left` / `--top` / `--width` / `--height` on the
 * `<SegmentGroup.Indicator>` are this `<label>`'s offset rect, re-read whenever it resizes.
 */
export const SegmentGroupItem: Component<SegmentGroupItemProps> = (props) => {
  const ctx = useSegmentGroupContext();

  // Getters, never `{ value: props.value, … }`: this bag is read again on every transition, by every
  // part below and by the memo underneath it, so a copy taken here would pin the whole segment to
  // the value it was built with — and a segment whose `value` comes from a signal would keep
  // answering with the old one.
  const itemProps: SegmentGroupItemBaseProps = {
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
  // segment rather than each part re-deriving it. The read of `props.value` happens **inside** the
  // memo, which is its own tracking scope — that is what keeps a segment built inside a `<For>`
  // callback, which SolidJS 2.0 treats as a strict-read phase, free of an untracked read.
  const state = createMemo(() => ctx.getItemState(itemProps));

  const item = createMachineStore(state, { itemProps });

  const elementProps = mergeProps(
    () => ctx.getItemProps(itemProps),
    parts.item.attrs,
    omit(props, "value", "disabled", "invalid"),
  ) as LabelProps;

  return (
    <SegmentGroupItemProvider value={item}>
      {renderStyled<LabelProps, HTMLLabelElement>({
        as: (props.as ?? "label") as ValidComponent,
        props: elementProps,
        render: props.render,
        // Off the Root's map, resolved once for the whole group — every segment in a group carries
        // the identical string, and a per-segment recipe call would be correct and wasteful.
        recipeClass: () => ctx.slots().item,
      })}
    </SegmentGroupItemProvider>
  );
};

/**
 * The segment's label. It needs no `value` of its own — the surrounding `<SegmentGroup.Item>`
 * published one — and no `for` either, since the Item is the `<label>`.
 *
 * Its id is what the hidden input's `aria-labelledby` points at, so a segment with no ItemText is
 * announced by nothing.
 */
export const SegmentGroupItemText: Component<SegmentGroupItemTextProps> = (props) => {
  const ctx = useSegmentGroupContext();
  const item = useSegmentGroupItemContext();

  const elementProps = mergeProps(
    () => ctx.getItemTextProps(item.itemProps),
    parts.itemText.attrs,
    props,
  ) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().itemText,
  });
};

/**
 * The sliding highlight — **one element for the whole group**, behind the checked segment, and the
 * only part of the radio-group family that gives the `indicator` slot a body.
 *
 * It is not drawn by CSS: the machine measures the checked `<SegmentGroup.Item>` with
 * `getOffsetRect` and writes `--left`, `--top`, `--width` and `--height` onto this element as inline
 * custom properties, which the recipe reads back through `var()`. An inline `style` is the legal
 * route for a value no build can see (`CLAUDE.md`, *the hard constraint*), and the machine keeps the four
 * in step with a `ResizeObserver` on the segment.
 *
 * The machine also decides when it exists to be seen: `hidden` while nothing is picked or the rect
 * is still empty, and the transition is switched off until a real value change turns it on — so the
 * highlight appears where it belongs rather than sliding in from the corner on first paint.
 *
 * Render it **before** the segments, or give it a `zIndex` of your own: the slot ships `zIndex: -1`
 * against the root's `isolation: isolate`, which is what keeps it behind the labels.
 */
export const SegmentGroupIndicator: Component<SegmentGroupIndicatorProps> = (props) => {
  const ctx = useSegmentGroupContext();

  // `style` is one of the keys this `mergeProps` *composes* rather than resolving last-wins, so a
  // consumer's own inline style lands on top of the four custom properties instead of replacing
  // them.
  const elementProps = mergeProps(
    () => ctx.getIndicatorProps(),
    parts.indicator.attrs,
    props,
  ) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().indicator,
  });
};

/**
 * The real `<input type="radio">` for one segment, visually hidden and fully focusable — everything
 * a screen reader, a form submission and a keyboard press actually touch.
 *
 * It is required, not optional: the Item's `for` points at it, so without it a click on the segment
 * picks nothing. Every input in one group shares a `name`, which is what makes the arrow keys move
 * between them and what makes the group submit one value.
 *
 * A read-only group serves these `disabled` so the browser refuses the change, and the machine
 * cancels the click as well.
 */
export const SegmentGroupItemHiddenInput: Component<SegmentGroupItemHiddenInputProps> = (props) => {
  const ctx = useSegmentGroupContext();
  const item = useSegmentGroupItemContext();

  // No anatomy pair: the hidden input is not one of the machine's six parts, in Ark or here.
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

/** A bare string is both the value and the label; the long form separates them. */
function normalize(items: SegmentGroupItemsProps["items"]) {
  return items.map((item) => (typeof item === "string" ? { value: item, label: item } : item));
}

/**
 * The whole set of segments from a list, so the common case is one line:
 *
 * ```tsx
 * <SegmentGroup.Items items={["React", "Vue", "Solid"]} />
 * <SegmentGroup.Items items={[{ value: "react", label: <><ReactIcon /> React</>, disabled: true }]} />
 * ```
 *
 * A convenience rather than a part — it renders an `<SegmentGroup.Item>`, an `ItemText` and an
 * `ItemHiddenInput` per entry and nothing of its own. Every other prop is passed to **every**
 * segment, so `<SegmentGroup.Items items={…} disabled />` disables the lot; write the three parts
 * out by hand when one segment needs something the others do not.
 *
 * **Index-keyed** (`keyed={false}`, SolidJS 2.0's spelling of `<Index>`): a segmented control is a
 * fixed row of choices whose contents change, and `normalize` builds fresh objects whenever `items`
 * does — so the default identity-keyed `<For>` would tear down and rebuild every `<label>` on each
 * tick, and the machine's indicator measures those labels. It would lose its rect mid-transition and
 * the highlight would jump.
 */
export const SegmentGroupItems: Component<SegmentGroupItemsProps> = (props) => {
  // Every prop but the list, applied to each segment — after the two the entry itself supplies, so a
  // group-wide `disabled` wins over an entry's, which is upstream's order.
  const itemProps = omit(props, "items");

  // One read of `items`, in a scope of its own. It is a JSX prop like any other — a `label` may be
  // markup, so an array literal written inline is rebuilt on every read — and `<For>` re-reads
  // `each` whenever anything it tracked changed.
  const items = createMemo(() => normalize(props.items));

  return (
    <For each={items()} keyed={false}>
      {(item) => (
        <SegmentGroupItem value={item().value} disabled={item().disabled} {...itemProps}>
          <SegmentGroupItemText>{item().label}</SegmentGroupItemText>
          <SegmentGroupItemHiddenInput />
        </SegmentGroupItem>
      )}
    </For>
  );
};

/**
 * Hands the machine to a render prop, for reading the group's state without writing a component:
 * `<SegmentGroup.Context>{(g) => <Show when={g.value === "React"}>picked</Show>}</SegmentGroup.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function SegmentGroupContext(props: SegmentGroupContextProps): JSX.Element {
  return props.children(useSegmentGroupContext());
}

/**
 * The same, for **one segment's** state — `checked`, `disabled`, `focused`, `hovered` and the rest,
 * read off the item context its surrounding `<SegmentGroup.Item>` published.
 *
 * ```tsx
 * <SegmentGroup.ItemContext>
 *   {(item) => <Show when={item.checked} fallback="—">✓</Show>}
 * </SegmentGroup.ItemContext>
 * ```
 *
 * Same hazard, same rule: the callback runs in this body, so it must return JSX rather than a bare
 * ternary.
 */
export function SegmentGroupItemContext(props: SegmentGroupItemContextProps): JSX.Element {
  return props.children(useSegmentGroupItemContext());
}
