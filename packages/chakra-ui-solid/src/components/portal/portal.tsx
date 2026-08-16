import { type JSX, Portal as SolidPortal } from "@solidjs/web";
import { type Component, createEffect, createSignal, Show } from "solid-js";

export interface PortalProps {
  /**
   * Render into this element instead of `document.body`. Read on every render, so a signal-valued
   * container moves the content.
   */
  container?: () => HTMLElement | null | undefined;
  /**
   * Render the children where they were written instead of portalling them.
   * @default false
   */
  disabled?: boolean;
  children?: JSX.Element;
}

/**
 * Portal — renders its children at the end of `document.body`, or into `container`, outside the
 * DOM hierarchy they were written in. Overlays use it so an ancestor's `overflow`, `transform` or
 * `z-index` cannot clip or re-stack them.
 *
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger>Open</Dialog.Trigger>
 *   <Portal>
 *     <Dialog.Backdrop />
 *     <Dialog.Positioner>…</Dialog.Positioner>
 *   </Portal>
 * </Dialog.Root>
 * ```
 *
 * **Nothing renders on the server.** `@solidjs/web`'s Portal emits no markup there and the content
 * arrives on hydration, where the React version instead renders it inline and warns about the
 * mismatch that follows. Ours is the divergence, and it is the one Solid can hydrate.
 */
export const Portal: Component<PortalProps> = (props) => {
  const built = createDeferredBuild();

  // `props.children` is written twice, and **`children()` is the wrong fix here** rather than a
  // missing one. The two reads are mutually exclusive arms: `Show` builds the one its condition
  // selects and disposes the other, so a render performs exactly one — counted, on both the default
  // path and across a `disabled` toggle, in `portal.browser.test.tsx`. Resolving the slot the
  // idiomatic way, in this body, would build the subtree *here* — during the pure phase of whatever
  // portal contains this one, which is precisely the race `createDeferredBuild` exists to lose.
  return (
    <Show
      when={props.disabled}
      fallback={
        <SolidPortal mount={props.container?.() ?? undefined}>
          <Show when={built()}>{props.children}</Show>
        </SolidPortal>
      }
    >
      {props.children}
    </Show>
  );
};

/**
 * False until the first effect flush, which is what keeps a **nested** portal from claiming its
 * place in `document.body` ahead of the portal containing it.
 *
 * `@solidjs/web`'s Portal reserves its slot — a pair of marker nodes it later fills — in its
 * *effect*, but builds its children in the *pure* phase before that. A portal written inside
 * another portal's children is therefore constructed while the outer one is still building, and
 * finishes first, so it reserves first and its content lands **above** the outer content. React has
 * no slot to reserve — `createPortal` appends at commit — so there the order follows what opened
 * last, which is what Chakra's z-index scheme leans on: `dialog.backdrop` resolves to
 * `calc(var(--dialog-z-index) + var(--layer-index, 0) - 1)`, putting a dialog one layer deep on
 * **1500**, the same number a layer-0 popover's content carries. Document order is all that
 * separates them, and inverted it paints the popover over the scrim it belongs under.
 *
 * Holding the children back one flush lets the containing portal reserve first.
 */
function createDeferredBuild() {
  const [built, setBuilt] = createSignal(false);

  createEffect(
    () => undefined,
    () => {
      setBuilt(true);
    },
  );

  return built;
}
