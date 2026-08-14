import { mergeProps, type RenderProp, renderStyled } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, children, omit, Show } from "solid-js";
import type {
  PopoverAnchorProps,
  PopoverArrowProps,
  PopoverArrowTipProps,
  PopoverBodyProps,
  PopoverCloseTriggerProps,
  PopoverContentProps,
  PopoverContextProps,
  PopoverDescriptionProps,
  PopoverFooterProps,
  PopoverHeaderProps,
  PopoverPositionerProps,
  PopoverTitleProps,
  PopoverTriggerProps,
} from "./popover.types";
import { type PopoverSlot, usePopoverContext } from "./popover-context";

type DivProps = ComponentProps<"div">;
type ButtonProps = ComponentProps<"button">;

/**
 * The control that opens the popover.
 *
 * `aria-controls` is dropped while the content is unmounted, and Chakra ships it — porting it is
 * parity, not an a11y improvement of ours. It is gated on the **render strategy**, not on `open`,
 * and Popover leaves the content mounted by default, so under defaults the attribute is there from
 * the first render and points at a real element.
 *
 * The gate rewrites the machine's own bag rather than layering `{ "aria-controls": undefined }`
 * over it. The adapter's `mergeProps` resolves a non-composing key to the last **defined** value,
 * so a later `undefined` deletes nothing.
 *
 * Ark's own Solid popover writes this as `presenceApi().unmounted && null`, which evaluates to
 * `false` while the content is mounted and ships `aria-controls="false"` — an IDREF that resolves
 * to nothing. The React shape is what is ported here.
 */
export const PopoverTrigger: Component<PopoverTriggerProps> = (props) => {
  const ctx = usePopoverContext();

  // `value` is a machine argument, not a DOM attribute — Ark splits it out for the same reason.
  // `omit` on a lazy props source stays lazy.
  const localProps = omit(props, "value");

  const elementProps = mergeProps(() => {
    const triggerProps = ctx.getTriggerProps({ value: props.value });
    return ctx.unmounted() ? { ...triggerProps, "aria-controls": undefined } : triggerProps;
  }, localProps) as ButtonProps;

  return renderStyled<ButtonProps, HTMLButtonElement>({
    as: (props.as ?? "button") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().trigger,
  });
};

/**
 * Positions the content against something other than the trigger — wrap the element the popover
 * should hang off, and the trigger becomes a plain button.
 *
 * **The one part with no `recipeClass`**, and the omission is upstream's: `PopoverAnchor` is wired
 * with `withContext(…, undefined)` even though `anchor` is a slot the recipe carries. The element
 * is a bare positioning handle, and giving it the class would be a divergence.
 */
export const PopoverAnchor: Component<PopoverAnchorProps> = (props) => {
  const ctx = usePopoverContext();
  const elementProps = mergeProps(() => ctx.getAnchorProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
  });
};

// There is no `PopoverIndicator` here. The machine has an `indicator` part and the recipe has an
// `indicator` slot, and `popover.tsx` defines the component — but it is exported from neither
// `index.ts` nor `namespace.ts` upstream, so no consumer of the React version can reach it. The
// port keeps the omission rather than inventing a component Chakra does not ship.

/**
 * The box popper places on screen, and the seam this whole component was measured for.
 *
 * `@zag-js/popper` writes eight CSS custom properties — `--x`, `--y`, `--z-index`,
 * `--transform-origin`, `--reference-width/height`, `--available-width/height` — **imperatively**
 * into this element's `style` attribute inside a `requestAnimationFrame`, while Solid binds the
 * machine's own `style` object to the same attribute reactively. Two rules follow, and neither is
 * enforced by a type:
 *
 * - **Only the object form of `style` may reach this element.** Solid diffs an object binding per
 *   property and leaves everything else alone; a string binding rewrites the whole attribute, which
 *   erases all eight. Popper would not put them back — its `zIndexComputed` flag and its
 *   approximate-equality guards believe the attribute is already correct.
 * - **Content must stay this element's `firstElementChild`.** `--z-index` is copied once per
 *   floating-element identity off `getComputedStyle(positioner.firstElementChild).zIndex`, which is
 *   where the recipe's `--popover-z-index` lives. A wrapper between the two silently unsets it.
 *
 * The arrow is resolved the same once-only way, by `querySelector("[data-part=arrow]")`.
 *
 * **The seam is free, measured.** A stacked pair reads back **1500 on the outer content and 1501 on
 * the inner**, and each positioner takes its own number by `var(--z-index)` — the inner one included,
 * because popper's copy lands after the layer stack has written `--layer-index: 1`. A consumer's own
 * signal-valued `style` on this element rewrites the attribute without disturbing any of the eight,
 * and neither does the machine re-emitting its own style object. `popover.browser.test.tsx`, *the
 * seam*, is where that is pinned.
 *
 * It attaches no ref: the machine emits neither `hidden` nor `data-state` for the positioner, so
 * there is nothing for a presence of its own to drive. The recipe gives this slot no styles at all
 * — everything on it is popper's.
 */
export const PopoverPositioner: Component<PopoverPositionerProps> = (props) => {
  const ctx = usePopoverContext();
  const elementProps = mergeProps(() => ctx.getPositionerProps(), props) as DivProps;

  return (
    <Show when={!ctx.unmounted()}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (props.as ?? "div") as ValidComponent,
        props: elementProps,
        render: props.render,
        recipeClass: () => ctx.slots().positioner,
      })}
    </Show>
  );
};

