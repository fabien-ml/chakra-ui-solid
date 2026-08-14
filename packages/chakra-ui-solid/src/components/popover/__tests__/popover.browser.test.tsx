import popoverServerHtml from "virtual:hydration-fixture?id=popover";
import { normalizeProps, useMachine } from "@chakra-ui-solid/core";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import * as zagPopover from "@zag-js/popover";
import { createSignal, untrack } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPopover, Popover } from "../index";
import { Tree } from "./popover.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a Popover runs two machines that send to each
 * other: the popover's own state change is what the content presence watches, and the presence's
 * answer is what decides whether the element exists. So `settle` is two turns, and anything that
 * waits on a `raf` uses `vi.waitFor`.
 */
const settle = async () => {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  await new Promise<void>((resolve) => queueMicrotask(resolve));
};

/**
 * One frame, for the machine's `raf`-deferred work: `trackDismissableElement` and `getPlacement`
 * both run with `defer: true`, so neither the Escape listener nor popper's first write happens in
 * the same turn as the transition that opened the popover.
 */
const settleFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Popper has written at least once. It is an observable fact rather than a frame count: inside its
 * deferred frame `updatePosition()` awaits `computePosition` before setting `--x`, so "two rafs" is
 * a guess and this is not.
 */
const placed = (positioner: HTMLElement) =>
  vi.waitFor(() => expect(positioner.style.getPropertyValue("--x")).not.toBe(""));

