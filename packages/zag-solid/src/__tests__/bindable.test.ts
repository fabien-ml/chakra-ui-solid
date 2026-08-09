// Carried from hope-ui `ef91b69`,
// `packages/primitives/src/zag-solid/__tests__/bindable.test.ts`. Same author, MIT — ours, forked
// on copy (`legal.md` §1.6).

import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createBindable } from "../bindable";

/**
 * Two SolidJS 2.0 rules shape every test here:
 *
 *  - The bindable is *created* inside `createRoot` (it owns an effect and needs an owner) but
 *    every `set()` runs **outside** that callback: 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]`
 *    on a synchronous write from inside an owned scope.
 *  - Writes are wrapped in `flush()`, because solid-js's *client* build (which the `unit` project
 *    resolves) defers a write to the next flush — a plain read straight after `set()` would see
 *    the old value, and the `valueRef`/`prevValue` effect would not have run yet.
 *
 * Both rules are pinned as characterization tests of SolidJS itself, in
 * `internal-test-utils`' `solid-contract.test.ts` — so when the 2.0 beta line moves, one red
 * contract test says so instead of every case in this file (`testing.md` §1.6).
 */
function owned<T>(create: () => T): { value: T; dispose: () => void } {
  let dispose!: () => void;
  const value = createRoot((disposeRoot) => {
    dispose = disposeRoot;
    return create();
  });
  // Settle the bindable's own `valueRef`/`prevValue` effect, the way mounting a component would.
  // Without it the first `set()` reports `prev: undefined`, since the effect that seeds
  // `prevValue` has not run — upstream's tests get this for free from `renderHook` + a microtask.
  flush();
  return { value, dispose };
}

