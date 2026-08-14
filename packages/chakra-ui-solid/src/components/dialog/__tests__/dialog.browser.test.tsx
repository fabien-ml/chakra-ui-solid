import dialogServerHtml from "virtual:hydration-fixture?id=dialog";
import { normalizeProps, useMachine } from "@chakra-ui-solid/core";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import * as zagDialog from "@zag-js/dialog";
import { createSignal, untrack } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDialog, Dialog } from "../index";
import { Tree } from "./dialog.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a Dialog runs three machines that send to each
 * other: the dialog's own state change is what the content presence watches, and the presence's
 * answer is what decides whether the element exists. So `settle` is two turns, and anything that
 * waits on a `raf` (the presence machine measures the exit animation in one) uses `vi.waitFor`.
 */
const settle = async () => {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  await new Promise<void>((resolve) => queueMicrotask(resolve));
};

/**
 * One frame, for the machine's `raf`-deferred work: `trackDismissableElement` registers the layer
 * with `defer: true`, so the Escape listener is not installed in the same turn as the transition
 * that opened the dialog.
 */
const settleFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function partOf(container: ParentNode, part: string): HTMLElement {
  const element = container.querySelector(`[data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

const partIn = (container: ParentNode, part: string) =>
  container.querySelector(`[data-part="${part}"]`);

/** For the trees where `[data-part]` is ambiguous — two nested dialogs both have a `content`. */
function probeIn(container: ParentNode, probe: string): HTMLElement {
  const element = container.querySelector(`[data-probe="${probe}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-probe="${probe}"] element`);
  }
  return element;
}

/** The action trigger has no `data-part` — it is not in the anatomy — so it is found by probe. */
function actionIn(container: ParentNode): HTMLButtonElement {
  const element = container.querySelector('[data-probe="action"]');
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error("expected the tree to render an action trigger");
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
  present?: boolean;
}) {
  return (
    <Dialog.Root
      defaultOpen={props.defaultOpen}
      lazyMount={props.lazyMount}
      unmountOnExit={props.unmountOnExit}
      modal={props.modal}
      onOpenChange={props.onOpenChange}
      open={props.open}
      present={props.present}
    >
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Delete file</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Dialog.Description>This cannot be undone.</Dialog.Description>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger data-probe="action">Cancel</Dialog.ActionTrigger>
          </Dialog.Footer>
          <Dialog.CloseTrigger>✕</Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

describe("Dialog — a real dialog machine through the adapter", () => {
  it("opens on a trigger click, and every part of the dialog follows", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(partIn(container, "content")).toBeNull();

    trigger.click();
    await settle();

    const content = partOf(container, "content");
    const backdrop = partOf(container, "backdrop");

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.dataset.state).toBe("open");
    expect(content.hidden).toBe(false);
    expect(backdrop.dataset.state).toBe("open");
    expect(backdrop.hidden).toBe(false);
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("aria-modal")).toBe("true");
  });

  it("labels the dialog from the title and description it finds in the DOM", async () => {
    // Neither part registers anything: the machine sniffs the DOM for `dialog:{id}:title` after the
    // dialog opens and points `aria-labelledby` at what it found. So this is the IDREF *and* the
    // element it names, produced by two `connect()` getters reading one scope.
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partOf(container, "trigger").click();
    await settle();

    const content = partOf(container, "content");

    expect(content.getAttribute("aria-labelledby")).toBe(partOf(container, "title").id);
    expect(content.getAttribute("aria-describedby")).toBe(partOf(container, "description").id);
  });

  it("moves focus into the dialog on open, which is the machine's own focus trap", async () => {
    // `@zag-js/focus-trap` arrives underneath `@zag-js/dialog` and the machine runs it in an effect
    // gated on `trapFocus`. Nothing here does it, and nothing here should.
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partOf(container, "trigger").click();
    await settle();

    const content = partOf(container, "content");
    await vi.waitFor(() => expect(content.contains(document.activeElement)).toBe(true));
  });

  it("closes the dialog from the close trigger", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    trigger.click();
    await settle();

    partOf(container, "close-trigger").click();

    await vi.waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("closes the dialog on Escape, which is the machine's dismissable layer", async () => {
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

  it("starts open on `defaultOpen`, with both gated parts already in the DOM", async () => {
    // The one state a page never serves — a dialog is opened by a client event — so it is covered
    // here rather than in the SSR round trip. Both presences see `present` true on their very first
    // run, which is what the render strategy's "never present" branch must not mistake for lazy.
    mounted = mount(() => <Basic defaultOpen />);
    const { container } = mounted;

    expect(partOf(container, "content").hidden).toBe(false);
    expect(partOf(container, "backdrop").hidden).toBe(false);
    expect(partOf(container, "trigger").getAttribute("aria-expanded")).toBe("true");
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

  it("exposes every member `connect` returns, and nothing of its own", () => {
    // The drift a hand-written member list cannot catch — and here it also states the difference
    // from Collapsible: `createCollapsible` adds `unmounted`, `createDialog` adds nothing, because a
    // Dialog's render strategy is a fact about a part (Content and Backdrop each have their own)
    // rather than about the machine.
    let storeKeys: string[] = [];
    let connectedKeys: string[] = [];

    mounted = mount(() => {
      storeKeys = Object.keys(createDialog());

      const service = useMachine(zagDialog.machine, () => ({ id: "key-set-probe" }));
      connectedKeys = untrack(() => Object.keys(zagDialog.connect(service, normalizeProps)));

      return null;
    });

    expect([...storeKeys].sort()).toEqual([...connectedKeys].sort());
  });
});

describe("Dialog — the two presences that gate one dialog", () => {
  it("gives the backdrop a presence of its own, driven by the same machine", async () => {
    // Ark's split, ported: the backdrop mounts independently of the content and animates on its own
    // curve, so it builds its own presence from the Root's render strategy rather than sharing the
    // Root's instance. Both still answer to one `open`.
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    expect(partIn(container, "backdrop")).toBeNull();
    expect(partIn(container, "content")).toBeNull();

    partOf(container, "trigger").click();
    await settle();

    expect(partOf(container, "backdrop").dataset.state).toBe("open");
    expect(partOf(container, "content").dataset.state).toBe("open");
  });

  it("gates the positioner on the content's presence, and gives it no presence props", async () => {
    // The positioner is the one gated part with no `hidden` and no `data-state`: the machine emits
    // neither for it, and it attaches no presence ref. What it does carry is the machine's inline
    // `pointer-events`, forwarded untouched.
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partOf(container, "trigger").click();
    await settle();

    const positioner = partOf(container, "positioner");

    expect(positioner.hidden).toBe(false);
    expect(positioner.dataset.state).toBeUndefined();
    expect(positioner.contains(partOf(container, "content"))).toBe(true);
  });

  it("lets `present` override the content's presence, and not the backdrop's", () => {
    // Ark's asymmetry, reproduced rather than corrected: `DialogRoot` merges `present` into the
    // content presence while `DialogBackdrop` hard-codes `dialog.open`. So an open dialog with
    // `present={false}` hides the surface and leaves the scrim — which is the observable shape of
    // the wart we chose not to fix, and the thing a consumer will otherwise report as a bug.
    mounted = mount(() => <Basic defaultOpen lazyMount={false} present={false} />);
    const { container } = mounted;

    expect(partOf(container, "content").hidden).toBe(true);
    expect(partOf(container, "backdrop").hidden).toBe(false);
  });

  it("falls back to the machine's `open` when a wrapper forwards `present={undefined}`", () => {
    // `??`, never `merge`: resolved by presence, an unset forward would win and hide a dialog the
    // machine says is open (`CLAUDE.md`, *The third hazard*). `Basic` forwards `present` on every
    // other test in this file, so this is the path all of them already ride on.
    mounted = mount(() => <Basic defaultOpen present={undefined} />);

    expect(partOf(mounted.container, "content").hidden).toBe(false);
  });

  it("drops the trigger's `aria-controls` only while the content is unmounted", async () => {
    // Presence-gated, not open-gated. With `lazyMount={false}` the content is in the DOM from the
    // start — closed and hidden — so the IDREF resolves to a real element and stays there.
    mounted = mount(() => <Basic lazyMount={false} />);
    const eager = partOf(mounted.container, "trigger");

    expect(eager.getAttribute("aria-controls")).toBe(partOf(mounted.container, "content").id);

    mounted.dispose();
    mounted = mount(() => <Basic />);
    const lazy = partOf(mounted.container, "trigger");

    expect(lazy.hasAttribute("aria-controls")).toBe(false);

    lazy.click();
    await settle();

    expect(lazy.getAttribute("aria-controls")).toBe(partOf(mounted.container, "content").id);
  });
});

describe("Dialog — the render strategy decides whether a dialog's parts exist", () => {
  it("keeps a lazily-mounted content out of the DOM until the first open, then leaves it there", async () => {
    // Two of the strategy's three states in one run: *never present*, then *present*. The close is
    // what separates `lazyMount` from `unmountOnExit` — with `unmountOnExit={false}` the element
    // stays once it has been open.
    mounted = mount(() => <Basic unmountOnExit={false} />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    expect(partIn(container, "content")).toBeNull();

    trigger.click();
    await settle();
    expect(partIn(container, "content")).not.toBeNull();

    trigger.click();
    await vi.waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));

    const closed = partOf(container, "content");
    expect(closed.hidden).toBe(true);
    expect(closed.dataset.state).toBe("closed");
  });

  it("keeps both defaults when a wrapper forwards them as `undefined`", async () => {
    // `withDefaults`, not `merge({ lazyMount: true }, props)`: `merge` resolves a key by presence, so
    // a wrapper spreading two unset props would win with `undefined` and turn Chakra's defaults into
    // Collapsible's — the content in the served markup and never removed (`CLAUDE.md`, *The third
    // hazard*). `Basic` forwards them exactly this way, which is what every other test here rides on.
    mounted = mount(() => (
      <Dialog.Root lazyMount={undefined} unmountOnExit={undefined}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>body</Dialog.Content>
      </Dialog.Root>
    ));
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    expect(partIn(container, "content")).toBeNull();

    trigger.click();
    await settle();
    expect(partIn(container, "content")).not.toBeNull();

    trigger.click();
    await vi.waitFor(() => expect(partIn(container, "content")).toBeNull());
  });

  it("takes both parts back out of the DOM on close, under Chakra's own defaults", async () => {
    // `lazyMount` and `unmountOnExit` are both `true` here where Collapsible defaults both to
    // `false`, so this is the shape a consumer gets by writing nothing: the third strategy state,
    // *present then not*, reached separately by each of the two presences.
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    trigger.click();
    await settle();
    expect(partIn(container, "content")).not.toBeNull();
    expect(partIn(container, "backdrop")).not.toBeNull();

    trigger.click();
    await vi.waitFor(() => {
      expect(partIn(container, "content")).toBeNull();
      expect(partIn(container, "backdrop")).toBeNull();
    });
  });
});

describe("Dialog — the action trigger, the one part with a handler of its own", () => {
  function WithAction(props: { type?: "button" | "submit"; onClick?: () => void }) {
    return (
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.ActionTrigger data-probe="action" type={props.type} onClick={props.onClick}>
            Cancel
          </Dialog.ActionTrigger>
        </Dialog.Content>
      </Dialog.Root>
    );
  }

  it("closes the dialog, after running the consumer's own handler", async () => {
    const onClick = vi.fn();
    mounted = mount(() => <WithAction onClick={onClick} />);
    const { container } = mounted;

    actionIn(container).click();
    await settle();

    expect(onClick).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(container.querySelector('[data-part="content"]')).toBeNull());
  });

  it("stays a `button` when a dialog's wrapper forwards `type={undefined}`", () => {
    // `withDefaults`, not a JSX attribute before the spread: `merge` resolves a key by presence, so
    // a wrapper spreading an unset `type` would win with `undefined` and this button would submit
    // whatever form it sits in (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => <WithAction type={undefined} />);

    expect(actionIn(mounted.container).type).toBe("button");
  });
});

describe("Dialog — the styles a dialog's slot recipe really generated", () => {
  // Computed styles, never class names: a Panda class whose CSS was never generated renders nothing
  // and raises no error, so `classList.contains("dialog__content")` passes on a dialog with no
  // surface, no scrim and no stacking at all (`CLAUDE.md`, *silent unstyling*).

  it("hides a mounted, closed content — the slot's own `display: flex` does not win", async () => {
    // The one configuration that can fail: a slot that sets `display`, on a part that carries
    // `hidden`, still mounted while closed. Reaching it means opting out of *both* Chakra defaults,
    // which is why every other test in this file passes it by.
    //
    // The mechanism is **not** Collapsible's. There, `display: none` is the user-agent's
    // `[hidden]` rule, and it only wins because the `content` slot declares no `display` of its own
    // to lose to. `.dialog__content` declares `display: flex`, which beats any UA rule — what hides
    // a closed dialog here is Panda's preflight,
    // `[hidden]:where(:not([hidden='until-found'])) { display: none !important }`. So blueprint
    // §6.3's open question is answered: Panda's own `preflight: true` already emits Chakra's rule
    // and our preset owes it no `globalCss` line. A consumer who turns preflight off gets a closed
    // dialog that is fully visible, with no error anywhere.
    mounted = mount(() => <Basic lazyMount={false} unmountOnExit={false} />);
    const content = partOf(mounted.container, "content");

    expect(content.hidden).toBe(true);
    expect(getComputedStyle(content).display).toBe("none");

    partOf(mounted.container, "trigger").click();
    await settle();

    // The slot's `display` was live the whole time — this is the declaration `!important` was
    // beating, and asserting it is what stops the test passing on an unstyled element.
    expect(getComputedStyle(content).display).toBe("flex");
    expect(getComputedStyle(content).flexDirection).toBe("column");
  });

  it("puts the twice-listed `backdrop` slot on the element exactly once", () => {
    // `dialogSlotNames` carries eleven entries for ten slots — `backdrop` is listed twice. Both
    // entries build the same class into the same key, so the `Object.fromEntries` that assembles the
    // map collapses them and nothing here has to de-duplicate anything.
    //
    // Read off the raw attribute: `classList` is an ordered *set*, so it would collapse a genuine
    // duplicate before this assertion ever saw it.
    mounted = mount(() => <Basic defaultOpen />);
    const backdrop = partOf(mounted.container, "backdrop");

    const emitted = (backdrop.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter((name) => name === "dialog__backdrop");

    expect(emitted).toHaveLength(1);
    expect(getComputedStyle(backdrop).position).toBe("fixed");
  });

  it("keeps the layer stack's imperative properties through a machine-driven `style` update", async () => {
    // Two writers on one attribute, which is what `decisions.md` records as unmeasured and gates
    // Popover. `@zag-js/dismissable` writes `--layer-index` and `--nested-layer-count` into the
    // content's `style` with `setProperty`, and it watches that same attribute with a
    // `MutationObserver` that rewrites `pointer-events` whenever anything else touches it — while
    // Solid binds the attribute reactively from `getContentProps().style`.
    //
    // They coexist because Solid's `style` binding diffs **per property** against what it last
    // wrote, so it only ever removes a key it owns. Bind an element's `style` as a *string* and
    // `cssText` wipes both custom properties on every machine update instead.
    const [modal, setModal] = createSignal(false);
    mounted = mount(() => <Basic defaultOpen lazyMount={false} modal={modal()} />);
    const content = partOf(mounted.container, "content");

    await settle();
    await settleFrame();
    await vi.waitFor(() => expect(content.style.getPropertyValue("--layer-index")).toBe("0"));

    // A real machine-driven change to the one property Solid owns here: `getContentProps()` emits
    // `pointerEvents: "auto"` only while the dialog is non-modal, so this makes Solid *remove* a
    // declaration from the attribute the layer stack is also writing to.
    setModal(true);
    await settle();
    await vi.waitFor(() => expect(content.getAttribute("aria-modal")).toBe("true"));

    expect(content.style.getPropertyValue("--layer-index")).toBe("0");
    expect(content.style.getPropertyValue("--nested-layer-count")).toBe("0");
  });

  it("reads `--layer-index` back out through the recipe's `z-index`", async () => {
    // What makes the property above load-bearing rather than decorative: `.dialog__content` is
    // `z-index: calc(var(--dialog-z-index) + var(--layer-index, 0))`, and `--dialog-z-index` is the
    // `popover` token, 1500. One dialog reads the fallback and is indistinguishable from an element
    // that never got the property — two stacked dialogs are what tell them apart.
    mounted = mount(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Content data-probe="outer">
          <Dialog.Root defaultOpen>
            <Dialog.Content data-probe="inner">nested</Dialog.Content>
          </Dialog.Root>
        </Dialog.Content>
      </Dialog.Root>
    ));

    const outer = probeIn(mounted.container, "outer");
    const inner = probeIn(mounted.container, "inner");

    await vi.waitFor(() => expect(inner.style.getPropertyValue("--layer-index")).toBe("1"));

    expect(getComputedStyle(outer).zIndex).toBe("1500");
    expect(getComputedStyle(inner).zIndex).toBe("1501");
  });
});

describe("Dialog — the a11y baseline of an open modal dialog", () => {
  /**
   * A dialog with no glyph-only control in it. Every part of `Basic` except the `✕`, which axe
   * declines to measure for contrast ("element content contains only non-text characters") and
   * which would otherwise buy an allowance that says nothing about the port.
   */
  function Labelled() {
    return (
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete file</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description>This cannot be undone.</Dialog.Description>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger>Cancel</Dialog.ActionTrigger>
              <Dialog.CloseTrigger>Close</Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  }

  it("runs clean closed, and carries one inherited incomplete open", async () => {
    // Closed is clean outright — the content is unmounted, so the trigger emits no `aria-controls`
    // and there is no dangling IDREF to flag.
    //
    // Open, axe returns `aria-hidden-focus` as **incomplete**, on the trigger: the machine's
    // `@zag-js/aria-hidden` blanket marks the page behind the modal `aria-hidden` without taking it
    // out of the tab order, and axe declines to decide whether the trigger is still tabbable. The
    // gap is real and it is upstream's — `ariaHidden` calls `hideOthers` unconditionally and the
    // package exports no way to reach the `inertOthers` in its own source — so Chakra v3 scores
    // exactly this. Blueprint §9.1 predicted it as a *violation*; measured, it is an incomplete,
    // which is why one `allowIncomplete` entry is the whole cost and the helper needs no
    // violation channel.
    mounted = mount(() => <Labelled />);
    const { container } = mounted;

    await expectNoA11yViolations(container);

    partOf(container, "trigger").click();
    await settle();

    // Not "two frames after the click": mid-fade the surface is at ~0.03 opacity and axe computes a
    // real, failing `color-contrast` ratio against it — a violation that comes and goes with the
    // animation's progress. Waiting for the enter animation to finish is what makes this
    // deterministic, and it is the first thing to reach for when an axe assertion flakes on a part
    // that animates in.
    const content = partOf(container, "content");
    await vi.waitFor(() => expect(getComputedStyle(content).opacity).toBe("1"));

    await expectNoA11yViolations(container, { allowIncomplete: ["aria-hidden-focus"] });
  });
});

describe("Dialog — server render, then hydrate a closed dialog", () => {
  it("reuses every server node across all three roots", () => {
    // The half neither other project can see. The three roots contribute three different numbers of
    // hydration keys — nothing, a whole tree, and a whole tree that lives in a `<Portal>` — so the
    // strategy each machine resolved on the server decides the key of everything after it. If the
    // two sides disagree, `hydrate()` either claims a server node under a different client tree or
    // gives up and client-renders, and **both are silent**.
    const { container, dispose } = hydrateFixture(dialogServerHtml, () => <Tree />);

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
    const { container, dispose } = hydrateFixture(dialogServerHtml, () => <Tree />);

    const after = container.querySelector('[data-probe="after-portal"]');
    expect(after?.textContent).toBe("after");
    expect(container.querySelector('[data-probe="portal-content"]')).toBeNull();
    expect(document.querySelector('[data-probe="portal-content"]')).not.toBeNull();

    dispose();
  });

  it("runs the machine after hydration, on the server's own nodes", async () => {
    const { container, dispose } = hydrateFixture(dialogServerHtml, () => <Tree />);

    const trigger = container.querySelector('[data-probe="eager-trigger"]');
    const content = container.querySelector('[data-probe="eager-content"]');
    if (!(trigger instanceof HTMLElement) || !(content instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its eager root");
    }

    // `createUniqueId()` is a different function in the server build and the hydrating client build,
    // and they only agree while both walk the same counter. An id that shifted would leave the
    // trigger pointing at nothing, and the machine unable to find its own content.
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(document.getElementById(content.id)).toBe(content);

    trigger.click();
    await settle();

    expect(content.dataset.state).toBe("open");
    expect(content.hidden).toBe(false);
    // The same object the server sent, still — the machine drove it rather than replacing it.
    expect(container.querySelector('[data-probe="eager-content"]')).toBe(content);

    dispose();
  });
});
