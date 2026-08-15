import {
  createMachineStore,
  normalizeProps,
  useEnvironmentContext,
  useLocaleContext,
  useMachine,
} from "@chakra-ui-solid/core";
import * as tabs from "@zag-js/tabs";
import { createMemo, createUniqueId } from "solid-js";
import type { CreateTabsProps, CreateTabsReturn } from "./tabs.types";

/**
 * Starts the `@zag-js/tabs` machine and hands back its connected API.
 *
 * Call it to own the machine yourself and drive a `<Tabs.RootProvider value={…}>` from outside;
 * `<Tabs.Root>` calls it for you and is the shorter way to the same thing.
 *
 * ```tsx
 * const tabs = createTabs({ defaultValue: "profile" });
 * <button onClick={() => tabs.setValue("billing")}>Go to billing</button>
 * <Tabs.RootProvider value={tabs}>…</Tabs.RootProvider>
 * ```
 *
 * **It returns the machine and nothing else** — no `unmounted`, where `createCollapsible` adds one.
 * A set of tabs has one panel per value, so whether a panel is in the DOM is a fact about that
 * `Tabs.Content` and cannot live on the machine store.
 */
export function createTabs(props: CreateTabsProps = {}): CreateTabsReturn {
  const locale = useLocaleContext();
  const environment = useEnvironmentContext();

  // Called unconditionally, at the top of the body, and never behind a `??` or inside a memo. Under
  // the server build `createUniqueId()` consumes a hydration child id and under the hydrating client
  // build it consumes a context id, both off one counter — so moving the call site between the two
  // renders desynchronises every `_hk` after it, and the tree hydrates against the wrong nodes with
  // no error.
  const generatedId = createUniqueId();

  // There is no `withDefaults` call anywhere in this component, and that is not an oversight: the
  // machine's own `props({ props })` block is `{ orientation: "horizontal", activationMode:
  // "automatic", loopFocus: true, composite: true, navigate, defaultValue: null, ...props }`, and it
  // survives a wrapper forwarding an unset prop because the adapter runs `compact()` over this bag
  // before handing it over (`packages/core/src/zag/machine.ts`). So the spread never sees an
  // `undefined` to overwrite a default with — a home for a default that `CLAUDE.md` does not name
  // because it is not ours. Chakra passes Tabs no `defaultProps` of its own.
  //
  // Bare, with no `untrack` around it: the adapter's `seedFromProps` absorbs the machine's one-shot
  // construction reads, so a `[STRICT_READ_UNTRACKED]` here would be a real bug in this body or in
  // the machine's `watch`, and wrapping the call would hide exactly that.
  const service = useMachine(tabs.machine, () => ({
    id: props.id ?? generatedId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    ids: props.ids,
    value: props.value,
    defaultValue: props.defaultValue,
    onValueChange: props.onValueChange,
    onFocusChange: props.onFocusChange,
    activationMode: props.activationMode,
    orientation: props.orientation,
    loopFocus: props.loopFocus,
    composite: props.composite,
    deselectable: props.deselectable,
    translations: props.translations,
    navigate: props.navigate,
  }));

  const api = createMemo(() => tabs.connect(service, normalizeProps));

  return createMachineStore(api, {});
}
