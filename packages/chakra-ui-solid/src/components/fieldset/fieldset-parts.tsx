import {
  createRegisteredId,
  mergeProps,
  type RenderProp,
  renderStyled,
} from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import type {
  FieldsetContentProps,
  FieldsetContextProps,
  FieldsetErrorTextAttributes,
  FieldsetErrorTextProps,
  FieldsetHelperTextAttributes,
  FieldsetHelperTextProps,
  FieldsetLegendProps,
} from "./fieldset.types";
import {
  type FieldsetSlot,
  useFieldsetContext,
  useFieldsetStyles,
  withFieldsetContext,
} from "./fieldset-context";

type LegendProps = ComponentProps<"legend">;
type SpanProps = ComponentProps<"span">;

/**
 * The name of the group. It is what the `fieldset`'s `aria-labelledby` points at, so a set without
 * one is a set a screen reader announces unnamed.
 */
export const FieldsetLegend: Component<FieldsetLegendProps> = (props) => {
  const ctx = useFieldsetContext();
  const styles = useFieldsetStyles();
  const elementProps = mergeProps(() => ctx.getLegendProps(), props) as LegendProps;

  return renderStyled<LegendProps, HTMLLegendElement>({
    as: (props.as ?? "legend") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => styles().legend,
  });
};

/**
 * Helper and error text differ in two values and nothing else, and the second is what makes them the
 * only parts that talk *back* to the Root: each publishes the id it actually rendered with, and the
 * group's `aria-describedby` names those ids.
 *
 * **The effective id, not the generated one** — a consumer's own `<Fieldset.HelperText id="hint">`
 * still links, where upstream's `getElementById` over the generated id drops the link entirely.
 */
function renderTextPart(
  props: FieldsetHelperTextProps | FieldsetErrorTextProps,
  attributes: () => FieldsetHelperTextAttributes | FieldsetErrorTextAttributes,
  register: (id: string | undefined) => void,
  slot: FieldsetSlot,
): JSX.Element {
  const styles = useFieldsetStyles();
  const elementProps = mergeProps(attributes, props) as SpanProps;

  createRegisteredId({ id: () => elementProps.id, register });

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render as RenderProp<SpanProps>,
    recipeClass: () => styles()[slot],
  });
}

/** What the group is for, or what shape its answers take. Rendering it is what adds the group's
 * `aria-describedby`; removing it takes the attribute away again. */
export const FieldsetHelperText: Component<FieldsetHelperTextProps> = (props) => {
  const ctx = useFieldsetContext();

  return renderTextPart(
    props,
    () => ctx.getHelperTextProps(),
    ctx.registerHelperText,
    "helperText",
  );
};

/**
 * Why the group was rejected.
 *
 * **It renders nothing unless the fieldset is `invalid`**, which is upstream's gate rather than a
 * convenience: an error message on a group that is not in error reads to a screen reader as one that
 * is. So a consumer writes it unconditionally and the fieldset decides.
 */
export const FieldsetErrorText: Component<FieldsetErrorTextProps> = (props) => {
  const ctx = useFieldsetContext();

  return (
    <Show when={ctx.invalid}>
      {renderTextPart(props, () => ctx.getErrorTextProps(), ctx.registerErrorText, "errorText")}
    </Show>
  );
};

/**
 * The box the fields sit in — the recipe stacks them and sets the gap between them.
 *
 * The one part with no prop getter, and so the one the styling seam can mint on its own. It carries
 * no `data-part` either: `content` is a slot the recipe adds and not a part of the anatomy, upstream
 * included.
 */
export const FieldsetContent = withFieldsetContext<FieldsetContentProps>("div", "content");

/**
 * Hands the fieldset to a render prop, for reading its state without writing a component:
 * `<Fieldset.Context>{(fieldset) => <Show when={fieldset.invalid}>…</Show>}</Fieldset.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the fieldset untracked
 * and freezes on the value it had at mount.
 */
export function FieldsetContext(props: FieldsetContextProps): JSX.Element {
  return props.children(useFieldsetContext());
}
