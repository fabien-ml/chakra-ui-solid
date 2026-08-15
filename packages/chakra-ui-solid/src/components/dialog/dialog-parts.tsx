import {
  composeEventHandlers,
  createPresence,
  createRenderStrategy,
  type HTMLChakraProps,
  mergeProps,
  omitProps,
  renderStyled,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, Show } from "solid-js";
import type {
  DialogActionTriggerProps,
  DialogBackdropProps,
  DialogBodyProps,
  DialogCloseTriggerProps,
  DialogContentProps,
  DialogContextProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogPositionerProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "./dialog.types";
import { type DialogSlot, useDialogContext } from "./dialog-context";

type DivProps = ComponentProps<"div">;
type ButtonProps = ComponentProps<"button">;
type HeadingProps = ComponentProps<"h2">;

/**
 * The control that opens the dialog.
 *
 * `aria-controls` is dropped while the content is unmounted, and Chakra ships it — porting it is
 * parity, not an a11y improvement of ours. It is gated on the **render strategy**, not on `open`:
 * while the content is mounted-but-closed the IDREF still resolves to a real element and stays.
 *
 * Ark carries the same gate on **five** triggers, not the six the notes claim — `dialog`, `drawer`,
 * `floating-panel`, `menu`, `popover`. Popover is the next of them to be ported.
 *
 * The gate rewrites the machine's own bag rather than layering `{ "aria-controls": undefined }` over
 * it. The adapter's `mergeProps` resolves a non-composing key to the last **defined** value, so a
 * later `undefined` deletes nothing — the same rule that keeps a consumer's forwarded `undefined`
 * from wiping the machine's `type="button"`.
 */
export const DialogTrigger: Component<DialogTriggerProps> = (props) => {
  const ctx = useDialogContext();

  // `value` is a machine argument, not a DOM attribute — Ark splits it out for the same reason.
  // `omitProps` on a lazy props source stays lazy.
  const localProps = omitProps(props, "value");

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
 * The scrim behind the content.
 *
 * **Its own presence, not the Root's**: it mounts independently of the content and animates on its
 * own curve. The render strategy still comes from the Root, so one `unmountOnExit` reaches both.
 *
 * It reads `open` **directly, ignoring the Root's `present` prop** — so a consumer overriding
 * presence gets the surface without the scrim. That is Ark's own shape, not a decision of ours:
 * `DialogBackdrop` hard-codes `present: dialog.open` where `DialogRoot` merges the prop in. Copied
 * rather than corrected, because a fix Chakra lacks is as much a divergence as a missing feature.
 *
 * Zag's `hidden` is not stripped — presence's own `hidden` is merged over it and wins while the exit
 * animation runs, which is the whole reason presence sits between the machine and the consumer.
 */
export const DialogBackdrop: Component<DialogBackdropProps> = (props) => {
  const ctx = useDialogContext();

  const presence = createPresence(() => ({ present: ctx.open }));
  const { unmounted } = createRenderStrategy(presence.present, () => ctx.renderStrategy);

  const elementProps = mergeProps(
    () => ctx.getBackdropProps(),
    () => presence.presenceProps(),
    props,
  ) as DivProps;

  return (
    <Show when={!unmounted()}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (props.as ?? "div") as ValidComponent,
        props: elementProps,
        render: props.render,
        ref: presence.setNode,
        recipeClass: () => ctx.slots().backdrop,
      })}
    </Show>
  );
};

/**
 * The box that places the content on screen. Gated on the Root's presence, and the only gated part
 * that attaches no ref: the machine emits neither `hidden` nor `data-state` for it, so there is
 * nothing for a presence of its own to drive. Its `style: { pointerEvents }` is the machine's, and
 * is forwarded untouched.
 */