/**
 * The popover surface. Everything behavioral — `role="dialog"`, the labelling IDREFs, the dismiss
 * layer, and under `modal` the focus trap, the scroll lock and the `aria-hidden` blanket — comes
 * from the machine's `getContentProps()` and the effects its `open` state runs. This layer is
 * assembly.
 *
 * Zag's `hidden` is not stripped: presence's own `hidden` is merged over it and wins while the exit
 * animation runs, which is the whole reason presence sits between the machine and the consumer.
 *
 * **No automatic close button.** A consumer places `<Popover.CloseTrigger>` themselves, exactly as
 * in the React version.
 */
export const PopoverContent: Component<PopoverContentProps> = (props) => {
  const ctx = usePopoverContext();

  const elementProps = mergeProps(
    () => ctx.getContentProps(),
    () => ctx.presence.presenceProps(),
    props,
  ) as DivProps;

  return (
    <Show when={!ctx.unmounted()}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (props.as ?? "div") as ValidComponent,
        props: elementProps,
        render: props.render,
        ref: ctx.presence.setNode,
        recipeClass: () => ctx.slots().content,
      })}
    </Show>
  );
};

/**
 * The little triangle pointing back at the anchor. It is the rotated square's **container** — the
 * part that carries popper's `left`/`top` — and it renders an {@link PopoverArrowTip} unless the
 * consumer supplies their own child.
 */
export const PopoverArrow: Component<PopoverArrowProps> = (props) => {
  const ctx = usePopoverContext();

  // The default lives *inside* the `children()` call, which is where a JSX-valued slot's default
  // belongs: `withDefaults` builds its defaults object eagerly, so `{ children: <PopoverArrowTip /> }`
  // there would construct a tip for every Arrow including the ones that already have a child, and
  // module scope is worse — JSX there runs at import time and 500s the SSR route. Resolving through
  // `children()` also collapses the prop's repeated reads (the merged bag's `children` getter is
  // re-read by every spread pass) to a single construction.
  const arrowTip = children(() => props.children ?? <PopoverArrowTip />);

  const elementProps = mergeProps(() => ctx.getArrowProps(), props, {
    get children() {
      return arrowTip();
    },
  }) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().arrow,
  });
};

/** The rotated square inside {@link PopoverArrow}, and the thing that actually has a background. */
export const PopoverArrowTip: Component<PopoverArrowTipProps> = (props) => {
  const ctx = usePopoverContext();
  const elementProps = mergeProps(() => ctx.getArrowTipProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().arrowTip,
  });
};

/**
 * The accessible name. It registers nothing — the machine sniffs the DOM for `popover:{id}:title`
 * one frame after mount and points `aria-labelledby` at what it finds.
 *
 * A `div`, not the `h2` Dialog's Title renders: that is the element upstream mints for this slot,
 * and a popover is not a landmark the way a dialog is.
 */
export const PopoverTitle: Component<PopoverTitleProps> = (props) => {
  const ctx = usePopoverContext();
  const elementProps = mergeProps(() => ctx.getTitleProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().title,
  });
};

/** The accessible description, found the same way `Title` is and wired to `aria-describedby`. */
export const PopoverDescription: Component<PopoverDescriptionProps> = (props) => {
  const ctx = usePopoverContext();
  const elementProps = mergeProps(() => ctx.getDescriptionProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().description,
  });
};

/** The ✕ in the corner. Its `type="button"`, its `aria-label` and its close handler are the machine's. */
export const PopoverCloseTrigger: Component<PopoverCloseTriggerProps> = (props) => {
  const ctx = usePopoverContext();
  const elementProps = mergeProps(() => ctx.getCloseTriggerProps(), props) as ButtonProps;

  return renderStyled<ButtonProps, HTMLButtonElement>({
    as: (props.as ?? "button") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().closeTrigger,
  });
};

/**
 * Header / Body / Footer have a recipe slot and no machine part — the slot recipe carries thirteen
 * names where the machine's anatomy carries ten. There is nothing from the machine to merge, so the
 * consumer's props *are* the element props, and the slot class is the only thing this adds.
 *
 * They also carry no `data-part`: nothing in the anatomy names them, so the slot class is the only
 * handle anything — a stylesheet, a snapshot, a test — has on one.
 *
 * The tag is a parameter, where Dialog's helper hard-codes `div`: upstream mints these three from
 * `"header"`, `"div"` and `"footer"`, and the DOM is what a recipe selector and a screen reader
 * see.
 */
function renderSlotPart(
  props: PopoverHeaderProps | PopoverBodyProps | PopoverFooterProps,
  slot: PopoverSlot,
  tag: "header" | "div" | "footer",
): JSX.Element {
  const ctx = usePopoverContext();

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? tag) as ValidComponent,
    props: props as DivProps,
    render: props.render as RenderProp<DivProps>,
    recipeClass: () => ctx.slots()[slot],
  });
}

export const PopoverHeader: Component<PopoverHeaderProps> = (props) =>
  renderSlotPart(props, "header", "header");

export const PopoverBody: Component<PopoverBodyProps> = (props) =>
  renderSlotPart(props, "body", "div");

export const PopoverFooter: Component<PopoverFooterProps> = (props) =>
  renderSlotPart(props, "footer", "footer");

/**
 * Hands the machine to a render prop, for reading its state without writing a component:
 * `<Popover.Context>{(p) => <Show when={p.open}>open</Show>}</Popover.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function PopoverContext(props: PopoverContextProps): JSX.Element {
  return props.children(usePopoverContext());
}