describe("createBindable", () => {
  it("starts from defaultValue and reads back what it is set to", () => {
    const { value, dispose } = owned(() => createBindable<string>(() => ({ defaultValue: "bar" })));

    expect(value.initial).toBe("bar");
    expect(value.get()).toBe("bar");

    flush(() => value.set("baz"));

    expect(value.get()).toBe("baz");
    dispose();
  });

  it("prefers `value` over `defaultValue` for the initial snapshot", () => {
    const { value, dispose } = owned(() =>
      createBindable<string>(() => ({ defaultValue: "bar", value: "foo" })),
    );

    expect(value.initial).toBe("foo");
    expect(value.get()).toBe("foo");
    dispose();
  });

  it("refuses to write while controlled, but still reports the change", () => {
    const onChange = vi.fn();
    const { value, dispose } = owned(() =>
      createBindable<string>(() => ({ value: "foo", onChange })),
    );

    flush(() => value.set("next"));

    expect(value.get()).toBe("foo");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("next", "foo");
    dispose();
  });

  it("treats `value: null` as controlled-with-null, not as uncontrolled", () => {
    // The one case D3 turns on, and the only one in this file that is *new* rather than carried
    // (`zag-solid-adapter.md` §4.3 D3; DoD rule 2.11). Under the fork's original loose
    // `value != undefined`, `null` read as *uncontrolled*: the cell would fall back to
    // `defaultValue` and accept writes, so `<Select value={null}>` would silently keep internal
    // state where Chakra and all six upstream adapters treat it as an explicit null.
    const onChange = vi.fn();
    const { value, dispose } = owned(() =>
      createBindable<string | null>(() => ({ defaultValue: "fallback", value: null, onChange })),
    );

    expect(value.get()).toBeNull();

    flush(() => value.set("written"));

    expect(value.get()).toBeNull();
    expect(onChange).toHaveBeenCalledExactlyOnceWith("written", null);
    dispose();
  });

  it("follows the controlled value when it changes underneath", () => {
    const [controlled, setControlled] = createSignal("foo");
    const { value, dispose } = owned(() => createBindable<string>(() => ({ value: controlled() })));

    expect(value.get()).toBe("foo");

    flush(() => setControlled("bar"));

    expect(value.get()).toBe("bar");
    expect(value.ref.current).toBe("bar");
    dispose();
  });

  it("notifies onChange with the previous value, and not at all when equal", () => {
    const onChange = vi.fn();
    const { value, dispose } = owned(() =>
      createBindable<string>(() => ({ defaultValue: "a", onChange })),
    );

    flush(() => value.set("b"));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("b", "a");

    flush(() => value.set("b"));
    expect(onChange).toHaveBeenCalledOnce();
    dispose();
  });

  it("honors a custom isEqual when deciding whether to notify", () => {
    const onChange = vi.fn();
    const { value, dispose } = owned(() =>
      createBindable<string[]>(() => ({
        defaultValue: ["a"],
        isEqual: (a, b) => a.join() === b?.join(),
        onChange,
      })),
    );

    flush(() => value.set(["a"]));
    expect(onChange).not.toHaveBeenCalled();

    flush(() => value.set(["a", "b"]));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(["a", "b"], ["a"]);
    dispose();
  });

  it("resolves an updater against the current value", () => {
    const { value, dispose } = owned(() => createBindable<number>(() => ({ defaultValue: 1 })));

    flush(() => value.set((previous) => previous + 1));
    expect(value.get()).toBe(2);

    flush(() => value.set((previous) => previous + 1));
    expect(value.get()).toBe(3);
    dispose();
  });

  it("stores a function value instead of invoking it", () => {
    // The whole reason the signal is boxed: 2.0's `createSignal(fn)` is the memo overload, so an
    // unboxed implementation would call this and store `"called"`.
    const stored = () => "called";
    const { value, dispose } = owned(() =>
      createBindable<() => string>(() => ({ defaultValue: stored })),
    );

    expect(value.get()).toBe(stored);
    dispose();
  });

  it("makes the write visible before `set` returns when `sync` is set", () => {
    // No `flush()` at the call site — `sync` is what buys the caller a settled read, which is what
    // the machine's state bindable depends on when two events land in the same tick.
    const { value, dispose } = owned(() =>
      createBindable<string>(() => ({ defaultValue: "a", sync: true })),
    );

    value.set("b");

    expect(value.get()).toBe("b");
    expect(value.ref.current).toBe("b");
    dispose();
  });

  it("exposes `invoke` as a bare onChange call that bypasses the signal", () => {
    const onChange = vi.fn();
    const { value, dispose } = owned(() =>
      createBindable<string>(() => ({ defaultValue: "a", onChange })),
    );

    value.invoke("next", "previous");

    expect(onChange).toHaveBeenCalledExactlyOnceWith("next", "previous");
    expect(value.get()).toBe("a");
    dispose();
  });

  it("hashes with the supplied hash, and with String() otherwise", () => {
    const plain = owned(() => createBindable<number>(() => ({ defaultValue: 1 })));
    const hashed = owned(() =>
      createBindable<number>(() => ({ defaultValue: 1, hash: (v) => `#${v}` })),
    );

    expect(plain.value.hash(2)).toBe("2");
    expect(hashed.value.hash(2)).toBe("#2");

    plain.dispose();
    hashed.dispose();
  });

  it("logs through the debug label", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { value, dispose } = owned(() =>
      createBindable<string>(() => ({ defaultValue: "a", debug: "toggle" })),
    );

    flush(() => value.set("b"));

    expect(log).toHaveBeenCalledWith("[bindable > toggle] setValue", {
      next: "b",
      prev: "a",
    });
    log.mockRestore();
    dispose();
  });
});

describe("createBindable.ref", () => {
  it("stores a plain, non-reactive value", () => {
    const ref = createBindable.ref("a");

    expect(ref.get()).toBe("a");

    ref.set("b");

    expect(ref.get()).toBe("b");
  });
});

describe("createBindable.cleanup", () => {
  it("runs the callback when the owning scope is disposed", () => {
    const cleanup = vi.fn();

    const { dispose } = owned(() => createBindable.cleanup(cleanup));
    expect(cleanup).not.toHaveBeenCalled();

    dispose();

    expect(cleanup).toHaveBeenCalledOnce();
  });
});
