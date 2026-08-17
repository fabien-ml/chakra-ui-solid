import { mergeProps, renderStyled, useChakraContext, withDefaults } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { Checkmark } from "../checkmark";
import { useOptionalFieldContext } from "../field/field-context";
import type {
  CheckboxCardAddonProps,
  CheckboxCardContentProps,
  CheckboxCardContextProps,
  CheckboxCardControlProps,
  CheckboxCardDescriptionProps,
  CheckboxCardHiddenInputProps,
  CheckboxCardIndicatorProps,
  CheckboxCardLabelProps,
} from "./checkbox-card.types";
import { useCheckboxCardContext } from "./checkbox-card-context";

type DivProps = ComponentProps<"div">;
type InputProps = ComponentProps<"input">;
type SpanProps = ComponentProps<"span">;

/**
 * The clickable box the card's contents sit in.
 *
 * It reads `--checkbox-card-justify` and `--checkbox-card-align` — the two custom properties the
 * `justify` and `align` variants write on the Root — so those two variants reach this element
 * through the cascade rather than through a class of its own. `justify` has no default, and unset it
 * writes nothing at all: the control keeps `justify-content: normal`.
 *
 * **Its children are not defaulted**, where `Checkbox.Control` fills an absent child with an
 * indicator. A card has no one-element shorthand — compose `Content`, `Label`, `Description` and
 * `Indicator` inside it.
 */
export const CheckboxCardControl: Component<CheckboxCardControlProps> = (props) => {
  const ctx = useCheckboxCardContext();
  const elementProps = mergeProps(() => ctx.getControlProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().control,
  });
};

/**
 * The column of text inside the control — a `Label`, usually with a `Description` under it.
 *
 * A slot with no machine part behind it: the anatomy has no `content`, so this element carries the
 * recipe's class and the style props and nothing else. It is what makes the label and the
 * description stack while the indicator stays beside them.
 */
export const CheckboxCardContent: Component<CheckboxCardContentProps> = (props) => {
  const ctx = useCheckboxCardContext();

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: props as DivProps,
    render: props.render,
    recipeClass: () => ctx.slots().content,
  });
};

/**
 * The card's title. It needs no `for` of its own — the Root is the `<label>` — so this is a `span`
 * carrying the machine's state attributes and the recipe's `label` slot.
 */
export const CheckboxCardLabel: Component<CheckboxCardLabelProps> = (props) => {
  const ctx = useCheckboxCardContext();
  const elementProps = mergeProps(() => ctx.getLabelProps(), props) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().label,
  });
};

/**
 * The dimmer line under the label.
 *
 * **Not a machine part**: the checkbox anatomy has no `description`, so there is no prop getter to
 * merge and this element's attributes are written here out of context instead — the anatomy pair,
 * plus `data-disabled` and `data-state`, which is what the recipe's `_disabled` block and a
 * consumer's own `[data-state=checked]` selector key on.
 */
export const CheckboxCardDescription: Component<CheckboxCardDescriptionProps> = (props) => {
  const ctx = useCheckboxCardContext();

  // After the spread, not before it: a consumer may restyle this line, and nobody may take its
  // identity off it — the same split `CheckboxGroup` makes on its own hand-written attributes. It
  // also puts them out of reach of a wrapper forwarding `data-part={undefined}`, which a JSX
  // attribute *before* a spread would lose (`CLAUDE.md`, *The third hazard*).
  const elementProps = mergeProps(props, () => ({
    "data-scope": "checkbox-card",
    "data-part": "description",
    "data-disabled": ctx.disabled ? "" : undefined,
    "data-state": ctx.checked ? "checked" : "unchecked",
  })) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().description,
  });
};

