import {
  createMachineStore,
  normalizeProps,
  useEnvironmentContext,
  useLocaleContext,
  useMachine,
} from "@chakra-ui-solid/core";
import * as avatar from "@zag-js/avatar";
import { createMemo, createUniqueId } from "solid-js";
import type { CreateAvatarProps, CreateAvatarReturn } from "./avatar.types";

/**
 * Starts the `@zag-js/avatar` machine and hands back its connected API.
 *
 * Call it to own the machine yourself and drive an `<Avatar.RootProvider value={…}>` from outside;
 * `<Avatar.Root>` calls it for you and is the shorter way to the same thing.
 *
 * ```tsx
 * const avatar = createAvatar();
 * <button onClick={() => avatar.setSrc("/team/segun.png")}>Load</button>
 * <Avatar.RootProvider value={avatar}>…</Avatar.RootProvider>
 * ```
 *
 * **It returns the machine and nothing else** — no `unmounted`, where `createCollapsible` adds one.
 * The machine hides whichever of the image and the fallback is not showing, so nothing here decides
 * what is in the DOM and there is no render strategy to resolve.
 */
export function createAvatar(props: CreateAvatarProps = {}): CreateAvatarReturn {
  const locale = useLocaleContext();
  const environment = useEnvironmentContext();

  // Unconditional and at the top of the body, never behind a `??` or inside a memo: the server and
  // the hydrating client draw from one counter, so a moved call site desynchronises every `_hk`
  // after it. `create-collapsible.ts` carries the full account.
  const generatedId = createUniqueId();

  // Bare, with no `untrack` around it: the adapter's `seedFromProps` absorbs the machine's one-shot
  // construction reads, so a `[STRICT_READ_UNTRACKED]` here would be a real bug in this body or in
  // the machine's `watch`, and wrapping the call would hide exactly that.
  const service = useMachine(avatar.machine, () => ({
    id: props.id ?? generatedId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    ids: props.ids,
    onStatusChange: props.onStatusChange,
  }));

  const api = createMemo(() => avatar.connect(service, normalizeProps));

  return createMachineStore(api, {});
}
