import { mergeProps, renderStyled } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import type {
  CollapsibleContentProps,
  CollapsibleContextProps,
  CollapsibleIndicatorProps,
  CollapsibleTriggerProps,
} from "./collapsible.types";
import { useCollapsibleContext } from "./collapsible-context";

type DivProps = ComponentProps<"div">;
type ButtonProps = ComponentProps<"button">;

/**
 * The control that toggles the content.
 *
 * No `aria-controls` gate here, unlike six other Ark components: Collapsible's own trigger is
 * `mergeProps(getTriggerProps(), props)` and nothing else, so the IDREF is emitted even when the
 * content is unmounted. The gate that reads `unmounted` lives one level up, in Accordion's item
 * trigger, and belongs to that row.
 *
 * `type="button"` comes from the machine rather than from a default of ours, and it survives a
 * wrapper forwarding `type={undefined}`: the adapter's `mergeProps` resolves a non-composing key to
 * the last **defined** value, so an `undefined` from the consumer does not delete it.
 */
export const CollapsibleTrigger: Component<CollapsibleTriggerProps> = (props) => {
  const ctx = useCollapsibleContext();
  const elementProps = mergeProps(() => ctx.getTriggerProps(), props) as ButtonProps;

  return renderStyled<ButtonProps, HTMLButtonElement>({
    as: "button",
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().trigger,
  });
};

/**
 * The part that reveals and hides — the only one of the four that is gated.
 *
 * Zag's `hidden` is **not** stripped. The `content` slot sets `overflow` and no `display`, so the UA
 * `[hidden] { display: none }` rule stands on its own, and the machine leaves `hidden` off entirely
 * once `collapsedHeight` or `collapsedWidth` is set — there the closed content keeps its box.
 */
export const CollapsibleContent: Component<CollapsibleContentProps> = (props) => {
  const ctx = useCollapsibleContext();
  const elementProps = mergeProps(() => ctx.getContentProps(), props) as DivProps;

  return (
    <Show when={!ctx.unmounted}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: "div",
        props: elementProps,
        render: props.render,
        recipeClass: () => ctx.slots().content,
      })}
    </Show>
  );
};

/**
 * A rotating chevron, or whatever else marks the state. It carries `data-state` and nothing else,
 * so the recipe (or a style prop) is what turns that into a rotation.
 */
export const CollapsibleIndicator: Component<CollapsibleIndicatorProps> = (props) => {
  const ctx = useCollapsibleContext();
  const elementProps = mergeProps(() => ctx.getIndicatorProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: "div",
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().indicator,
  });
};

/**
 * Hands the machine to a render prop, for reading its state without writing a component:
 * `<Collapsible.Context>{(c) => <span>{c.open ? "Hide" : "Show"}</span>}</Collapsible.Context>`.
 */
export function CollapsibleContext(props: CollapsibleContextProps): JSX.Element {
  return props.children(useCollapsibleContext());
}
