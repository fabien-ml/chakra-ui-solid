// Carried from hope-ui `main` (1dc059f), `packages/primitives/src/__tests__/solid-contract.test.ts`,
// and extended with the three `flush()` cases of `zag-solid-adapter.md` §6.3. Same author, MIT —
// ours, forked on copy (`CLAUDE.md`, *Reference use*).

import {
  createContext,
  createEffect,
  createRoot,
  createSignal,
  flush,
  merge,
  useContext,
} from "solid-js";
import { describe, expect, it } from "vitest";

/**
 * Characterization tests for the `solid-js` internals this codebase leans on, none of which is
 * documented, public API. Each block names the code that breaks if SolidJS 2.0 *stable* changes it.
 *
 * They do not test chakra-ui-solid. They exist so the beta→stable migration is a mechanical diff
 * rather than a bug hunt, and so that when the 2.0 beta line moves, **one red contract test says so
 * instead of thirty adapter tests failing with no common cause** (`testing.md` §1.6). `@solidjs/web`
 * has already renamed runtime helpers *within* the beta line (`use`→`ref`,
 * `addEventListener`→`addEvent`), and a silent flip here would otherwise surface days later as a
 * dialog that will not label itself, a ref that never fires, or a crash inside `@solidjs/web`.
 *
 * This file runs in the **unit** project — `solid-js`'s client build, real effects, and signal
 * writes that only become visible after a `flush()`. Its siblings pin the same idea against the
 * other builds: `solid-contract.ssr.test.tsx` (server build, and the `_hk` hydration key — the
 * positional marker Solid matches server and client nodes by) and
 * `solid-contract.browser.test.tsx` (client build in a real browser, `applyRef`).
 */