function partOf(container: ParentNode, part: string): HTMLElement {
  const element = container.querySelector(`[data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

const partIn = (container: ParentNode, part: string) =>
  container.querySelector(`[data-part="${part}"]`);

/** For the trees where `[data-part]` is ambiguous — two nested popovers both have a `content`. */
function probeIn(container: ParentNode, probe: string): HTMLElement {
  const element = container.querySelector(`[data-probe="${probe}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-probe="${probe}"] element`);
  }
  return element;
}

function Basic(props: {
  defaultOpen?: boolean;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  modal?: boolean;
  onOpenChange?: () => void;
  open?: boolean;
  initialFocusEl?: () => HTMLElement | null;
  autoFocus?: boolean;
}) {
  return (
    <Popover.Root
      defaultOpen={props.defaultOpen}
      lazyMount={props.lazyMount}
      unmountOnExit={props.unmountOnExit}
      modal={props.modal}
      onOpenChange={props.onOpenChange}
      open={props.open}
      initialFocusEl={props.initialFocusEl}
      autoFocus={props.autoFocus}
    >
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Arrow />
          <Popover.Header>
            <Popover.Title>Delete file</Popover.Title>
          </Popover.Header>
          <Popover.Body>
            <Popover.Description>This cannot be undone.</Popover.Description>
            <button type="button" data-probe="inner-focusable">
              Confirm
            </button>
          </Popover.Body>
          <Popover.Footer>
            <Popover.CloseTrigger>Close</Popover.CloseTrigger>
          </Popover.Footer>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

describe("Popover — a real popover machine through the adapter", () => {
  it("opens on a trigger click, and every part of the popover follows", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");
    const content = partOf(container, "content");

    // Mounted from the first render, unlike Dialog's: Popover's render strategy defaults to
    // `false`/`false`, so the closed content is real markup carrying `hidden`.
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(content.hidden).toBe(true);

    trigger.click();
    await settle();

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.dataset.state).toBe("open");
    expect(content.hidden).toBe(false);
    expect(content.getAttribute("role")).toBe("dialog");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    // Non-modal by default, where a Dialog is `aria-modal="true"` — the machine only emits it when
    // `modal` is set, and every effect that blocks the page behind the surface gates on the same
    // prop.
    expect(content.hasAttribute("aria-modal")).toBe(false);
  });

  it("labels the popover from the title and description it finds in the DOM", async () => {
    // Neither part registers anything. `renderedElements` starts `{ title: true, description: true }`
    // and the machine's entry action re-reads the DOM one `raf` later, so the IDREFs are emitted
    // optimistically and confirmed a frame after mount — the assertion is that the ids the two
    // `connect()` getters produce name the elements the other two really rendered.
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partOf(container, "trigger").click();
    await settle();
    await settleFrame();

    const content = partOf(container, "content");
    const title = partOf(container, "title");
    const description = partOf(container, "description");

    expect(content.getAttribute("aria-labelledby")).toBe(title.id);
    expect(content.getAttribute("aria-describedby")).toBe(description.id);
    expect(document.getElementById(title.id)).toBe(title);
    expect(document.getElementById(description.id)).toBe(description);
  });

  it("moves focus into the content on open, which is the machine's own `setInitialFocus`", async () => {
    // A non-modal popover has no focus trap — `trapFocus` returns early unless `modal` — so what
    // moves focus is the transition action, in a `raf`, to the first focusable thing in the content.
    // It runs on the *transition*, so a `defaultOpen` popover never does it.
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partOf(container, "trigger").click();
    await settle();

    const content = partOf(container, "content");
    await vi.waitFor(() => expect(content.contains(document.activeElement)).toBe(true));
    expect(document.activeElement).toBe(probeIn(container, "inner-focusable"));
  });

  it("sends focus where `initialFocusEl` points instead", async () => {
    mounted = mount(() => (
      <div>
        <button type="button" data-probe="elsewhere">
          Elsewhere
        </button>
        <Basic
          initialFocusEl={() =>
            mounted?.container.querySelector<HTMLElement>('[data-probe="elsewhere"]') ?? null
          }
        />
      </div>
    ));
    const { container } = mounted;

    partOf(container, "trigger").click();
    await settle();

    await vi.waitFor(() => expect(document.activeElement).toBe(probeIn(container, "elsewhere")));
  });

  it("leaves focus alone under `autoFocus={false}`", async () => {
    mounted = mount(() => <Basic autoFocus={false} />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    trigger.focus();
    trigger.click();
    await settle();
    await settleFrame();
    await settleFrame();

    expect(document.activeElement).toBe(trigger);
  });

  it("closes the popover from the close trigger", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    trigger.click();
    await settle();

    partOf(container, "close-trigger").click();

    await vi.waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("closes the popover on Escape, which is the machine's dismissable layer", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    trigger.click();
    await settle();
    await settleFrame();

    partOf(container, "content").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );

    await vi.waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("closes the popover on a pointer press outside it", async () => {
    mounted = mount(() => (
      <div>
        {/* Away from the popover *and* away from both viewport edges: the layer treats a press
            within a scrollable ancestor's scrollbar gutter as inside, and the headless browser runs
            with the classic gutter restored. */}
        <button
          type="button"
          data-probe="outside"
          style={{ position: "fixed", left: "200px", top: "500px" }}
        >
          Outside
        </button>
        <Basic />
      </div>
    ));
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    trigger.click();
    await settle();

    const outside = probeIn(container, "outside");

    // The press is retried rather than counted out. `trackInteractOutside` installs its `pointerdown`
    // listener a `setTimeout(0)` after `trackDismissableElement`'s own deferred frame, which is
    // itself behind the Solid effect that starts the machine's open-state effects — three deferrals
    // with nothing observable marking the end of them, and one frame is measurably too few.
    await vi.waitFor(() => {
      // Real coordinates, because the layer rejects a press whose point falls inside the content's
      // rect regardless of its target — and a synthetic event defaults to (0, 0), which is inside
      // plenty of popovers.
      const rect = outside.getBoundingClientRect();
      outside.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        }),
      );
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("reports a controlled open state upward rather than changing it itself", async () => {
    const onOpenChange = vi.fn();

    mounted = mount(() => <Basic open={false} onOpenChange={onOpenChange} />);
    const trigger = partOf(mounted.container, "trigger");

    trigger.click();
    await settle();

    expect(onOpenChange).toHaveBeenCalledWith({ open: true });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders the Arrow's default tip, and lets a consumer's child replace it", async () => {
    // The JSX-valued slot default, resolved *inside* the `children()` call. Built eagerly in a
    // defaults object it would construct a tip for every Arrow including the ones that already have
    // a child; hoisted to module scope it would run at import time.
    mounted = mount(() => <Basic defaultOpen />);
    expect(partIn(mounted.container, "arrow-tip")).not.toBeNull();

    mounted.dispose();
    mounted = mount(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow>
              <span data-probe="custom-tip">▲</span>
            </Popover.Arrow>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));

    expect(probeIn(mounted.container, "custom-tip").textContent).toBe("▲");
    expect(partIn(mounted.container, "arrow-tip")).toBeNull();
  });

  it("draws no tip for a `null` child on the Arrow", async () => {
    // `{cond() ? <Tip/> : null}` is ordinary Solid, and Chakra's `mergeProps` yields a default only
    // to `undefined` — so a `null` child renders a bare arrow upstream. `??` would put the tip back
    // and quietly overrule what the consumer wrote.
    mounted = mount(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow>{null}</Popover.Arrow>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));

    expect(partIn(mounted.container, "arrow")).not.toBeNull();
    expect(partIn(mounted.container, "arrow-tip")).toBeNull();
  });

  it("closes only the inner popover when Escape is pressed inside a nested pair", async () => {
    // The layer stack's own rule — `onEscapeKeyDown` returns early unless the layer is topmost — and
    // the reason a nested pair is worth building at all: two independent machines, one keyboard.
    mounted = mount(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger data-probe="outer-trigger">Outer</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content data-probe="outer-content">
            <Popover.Root defaultOpen>
              <Popover.Trigger data-probe="inner-trigger">Inner</Popover.Trigger>
              <Popover.Positioner>
                <Popover.Content data-probe="inner-content">nested</Popover.Content>
              </Popover.Positioner>
            </Popover.Root>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));
    const { container } = mounted;

    await settle();
    await settleFrame();
    const innerContent = probeIn(container, "inner-content");
    await vi.waitFor(() => expect(innerContent.style.getPropertyValue("--layer-index")).toBe("1"));

    innerContent.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    await vi.waitFor(() =>
      expect(probeIn(container, "inner-trigger").getAttribute("aria-expanded")).toBe("false"),
    );
    expect(probeIn(container, "outer-trigger").getAttribute("aria-expanded")).toBe("true");
  });

  it("exposes every member `connect` returns, and nothing of its own", () => {
    // The drift a hand-written member list cannot catch. `createPopover` adds nothing, because a
    // Popover's render strategy is a fact about the Root — Content and Positioner share one
    // presence — rather than about the machine.
    let storeKeys: string[] = [];
    let connectedKeys: string[] = [];

    mounted = mount(() => {
      storeKeys = Object.keys(createPopover());

      const service = useMachine(zagPopover.machine, () => ({ id: "key-set-probe" }));
      connectedKeys = untrack(() => Object.keys(zagPopover.connect(service, normalizeProps)));

      return null;
    });

    expect([...storeKeys].sort()).toEqual([...connectedKeys].sort());
  });
});

describe("Popover — the trigger's `aria-controls`, both ways", () => {
  it("keeps the IDREF under the defaults and drops it only while the content is unmounted", async () => {
    // Both directions, because the positive case is the one Ark's Solid popover gets wrong: it
    // writes the gate as `presenceApi().unmounted && null`, which evaluates to `false` while the
    // content is mounted and ships `aria-controls="false"` — an IDREF resolving to nothing. The
    // React shape is what is ported, so the assertion is not merely "an attribute is present".
    mounted = mount(() => <Basic />);
    const eager = partOf(mounted.container, "trigger");
    const content = partOf(mounted.container, "content");

    expect(eager.getAttribute("aria-controls")).toBe(content.id);
    expect(eager.getAttribute("aria-controls")).not.toBe("false");
    expect(document.getElementById(content.id)).toBe(content);

    mounted.dispose();
    mounted = mount(() => <Basic lazyMount />);
    const lazy = partOf(mounted.container, "trigger");

    expect(lazy.hasAttribute("aria-controls")).toBe(false);

    lazy.click();
    await settle();

    expect(lazy.getAttribute("aria-controls")).toBe(partOf(mounted.container, "content").id);
  });
});

/**
 * The machine emits `aria-labelledby` and `aria-describedby` **optimistically** — `renderedElements`
 * starts `{ title: true, description: true }` — and corrects itself a frame later by sniffing the
 * DOM. It writes that correction with `Object.assign(context.get("renderedElements"), …)`, an
 * in-place mutation that notifies no signal, so nothing re-reads it and the wrong answer sticks.
 *
 * `createPopover` forces one re-read a frame in for exactly this. Without it a `defaultOpen` popover
 * with no Description keeps a dangling IDREF for its entire open window (measured), where the React
 * version ships none — six popovers on chakra-ui.com's docs, no Description among them, every
 * `aria-describedby` absent.
 */
describe("Popover — the labelling IDREFs the machine sniffs for after mount", () => {
  it("drops `aria-describedby` when the tree has no Description", async () => {
    mounted = mount(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>Delete file</Popover.Title>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));
    const content = partOf(mounted.container, "content");

    await vi.waitFor(() => expect(content.hasAttribute("aria-describedby")).toBe(false));
    // The half that must survive the correction: the Title is really there, so its IDREF stays.
    expect(content.getAttribute("aria-labelledby")).toBe(partOf(mounted.container, "title").id);
  });

  it("drops `aria-labelledby` when the tree has no Title", async () => {
    mounted = mount(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Description>This cannot be undone.</Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));
    const content = partOf(mounted.container, "content");

    await vi.waitFor(() => expect(content.hasAttribute("aria-labelledby")).toBe(false));
    expect(content.getAttribute("aria-describedby")).toBe(
      partOf(mounted.container, "description").id,
    );
  });

  it("keeps both when both are there, each resolving to its real element", async () => {
    // The control, and the thing the nudge must not break: a forced re-read that dropped a *live*
    // IDREF would leave the surface unlabelled, which is worse than the dangle it fixes.
    mounted = mount(() => <Basic defaultOpen />);
    const { container } = mounted;
    const content = partOf(container, "content");
    const title = partOf(container, "title");
    const description = partOf(container, "description");

    await settleFrame();
    await settleFrame();

    expect(content.getAttribute("aria-labelledby")).toBe(title.id);
    expect(content.getAttribute("aria-describedby")).toBe(description.id);
    expect(document.getElementById(title.id)).toBe(title);
    expect(document.getElementById(description.id)).toBe(description);
  });
});

