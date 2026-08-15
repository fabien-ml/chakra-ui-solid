import {
  createPresence,
  createRenderStrategy,
  mergeProps,
  omitProps,
  renderStyled,
} from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import type {
  TabsContentGroupProps,
  TabsContentProps,
  TabsContextProps,
  TabsIndicatorProps,
  TabsListProps,
  TabsTriggerProps,
} from "./tabs.types";
import { useTabsContext } from "./tabs-context";

type DivProps = ComponentProps<"div">;
type ButtonProps = ComponentProps<"button">;

/**
 * The `role="tablist"` box the triggers sit in, and the positioning context `<Tabs.Indicator>`
 * needs — the `list` slot sets `position: relative`, and the indicator is placed with `offsetLeft`
 * against its `offsetParent`.
 *
 * The arrow-key handler is the machine's and lives here rather than on each trigger, so `loopFocus`
 * and `orientation` are answered once for the whole set.
 */
export const TabsList: Component<TabsListProps> = (props) => {
  const ctx = useTabsContext();
  const elementProps = mergeProps(() => ctx.getListProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().list,
  });
};

/**
 * One tab. `value` pairs it with the `<Tabs.Content>` of the same value, and both are machine
 * arguments rather than DOM attributes — `disabled` comes back out of `getTriggerProps()` as the
 * real attribute, and `value` as `data-value`.
 *
 * **No `aria-controls` gate here**, unlike Dialog's trigger. Zag emits the IDREF only on the
 * *selected* trigger, whose panel is present by definition, so an unmounted panel can never leave a
 * dangling reference behind.
 *
 * `type="button"` comes from the machine rather than from a default of ours, and it survives a
 * wrapper forwarding `type={undefined}`: the adapter's `mergeProps` resolves a non-composing key to
 * the last **defined** value, so an `undefined` from the consumer does not delete it.
 */
export const TabsTrigger: Component<TabsTriggerProps> = (props) => {
  const ctx = useTabsContext();

  // `omitProps` on a lazy props source stays lazy.
  const localProps = omitProps(props, "value", "disabled");

  const elementProps = mergeProps(
    () => ctx.getTriggerProps({ value: props.value, disabled: props.disabled }),
    localProps,
  ) as ButtonProps;

  return renderStyled<ButtonProps, HTMLButtonElement>({
    as: (props.as ?? "button") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().trigger,
  });
};

/**
 * One panel, gated on **its own** presence.
 *
 * That inverts Dialog's rule that a presence is created on the Root, and for a structural reason: a
 * set of tabs has N panels and each animates on its own schedule, so one shared presence could not
 * describe them. The Root's `lazyMount`/`unmountOnExit` still reach here, through the stable
 * `renderStrategy` object it publishes on the context.
 *
 * `immediate: true` is Ark's, kept for fidelity. It is inert at our pin — `@zag-js/presence@1.43.0`
 * declares the prop and never reads it — so nothing here may depend on it.
 *
 * Zag's `hidden: !selected` is not stripped: presence's own `hidden` is merged over it and wins
 * while the exit animation runs, which is the whole reason presence sits between the machine and the
 * consumer.
 */
export const TabsContent: Component<TabsContentProps> = (props) => {
  const ctx = useTabsContext();

  const presence = createPresence(() => ({
    present: ctx.value === props.value,
    immediate: true,
  }));

  const { unmounted } = createRenderStrategy(presence.present, () => ctx.renderStrategy);

  const elementProps = mergeProps(
    () => ctx.getContentProps({ value: props.value }),
    () => presence.presenceProps(),
    omitProps(props, "value"),
  ) as DivProps;

  return (
    <Show when={!unmounted()}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (props.as ?? "div") as ValidComponent,
        props: elementProps,
        render: props.render,
        ref: presence.setNode,
        recipeClass: () => ctx.slots().content,
      })}
    </Show>
  );
};

/**
 * An optional box around the panels, with a recipe slot and no machine part — the slot recipe
 * carries six names where the machine's anatomy carries five. There is nothing from the machine to
 * merge, so the consumer's props *are* the element props and the slot class is the only thing this
 * adds.
 *
 * It also carries no `data-part`: nothing in the anatomy names it, so the slot class is the only
 * handle anything — a stylesheet, a snapshot, a test — has on one.
 */
export const TabsContentGroup: Component<TabsContentGroupProps> = (props) => {
  const ctx = useTabsContext();

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: props as DivProps,
    render: props.render,
    recipeClass: () => ctx.slots().contentGroup,
  });
};

/**
 * The bar that slides under the selected tab. Place it **inside `<Tabs.List>`** — the machine
 * positions it with `--left`/`--top` measured against its `offsetParent`, and the `list` slot is
 * what sets `position: relative`. Anywhere else it lands silently in the wrong place.
 *
 * It attaches no ref: the machine finds this element by id and measures it, so an `id` of a
 * consumer's own wins on the DOM and leaves the machine looking for the old one. `ids={{ indicator }}`
 * on the Root is the supported route.
 *
 * It ships `hidden` from the server — the machine's `hidden` is `isRectEmpty(rect)` and `rect`
 * starts `null` — and un-hides itself once it has measured a trigger on the client.
 */
export const TabsIndicator: Component<TabsIndicatorProps> = (props) => {
  const ctx = useTabsContext();
  const elementProps = mergeProps(() => ctx.getIndicatorProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().indicator,
  });
};

/**
 * Hands the machine to a render prop, for reading its state without writing a component:
 * `<Tabs.Context>{(t) => <Show when={t.value === "one"}>first</Show>}</Tabs.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function TabsContext(props: TabsContextProps): JSX.Element {
  return props.children(useTabsContext());
}
