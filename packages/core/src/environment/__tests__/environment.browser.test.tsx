import { expectNoA11yViolations, mount } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Portal } from "@solidjs/web";
import type { Accessor } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type EnvironmentContext,
  EnvironmentProvider,
  useEnvironmentContext,
} from "../environment";

/**
 * The provider exists for one case that is invisible in an ordinary page: a subtree mounted inside a
 * **shadow root** — a DOM tree attached to an element that the main document cannot look into. There
 * `document.getElementById` returns `null` for an element that is plainly on screen, and a machine's
 * focus management and outside-click detection stop working with nothing to say so. The
 * discovery path below is the only thing that can learn it, so it is the only test here that could
 * not be replaced by reading the source.
 *
 * The probe hands out the context **accessor** and the assertions call it, rather than capturing a
 * root node at mount time. The provider learns its root node from a `ref` callback, whose signal
 * write Solid 2.0 defers to the next flush, so a value read during mount can legitimately still be
 * the fallback — a test that captured it then would be pinning the timing rather than the answer.
 */

function EnvironmentProbe(props: {
  onReady: (environment: Accessor<EnvironmentContext>) => void;
}): JSX.Element {
  // `useContext` reads no signal — the context value IS the accessor — so this is a plain read, not
  // an untracked one.
  props.onReady(useEnvironmentContext());
  return <p>environment probe</p>;
}

let mounted: { container: HTMLElement; dispose: () => void } | undefined;
let openedShadowHost: HTMLElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
  openedShadowHost?.remove();
  openedShadowHost = undefined;
});

/** A container inside a real shadow root, kept out of the mounted tree so `mount()` still owns cleanup. */
function shadowContainer(): { shadow: ShadowRoot; container: HTMLElement } {
  const host = document.createElement("div");
  document.body.append(host);
  openedShadowHost = host;

  const shadow = host.attachShadow({ mode: "open" });
  const container = document.createElement("div");
  shadow.append(container);
  return { shadow, container };
}

let captured: Accessor<EnvironmentContext> | undefined;

/**
 * Every tree below writes `<EnvironmentProbe onReady={capture} />` **inside** its provider, because
 * a Solid component reads context from the owner it was *created* in: an element built outside the
 * provider and passed in as a child resolves against the default context and every assertion here
 * would then be measuring the default.
 */
function capture(environment: Accessor<EnvironmentContext>): void {
  captured = environment;
}

function mountTree(ui: () => JSX.Element): Accessor<EnvironmentContext> {
  captured = undefined;
  mounted = mount(ui);
  if (captured === undefined) {
    throw new Error("the probe never mounted");
  }
  return captured;
}

describe("useEnvironmentContext", () => {
  it("answers the document with no provider anywhere", () => {
    // Defaulted rather than mandatory: the overwhelmingly common answer is `document`, and requiring
    // a provider for it would make every component unusable on its own.
    const environment = mountTree(() => <EnvironmentProbe onReady={capture} />);

    expect(environment().getRootNode()).toBe(document);
    expect(environment().getDocument()).toBe(document);
    expect(environment().getWindow()).toBe(window);
  });
});

describe("EnvironmentProvider — an explicit value", () => {
  it("takes a root node directly", () => {
    const environment = mountTree(() => (
      <EnvironmentProvider value={document}>
        <EnvironmentProbe onReady={capture} />
      </EnvironmentProvider>
    ));

    expect(environment().getRootNode()).toBe(document);
  });

  it("takes a function returning one, and calls it on every read", () => {
    // A function rather than a node is what lets a consumer point at an element that does not exist
    // yet — an iframe's document, most often, which is null until the frame loads.
    const value = vi.fn(() => document);
    const environment = mountTree(() => (
      <EnvironmentProvider value={value}>
        <EnvironmentProbe onReady={capture} />
      </EnvironmentProvider>
    ));

    expect(environment().getRootNode()).toBe(document);
    const callsSoFar = value.mock.calls.length;
    environment().getRootNode();
    expect(value.mock.calls.length).toBeGreaterThan(callsSoFar);
  });

  it("adds no element to the tree", () => {
    // The documented promise of the explicit form. The discovery probe below is a real `<span>`, and
    // a provider that rendered it unconditionally would insert one into every consumer's markup —
    // and shift every following node's hydration key.
    mountTree(() => (
      <EnvironmentProvider value={document}>
        <EnvironmentProbe onReady={capture} />
      </EnvironmentProvider>
    ));

    expect(mounted?.container.querySelector("span")).toBeNull();
  });
});

describe("EnvironmentProvider — discovery", () => {
  it("renders a probe element when no value is given", () => {
    mountTree(() => (
      <EnvironmentProvider>
        <EnvironmentProbe onReady={capture} />
      </EnvironmentProvider>
    ));

    const span = mounted?.container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span?.hasAttribute("hidden")).toBe(true);
  });

  it("finds the shadow root its subtree was mounted into", async () => {
    // The case the whole provider exists for, and the only way to learn it: ask a real node inside
    // the subtree what its root is.
    const { shadow, container } = shadowContainer();
    const environment = mountTree(() => (
      <Portal mount={container}>
        <EnvironmentProvider>
          <EnvironmentProbe onReady={capture} />
        </EnvironmentProvider>
      </Portal>
    ));

    await vi.waitFor(() => expect(environment().getRootNode()).toBe(shadow));
    // A shadow root is not a document — this is what a machine needs `getDocument()` for, since
    // `getRootNode().defaultView` would be undefined on it.
    expect(environment().getDocument()).toBe(document);
    expect(environment().getWindow()).toBe(window);
  });

  it("is accessible", async () => {
    const { container, dispose } = mount(() => (
      <EnvironmentProvider>
        <p>environment probe</p>
      </EnvironmentProvider>
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});
