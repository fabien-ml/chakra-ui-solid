import { type Accessor, untrack } from "solid-js";

/**
 * The **machine store**: the value a `create<Name>()` returns and every part component reads off
 * context, built once from the memo that holds a Zag machine's connected api.
 *
 * Zag's `connect()` returns a whole new plain object on every transition, so the memo — not the
 * object — is the live thing. This wraps it in a stable object whose data members are getters back
 * into the memo and whose function members delegate to it, which is what lets a consumer write
 * `collapsible.open` and a part write `ctx.getTriggerProps()` and have both stay current.
 *
 * ```ts
 * const api = createMemo(() => collapsible.connect(service, normalizeProps));
 * return createMachineStore(api, {
 *   get unmounted() {
 *     return unmounted();
 *   },
 * });
 * ```
 *
 * `extra` carries the members the library adds beyond the machine's own, and its keys win over the
 * api's. The result is `Readonly<Api>`, so `store.open = true` is a compile error rather than a
 * write that silently goes nowhere.
 */
export function createMachineStore<Api extends object, Extra extends object>(
  api: Accessor<Api>,
  extra: Extra,
): Readonly<Api> & Extra {
  const read = api as Accessor<Record<string, unknown>>;

  // Bare `untrack`, and the one eager read in here: the key set has to come from somewhere, and the
  // memo already ran during this render pass on both builds. Un-untracked it would warn
  // `[STRICT_READ_UNTRACKED]` — SolidJS 2.0's dev build wraps a component body in a labelled
  // untrack, and a read of a memo from inside one is exactly what that warning is for.
  const initial = untrack(read);

  const store: Record<string, unknown> = {};

  for (const key of Object.keys(initial)) {
    if (typeof initial[key] === "function") {
      // Rest args, never a fixed arity. Zag's members are not all unary — `setChannelValue(channel,
      // value)`, `item(index, count)`, `setOpen(open, reason?)` — and a delegate that names one
      // parameter drops the rest with no error anywhere.
      store[key] = (...args: unknown[]) =>
        (read()[key] as (...args: unknown[]) => unknown)(...args);
    } else {
      // `configurable`, which `defineProperty` otherwise defaults to false: `extra` overriding a
      // member of the same name is a redefinition, and a locked one throws instead of winning.
      Object.defineProperty(store, key, {
        get: () => read()[key],
        enumerable: true,
        configurable: true,
      });
    }
  }

  // Descriptors, never `Object.assign` or `{ ...extra }`: both *call* a getter and copy its result,
  // which would freeze a caller's `get unmounted()` at whatever it read here.
  Object.defineProperties(store, Object.getOwnPropertyDescriptors(extra));

  return store as Readonly<Api> & Extra;
}