describe("Popover — the render strategy decides whether a popover's parts exist", () => {
  it("leaves a closed content mounted and hidden, which is what writing nothing gets you", async () => {
    // Chakra's `PopoverRoot` is `withRootProvider(ArkPopover.Root)` with **no options object**, so
    // nothing overrides `createRenderStrategy`'s own `false`/`false`. That inverts Dialog: the
    // element is in the DOM before the first open and stays there after the last close.
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    const content = partOf(container, "content");
    expect(content.hidden).toBe(true);
    expect(content.dataset.state).toBe("closed");
    // The slot really does declare `display: flex`, and Panda's preflight `[hidden] { display: none
    // !important }` is what beats it — asserting the computed value is what stops this passing on an
    // element the stylesheet never reached.
    expect(getComputedStyle(content).display).toBe("none");

    trigger.click();
    await settle();

    expect(getComputedStyle(content).display).toBe("flex");
    expect(getComputedStyle(content).flexDirection).toBe("column");

    trigger.click();
    await vi.waitFor(() => expect(partOf(container, "content").hidden).toBe(true));
    expect(partIn(container, "content")).not.toBeNull();
  });

  it("round-trips the opt-in: out of the DOM, in, then out again", async () => {
    mounted = mount(() => <Basic lazyMount unmountOnExit />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    expect(partIn(container, "content")).toBeNull();

    trigger.click();
    await settle();
    expect(partIn(container, "content")).not.toBeNull();

    trigger.click();
    await vi.waitFor(() => expect(partIn(container, "content")).toBeNull());
  });

  it("keeps both defaults when a wrapper forwards them as `undefined`", () => {
    // `withContextDefaults` resolves by value and the Root applies no literal default after it, so
    // an unset forward has to land on `createRenderStrategy`'s own `false` rather than on
    // `undefined`-as-a-value (`CLAUDE.md`, *The third hazard*). `Basic` forwards both props on every
    // other test in this file, which is the path all of them ride on.
    mounted = mount(() => (
      <Popover.Root lazyMount={undefined} unmountOnExit={undefined}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>body</Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));

    expect(partIn(mounted.container, "content")).not.toBeNull();
    expect(partOf(mounted.container, "content").hidden).toBe(true);
  });

  it("lets a `PropsProvider` supply the strategy, and a Root override it", () => {
    mounted = mount(() => (
      <Popover.PropsProvider value={{ lazyMount: true }}>
        <div data-probe="from-provider">
          <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content>provider</Popover.Content>
          </Popover.Root>
        </div>
        <div data-probe="from-root">
          <Popover.Root lazyMount={false}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content>root</Popover.Content>
          </Popover.Root>
        </div>
      </Popover.PropsProvider>
    ));
    const { container } = mounted;

    expect(partIn(probeIn(container, "from-provider"), "content")).toBeNull();
    expect(partIn(probeIn(container, "from-root"), "content")).not.toBeNull();
  });
});

/**
 * **The measurement this row exists for, and its answer is 1500 / 1501.**
 *
 * `@zag-js/popper` writes eight CSS custom properties — `--x`, `--y`, `--z-index`,
 * `--transform-origin`, `--reference-width/height`, `--available-width/height` — **imperatively**
 * into the positioner's `style` attribute inside a `requestAnimationFrame`, while Solid binds the
 * machine's own `style` object to that same attribute reactively. Nine components in this library
 * inherit the arrangement, and nothing had ever measured it.
 *
 * **Measured free, exactly as the dismissable half was.** Solid diffs an object-form `style`
 * binding per property against what it last wrote, so a reactive rewrite removes only keys it owns
 * and popper's eight survive. A stacked pair reads back through the recipe as **1500 on the outer
 * content and 1501 on the inner**, and the positioner takes the same number by `var(--z-index)`.
 *
 * Two rules follow for every floating component after this one, and neither is enforced by a type:
 *
 * - **Only the object form of `style` may reach a positioner.** A string binding rewrites the whole
 *   attribute; popper's `zIndexComputed` flag and its approximate-equality guards then believe the
 *   properties are already written and never restore them. It is the one unrecoverable wipe.
 * - **Content must stay the positioner's `firstElementChild`.** `--z-index` is copied once per
 *   floating-element identity off `getComputedStyle(positioner.firstElementChild).zIndex`, which is
 *   where the recipe puts the number. A wrapper between the two silently unsets it, with no error.
 */
describe("Popover — the seam: popper's imperative writes under Solid's reactive style binding", () => {
  it("(a) lands the placement, and keeps content as the positioner's first element child", async () => {
    mounted = mount(() => <Basic defaultOpen />);
    const { container } = mounted;
    const positioner = partOf(container, "positioner");
    const content = partOf(container, "content");

    await placed(positioner);

    for (const property of ["--x", "--y", "--transform-origin", "--z-index"]) {
      expect(positioner.style.getPropertyValue(property), property).not.toBe("");
    }

    // The two halves of the seam meeting. The inline `transform` is the machine's reactive string —
    // its placed form, not the `translate3d(0, -100vh, 0)` the same getter emits while
    // `currentPlacement` is undefined — and the computed value is a matrix only because popper's
    // imperative `--x`/`--y` resolved it. An unresolvable `var()` computes to `none`.
    expect(positioner.style.transform).toBe("translate3d(var(--x), var(--y), 0)");
    expect(getComputedStyle(positioner).transform).toMatch(/^matrix/);

    // The recipe puts the number on `content` (`--popover-z-index` = the `popover` token) and popper
    // copies it up to the positioner. Both read 1500, from two different mechanisms.
    expect(getComputedStyle(content).zIndex).toBe("1500");
    expect(getComputedStyle(positioner).zIndex).toBe("1500");
    expect(positioner.style.getPropertyValue("--z-index")).toBe("1500");

    // Asserted explicitly, because it is the structural precondition of the line above and nothing
    // else can see it break: a future wrapper element here would leave `--z-index` copied off the
    // wrapper instead, and the popover would silently stop stacking.
    expect(positioner.firstElementChild).toBe(content);
  });

  it("(b) stacks a nested pair at 1500 and 1501, with the inner positioner reading 1501", async () => {
    // Only a nested pair can tell `--layer-index: 0` from the property being absent — one popover
    // reads the recipe's `var(--layer-index, 0)` fallback and is indistinguishable from an element
    // that never got it.
    mounted = mount(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger data-probe="outer-trigger">Outer</Popover.Trigger>
        <Popover.Positioner data-probe="outer-positioner">
          <Popover.Content data-probe="outer-content">
            <Popover.Root defaultOpen>
              <Popover.Trigger data-probe="inner-trigger">Inner</Popover.Trigger>
              <Popover.Positioner data-probe="inner-positioner">
                <Popover.Content data-probe="inner-content">nested</Popover.Content>
              </Popover.Positioner>
            </Popover.Root>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));
    const { container } = mounted;

    const outerPositioner = probeIn(container, "outer-positioner");
    const innerPositioner = probeIn(container, "inner-positioner");
    const outerContent = probeIn(container, "outer-content");
    const innerContent = probeIn(container, "inner-content");

    await settle();
    await placed(outerPositioner);
    await placed(innerPositioner);
    await vi.waitFor(() => expect(innerContent.style.getPropertyValue("--layer-index")).toBe("1"));

    // The recipe's `calc()` is live, so a `--layer-index` that arrives after popper's copy still
    // re-resolves the content's own number. These three do not race.
    expect(getComputedStyle(outerContent).zIndex).toBe("1500");
    expect(getComputedStyle(innerContent).zIndex).toBe("1501");
    expect(getComputedStyle(outerPositioner).zIndex).toBe("1500");

    // **The one order-dependent cell, pinned to what it actually does.** `--z-index` is a *copy*,
    // taken once per floating-element identity, so the inner positioner is frozen at whatever the
    // inner content computed at that instant. The two `defer: true` frames are queued
    // dismissable-first, and the copy sits behind `await computePosition` — which puts
    // `--layer-index: 1` on the content before popper reads it, every run. Were the order to
    // reverse, this cell would read 1500 while the content beneath it read 1501, and the inner
    // surface would still paint above the outer one (they are separate stacking contexts), so the
    // observable stack is the same either way.
    expect(innerPositioner.style.getPropertyValue("--z-index")).toBe("1501");
    expect(getComputedStyle(innerPositioner).zIndex).toBe("1501");
  });

  it("(c) survives an interleave of reactive rewrites without losing an imperative property", async () => {
    const [pad, setPad] = createSignal("0px");
    const [sameWidth, setSameWidth] = createSignal(false);
    let reposition: (() => void) | undefined;

    mounted = mount(() => (
      <Popover.Root defaultOpen positioning={{ sameWidth: sameWidth() }}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Context>
          {(popover) => {
            reposition = () => popover.reposition();
            return <span data-probe="context" />;
          }}
        </Popover.Context>
        <Popover.Positioner style={{ "padding-top": pad() }}>
          <Popover.Content>
            <Popover.Arrow />
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));
    const { container } = mounted;
    const positioner = partOf(container, "positioner");
    const arrow = partOf(container, "arrow");

    await placed(positioner);
    await vi.waitFor(() =>
      expect(positioner.style.getPropertyValue("--transform-origin")).not.toBe(""),
    );

    const imperative = () => ({
      "--x": positioner.style.getPropertyValue("--x"),
      "--y": positioner.style.getPropertyValue("--y"),
      "--z-index": positioner.style.getPropertyValue("--z-index"),
      "--transform-origin": positioner.style.getPropertyValue("--transform-origin"),
    });
    const arrowOffsets = () => ({
      top: arrow.style.top,
      right: arrow.style.right,
      bottom: arrow.style.bottom,
      left: arrow.style.left,
    });

    const baseline = imperative();
    const arrowBaseline = arrowOffsets();
    // Not vacuous: an all-empty snapshot would compare equal to itself forever.
    expect(Object.values(arrowBaseline).some((value) => value !== "")).toBe(true);

    // 1. A consumer-driven rewrite of the same attribute. This is the direct measurement of
    //    per-property diffing on this seam — Solid touches `padding-top` and nothing else.
    setPad("7px");
    await settle();

    expect(getComputedStyle(positioner).paddingTop).toBe("7px");
    expect(imperative()).toEqual(baseline);
    expect(arrowOffsets()).toEqual(arrowBaseline);

    // 2. A machine-driven rewrite: `getPlacementStyles` drops `minWidth` and adds `width` when
    //    `sameWidth` flips, so Solid *removes* a declaration from the attribute popper is also
    //    writing to. `--x`/`--y` are presence rather than equality — the box may legitimately move.
    expect(positioner.style.minWidth).toBe("max-content");
    setSameWidth(true);
    await settle();

    await vi.waitFor(() => expect(positioner.style.minWidth).toBe(""));
    expect(positioner.style.width).toBe("var(--reference-width)");
    expect(positioner.style.getPropertyValue("--z-index")).toBe("1500");
    expect(positioner.style.getPropertyValue("--transform-origin")).not.toBe("");
    expect(positioner.style.getPropertyValue("--x")).not.toBe("");
    expect(positioner.style.getPropertyValue("--y")).not.toBe("");
    expect(getComputedStyle(positioner).zIndex).toBe("1500");

    // 3. `autoUpdate` re-runs on a window resize (popper's `listeners` default is `true`). Its
    //    `isApproximatelyEqual` and `zIndexComputed` guards *believe* the properties are written, so
    //    if anything above had wiped them this update would not resurrect them. This is the
    //    assertion that catches a string-form `style` binding.
    window.dispatchEvent(new Event("resize"));
    await settleFrame();
    await settleFrame();

    for (const property of ["--x", "--y", "--transform-origin", "--z-index"]) {
      expect(positioner.style.getPropertyValue(property), property).not.toBe("");
    }
    expect(getComputedStyle(positioner).zIndex).toBe("1500");

    // 4. `reposition()` — the **only** path that re-reads the content's z-index. It sends
    //    `POSITIONING.SET`, whose action builds a whole new `getPlacement` closure with
    //    `zIndexComputed` back to `false`; a prop change like driver 2 does not, because this
    //    machine's `watch` tracks `open` alone and `trackPositioning` is an open-state effect that
    //    never restarts.
    //
    //    Proven by deletion rather than by inspection: the property is removed first, so the
    //    assertion cannot pass on a value that was simply never disturbed. This is also the escape
    //    hatch worth knowing about — the properties an ordinary update declines to resurrect, a
    //    `reposition()` does.
    positioner.style.removeProperty("--z-index");
    expect(getComputedStyle(positioner).zIndex).not.toBe("1500");

    reposition?.();
    await settle();

    await vi.waitFor(() => expect(positioner.style.getPropertyValue("--z-index")).toBe("1500"));
    expect(getComputedStyle(positioner).zIndex).toBe("1500");
    expect(positioner.style.getPropertyValue("--x")).not.toBe("");
    expect(positioner.style.getPropertyValue("--transform-origin")).not.toBe("");
    expect(positioner.firstElementChild).toBe(partOf(container, "content"));
  });
});

