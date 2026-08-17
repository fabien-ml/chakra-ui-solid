import {
  chakra,
  mergeProps,
  renderStyled,
  useChakraContext,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, children, Match, omit, Switch } from "solid-js";
import { Checkmark } from "../checkmark";
import { useOptionalFieldContext } from "../field/field-context";
import type {
  CheckboxContextProps,
  CheckboxControlProps,
  CheckboxHiddenInputProps,
  CheckboxIndicatorProps,
  CheckboxLabelProps,
} from "./checkbox.types";
import { useCheckboxContext } from "./checkbox-context";

type DivProps = ComponentProps<"div">;
type InputProps = ComponentProps<"input">;
type SpanProps = ComponentProps<"span">;

/**
 * The text beside the box. It needs no `for` of its own — the Root is the `<label>` — so this is a
 * `span` carrying the machine's state attributes and the recipe's `label` slot.
 */
export const CheckboxLabel: Component<CheckboxLabelProps> = (props) => {
  const ctx = useCheckboxContext();
  const elementProps = mergeProps(() => ctx.getLabelProps(), props) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().label,
  });
};

/**
 * The box itself — **this is the element the tick is drawn on**, not the indicator inside it. The
 * `control` slot carries the whole `checkmark` recipe body: the border, the radius, the size, the
 * `cursor: checkbox`, and every variant's paint.
 *
 * Its children default to a `<Checkbox.Indicator />`, so `<Checkbox.Control />` is the whole box.
 * Pass a glyph of your own to replace the mark, or `null` for an empty box.
 *
 * `aria-hidden` comes from the machine: the hidden input is what a screen reader reads, and the box
 * is decoration.
 */
export const CheckboxControl: Component<CheckboxControlProps> = (props) => {
  const ctx = useCheckboxContext();

  // One read of `props.children`, inside one `children()` call. The prop is a getter that runs
  // `createComponent` on every read, so the gate and the body would build a child twice and throw
  // one away — and the merged bag below re-reads its `children` on every spread pass, which
  // `children()` collapses to a single construction (`CLAUDE.md`, *The second hazard*).
  //
  // `!== undefined`, never `??`: React's `defaultProps` fills only an *absent* child, so
  // `<Checkbox.Control>{null}</Checkbox.Control>` is an empty box in either library where `??` would
  // put the mark back.
  const content = children(() => {
    const provided = props.children;
    return provided !== undefined ? provided : <CheckboxIndicator />;
  });

  const elementProps = mergeProps(() => ctx.getControlProps(), props, {
    get children() {
      return content();
    },
  }) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().control,
  });
};

/**
 * The mark inside the box — a tick when checked, a dash when indeterminate, nothing at rest.
 *
 * **It is not a machine part**, which is Chakra's own shape rather than an omission: the anatomy
 * names an `indicator` and Chakra's component never calls `getIndicatorProps()`, so this element
 * carries no `data-scope`, no `data-part` and no `hidden`. What it does carry is `data-state`, which
 * {@link Checkmark} writes for itself.
 *
 * It renders a `<Checkmark unstyled>`: the `checkmark` recipe is switched off because the `control`
 * slot above it already carries that whole body, and the `indicator` slot the class map hands back
 * has no declarations of its own in this recipe — the class travels anyway, so a stylesheet or a
 * test still has a handle on the mark.
 *
 * `checked` and `indeterminate` replace the glyph for one state each, and each is a **function**
 * that is handed this part's computed props — the same class the default mark wears, and every
 * other prop written on the `Checkbox.Indicator`. Spread them onto your glyph.
 */
export const CheckboxIndicator: Component<CheckboxIndicatorProps> = (props) => {
  const ctx = useCheckboxContext();
  const system = useChakraContext();

  // `unstyled` through `withDefaults` rather than as an attribute before the spread, because a
  // spread merges by presence: `<Checkbox.Indicator unstyled={undefined} />` would switch the
  // `checkmark` recipe back on underneath the `control` slot that already draws the box, and the
  // mark would render with a second border of its own (`CLAUDE.md`, *The third hazard*).
  const merged = withDefaults(props, {
    unstyled: true,
  } satisfies Partial<CheckboxIndicatorProps>);

  // The two escape hatches are this component's inputs, not the `svg`'s: forwarded, `checked` would
  // reach `Checkmark`'s own boolean `checked` as a function.
  const markProps = omit(merged, "checked", "indeterminate", "class");

  // The one class both arms wear, so a glyph of a consumer's own is styled exactly as the default
  // mark is — the `indicator` slot, then whatever `class` they wrote, which wins ties.
  const indicatorClass = () =>
    system().cx(ctx.slots().indicator, merged.class as string | undefined);

  // No `children()` anywhere: an escape hatch is a function now, not a JSX prop, so reading it in a
  // gate and again in a body constructs nothing (`CLAUDE.md`, *The second hazard*).
  //
  // Each arm goes through `chakra.svg` rather than calling the function itself, because that is
  // what turns the style props on this part into a class before the glyph is handed them — called
  // directly, a `<Checkbox.Indicator color="red" checked={…} />` would pass `color` on as a raw
  // prop and the glyph would go unstyled. `render` receives what is left: the DOM props and the
  // composed class.
  return (
    <Switch
      fallback={
        <Checkmark
          checked={ctx.checked}
          indeterminate={ctx.indeterminate}
          disabled={ctx.disabled}
          {...markProps}
          class={indicatorClass()}
        />
      }
    >
      <Match when={merged.checked && ctx.checked}>
        <chakra.svg {...markProps} class={indicatorClass()} render={merged.checked} />
      </Match>
      <Match when={merged.indeterminate && ctx.indeterminate}>
        <chakra.svg {...markProps} class={indicatorClass()} render={merged.indeterminate} />
      </Match>
    </Switch>
  );
};

/**
 * The real `<input type="checkbox">`, visually hidden and fully focusable — everything a screen
 * reader, a form submission and a keyboard press actually touch.
 *
 * It is required, not optional: the Root's `for` points at it, so without it a click on the label
 * toggles nothing.
 *
 * **The machine writes `.checked` and `.indeterminate` onto this node imperatively**, from its own
 * effect — so nothing here tries to control either property. The machine's `defaultChecked` is what
 * decides the served `checked` attribute, and the effect takes over from the first change onwards.
 *
 * One consequence, and it is Zag's on every framework it ships: the effect is change-only, so a box
 * that *started* indeterminate reports that state through `data-state` and the glyph while this
 * input's `indeterminate` property is still `false`. The first real change brings them together.
 *
 * Inside a `<Field.Root>` it also picks up the field's `aria-describedby`, so the helper text is
 * announced with the box.
 */
export const CheckboxHiddenInput: Component<CheckboxHiddenInputProps> = (props) => {
  const ctx = useCheckboxContext();
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
 * `<Checkbox.Context>{(c) => <Show when={c.checked}>on</Show>}</Checkbox.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function CheckboxContext(props: CheckboxContextProps): JSX.Element {
  return props.children(useCheckboxContext());
}
