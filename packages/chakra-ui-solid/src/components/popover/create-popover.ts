import {
  createMachineStore,
  normalizeProps,
  useEnvironmentContext,
  useLocaleContext,
  useMachine,
} from "@chakra-ui-solid/core";
import { isServer } from "@solidjs/web";
import * as popover from "@zag-js/popover";
import { createMemo, createSignal, createUniqueId, onSettled } from "solid-js";
import type { CreatePopoverProps, CreatePopoverReturn } from "./popover.types";

/**
 * Starts the `@zag-js/popover` machine and hands back its connected API.
 *
 * Call it to own the machine yourself and drive a `<Popover.RootProvider value={…}>` from outside;
 * `<Popover.Root>` calls it for you and is the shorter way to the same thing.
 *
 * ```tsx
 * const popover = createPopover({ positioning: { placement: "right-start" } });
 * <button onClick={() => popover.reposition()}>Re-place it</button>
 * <Popover.RootProvider value={popover}>…</Popover.RootProvider>
 * ```
 *
 * **It returns the machine and nothing else** — no `unmounted`, where `createCollapsible` adds one.
 * The exit window belongs to a `@zag-js/presence` machine, and that is the Root's to create.
 */
export function createPopover(props: CreatePopoverProps = {}): CreatePopoverReturn {
  const locale = useLocaleContext();
  const environment = useEnvironmentContext();

  // Called unconditionally, at the top of the body, and never behind a `??` or inside a memo. Under
  // the server build `createUniqueId()` consumes a hydration child id and under the hydrating client
  // build it consumes a context id, both off one counter — so moving the call site between the two
  // renders desynchronises every `_hk` after it, and the tree hydrates against the wrong nodes with
  // no error.
  const generatedId = createUniqueId();

  // Bare, with no `untrack` around it: the adapter's `seedFromProps` absorbs the machine's one-shot
  // construction reads, so a `[STRICT_READ_UNTRACKED]` here would be a real bug in this body or in
  // the machine's `watch`, and wrapping the call would hide exactly that.
  const service = useMachine(popover.machine, () => ({
    id: props.id ?? generatedId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    ids: props.ids,
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
    modal: props.modal,
    portalled: props.portalled,
    autoFocus: props.autoFocus,
    initialFocusEl: props.initialFocusEl,
    finalFocusEl: props.finalFocusEl,
    restoreFocus: props.restoreFocus,
    closeOnInteractOutside: props.closeOnInteractOutside,
    closeOnEscape: props.closeOnEscape,
    positioning: props.positioning,
    persistentElements: props.persistentElements,
    translations: props.translations,
    triggerValue: props.triggerValue,
    defaultTriggerValue: props.defaultTriggerValue,
    onTriggerValueChange: props.onTriggerValueChange,
    onEscapeKeyDown: props.onEscapeKeyDown,
    onPointerDownOutside: props.onPointerDownOutside,
    onFocusOutside: props.onFocusOutside,
    onInteractOutside: props.onInteractOutside,
    onRequestDismiss: props.onRequestDismiss,
  }));

  // One forced re-read of the machine, one frame in.
  //
  // Zag's `checkRenderedElements` sniffs the DOM for the title and description a frame after the
  // machine starts, and writes the answer with `Object.assign(context.get("renderedElements"), …)`
  // — an in-place mutation that notifies no signal, so the memo below never re-reads it. Until
  // something else invalidates that memo, `connect` keeps the machine's optimistic
  // `{ title: true, description: true }` and the content carries an `aria-describedby` pointing at
  // an element that does not exist. Measured: a `defaultOpen` popover with no `Description` kept
  // the dangling IDREF for its whole open window, and only a later transition cleared it.
  //
  // The React version does not ship this — six popovers on chakra-ui.com's own docs, none with a
  // Description, all with `aria-describedby` absent — because it recomputes `connect` on any
  // re-render of the root, for any reason. Nothing gives us one, so this asks for exactly one.
  const [elementsSniffed, markElementsSniffed] = createSignal(false);

  // Registered after `useMachine`'s own `onSettled`, which is where the machine starts and where
  // the entry action queues its frame callback — so this one is queued strictly behind it and the
  // read below happens after the mutation, in the same frame.
  onSettled(() => {
    // Inside the callback, never around it: the server runs no frames and has no DOM to sniff, and
    // its markup carries the same optimistic attribute the React version's does. Skipping the
    // registration instead would be the quieter bug — both builds must make the same calls in the
    // same order.
    if (isServer) {
      return;
    }
    requestAnimationFrame(() => markElementsSniffed(true));
  });

  const api = createMemo(() => {
    // Subscribes this memo to the nudge above. The value carries nothing; being read is the point.
    elementsSniffed();
    return popover.connect(service, normalizeProps);
  });

  return createMachineStore(api, {});
}