describe("Popover — the a11y baseline, in three states", () => {
  /**
   * A popover with no glyph-only control in it. Every part of `Basic` except the `✕`, which axe
   * declines to measure for contrast ("element content contains only non-text characters") and which
   * would otherwise buy an allowance that says nothing about the port.
   */
  function Labelled(props: { modal?: boolean }) {
    return (
      <Popover.Root modal={props.modal}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Header>
              <Popover.Title>Delete file</Popover.Title>
            </Popover.Header>
            <Popover.Body>
              <Popover.Description>This cannot be undone.</Popover.Description>
            </Popover.Body>
            <Popover.Footer>
              <Popover.CloseTrigger>Close</Popover.CloseTrigger>
            </Popover.Footer>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    );
  }

  /**
   * Mid-fade the surface sits at ~0.03 opacity and axe computes a real, failing `color-contrast`
   * ratio against it — a violation that comes and goes with the animation's progress. Waiting for
   * the enter animation to finish is what makes an open-state axe run deterministic.
   */
  async function openAndSettle(container: ParentNode): Promise<void> {
    partOf(container, "trigger").click();
    await settle();
    const content = partOf(container, "content");
    await vi.waitFor(() => expect(getComputedStyle(content).opacity).toBe("1"));
  }

  /**
   * The one allowance all three states buy, and it is bought by the *trigger* in every one of them.
   *
   * Zag emits `aria-haspopup="dialog"` and `aria-controls` on the same button, and axe's
   * `aria-valid-attr-value` has a `controlsWithinPopup` pre-check that declines to judge an
   * `aria-controls` on any element carrying a live `aria-haspopup` — "unable to determine if the
   * referenced ID exists on the page" — whatever the referenced element is actually doing. The IDREF
   * is verified directly instead, by the `aria-controls` block above.
   *
   * **Inherited, and not Popover's.** `@zag-js/dialog`'s trigger emits exactly the same pair and
   * scores exactly the same incomplete (measured); Dialog's own axe run never reaches it, because
   * the state it checks closed has no content mounted and therefore no `aria-controls`, and the
   * state it checks open is modal, where the trigger sits inside the `aria-hidden` blanket and the
   * rule skips it. Popover's defaults mount the content, and its blanket keeps the trigger out, so
   * both of Dialog's escape routes are closed here.
   */
  const TRIGGER_HASPOPUP_INCOMPLETE = ["aria-valid-attr-value"] as const;

  it("carries one inherited incomplete closed, where the content is mounted and the IDREF is live", async () => {
    // Not the trivially-clean state Dialog's closed case is. Popover serves the whole tree, so axe
    // sees a real `aria-controls` target and a `hidden` dialog sitting in the container.
    mounted = mount(() => <Labelled />);

    await expectNoA11yViolations(mounted.container, {
      allowIncomplete: TRIGGER_HASPOPUP_INCOMPLETE,
    });
  });

  it("carries the same one open and non-modal, and nothing else", async () => {
    mounted = mount(() => <Labelled />);

    await openAndSettle(mounted.container);
    await expectNoA11yViolations(mounted.container, {
      allowIncomplete: TRIGGER_HASPOPUP_INCOMPLETE,
    });
  });

  it("carries no `aria-hidden-focus` open and modal, because the blanket keeps the trigger", async () => {
    // The allowance Dialog pays and Popover does not, measured rather than predicted. Both call
    // `@zag-js/aria-hidden`'s `hideOthers`, which marks the page outside the kept elements
    // `aria-hidden` without taking it out of the tab order — but `dialog`'s `hideContentBelow` keeps
    // only the content, leaving its still-tabbable trigger inside the blanket, while `popover`'s
    // keeps `[contentEl, activeTriggerEl]`. So the rule axe could not decide there has no subject
    // here, and `aria-hidden-focus` is not in this call's allowance.
    mounted = mount(() => <Labelled modal />);

    await openAndSettle(mounted.container);
    expect(partOf(mounted.container, "content").getAttribute("aria-modal")).toBe("true");
    await expectNoA11yViolations(mounted.container, {
      allowIncomplete: TRIGGER_HASPOPUP_INCOMPLETE,
    });
  });
});

