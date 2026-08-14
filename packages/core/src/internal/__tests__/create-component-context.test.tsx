import type { JSX } from "@solidjs/web";
import { type Accessor, children, createMemo, createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { createComponentContext } from "../create-component-context";

/**
 * The context carries an accessor, the way a real component context carries a connected machine:
 * a value that would go stale if the read stopped tracking.
 */
interface TestContextValue {
  label: Accessor<string>;
}

const [TestProvider, useTestContext, useOptionalTestContext] =
  createComponentContext<TestContextValue>("Test");

const MISSING_ROOT = "Test sub-components must be rendered inside a Test root component.";

/**
 * A component reads context from the owner it was **created** in, so every probe below is written
 * inside the provider rather than built outside and passed in as a child. A provider returns its
 * children unevaluated, which is what `children()` here is for — nothing else in these trees
 * renders, so without it no probe ever runs.
 */
function resolve(tree: () => JSX.Element): void {
  children(tree)();
}

describe("createComponentContext — the strict reader", () => {
  it("throws an error naming the component family with no provider above it", () => {
    createRoot((dispose) => {
      expect(() => useTestContext()).toThrowError(MISSING_ROOT);
      dispose();
    });
  });

  it("returns the value under a provider", () => {
    const value: TestContextValue = { label: () => "labelled" };
    let seen: TestContextValue | undefined;

    function Probe(): null {
      seen = useTestContext();
      return null;
    }

    createRoot((dispose) => {
      resolve(() => (
        <TestProvider value={value}>
          <Probe />
        </TestProvider>
      ));
      dispose();
    });

    expect(seen).toBe(value);
  });
});

describe("createComponentContext — the optional reader", () => {
  it("answers undefined with no provider above it", () => {
    // What lets a form control render standing alone instead of demanding a root it does not need.
    createRoot((dispose) => {
      expect(useOptionalTestContext()).toBeUndefined();
      dispose();
    });
  });

  it("returns the value under a provider", () => {
    const value: TestContextValue = { label: () => "labelled" };
    let seen: TestContextValue | undefined;

    function Probe(): null {
      seen = useOptionalTestContext();
      return null;
    }

    createRoot((dispose) => {
      resolve(() => (
        <TestProvider value={value}>
          <Probe />
        </TestProvider>
      ));
      dispose();
    });

    expect(seen).toBe(value);
  });
});

describe("createComponentContext — reactivity", () => {
  it("keeps a signal inside the context value tracking through either reader", () => {
    const [label, setLabel] = createSignal("first");
    const value: TestContextValue = { label };

    let strict!: Accessor<string>;
    let optional!: Accessor<string>;

    function Probe(): null {
      strict = createMemo(() => useTestContext().label());
      optional = createMemo(() => useOptionalTestContext()?.label() ?? "no provider");
      return null;
    }

    const dispose = createRoot((disposeRoot) => {
      resolve(() => (
        <TestProvider value={value}>
          <Probe />
        </TestProvider>
      ));
      return disposeRoot;
    });

    expect(strict()).toBe("first");
    expect(optional()).toBe("first");

    // The write lands outside the root: 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` inside one.
    flush(() => setLabel("second"));

    expect(strict()).toBe("second");
    expect(optional()).toBe("second");
    dispose();
  });
});
