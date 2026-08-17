import { mergeProps, renderStyled } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Accessor, type Component, children, merge, omit } from "solid-js";
import { useOptionalFieldContext } from "../field/field-context";
import type {
  SwitchContextProps,
  SwitchControlProps,
  SwitchHiddenInputProps,
  SwitchIndicatorProps,
  SwitchLabelProps,
  SwitchThumbIndicatorProps,
  SwitchThumbProps,
} from "./switch.types";
import { useSwitchContext } from "./switch-context";

type InputProps = ComponentProps<"input">;
type SpanProps = ComponentProps<"span">;

/**
 * The text beside the track. It needs no `for` of its own — the Root is the `<label>` — so this is a
 * `span` carrying the machine's state attributes and the recipe's `label` slot.
 */
export const SwitchLabel: Component<SwitchLabelProps> = (props) => {
  const ctx = useSwitchContext();
  const elementProps = mergeProps(() => ctx.getLabelProps(), props) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().label,
  });
};

/**
 * The track the thumb slides along — the `control` slot carries its width, its height, its radius
 * and the `cursor: pointer` a switch shows.
 *
 * Its children default to a `<Switch.Thumb />`, so `<Switch.Control />` is the whole track. Pass
 * your own children to compose a `Switch.Indicator` beside the thumb, or `null` for an empty track.
 *
 * `aria-hidden` comes from the machine: the hidden input is what a screen reader reads, and the
 * track is decoration.
 */
export const SwitchControl: Component<SwitchControlProps> = (props) => {
  const ctx = useSwitchContext();

  // One read of `props.children`, inside one `children()` call. The prop is a getter that runs
  // `createComponent` on every read, so the gate and the body would build a child twice and throw
  // one away — and the merged bag below re-reads its `children` on every spread pass, which
  // `children()` collapses to a single construction (`CLAUDE.md`, *The second hazard*).
  //
  // `!== undefined`, never `??`: React's `defaultProps` fills only an *absent* child, so
  // `<Switch.Control>{null}</Switch.Control>` is an empty track in either library where `??` would
  // put the thumb back.
  const content = children(() => {
    const provided = props.children;
    return provided !== undefined ? provided : <SwitchThumb />;
  });

  const elementProps = mergeProps(() => ctx.getControlProps(), props, {
    get children() {
      return content();
    },
  }) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().control,
  });
};

/**
 * The knob that slides across the track. Its `_checked` translation is the whole animation — the
 * recipe moves it by `--switch-x`, which the Root's `size` variant writes.
 */
export const SwitchThumb: Component<SwitchThumbProps> = (props) => {
  const ctx = useSwitchContext();
  const elementProps = mergeProps(() => ctx.getThumbProps(), props) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().thumb,
  });
};

/**
 * The two arms of a `children` / `fallback` pair, resolved once each and read one at a time.
 *
 * Two `children()` calls rather than one, because the arms are two different subtrees and a single
 * memo could only hold one of them. `children()`'s memo is **lazy**, so the arm the gate does not
 * select is never constructed and costs no hydration key — which is what makes an unselected
 * `fallback` free on the server as well as in the browser (`CLAUDE.md`, *The second hazard*).
 */
function createCheckedContent(
  props: { children?: JSX.Element; fallback?: JSX.Element },
  checked: () => boolean,
): Accessor<JSX.Element> {
  const on = children(() => props.children);
  const off = children(() => props.fallback);

  return () => (checked() ? on() : off());
}

/**
 * A glyph on the track, showing one thing while the switch is on and another while it is off — a sun
 * and a moon, an `ON` and an `OFF`.
 *
 * **It is not a machine part**, which is Chakra's own shape rather than an omission: the anatomy
 * this recipe styles has four parts and `indicator` is Chakra's fifth, so this element carries no
 * `data-scope`, no `data-part` and no `data-state`. The one attribute it does carry is
 * `data-checked`, which is what the `indicator` slot's `_checked` block keys on to slide the glyph
 * from one end of the track to the other.
 *
 * Put it inside `Switch.Control`, beside the `Switch.Thumb`.
 */
export const SwitchIndicator: Component<SwitchIndicatorProps> = (props) => {
  const ctx = useSwitchContext();
  const content = createCheckedContent(props, () => ctx.checked);

  // `data-checked` **after** the spread, not before it: a consumer may restyle this glyph, and
  // nobody may take its state off it. A JSX attribute before a spread is a presence merge, so a
  // wrapper forwarding `data-checked={undefined}` would delete the one attribute the `_checked`
  // block selects on and the glyph would sit at the unchecked end for ever, silently
  // (`CLAUDE.md`, *The third hazard*). The React version writes it before its own spread and has
  // exactly that hole; this is the same split `CheckboxCard.Description` already makes.
  const elementProps = merge(omit(props, "fallback"), {
    get children() {
      return content();
    },
    get "data-checked"() {
      return ctx.checked ? "" : undefined;
    },
  }) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().indicator,
  });
};

/**
 * The same pair of arms, for a glyph that rides **inside** the thumb — a tick when on, a cross when
 * off. Put it inside `Switch.Thumb`.
 *
 * **It has no slot of its own**, and that is the whole of what separates it from
 * {@link SwitchIndicator}: the `swittch` recipe declares five slots and none of them is this, so
 * nothing here carries a recipe class and the glyph is sized and coloured by whatever you write on
 * it. It exists because a thumb needs somewhere to put a state-dependent child, not because the
 * design system paints one.
 */
export const SwitchThumbIndicator: Component<SwitchThumbIndicatorProps> = (props) => {
  const ctx = useSwitchContext();
  const content = createCheckedContent(props, () => ctx.checked);

  const elementProps = merge(omit(props, "fallback"), {
    get children() {
      return content();
    },
    get "data-checked"() {
      return ctx.checked ? "" : undefined;
    },
  }) as SpanProps;

  // No `recipeClass`: there is no `thumbIndicator` slot to hand it.
  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
  });
};

/**
 * The real `<input type="checkbox">`, visually hidden and fully focusable — everything a screen
 * reader, a form submission and a keyboard press actually touch.
 *
 * **`type="checkbox"`, not `role="switch"`**, which is Zag's decision on every framework it ships:
 * the native checkbox is what a form serialises and what every assistive technology already
 * understands, and the `Switch.Label` names it through `aria-labelledby`.
 *
 * It is required, not optional: the Root's `for` points at it, so without it a click on the label
 * toggles nothing.
 *
 * **The machine writes `.checked` onto this node imperatively**, from its own effect — so nothing
 * here tries to control the property. The machine's `defaultChecked` is what decides the served
 * `checked` attribute, and the effect takes over from the first change onwards.
 *
 * Inside a `<Field.Root>` it also picks up the field's `aria-describedby`, so the helper text is
 * announced with the switch.
 */
export const SwitchHiddenInput: Component<SwitchHiddenInputProps> = (props) => {
  const ctx = useSwitchContext();
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
 * `<Switch.Context>{(s) => <Show when={s.checked}>on</Show>}</Switch.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function SwitchContext(props: SwitchContextProps): JSX.Element {
  return props.children(useSwitchContext());
}
