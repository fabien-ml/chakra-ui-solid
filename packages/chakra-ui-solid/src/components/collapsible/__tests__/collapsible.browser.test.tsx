import collapsibleServerHtml from "virtual:hydration-fixture?id=collapsible";
import { normalizeProps, useMachine } from "@chakra-ui-solid/core";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import * as zagCollapsible from "@zag-js/collapsible";
import { createSignal, untrack } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Collapsible, createCollapsible } from "../index";
import { Tree } from "./collapsible.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask — an action that sends is not re-entrant with the
 * transition that triggered it — and writes the new state through `flush`, so one turn of the
 * microtask queue is the whole wait.
 */
const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/** Two frames, for the `raf`-scheduled work: `computeSize` measures, then the animation is tracked. */
const settleFrames = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

function partOf(container: HTMLElement, part: string): HTMLElement {
  const element = container.querySelector(`[data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

function Basic(props: { disabled?: boolean; open?: boolean; onOpenChange?: () => void }) {
  return (
    <Collapsible.Root disabled={props.disabled} open={props.open} onOpenChange={props.onOpenChange}>
      <Collapsible.Trigger>
        Show
        <Collapsible.Indicator>▾</Collapsible.Indicator>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <span data-probe="body">body</span>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

describe("Collapsible — a real machine through the adapter", () => {
  it("opens on a click, and every part follows", async () => {
    mounted = mount(() => <Basic />);
    const trigger = partOf(mounted.container, "trigger");
    const content = partOf(mounted.container, "content");
    const root = partOf(mounted.container, "root");
    const indicator = partOf(mounted.container, "indicator");

    expect(root.dataset.state).toBe("closed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(content.hidden).toBe(true);

    trigger.click();
    await settle();

    expect(root.dataset.state).toBe("open");
    expect(indicator.dataset.state).toBe("open");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.dataset.state).toBe("open");
    expect(content.hidden).toBe(false);
  });

  it("keeps every element it started with, rather than rebuilding the subtree", async () => {
    // The failure this is the only witness to: a part's merged bag is a proxy whose `children` read
    // goes back to a live source, and a `children` getter rebuilds its whole JSX on every read. If a
    // transition invalidated the `insert` that reads it, the trigger's label and indicator would be
    // replaced by new nodes on every click — taking focus and any event binding with them, with the
    // markup still looking exactly right.
    mounted = mount(() => <Basic />);
    const before = [...mounted.container.querySelectorAll("*")];
    const trigger = partOf(mounted.container, "trigger");

    trigger.click();
    await settle();

    expect([...mounted.container.querySelectorAll("*")]).toEqual(before);
  });

  it("measures the content it found by id, which is the machine reaching the real DOM", async () => {
    // `computeSize` looks the content element up through the scope's `getRootNode` and writes its
    // measured height into `--height`, which is what the expand animation interpolates towards. A
    // `0px` here means the machine never found the element — the whole point of `getRootNode` being
    // injected from the environment context.
    mounted = mount(() => (
      <Collapsible.Root>
        <Collapsible.Trigger>Show</Collapsible.Trigger>
        <Collapsible.Content>
          <div style={{ height: "40px" }}>tall</div>
        </Collapsible.Content>
      </Collapsible.Root>
    ));
    const trigger = partOf(mounted.container, "trigger");
    const content = partOf(mounted.container, "content");

    trigger.click();
    await settle();
    await settleFrames();

    expect(content.style.getPropertyValue("--height")).toBe("40px");
  });

  it("closes through a `closing` window that lasts as long as the recipe's animation", async () => {
    // The window `unmountOnExit` is built on, and the reason this row needs no `@zag-js/presence`:
    // the machine holds a third state while the content animates out, and it leaves that state on
    // the `animationend` of the very keyframes the preset generated. The content already says
    // `closed` — that is what starts the animation — while the trigger still says expanded, because
    // the element is still there and still reachable.
    mounted = mount(() => <Basic />);
    const trigger = partOf(mounted.container, "trigger");
    const content = partOf(mounted.container, "content");

    trigger.click();
    await settle();
    trigger.click();
    await settle();

    expect(content.dataset.state).toBe("closed");
    expect(content.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(getComputedStyle(content).animationName).toContain("collapse-height");

    await vi.waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    expect(content.hidden).toBe(true);
  });

  it("ignores a click when disabled", async () => {
    mounted = mount(() => <Basic disabled />);
    const trigger = partOf(mounted.container, "trigger");
    const root = partOf(mounted.container, "root");

    expect(trigger.dataset.disabled).toBe("");
    trigger.click();
    await settle();

    expect(root.dataset.state).toBe("closed");
  });

  it("reports a controlled open state upward rather than changing it itself", async () => {
    const onOpenChange = vi.fn();
    const [open, setOpen] = createSignal(false);

    mounted = mount(() => <Basic open={open()} onOpenChange={onOpenChange} />);
    const trigger = partOf(mounted.container, "trigger");
    const root = partOf(mounted.container, "root");

    trigger.click();
    await settle();

    expect(onOpenChange).toHaveBeenCalledWith({ open: true });
    expect(root.dataset.state).toBe("closed");

    setOpen(true);
    await settle();

    expect(root.dataset.state).toBe("open");
  });

  it("exposes every member `connect` returns, and exactly one of its own", () => {
    // The drift a hand-written member list cannot catch. `createMachineStore` enumerates the
    // connected api at runtime and `CreateCollapsibleReturn extends collapsible.Api<PropTypes>`
    // inherits it at compile time, so a member a Zag minor release adds reaches both for free —
    // this is what says the two really are the same set, rather than two lists that agree today.
    let storeKeys: string[] = [];
    let connectedKeys: string[] = [];

    mounted = mount(() => {
      storeKeys = Object.keys(createCollapsible());

      const service = useMachine(zagCollapsible.machine, () => ({ id: "key-set-probe" }));
      connectedKeys = untrack(() => Object.keys(zagCollapsible.connect(service, normalizeProps)));

      return null;
    });

    expect([...storeKeys].sort()).toEqual([...connectedKeys, "unmounted"].sort());
  });
});

describe("Collapsible — the styles the recipe really generated", () => {
  // Computed styles, never class names: a Panda class whose CSS was never generated renders nothing
  // and raises no error, so `classList.contains("collapsible__content")` passes on a content element
  // that clips nothing and animates nothing (`CLAUDE.md`, *silent unstyling*).
  //
  // Only the `content` slot has a body — `root`, `trigger` and `indicator` carry a class name and no
  // rules — so there is nothing to assert on the other three, and an assertion that found something
  // there would be reading someone else's cascade.

  it("clips the content, and lets the UA `[hidden]` rule be the only thing that hides it", async () => {
    // The pair, not either half. `overflow: hidden` is the slot's; `display: none` is
    // `[hidden] { display: none }` from the user-agent sheet, and it only wins because the slot
    // declares no `display` of its own for it to lose to. A `display: block` added to the recipe
    // would leave the closed content visible with `hidden` still on the attribute — valid CSS, no
    // error, and the component silently stops hiding anything.
    mounted = mount(() => <Basic />);
    const content = partOf(mounted.container, "content");
    const trigger = partOf(mounted.container, "trigger");

    expect(getComputedStyle(content).overflow).toBe("hidden");
    expect(getComputedStyle(content).display).toBe("none");

    trigger.click();
    await settle();

    expect(getComputedStyle(content).overflow).toBe("hidden");
    expect(getComputedStyle(content).display).toBe("block");
  });

  it("runs the preset's `expand-height` keyframes on the way open", async () => {
    // Read before the `raf` work: `computeSize` blanks `animationName` inline while it measures, so
    // the window this is true in is the same one `closes through a closing window` reads for
    // `collapse-height` — one microtask after the click.
    mounted = mount(() => <Basic />);
    const trigger = partOf(mounted.container, "trigger");
    const content = partOf(mounted.container, "content");

    trigger.click();
    await settle();

    expect(getComputedStyle(content).animationName).toContain("expand-height");
    expect(getComputedStyle(content).animationDuration).not.toBe("0s");
  });
});

/** A "read more" collapsible: closed it keeps a shrunken box, and its child is taller than that. */
function Preview(props: { collapsedHeight?: string; collapsedWidth?: string }) {
  return (
    <Collapsible.Root collapsedHeight={props.collapsedHeight} collapsedWidth={props.collapsedWidth}>
      <Collapsible.Trigger>Show more</Collapsible.Trigger>
      <Collapsible.Content>
        <a href="#more" data-probe="link">
          a tabbable child
        </a>
        <div style={{ height: "200px", width: "300px" }}>tall and wide</div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

describe("Collapsible — `collapsedHeight` keeps the box the `hidden` attribute would have taken", () => {
  it("leaves the closed content mounted, visible and shrunk by inline declarations", () => {
    // The one place on this row where a CSS custom property is load-bearing. `hidden` is
    // `!visible && !hasCollapsedSize`, so a collapsed size **removes** the attribute — easy to
    // assert backwards, since every other closed content in this file is `hidden`.
    mounted = mount(() => <Preview collapsedHeight="100px" />);
    const content = partOf(mounted.container, "content");
    const style = getComputedStyle(content);

    expect(content.hidden).toBe(false);
    expect(style.display).toBe("block");
    expect(style.maxHeight).toBe("100px");
    expect(style.minHeight).toBe("100px");
    expect(content.dataset.hasCollapsedSize).toBe("");
  });

  it("writes the custom property the `expand-height` keyframes interpolate from", async () => {
    // `@keyframes expand-height { from { height: var(--collapsed-height, 0) } to { height:
    // var(--height) } }`. Both ends are custom properties the machine writes inline, so a missing
    // one falls back to `0` and the content animates from nothing — visually identical to a
    // collapsible with no partial height at all.
    mounted = mount(() => <Preview collapsedHeight="100px" />);
    const trigger = partOf(mounted.container, "trigger");
    const content = partOf(mounted.container, "content");

    expect(content.style.getPropertyValue("--collapsed-height")).toBe("100px");

    trigger.click();
    await settle();
    await settleFrames();

    expect(content.style.getPropertyValue("--height")).not.toBe("0px");
    expect(getComputedStyle(content).maxHeight).toBe("none");
  });

  it("does the same for `collapsedWidth`", () => {
    mounted = mount(() => <Preview collapsedWidth="80px" />);
    const content = partOf(mounted.container, "content");
    const style = getComputedStyle(content);

    expect(content.hidden).toBe(false);
    expect(content.style.getPropertyValue("--collapsed-width")).toBe("80px");
    expect(style.maxWidth).toBe("80px");
    expect(style.minWidth).toBe("80px");
  });

  it("makes the clipped content's tabbable children `inert` while it is closed", async () => {
    // Zag's `trackTabbableElements`, and it only exists because of the branch above: a content that
    // keeps its box also keeps its links reachable by Tab, pointing at text nobody can read. It is
    // the machine's behaviour, not ours — nothing here adds to it or improves it.
    mounted = mount(() => <Preview collapsedHeight="100px" />);
    const link = mounted.container.querySelector('[data-probe="link"]');
    if (!(link instanceof HTMLElement)) {
      throw new Error("expected the preview to render its tabbable child");
    }

    await vi.waitFor(() => expect(link.hasAttribute("inert")).toBe(true));

    partOf(mounted.container, "trigger").click();
    await settle();

    await vi.waitFor(() => expect(link.hasAttribute("inert")).toBe(false));
  });
});