/**
 * The tick — a mark when checked, a dash when indeterminate, an empty box at rest.
 *
 * **This is the element the box is drawn on**, which is the exact inverse of `Checkbox.Indicator`:
 * there the whole `checkmark` recipe body sits on the `control` slot and `indicator` is empty, and
 * here `indicator` carries the border, the radius, the size, the `cursor: checkbox` and every
 * variant's paint while `control` styles the card around it.
 *
 * It renders a `<Checkmark unstyled>` for that reason — the `checkmark` recipe is switched off
 * because this slot already carries its body, and a second copy would draw a box inside the box.
 *
 * **It takes no `checked` or `indeterminate` escape hatch**, where `Checkbox.Indicator` takes both.
 * That is upstream's own shape. To draw something else, leave this part out and put your own element
 * in the `CheckboxCard.Control`.
 */
export const CheckboxCardIndicator: Component<CheckboxCardIndicatorProps> = (props) => {
  const ctx = useCheckboxCardContext();
  const system = useChakraContext();

  // `unstyled` through `withDefaults` rather than as an attribute before the spread, because a
  // spread merges by presence: `<CheckboxCard.Indicator unstyled={undefined} />` would switch the
  // `checkmark` recipe back on underneath the `indicator` slot that already draws the box, and the
  // mark would render with a second border of its own (`CLAUDE.md`, *The third hazard*).
  const merged = withDefaults(props, {
    unstyled: true,
  } satisfies Partial<CheckboxCardIndicatorProps>);

  const markProps = omit(merged, "class");

  // The `indicator` slot first, then whatever `class` the consumer wrote, which wins ties.
  const indicatorClass = () =>
    system().cx(ctx.slots().indicator, merged.class as string | undefined);

  return (
    <Checkmark
      checked={ctx.checked}
      indeterminate={ctx.indeterminate}
      disabled={ctx.disabled}
      {...markProps}
      class={indicatorClass()}
      data-scope="checkbox-card"
      data-part="indicator"
    />
  );
};

/**
 * The strip below the control — supporting text, a badge, a price.
 *
 * A slot with no machine part, and the one part that sits **outside** the `CheckboxCard.Control`:
 * the sizes give it its own padding and a top border, so it reads as a separate band on the card. It
 * is still inside the Root's `<label>`, so a click on it toggles the box.
 */
export const CheckboxCardAddon: Component<CheckboxCardAddonProps> = (props) => {
  const ctx = useCheckboxCardContext();

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: props as DivProps,
    render: props.render,
    recipeClass: () => ctx.slots().addon,
  });
};

/**
 * The real `<input type="checkbox">`, visually hidden and fully focusable — everything a screen
 * reader, a form submission and a keyboard press actually touch.
 *
 * It is required, not optional: the Root's `for` points at it, so without it a click on the card
 * toggles nothing.
 *
 * **The machine writes `.checked` and `.indeterminate` onto this node imperatively**, from its own
 * effect — so nothing here tries to control either property. One consequence, and it is Zag's on
 * every framework it ships: the effect is change-only, so a card that *started* indeterminate
 * reports that state through `data-state` and the glyph while this input's `indeterminate` property
 * is still `false`. The first real change brings them together.
 *
 * Inside a `<Field.Root>` it also picks up the field's `aria-describedby`, so the helper text is
 * announced with the card.
 */
export const CheckboxCardHiddenInput: Component<CheckboxCardHiddenInputProps> = (props) => {
  const ctx = useCheckboxCardContext();
  const field = useOptionalFieldContext();

  const elementProps = mergeProps(
    () => ({ "aria-describedby": field?.getControlProps()["aria-describedby"] }),
    () => ctx.getHiddenInputProps(),
    props,
  ) as InputProps;

  return renderStyled<InputProps, HTMLInputElement>({
    as: (props.as ?? "input") as ValidComponent,
    props: elementProps,
    render: props.render,
  });
};

/**
 * Hands the machine to a render prop, for reading its state without writing a component:
 * `<CheckboxCard.Context>{(c) => <Show when={c.checked}>on</Show>}</CheckboxCard.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function CheckboxCardContext(props: CheckboxCardContextProps): JSX.Element {
  return props.children(useCheckboxCardContext());
}
