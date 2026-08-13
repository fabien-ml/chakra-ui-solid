import { createMemo, createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { createMachineStore } from "../machine-store";

/** The store owns a memo read, so it is built under an owner and disposed by the test. */
function owned<T>(create: () => T): { value: T; dispose: () => void } {
  let dispose!: () => void;
  const value = createRoot((disposeRoot) => {
    dispose = disposeRoot;
    return create();
  });
  return { value, dispose };
}

describe("createMachineStore", () => {
  it("reads a data member back through the memo, not off the object it was built from", () => {
    const [open, setOpen] = createSignal(false);
    const { value: store, dispose } = owned(() =>
      createMachineStore(
        createMemo(() => ({ open: open() })),
        {},
      ),
    );

    expect(store.open).toBe(false);

    flush(() => setOpen(true));

    expect(store.open).toBe(true);
    dispose();
  });

  it("forwards every argument, so a multi-argument member is not truncated", () => {
    // Zag ships `setChannelValue(channel, value)`, `item(index, count)`, `setOpen(open, reason?)`.
    // A delegate written `(arg) => api()[key](arg)` drops the rest and reports nothing.
    const calls: unknown[][] = [];
    const { value: store, dispose } = owned(() =>
      createMachineStore(
        createMemo(() => ({
          setChannelValue: (...args: unknown[]) => {
            calls.push(args);
            return args.length;
          },
        })),
        {},
      ),
    );

    const returned = store.setChannelValue("hue", 120);

    expect(calls).toEqual([["hue", 120]]);
    expect(returned).toBe(2);
    dispose();
  });

  it("lets an `extra` member win over an api member of the same name", () => {
    const { value: store, dispose } = owned(() =>
      createMachineStore(
        createMemo(() => ({ open: false, visible: false })),
        {
          get visible() {
            return true;
          },
        },
      ),
    );

    expect(store.visible).toBe(true);
    expect(store.open).toBe(false);
    dispose();
  });

  it("keeps an `extra` getter a getter, rather than calling it once on the way in", () => {
    // `Object.assign(store, extra)` and `{ ...extra }` both read the getter here and copy the
    // value, which would freeze `unmounted` at whatever the render strategy said on first render.
    const [unmounted, setUnmounted] = createSignal(false);
    const { value: store, dispose } = owned(() =>
      createMachineStore(
        createMemo(() => ({ open: false })),
        {
          get unmounted() {
            return unmounted();
          },
        },
      ),
    );

    expect(store.unmounted).toBe(false);

    flush(() => setUnmounted(true));

    expect(store.unmounted).toBe(true);
    dispose();
  });

  it("enumerates the union of the api's keys and `extra`'s", () => {
    const { value: store, dispose } = owned(() =>
      createMachineStore(
        createMemo(() => ({ open: false, setOpen: () => {} })),
        {
          get unmounted() {
            return false;
          },
        },
      ),
    );

    expect(Object.keys(store).sort()).toEqual(["open", "setOpen", "unmounted"]);
    dispose();
  });
});