describe("solid-js contract", () => {
  describe("merge resolves a key by presence, not by value", () => {
    // Depended on by two things here. First, **every `merge` call site in the `zag-solid` fork's
    // `machine.ts`** (`zag-solid-adapter.md` §3.4): the Solid 2.0 migration replaced upstream's
    // value-based `mergeProps` with this presence-based one, and the whole prop-bag precedence
    // order rests on it. Second, `withDefaults` in `@chakra-ui-solid/system` (step 3), which
    // exists *only* because of this — without it, `<Dialog.Root modal={props.modal}>` with `modal`
    // unset silently yields a non-modal dialog (`prior-art.md` §9).
    //
    // If stable makes a later source's `undefined` stop winning, `withDefaults` becomes
    // unnecessary: delete it.
    it("keeps an earlier source's value when a later source omits the key", () => {
      expect(merge({ modal: true }, {}).modal).toBe(true);
    });

    it("lets a later source's explicit `undefined` clobber an earlier value", () => {
      expect(merge({ modal: true }, { modal: undefined }).modal).toBeUndefined();
    });
  });

  describe("createSignal(fn) is the memo overload, not a signal holding a function", () => {
    // This is the premise of the fork's **divergence 3** (`zag-solid-adapter.md` §3.4): `bindable.ts`
    // boxes its value in `{ value: T }` plus an unwrapping `equals` solely to dodge this. 2.0
    // overloads `createSignal` as `<T>(value: Exclude<T, Function>, options?)` and
    // `<T>(fn: ComputeFunction<T>, options?)`, so a generic `createSignal<T>(someValue)` silently
    // invokes a function-typed value and stores its return instead — and a machine's state value
    // is allowed to be a function.
    //
    // Pinned in both directions, because divergence 3 retires the day the overload does.
    it("invokes a function argument and stores its return value", () => {
      const compute = () => "computed";
      const [read] = createSignal(compute);

      expect(read()).toBe("computed");
      expect(read()).not.toBe(compute);
    });

    it("stores a function untouched once it is boxed inside an object", () => {
      const compute = () => "computed";
      const [read] = createSignal({ value: compute });

      expect(read().value).toBe(compute);
    });
  });

  describe("useContext throws when no Provider is mounted", () => {
    // Depended on by `createComponentContext` in `@chakra-ui-solid/system` (step 3;
    // `component-blueprint.md` §3.3), whose `try/catch` relies on the throw to reword it as
    // "Dialog sub-components must be rendered inside a Dialog root component." If stable returns
    // `undefined` instead, that friendly error stops firing and every part component fails later
    // with a null-deref on the machine api.
    it("throws for a context created without a default value", () => {
      const NoDefault = createContext<string>(undefined, { name: "NoDefault" });

      createRoot((dispose) => {
        expect(() => useContext(NoDefault)).toThrow(/Context must either be created with/);
        dispose();
      });
    });

    it("returns the default value, without throwing, when the context has one", () => {
      // The other half of the contract: `createComponentContext` passes `undefined` as the default
      // *on purpose*. Were it to pass a real default, the catch would never run.
      const WithDefault = createContext<string>("fallback", { name: "WithDefault" });

      createRoot((dispose) => {
        expect(useContext(WithDefault)).toBe("fallback");
        dispose();
      });
    });
  });

  describe("sibling effect ordering", () => {
    // **What this pins, and why it is here even though its original dependant is not.** In hope-ui
    // these two paths were depended on by `createFocusRestore`, which the port rule strikes — Zag
    // owns focus behavior here and we add nothing on top of it (`prior-art.md` §8.2). What survives
    // is the semantic itself: sibling effects re-run in creation order but dispose in REVERSE
    // creation order, and a microtask queued from a cleanup lands after every sibling cleanup.
    //
    // Both orders are load-bearing for anything that attaches a listener or a machine subscription
    // in an effect and tears it down in the cleanup — the adapter's `machine.ts`, and the presence
    // render strategy from step 3. They are pinned because **the two paths disagreeing is exactly
    // the sort of thing a reader assumes away**, and because a component that unmounts *while open*
    // takes the disposal path while one that merely closes takes the re-run path.

    /** Two sibling effects on one signal, each logging its run and its cleanup. */
    function createOrderedSiblings(): {
      order: string[];
      setActive: (v: boolean) => void;
      dispose: () => void;
    } {
      const order: string[] = [];
      const [active, setActive] = createSignal(true);
      let dispose!: () => void;

      createRoot((disposeRoot) => {
        dispose = disposeRoot;

        createEffect(
          () => active(),
          () => {
            order.push("first:run");
            return () => {
              order.push("first:cleanup");
              queueMicrotask(() => order.push("first:microtask"));
            };
          },
        );

        createEffect(
          () => active(),
          () => {
            order.push("second:run");
            return () => order.push("second:cleanup");
          },
        );
      });

      flush();
      return { order, setActive, dispose };
    }

    it("runs sibling effects in creation order", () => {
      const { order, dispose } = createOrderedSiblings();
      expect(order).toEqual(["first:run", "second:run"]);
      dispose();
    });

    it("runs sibling cleanups in creation order when the effects re-run", () => {
      // Each effect runs its own previous cleanup before its own new body, so the first sibling's
      // cleanup fires while the second sibling's listener is *still attached*.
      const { order, setActive, dispose } = createOrderedSiblings();
      order.length = 0;

      flush(() => setActive(false));

      expect(order).toEqual(["first:cleanup", "first:run", "second:cleanup", "second:run"]);
      dispose();
    });

    it("lands a microtask queued from the first cleanup after every sibling cleanup", () => {
      // Effect cleanups are synchronous within a flush, so a microtask queued from the first one
      // runs after all of them. Any teardown that must observe the *fully* torn-down state defers
      // itself by exactly one microtask on the strength of this; if stable made cleanups async, the
      // deferral would no longer be enough.
      const { order, setActive, dispose } = createOrderedSiblings();
      order.length = 0;

      flush(() => setActive(false));
      expect(order).not.toContain("first:microtask");

      return Promise.resolve().then(() => {
        expect(order.at(-1)).toBe("first:microtask");
        dispose();
      });
    });

    it("runs sibling cleanups in REVERSE creation order when the owner is disposed", () => {
      // The other path, and it is the opposite. Owner disposal is LIFO.
      const { order, dispose } = createOrderedSiblings();
      order.length = 0;

      dispose();

      expect(order).toEqual(["second:cleanup", "first:cleanup"]);
    });
  });

  describe("flush() is what makes a write visible", () => {
    // The fork's **divergence 4** (`zag-solid-adapter.md` §3.4): `machine.ts` calls Solid 2.0's real
    // `flush(() => state.set(target))` on a state change, where upstream's adapter has a no-op.
    // Solid 1.x propagated writes synchronously; 2.0's client build defers them, so without the
    // flush two events sent back-to-back would both transition from the *pre*-transition state.
    // This is what the React adapter spells `flushSync`.
    //
    // `brief-plan` §3.5 asked for these three cases and hope-ui never wrote them: `flush` was *used*
    // throughout its contract tests but never *characterized*. Without them divergence 4 is an
    // unexplained line, and the day 2.0's batching changes we would be debugging Dialog instead of
    // reading one red contract test.

    it("leaves a plain write invisible to a plain read until the next flush", () => {
      const [count, setCount] = createSignal(0);

      setCount(5);
      expect(count()).toBe(0);

      flush();
      expect(count()).toBe(5);
    });

    it("drains the writes made inside flush(fn) before returning", () => {
      const [count, setCount] = createSignal(0);
      const seen: number[] = [];
      let dispose!: () => void;

      createRoot((disposeRoot) => {
        dispose = disposeRoot;
        createEffect(
          () => count(),
          (value) => {
            seen.push(value);
          },
        );
      });
      flush();
      seen.length = 0;

      flush(() => {
        setCount(7);
        // Still the pre-write value in here: `flush(fn)` runs `fn` first and drains afterwards.
        expect(count()).toBe(0);
      });

      expect(count()).toBe(7);
      expect(seen).toEqual([7]);

      dispose();
    });

    it("lands a write queued inside queueMicrotask after the current synchronous flush", async () => {
      // The exact ordering `send` relies on: a machine event queued from a microtask observes the
      // *previous* transition as fully settled, rather than racing the flush that is settling it.
      const [count, setCount] = createSignal(0);
      const observed: number[] = [];

      queueMicrotask(() => {
        observed.push(count());
        setCount(100);
      });

      flush(() => setCount(50));
      expect(observed).toEqual([]);
      expect(count()).toBe(50);

      await Promise.resolve();

      expect(observed).toEqual([50]);
      // And the microtask's own write is subject to the same rule — it needs its own flush.
      expect(count()).toBe(50);
      flush();
      expect(count()).toBe(100);
    });
  });
});
