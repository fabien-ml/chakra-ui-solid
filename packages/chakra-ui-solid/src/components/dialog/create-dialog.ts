import {
  createMachineStore,
  normalizeProps,
  useEnvironmentContext,
  useLocaleContext,
  useMachine,
} from "@chakra-ui-solid/core";
import * as dialog from "@zag-js/dialog";
import { createMemo, createUniqueId } from "solid-js";
import type { CreateDialogProps, CreateDialogReturn } from "./dialog.types";

/**
 * Starts the `@zag-js/dialog` machine and hands back its connected API.
 *
 * Call it to own the machine yourself and drive a `<Dialog.RootProvider value={…}>` from outside;
 * `<Dialog.Root>` calls it for you and is the shorter way to the same thing.
 *
 * ```tsx
 * const dialog = createDialog({ role: "alertdialog" });
 * <button onClick={() => dialog.setOpen(true)}>Delete…</button>
 * <Dialog.RootProvider value={dialog}>…</Dialog.RootProvider>
 * ```
 *
 * **It returns the machine and nothing else** — no `unmounted`, where `createCollapsible` adds one.
 * Dialog's exit window belongs to a `@zag-js/presence` machine, and that is the Root's to create:
 * Content and Backdrop mount independently and each needs its own.
 */
export function createDialog(props: CreateDialogProps = {}): CreateDialogReturn {
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
  const service = useMachine(dialog.machine, () => ({
    id: props.id ?? generatedId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    ids: props.ids,
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
    modal: props.modal,
    role: props.role,
    trapFocus: props.trapFocus,
    preventScroll: props.preventScroll,
    restoreFocus: props.restoreFocus,
    closeOnEscape: props.closeOnEscape,
    closeOnInteractOutside: props.closeOnInteractOutside,
    initialFocusEl: props.initialFocusEl,
    finalFocusEl: props.finalFocusEl,
    persistentElements: props.persistentElements,
    triggerValue: props.triggerValue,
    defaultTriggerValue: props.defaultTriggerValue,
    onTriggerValueChange: props.onTriggerValueChange,
    "aria-label": props["aria-label"],
    onEscapeKeyDown: props.onEscapeKeyDown,
    onPointerDownOutside: props.onPointerDownOutside,
    onFocusOutside: props.onFocusOutside,
    onInteractOutside: props.onInteractOutside,
    onRequestDismiss: props.onRequestDismiss,
  }));

  const api = createMemo(() => dialog.connect(service, normalizeProps));

  return createMachineStore(api, {});
}
