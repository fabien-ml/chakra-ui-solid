import {
  createMachineStore,
  createRenderStrategy,
  normalizeProps,
  useEnvironmentContext,
  useLocaleContext,
  useMachine,
} from "@chakra-ui-solid/core";
import * as collapsible from "@zag-js/collapsible";
import { createMemo, createUniqueId } from "solid-js";
import type { CreateCollapsibleProps, CreateCollapsibleReturn } from "./collapsible.types";

/**
 * Starts the `@zag-js/collapsible` machine and hands back its connected API.
 *
 * Call it to own the machine yourself and drive a `<Collapsible.RootProvider value={…}>` from
 * outside; `<Collapsible.Root>` calls it for you and is the shorter way to the same thing.
 *
 * ```tsx
 * const collapsible = createCollapsible({ defaultOpen: true });
 * <button onClick={() => collapsible.setOpen(!collapsible.open)}>Toggle</button>
 * <Collapsible.RootProvider value={collapsible}>…</Collapsible.RootProvider>
 * ```
 */
export function createCollapsible(props: CreateCollapsibleProps = {}): CreateCollapsibleReturn {
  const locale = useLocaleContext();
  const environment = useEnvironmentContext();

  // Called unconditionally, at the top of the body, and never behind a `??` or inside a memo. Under
  // the server build `createUniqueId()` consumes a hydration child id and under the hydrating client
  // build it consumes a context id, both off one counter — so moving the call site between the two
  // renders desynchronises every `_hk` after it, and the tree hydrates against the wrong nodes with
  // no error (`solid-contract.ssr.test.tsx` pins the two builds against each other).
  const generatedId = createUniqueId();

  // Bare, with no `untrack` around it: the adapter's `seedFromProps` absorbs the machine's one-shot
  // construction reads, so a `[STRICT_READ_UNTRACKED]` here would be a real bug in this body or in
  // the machine's `watch`, and wrapping the call would hide exactly that.
  const service = useMachine(collapsible.machine, () => ({
    id: props.id ?? generatedId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    ids: props.ids,
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
    onExitComplete: props.onExitComplete,
    disabled: props.disabled,
    collapsedHeight: props.collapsedHeight,
    collapsedWidth: props.collapsedWidth,
  }));

  const api = createMemo(() => collapsible.connect(service, normalizeProps));

  // `visible`, not `open`: it stays true through the exit animation, so `unmountOnExit` removes the
  // node when the animation ends rather than when the close begins. Collapsible owns that window
  // itself — its `closing` state and its `animationend` listener are the machine's — which is why
  // this row needs no `@zag-js/presence` and why the strategy takes a plain `present` accessor.
  const { unmounted } = createRenderStrategy(
    () => api().visible,
    () => ({ lazyMount: props.lazyMount, unmountOnExit: props.unmountOnExit }),
  );

  return createMachineStore(api, {
    get unmounted() {
      return unmounted();
    },
  });
}
