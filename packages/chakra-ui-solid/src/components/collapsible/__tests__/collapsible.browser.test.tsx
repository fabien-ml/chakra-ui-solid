import collapsibleServerHtml from "virtual:hydration-fixture?id=collapsible";
import { hydrateFixture, type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Collapsible } from "../index";
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