export const DialogPositioner: Component<DialogPositionerProps> = (props) => {
  const ctx = useDialogContext();
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
 * The dialog surface. Everything behavioral — `role`, `aria-modal`, the labelling IDREFs, the focus
 * trap, the dismiss layer, the scroll lock, the `aria-hidden` blanket — comes from the machine's
 * `getContentProps()` and the effects its `open` state runs. This layer is assembly.
 *
 * The `"div"` fallback follows the DOM rather than Chakra's type, which says `section`: the element
 * Ark renders is a `div`, and the DOM is what a recipe selector, a snapshot and a screen reader all
 * see. Same for `Description`, typed `p` upstream and rendered `div`.
 *
 * **No automatic close button.** A consumer places `<Dialog.CloseTrigger>` themselves, exactly as in
 * the React version.
 */
export const DialogContent: Component<DialogContentProps> = (props) => {
  const ctx = useDialogContext();

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
 * The accessible name. It registers nothing — the machine sniffs the DOM for `dialog:{id}:title` one
 * frame after the dialog opens and points `aria-labelledby` at what it finds.
 */
export const DialogTitle: Component<DialogTitleProps> = (props) => {
  const ctx = useDialogContext();
  const elementProps = mergeProps(() => ctx.getTitleProps(), props) as HeadingProps;

  return renderStyled<HeadingProps, HTMLHeadingElement>({
    as: (props.as ?? "h2") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().title,
  });
};

/** The accessible description, found the same way `Title` is and wired to `aria-describedby`. */
export const DialogDescription: Component<DialogDescriptionProps> = (props) => {
  const ctx = useDialogContext();
  const elementProps = mergeProps(() => ctx.getDescriptionProps(), props) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().description,
  });
};

/** The ✕ in the corner. Its `type="button"` and its close handler are both the machine's. */
export const DialogCloseTrigger: Component<DialogCloseTriggerProps> = (props) => {
  const ctx = useDialogContext();
  const elementProps = mergeProps(() => ctx.getCloseTriggerProps(), props) as ButtonProps;

  return renderStyled<ButtonProps, HTMLButtonElement>({
    as: (props.as ?? "button") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().closeTrigger,
  });
};

/**
 * A close button with no machine part behind it — the "Cancel" in a footer. Because there are no
 * machine props to merge, the adapter's `mergeProps` (which chains `on*` handlers for free) is not
 * in play, so this is the one part in the family that composes a handler itself. The consumer's
 * handler runs first, and `event.preventDefault()` in it cancels the close.
 *
 * **The one part with no `recipeClass`**, and the omission is upstream's: `DialogActionTrigger` is
 * a bare `chakra.button` where every other part goes through `withContext(…, slot)`. The recipe has
 * no slot for it, so it inherits whatever `<Button>` a consumer nests inside it.
 */
export const DialogActionTrigger: Component<DialogActionTriggerProps> = (props) => {
  const ctx = useDialogContext();

  // `withDefaults`, not `type="button"` as a JSX attribute before the spread: `merge` resolves a key
  // by presence, so a wrapper forwarding an unset `type={props.type}` would win with `undefined` and
  // the button would submit whatever form it sits in.
  const merged = withDefaults(props, { type: "button" as const });

  const elementProps = merge(merged, {
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(merged.onClick, () =>
        ctx.setOpen(false),
      );
    },
  }) as ButtonProps;

  return renderStyled<ButtonProps, HTMLButtonElement>({
    // `merged`, not `props`: it is the only props object once `withDefaults` has run.
    as: (merged.as ?? "button") as ValidComponent,
    props: elementProps,
    render: merged.render,
  });
};

/**
 * Header / Body / Footer have a recipe slot and no machine part — the slot recipe carries ten names
 * where the machine's anatomy carries seven. There is nothing from the machine to merge, so the
 * consumer's props *are* the element props, and the slot class is the only thing this adds.
 *
 * They also carry no `data-part`: nothing in the anatomy names them, so the slot class is the only
 * handle anything — a stylesheet, a snapshot, a test — has on one.
 */
function renderSlotPart(props: HTMLChakraProps<"div">, slot: DialogSlot): JSX.Element {
  const ctx = useDialogContext();

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: props as DivProps,
    render: props.render,
    recipeClass: () => ctx.slots()[slot],
  });
}

export const DialogHeader: Component<DialogHeaderProps> = (props) =>
  renderSlotPart(props, "header");

export const DialogBody: Component<DialogBodyProps> = (props) => renderSlotPart(props, "body");

export const DialogFooter: Component<DialogFooterProps> = (props) =>
  renderSlotPart(props, "footer");

/**
 * Hands the machine to a render prop, for reading its state without writing a component:
 * `<Dialog.Context>{(d) => <Show when={d.open}>open</Show>}</Dialog.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function DialogContext(props: DialogContextProps): JSX.Element {
  return props.children(useDialogContext());
}
