import { getComputedStyle } from "@zag-js/dom-query";
import * as presence from "@zag-js/presence";
import { type Accessor, createMemo } from "solid-js";
import { useMachine } from "../zag/machine";
import { normalizeProps } from "../zag/normalize-props";

/** What {@link createPresence} takes — the presence machine's three props, plus one of ours. */
export interface CreatePresenceProps {
  /** Whether the node should be there. The exit animation runs after this goes false. */
  present?: boolean;
  /** Called once the exit animation has finished and the node is fully gone. */
  onExitComplete?: VoidFunction;
  /** Apply a `present` change in the same frame rather than the next one. */
  immediate?: boolean;
  /**
   * Suppress the enter animation on the very first present, so a node that starts open does not
   * animate in.
   *
   * @default false
   */
  skipAnimationOnMount?: boolean;
}

/** What {@link createPresence} returns. */
export interface Presence {
  /**
   * Whether the node belongs in the DOM — **stays true through the exit animation**, which is the
   * whole point of the machine.
   */
  present: Accessor<boolean>;
  /** Hand the machine its element as early as possible; it reads computed styles off it. */
  setNode: (node: Element | null) => void;
  /** `hidden` and `data-state`, merged **over** the owning machine's own values. */
  presenceProps: Accessor<{ hidden: boolean; "data-state": "open" | "closed" | undefined }>;
}

/**
 * Keeps a node in the DOM while its exit animation runs, over the `@zag-js/presence` machine —
 * consumed through this package's own SolidJS adapter, exactly like any component's machine.
 *
 * The machine reads the element's computed `animation-name` when `present` goes false, and waits
 * for the matching `animationend` before it reports the node gone. So a part that animates out
 * needs three things: this `setNode` as its ref, `presenceProps()` merged over the component
 * machine's props, and the element still rendered while `present()` is true.
 *
 * **It does not own the render strategy.** Whether the node is in the DOM *at all* —
 * `lazyMount`, `unmountOnExit` — is {@link createRenderStrategy}, which takes a plain
 * `Accessor<boolean>` so that Collapsible (whose own machine owns its exit animation) and Dialog
 * (which needs this one) can share it. Callers compose the two:
 *
 * ```tsx
 * const presence = createPresence(() => ({ present: store.open }));
 * const { unmounted } = createRenderStrategy(presence.present, () => ({ lazyMount, unmountOnExit }));
 *
 * <Show when={!unmounted()}>
 *   <div ref={presence.setNode} {...store.getContentProps()} {...presence.presenceProps()} />
 * </Show>
 * ```
 *
 * `hideMode` is not shipped: Ark's `"activity"` renders children inside React 19's `<Activity>`,
 * and Solid has no equivalent. Every node this gates is hidden with `hidden`.
 */
export function createPresence(props: Accessor<CreatePresenceProps>): Presence {
  const service = useMachine(presence.machine, () => ({
    present: props().present,
    onExitComplete: props().onExitComplete,
    immediate: props().immediate,
  }));

  const api = createMemo(() => presence.connect(service, normalizeProps));

  const present = createMemo(() => api().present);

  let element: Element | null = null;

  // `service.send`, not `api().setNode`: this is called from a ref callback during the render pass,
  // and reading the `api()` memo there is the strict-read `mount()` fails a test on. The machine's
  // own `NODE.SET` handler is all `setNode` wraps anyway.
  const setNode = (node: Element | null) => {
    element = node;
    if (node) {
      service.send({ type: "NODE.SET", node });
    }
  };

  /**
   * Whether this node's exit is over before it begins — asked here, synchronously, rather than
   * waited for.
   *
   * The machine answers the same question inside a `raf`, so between a `present` going false and
   * that frame it still reports the node present and this layer still says `hidden: false`. React
   * never shows that window because its own re-render lands in the same paint; Solid applies the
   * *owning* machine's change immediately, so the outgoing node stays visible one frame after the
   * incoming one appears — two tab panels in flow at once, and the layout jump that comes with it.
   *
   * Reading the computed style costs one style resolution on a node we already hold, and it can only
   * ever hide something the machine is about to hide anyway: a node with a real exit animation
   * answers `false` here and keeps every frame the machine gives it.
   */
  const exitsWithoutAnimating = () => {
    if (!element) {
      return true;
    }
    const styles = getComputedStyle(element);
    return styles.animationName === "none" || styles.animationDuration === "0s";
  };

  const presenceProps = createMemo(() => ({
    hidden: !present() || (!props().present && exitsWithoutAnimating()),
    // The `present` PROP, not the machine's `present()`. They diverge for exactly the window that
    // matters: while closing, the prop is already false and the machine is still
    // `unmountSuspended`, so `data-state="closed"` is what *starts* the exit animation on a node
    // that is still mounted. Reading the machine here would flip `data-state` only once the
    // animation it was supposed to start had finished.
    "data-state": (api().skip && props().skipAnimationOnMount
      ? undefined
      : props().present
        ? "open"
        : "closed") as "open" | "closed" | undefined,
  }));

  return { present, setNode, presenceProps };
}
