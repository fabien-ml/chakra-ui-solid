import portalServerHtml from "virtual:hydration-fixture?id=portal";
import { hydrateFixture, type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "../../dialog";
import { Popover } from "../../popover";
import { Portal } from "../index";
import { Tree } from "./portal.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The children are held back one effect flush, so nothing a portal renders exists in the same turn
 * as the `mount()` that created it.
 */
const settle = async () => {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  await new Promise<void>((resolve) => queueMicrotask(resolve));
};

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const probe = (name: string) => document.querySelector(`[data-probe="${name}"]`);

const follows = (first: Element | null, second: Element | null) =>
  !!(first && second && first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

const buttonWithText = (root: ParentNode, text: string) =>
  [...root.querySelectorAll("button")].find((button) => button.textContent?.trim() === text);

describe("Portal", () => {
  it("renders its children at the end of `document.body`", async () => {
    mounted = mount(() => (
      <Portal>
        <div data-probe="content">portalled</div>
      </Portal>
    ));
    await settle();

    expect(probe("content")?.parentElement).toBe(document.body);
    expect(mounted.container.querySelector('[data-probe="content"]')).toBeNull();
  });

  it("renders into `container` instead, and follows it when it changes", async () => {
    const [container, setContainer] = createSignal<HTMLElement | null>(null);
    const first = document.createElement("div");
    const second = document.createElement("div");
    document.body.append(first, second);

    mounted = mount(() => (
      <Portal container={container}>
        <div data-probe="content">portalled</div>
      </Portal>
    ));
    await settle();
    expect(probe("content")?.parentElement).toBe(document.body);

    setContainer(first);
    await settle();
    expect(probe("content")?.parentElement).toBe(first);

    setContainer(second);
    await settle();
    expect(probe("content")?.parentElement).toBe(second);

    first.remove();
    second.remove();
  });

  it("builds its children exactly once on the path every consumer takes", async () => {
    // `props.children` is written twice in this component — once per arm of the `disabled` Show —
    // and a JSX slot is a **getter**, so a read is a `createComponent` call rather than a lookup.
    // Two reads in one render would build the subtree twice and discard one, and the DOM afterwards
    // is identical either way. This is the default path: no `disabled` prop, no toggling, which is
    // how all 42 examples and every overlay in the library use it.
    let built = 0;
    const Counted = () => {
      built += 1;
      return <div data-probe="content">portalled</div>;
    };

    mounted = mount(() => (
      <Portal>
        <Counted />
      </Portal>
    ));
    await settle();
    await frame();

    expect(probe("content")?.parentElement).toBe(document.body);
    expect(built).toBe(1);
  });

  it("renders in place while `disabled`, and builds the subtree exactly once per arm", async () => {
    // The arm-swap is a real rebuild, so what is asserted is that it happens *once* per swap: a
    // `props.children` read by a gate as well as a body would build the subtree twice on the way in
    // and throw one away, which nothing in the DOM afterwards would show.
    let built = 0;
    const Counted = () => {
      built += 1;
      return <div data-probe="content">portalled</div>;
    };
    const [disabled, setDisabled] = createSignal(true);

    mounted = mount(() => (
      <Portal disabled={disabled()}>
        <Counted />
      </Portal>
    ));
    await settle();

    expect(mounted.container.querySelector('[data-probe="content"]')).not.toBeNull();
    expect(built).toBe(1);

    setDisabled(false);
    await settle();

    expect(probe("content")?.parentElement).toBe(document.body);
    expect(built).toBe(2);

    setDisabled(true);
    await settle();

    expect(mounted.container.querySelector('[data-probe="content"]')).not.toBeNull();
    expect(built).toBe(3);
  });

  it("puts a nested portal's content **after** the portal that contains it", async () => {
    // The whole reason this component exists rather than a re-export of `@solidjs/web`'s. That one
    // reserves its slot in `document.body` in an effect but builds its children before it, so a
    // nested portal finishes — and therefore reserves — first, landing its content *above* the
    // portal it was written inside. React's `createPortal` appends at commit, so upstream orders the
    // other way round, and Chakra's z-index scheme is built on upstream's order.
    mounted = mount(() => (
      <Portal>
        <div data-probe="outer">
          <Portal>
            <div data-probe="inner" />
          </Portal>
        </div>
      </Portal>
    ));
    await settle();
    await frame();

    expect(probe("outer")).not.toBeNull();
    expect(probe("inner")).not.toBeNull();
    expect(follows(probe("outer"), probe("inner"))).toBe(true);
  });

  it("lets a dialog opened from a popover put its backdrop over the popover", async () => {
    // What the ordering rule buys, measured the way a reader sees it. `dialog.backdrop` is
    // `calc(var(--dialog-z-index) + var(--layer-index, 0) - 1)`, so a dialog one layer deep carries
    // **1500** — the same number the popover's content carries at layer 0. The two never separate by
    // z-index, so whichever comes later in `document.body` paints on top.
    mounted = mount(() => (
      <Popover.Root>
        <Popover.Trigger>Open Popover</Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Body>
                <Dialog.Root>
                  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content>
                        <Dialog.Title>Dialog from Popover</Dialog.Title>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    ));
    await settle();
    await frame();

    buttonWithText(mounted.container, "Open Popover")?.click();
    await settle();
    await frame();

    const positioner = document.querySelector<HTMLElement>(
      '[data-scope="popover"][data-part="positioner"]',
    );
    const content = document.querySelector<HTMLElement>(
      '[data-scope="popover"][data-part="content"]',
    );
    // Popper writes `--x` inside a `raf`, and the positioner's own `z-index` is the `--z-index` it
    // copies off the content in the same pass — so this waits on the number under test.
    await vi.waitFor(() => expect(positioner?.style.getPropertyValue("--x")).not.toBe(""));

    buttonWithText(content as ParentNode, "Open Dialog")?.click();
    await settle();
    await frame();

    const backdrop = document.querySelector<HTMLElement>(
      '[data-scope="dialog"][data-part="backdrop"]',
    );
    await vi.waitFor(() => expect(backdrop?.style.getPropertyValue("--layer-index")).toBe("1"));

    // The tie itself, pinned: neither number moves, and only the order decides.
    expect(getComputedStyle(positioner as Element).zIndex).toBe("1500");
    expect(getComputedStyle(backdrop as Element).zIndex).toBe("1500");
    expect(follows(positioner, backdrop)).toBe(true);
  });
});

describe("Portal — server render, then hydrate", () => {
  it("emits nothing on the server and still reuses the siblings around it", async () => {
    // The server leaves no markup for the portal at all, so the two `span`s are adjacent in the
    // served HTML and separated by a whole subtree on the client. If the portal spent a hydration
    // key the server never wrote, `after` is claimed under the wrong node or re-rendered fresh —
    // and both look right in the DOM afterwards, which is why this is asserted on node identity.
    expect(portalServerHtml).not.toMatch(/data-probe="outer"/);

    const { container, dispose } = hydrateFixture(portalServerHtml, () => <Tree />);
    const before = container.querySelector('[data-probe="before"]');
    const after = container.querySelector('[data-probe="after"]');

    await settle();

    expect(container.querySelector('[data-probe="before"]')).toBe(before);
    expect(container.querySelector('[data-probe="after"]')).toBe(after);
    expect(after?.textContent).toBe("after");

    dispose();
  });

  it("builds the portalled tree after hydration, nested portal included and in order", async () => {
    // The half the deferred build puts at risk: the children arrive a flush after `hydrate()` has
    // returned, so this is where "held back one flush" either survives the round trip or turns into
    // content that never mounts.
    const { dispose } = hydrateFixture(portalServerHtml, () => <Tree />);

    await settle();
    await frame();

    expect(probe("outer")).not.toBeNull();
    expect(probe("inner")).not.toBeNull();
    expect(follows(probe("outer"), probe("inner"))).toBe(true);

    dispose();
  });
});
