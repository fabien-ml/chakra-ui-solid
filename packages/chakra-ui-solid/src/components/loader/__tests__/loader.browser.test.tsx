import loaderServerHtml from "virtual:hydration-fixture?id=loader";
import {
  hydrateFixture,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "vitest";
import { Box } from "../../box";
import { Span } from "../../span";
import { Loader } from "../loader";
import { Tree } from "./loader.ssr-entry";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/** A wrapper's children as they read in the DOM — an element by its tag, a text node by its text. */
function contentOrder(element: HTMLElement): string[] {
  return [...element.childNodes]
    .map((node) =>
      node instanceof Element ? node.tagName.toLowerCase() : (node.textContent ?? "").trim(),
    )
    .filter((entry) => entry !== "");
}

function queryElement(root: ParentNode, selector: string): HTMLElement {
  const found = root.querySelector(selector);
  if (!(found instanceof HTMLElement)) {
    throw new Error(`expected an element matching \`${selector}\``);
  }
  return found;
}

describe("Loader", () => {
  it("renders the children on their own when it is not visible", () => {
    mounted = mountElement(() => (
      <Loader visible={false}>
        <span data-testid="label">Save</span>
      </Loader>
    ));

    // Not merely *a* span around the children — the container holds the child and nothing else, so
    // a caller who leaves a Loader mounted across a state change adds no element to the DOM while
    // idle.
    expect(mounted.container.childNodes.length).toBe(1);
    expect(mounted.element.dataset.testid).toBe("label");
  });

  it("puts the spinner before the text", () => {
    mounted = mountElement(() => <Loader text="Saving…">Save</Loader>);

    expect(contentOrder(mounted.element)).toEqual(["span", "Saving…"]);
    // The text replaces the children rather than joining them, which is Chakra's shape.
    expect(mounted.element.textContent).toBe("Saving…");
  });

  it("puts the spinner after the text when placed at the end", () => {
    mounted = mountElement(() => (
      <Loader text="Saving…" spinnerPlacement="end">
        Save
      </Loader>
    ));

    expect(contentOrder(mounted.element)).toEqual(["Saving…", "span"]);
  });

  it("hides the children in place and centres the spinner over them", () => {
    mounted = mountElement(() => (
      <Box position="relative" width="200px">
        <Loader>
          <Span data-testid="label" display="block" width="120px" height="40px">
            Save
          </Span>
        </Loader>
      </Box>
    ));

    const label = queryElement(mounted.element, "[data-testid='label']");
    const overlay = queryElement(mounted.element, "div");

    // `visibility` rather than `display: none`: the label is invisible and still laid out, so the
    // parent keeps the size it had before it started loading. Asserted as geometry, because both
    // wrappers are `display: contents` and measure nothing themselves.
    expect(getComputedStyle(label).visibility).toBe("hidden");
    expect(label.getBoundingClientRect().width).toBe(120);
    expect(mounted.element.getBoundingClientRect().height).toBe(40);

    const box = mounted.element.getBoundingClientRect();
    const spinner = overlay.getBoundingClientRect();
    expect(spinner.left + spinner.width / 2).toBeCloseTo(box.left + box.width / 2, 1);
    expect(spinner.top + spinner.height / 2).toBeCloseTo(box.top + box.height / 2, 1);
  });

  it("wraps the children in a bare `display: contents` span with neither a spinner nor text", () => {
    mounted = mountElement(() => (
      <Loader spinner={false}>
        <span data-testid="label">Save</span>
      </Loader>
    ));

    expect(mounted.element.tagName).toBe("SPAN");
    expect(getComputedStyle(mounted.element).display).toBe("contents");
    expect(contentOrder(mounted.element)).toEqual(["span"]);
    // No overlay, and no second wrapper hiding anything.
    expect(mounted.element.querySelector("div")).toBeNull();
    expect(getComputedStyle(queryElement(mounted.element, "span")).visibility).toBe("visible");
  });

  it("stays `display: contents` when a wrapper forwards an unset `display`", () => {
    // Spelled `merge({ display: "contents" }, props)` the default resolved by presence, so this
    // gave the Loader a box of its own — an inline element between the button and its label, which
    // is what centres the spinner somewhere else and lets the width collapse.
    mounted = mountElement(() => (
      <Loader display={undefined} spinner={false}>
        <span data-testid="label">Save</span>
      </Loader>
    ));

    expect(getComputedStyle(mounted.element).display).toBe("contents");
  });

  /**
   * The hazard these two exist for: a JSX-valued **prop** compiles to a lazy getter that runs
   * `createComponent` on every read, and both slots are read twice in a render — once by their
   * branch's gate, once by its body. Read raw they are built twice and one copy is discarded, and
   * nothing else in this file can see it: the markup, the geometry and the styles are all identical
   * either way. Only a count says so.
   */
  function countingComponent(): { component: () => JSX.Element; builds: () => number } {
    let builds = 0;
    return {
      component: () => {
        builds += 1;
        return <span data-testid="slot" />;
      },
      builds: () => builds,
    };
  }

  it("builds the `spinner` slot once, not once per read", () => {
    const { component: Counted, builds } = countingComponent();
    mounted = mountElement(() => <Loader spinner={<Counted />}>Save</Loader>);

    expect(queryElement(mounted.element, "[data-testid='slot']")).toBeDefined();
    expect(builds()).toBe(1);
  });

  it("builds the `text` slot once, not once per read", () => {
    const { component: Counted, builds } = countingComponent();
    mounted = mountElement(() => <Loader text={<Counted />}>Save</Loader>);

    expect(queryElement(mounted.element, "[data-testid='slot']")).toBeDefined();
    expect(builds()).toBe(1);
  });

  it("builds neither slot when it is not visible", () => {
    // `children()`'s memo is lazy and `Switch` stops at the first matching gate, so a Loader left
    // mounted while idle pays for nothing. An eager memo here would build both.
    const countedSpinner = countingComponent();
    const countedText = countingComponent();
    const Spinner = countedSpinner.component;
    const Text = countedText.component;

    mounted = mountElement(() => (
      <Loader visible={false} spinner={<Spinner />} text={<Text />}>
        <span data-testid="label">Save</span>
      </Loader>
    ));

    expect(mounted.element.dataset.testid).toBe("label");
    expect(countedSpinner.builds()).toBe(0);
    expect(countedText.builds()).toBe(0);
  });

  it("sizes the default spinner off the surrounding font size", () => {
    // `size="inherit"` resolves to `--spinner-size: 1em`, which is the whole reason a Button's
    // spinner matches its label. An unresolved variant leaves the custom property undefined and the
    // spinner collapses to nothing, with no error.
    mounted = mountElement(() => (
      <Box fontSize="24px">
        <Loader>Save</Loader>
      </Box>
    ));

    // The AbsoluteCenter is the only `div` under the wrapper, and the spinner is what it holds.
    const spinner = queryElement(mounted.element, "div").firstElementChild;
    if (!(spinner instanceof HTMLElement)) {
      throw new Error("expected the overlay to hold the default spinner");
    }

    expect(getComputedStyle(spinner).width).toBe("24px");
    expect(getComputedStyle(spinner).height).toBe("24px");
  });
});

describe("Loader — server render, then hydrate", () => {
  it("reuses every server node across both slot-resolving branches", () => {
    // The half neither other project can see. `children()` resolves in the ambient owner rather
    // than at the position it is read, so it does not consume the hydration key a raw read there
    // would — and the whole subtree after it keys accordingly. If server and client disagree,
    // `hydrate()` either claims a server node under a different client tree or gives up and
    // client-renders, and **both are silent**: the markup, the styles and the geometry all still
    // look right. `hydrateFixture` is what makes them fail — it asserts hydration logged nothing,
    // added and dropped no element, and reused every server node as the same object.
    const { container, dispose } = hydrateFixture(loaderServerHtml, () => <Tree />);

    const label = container.querySelector('[data-probe="label"]');
    const customSpinner = container.querySelector('[data-probe="custom-spinner"]');
    if (!(label instanceof HTMLElement) || !(customSpinner instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its probe elements");
    }

    // The styles have to survive on the server's own nodes, not on nodes a fallback rebuilt: the
    // hidden wrapper still hides its children, and the spinner-only branch still centres its
    // overlay on the positioned Box.
    expect(getComputedStyle(label).visibility).toBe("hidden");
    expect(getComputedStyle(customSpinner).visibility).toBe("visible");

    dispose();
  });
});