function Strategy(props: { lazyMount?: boolean; unmountOnExit?: boolean }) {
  return (
    <Collapsible.Root lazyMount={props.lazyMount} unmountOnExit={props.unmountOnExit}>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Content>
        <span>body</span>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

/** Null, not `hidden` — the whole claim of a render strategy is that there is no element at all. */
const contentIn = (container: HTMLElement) => container.querySelector('[data-part="content"]');

describe("Collapsible — the render strategy decides whether the content exists", () => {
  it("keeps a `lazyMount` content out of the DOM until the first open, then leaves it there", async () => {
    // Two of the strategy's three states in one run: *never present*, then *present*. The second
    // click is what separates `lazyMount` from `unmountOnExit` — it stays mounted once it has been
    // open, which is the whole difference between the two props.
    mounted = mount(() => <Strategy lazyMount />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    expect(contentIn(container)).toBeNull();

    trigger.click();
    await settle();
    expect(contentIn(container)).not.toBeNull();

    trigger.click();
    await vi.waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    expect(contentIn(container)).not.toBeNull();
  });

  it("removes an `unmountOnExit` content when the exit animation ends, not when the close begins", async () => {
    // The third state, *present then not*, and the reason it is worth its own assertion: the node
    // has to survive the `closing` window or the content vanishes mid-animation. With no
    // `lazyMount`, it is also in the DOM before it has ever been open — the two props are
    // independent, and a strategy that conflated them would fail on the first line here.
    mounted = mount(() => <Strategy unmountOnExit />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    expect(contentIn(container)).not.toBeNull();

    trigger.click();
    await settle();
    trigger.click();
    await settle();

    const closing = contentIn(container);
    if (!(closing instanceof HTMLElement)) {
      throw new Error("expected the content to survive the `closing` window");
    }
    expect(closing.dataset.state).toBe("closed");

    await vi.waitFor(() => expect(contentIn(container)).toBeNull());
  });
});

describe("Collapsible — `as` and `render`, on all four parts", () => {
  // The React version supports both on every component *and every part*: its parts are
  // `chakra(ArkCollapsible.Trigger, …, { forwardAsChild: true })`, and its factory turns `as` on
  // such a part into `<ArkTrigger asChild><a>…</a></ArkTrigger>` — the machine's computed props
  // rendered onto the consumer's element. `renderElement`'s `<Dynamic component={as} {...props} />`
  // is that same thing, so `as` and `render` are one mechanism here with two spellings.

  const tagOf = (container: HTMLElement, part: string) =>
    container.querySelector(`[data-part="${part}"]`)?.tagName ?? "MISSING";

  it("renders the element `as` names, on every part", () => {
    mounted = mount(() => (
      <Collapsible.Root as="section">
        <Collapsible.Trigger as="a">Show</Collapsible.Trigger>
        <Collapsible.Indicator as="span">▾</Collapsible.Indicator>
        <Collapsible.Content as="p">body</Collapsible.Content>
      </Collapsible.Root>
    ));
    const { container } = mounted;

    expect(tagOf(container, "root")).toBe("SECTION");
    expect(tagOf(container, "trigger")).toBe("A");
    expect(tagOf(container, "indicator")).toBe("SPAN");
    expect(tagOf(container, "content")).toBe("P");
  });

  it("keeps the machine's own props on whatever element `as` chose", () => {
    // `as` re-homes the element, never the behaviour: the trigger the machine addresses is still
    // this one, and it still carries the IDREF and the state the content is matched against.
    mounted = mount(() => (
      <Collapsible.Root>
        <Collapsible.Trigger as="a">Show</Collapsible.Trigger>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));
    const trigger = partOf(mounted.container, "trigger");
    const content = partOf(mounted.container, "content");

    expect(trigger.tagName).toBe("A");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(trigger.dataset.state).toBe("closed");
  });

  it("falls back to its own element when a wrapper forwards `as={undefined}`", () => {
    // `??`, never `merge`: a wrapper spreading an unset `as` resolves by presence and would hand
    // every part `undefined`, which `<Dynamic>` renders as nothing at all (`CLAUDE.md`, *The third
    // hazard*).
    mounted = mount(() => (
      <Collapsible.Root as={undefined}>
        <Collapsible.Trigger as={undefined}>Show</Collapsible.Trigger>
        <Collapsible.Indicator as={undefined}>▾</Collapsible.Indicator>
        <Collapsible.Content as={undefined}>body</Collapsible.Content>
      </Collapsible.Root>
    ));
    const { container } = mounted;

    expect(tagOf(container, "root")).toBe("DIV");
    expect(tagOf(container, "trigger")).toBe("BUTTON");
    expect(tagOf(container, "indicator")).toBe("DIV");
    expect(tagOf(container, "content")).toBe("DIV");
  });

  it("lets `render` win when a part is given both", () => {
    // `renderElement` returns on `render` before it reads `as`, which is the library's rule
    // everywhere — the factory behaves the same. Stated by a test because the two props overlap
    // and nothing else says which one loses.
    mounted = mount(() => (
      <Collapsible.Root>
        <Collapsible.Trigger
          as="a"
          render={(props) => <span {...(props as JSX.HTMLAttributes<HTMLSpanElement>)} />}
        >
          Show
        </Collapsible.Trigger>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    expect(tagOf(mounted.container, "trigger")).toBe("SPAN");
  });
});

describe("Collapsible — accessibility", () => {
  it("is accessible closed and open, with no allowance of any kind", async () => {
    // Zero allowances is the expectation for this row, and it is a claim about what Collapsible
    // *is*: no modality stack, so no `@zag-js/aria-hidden`, so none of the `aria-hidden-focus`
    // findings a Dialog inherits. A violation appearing here would be ours.
    //
    // The indicator draws an **SVG** rather than `Basic`'s `▾`. That glyph is outside axe's basic
    // multilingual plane, and `color-contrast` answers `incomplete` on it — "element content
    // contains only non-text characters" — which says nothing about this component and everything
    // about the character the other tests picked to see a `data-state` on. A chevron is what a
    // consumer draws anyway.
    mounted = mount(() => (
      <Collapsible.Root>
        <Collapsible.Trigger>
          Show
          <Collapsible.Indicator>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Collapsible.Indicator>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <p>Everything the trigger reveals.</p>
        </Collapsible.Content>
      </Collapsible.Root>
    ));

    await expectNoA11yViolations(mounted.container);

    partOf(mounted.container, "trigger").click();
    await settle();

    await expectNoA11yViolations(mounted.container);
  });
});

describe("Collapsible — server render, then hydrate", () => {
  it("reuses every server node across all three roots", () => {
    // The half neither other project can see. The three roots start in three different states —
    // closed, open, and lazily unmounted — so the state each machine reached on the server decides
    // the hydration key of everything after it. If the two sides disagree, `hydrate()` either claims
    // a server node under a different client tree or gives up and client-renders, and **both are
    // silent**: the markup and the styles still look right.
    const { container, dispose } = hydrateFixture(collapsibleServerHtml, () => <Tree />);

    const closed = container.querySelector('[data-probe="closed-content"]');
    const open = container.querySelector('[data-probe="open-content"]');
    if (!(closed instanceof HTMLElement) || !(open instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its content elements");
    }

    expect(closed.hidden).toBe(true);
    expect(open.hidden).toBe(false);
    expect(container.querySelector('[data-probe="lazy-content"]')).toBeNull();
    expect(container.querySelector('[data-probe="open-label"]')?.textContent).toBe("open");

    dispose();
  });

  it("hands the hydrated machine the same ids the server wrote", () => {
    const { container, dispose } = hydrateFixture(collapsibleServerHtml, () => <Tree />);

    const trigger = container.querySelector('[data-probe="closed-trigger"]');
    const content = container.querySelector('[data-probe="closed-content"]');
    if (!(trigger instanceof HTMLElement) || !(content instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its closed root");
    }

    // `createUniqueId()` is a different function in the server build and the hydrating client build,
    // and they only agree while both walk the same counter. An id that shifted would leave the
    // trigger pointing at nothing, and the machine unable to find its own content.
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(document.getElementById(content.id)).toBe(content);

    dispose();
  });

  it("runs the machine after hydration, on the server's own nodes", async () => {
    const { container, dispose } = hydrateFixture(collapsibleServerHtml, () => <Tree />);

    const trigger = container.querySelector('[data-probe="closed-trigger"]');
    const content = container.querySelector('[data-probe="closed-content"]');
    if (!(trigger instanceof HTMLElement) || !(content instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its closed root");
    }

    trigger.click();
    await settle();

    expect(content.dataset.state).toBe("open");
    expect(content.hidden).toBe(false);
    // The same object the server sent, still — the machine drove it rather than replacing it.
    expect(container.querySelector('[data-probe="closed-content"]')).toBe(content);

    dispose();
  });
});