describe("Popover — server render, then hydrate a closed popover", () => {
  it("reuses every server node across all three roots", () => {
    // The half neither other project can see. The three roots contribute three different numbers of
    // hydration keys — a trigger only, a whole tree, and a whole tree that lives in a `<Portal>` —
    // so the strategy each machine resolved on the server decides the key of everything after it. If
    // the two sides disagree, `hydrate()` either claims a server node under a different client tree
    // or gives up and client-renders, and **both are silent**.
    const { container, dispose } = hydrateFixture(popoverServerHtml, () => <Tree />);

    const eager = container.querySelector('[data-probe="eager-content"]');
    if (!(eager instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its eager content");
    }

    expect(eager.hidden).toBe(true);
    expect(eager.dataset.state).toBe("closed");
    expect(container.querySelector('[data-probe="lazy-content"]')).toBeNull();
    expect(container.querySelector('[data-probe="eager-label"]')?.textContent).toBe("closed");

    dispose();
  });

  it("keeps the sibling after a `<Portal>` aligned on both builds", () => {
    // The Portal renders nothing on the server and consumes exactly one child id there; its client
    // counterpart consumes one too and mounts its content in `document.body`. If those two numbers
    // disagreed, every hydration key after the portal would shift — and this span, the first thing
    // after it, is what would hydrate against the wrong node.
    const { container, dispose } = hydrateFixture(popoverServerHtml, () => <Tree />);

    const after = container.querySelector('[data-probe="after-portal"]');
    expect(after?.textContent).toBe("after");
    expect(container.querySelector('[data-probe="portal-content"]')).toBeNull();
    expect(document.querySelector('[data-probe="portal-content"]')).not.toBeNull();

    dispose();
  });

  it("runs the machine and popper after hydration, on the server's own nodes", async () => {
    const { container, dispose } = hydrateFixture(popoverServerHtml, () => <Tree />);

    const trigger = container.querySelector('[data-probe="eager-trigger"]');
    const content = container.querySelector('[data-probe="eager-content"]');
    const positioner = container.querySelector('[data-probe="eager-positioner"]');
    if (
      !(trigger instanceof HTMLElement) ||
      !(content instanceof HTMLElement) ||
      !(positioner instanceof HTMLElement)
    ) {
      throw new Error("the hydrated tree is missing its eager root");
    }

    // `createUniqueId()` is a different function in the server build and the hydrating client build,
    // and they only agree while both walk the same counter. An id that shifted would leave the
    // trigger pointing at nothing, and the machine unable to find its own content.
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(document.getElementById(content.id)).toBe(content);

    // The served positioner is parked off-screen — the fallback `getPlacementStyles()` emits while
    // `currentPlacement` is undefined — and that is what popper has to replace on a node it did not
    // create.
    // `toContain`, because reading `style.transform` back goes through the CSSOM, which re-serializes
    // the served `translate3d(0, -100vh, 0)` as `translate3d(0px, -100vh, 0px)`.
    expect(positioner.style.transform).toContain("-100vh");

    trigger.click();
    await settle();
    await placed(positioner);

    expect(content.dataset.state).toBe("open");
    expect(content.hidden).toBe(false);
    expect(positioner.style.transform).toBe("translate3d(var(--x), var(--y), 0)");
    expect(getComputedStyle(positioner).zIndex).toBe("1500");
    // The same objects the server sent, still — the machine and popper drove them rather than
    // replacing them.
    expect(container.querySelector('[data-probe="eager-content"]')).toBe(content);
    expect(positioner.firstElementChild).toBe(content);

    dispose();
  });
});
