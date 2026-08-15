import drawerServerHtml from "virtual:hydration-fixture?id=drawer";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDialog, Dialog } from "../../dialog";
import { createDrawer, Drawer } from "../index";
import { Tree } from "./drawer.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a Drawer runs three machines that send to each
 * other: the dialog machine's own state change is what the content presence watches, and the
 * presence's answer is what decides whether the element exists. So `settle` is two turns, and
 * anything that waits on a `raf` (the presence machine measures the exit animation in one) uses
 * `vi.waitFor`.
 */
const settle = async () => {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  await new Promise<void>((resolve) => queueMicrotask(resolve));
};

/**
 * One frame, for the machine's `raf`-deferred work: `trackDismissableElement` registers the layer
 * with `defer: true`, so the Escape listener is not installed in the same turn as the transition
 * that opened the drawer.
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

/**
 * For the trees where `[data-part]` is ambiguous. A Drawer and a Dialog both run the dialog machine,
 * so both emit `data-scope="dialog"` and a `content` part — the recipe is the only thing that tells
 * them apart, which is exactly what the two-recipes test is measuring.
 */
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
  onOpenChange?: () => void;
  open?: boolean;
  placement?: "start" | "end" | "top" | "bottom";
  present?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
}) {
  return (
    <Drawer.Root
      defaultOpen={props.defaultOpen}
      lazyMount={props.lazyMount}
      unmountOnExit={props.unmountOnExit}
      onOpenChange={props.onOpenChange}
      open={props.open}
      placement={props.placement}
      present={props.present}
      size={props.size}
    >
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Filters</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <Drawer.Description>Narrow the results.</Drawer.Description>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.ActionTrigger data-probe="action">Cancel</Drawer.ActionTrigger>
          </Drawer.Footer>
          <Drawer.CloseTrigger>✕</Drawer.CloseTrigger>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}

describe("Drawer — a real dialog machine through the adapter", () => {
  it("is the dialog factory under a second name, which is what a drawer is here", () => {
    // Not a stylistic alias: Chakra's `drawer.tsx` imports `@ark-ui/react/dialog` and its `index.ts`
    // ships `useDialog as useDrawer`. A `createDrawer` of its own would be a second machine to keep
    // in step, and `check:bundle`'s "zero new machine packages" claim for this batch rests on there
    // not being one.
    expect(createDrawer).toBe(createDialog);
  });

  it("opens on a trigger click, and every part of the drawer follows", async () => {
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

  it("labels the drawer from the title and description it finds in the DOM", async () => {
    // Neither part registers anything: the machine sniffs the DOM for `dialog:{id}:title` after the
    // drawer opens and points `aria-labelledby` at what it found.
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partOf(container, "trigger").click();
    await settle();

    const content = partOf(container, "content");

    expect(content.getAttribute("aria-labelledby")).toBe(partOf(container, "title").id);
    expect(content.getAttribute("aria-describedby")).toBe(partOf(container, "description").id);
  });

  it("moves focus into the drawer on open, which is the machine's own focus trap", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partOf(container, "trigger").click();
    await settle();

    const content = partOf(container, "content");
    await vi.waitFor(() => expect(content.contains(document.activeElement)).toBe(true));
  });

  it("closes the drawer from the close trigger", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const trigger = partOf(container, "trigger");

    trigger.click();
    await settle();

    partOf(container, "close-trigger").click();

    await vi.waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("closes the drawer on Escape, which is the machine's dismissable layer", async () => {
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

  it("starts open on `defaultOpen`, with both gated parts already in the DOM", () => {
    // The one state a page never serves — a drawer is opened by a client event — so it is covered
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
});

describe("Drawer — the two presences that gate one drawer", () => {
  it("gives the backdrop a presence of its own, driven by the same machine", async () => {
    // Ark's split, ported: the scrim mounts independently of the panel and fades on its own curve
    // while the panel slides, so it builds its own presence from the Root's render strategy rather
    // than sharing the Root's instance. Both still answer to one `open`.
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
    // Ark's asymmetry, reproduced rather than corrected: the Root merges `present` into the content
    // presence while the Backdrop hard-codes `open`. So an open drawer with `present={false}` hides
    // the panel and leaves the scrim — the observable shape of the wart we chose not to fix, and the
    // thing a consumer will otherwise report as a bug.
    mounted = mount(() => <Basic defaultOpen lazyMount={false} present={false} />);
    const { container } = mounted;

    expect(partOf(container, "content").hidden).toBe(true);
    expect(partOf(container, "backdrop").hidden).toBe(false);
  });

  it("falls back to the machine's `open` when a wrapper forwards `present={undefined}`", () => {
    // `??`, never `merge`: resolved by presence, an unset forward would win and hide a drawer the
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

describe("Drawer — the render strategy decides whether a drawer's parts exist", () => {
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

  it("hides a mounted, closed content — the slot's own `display: flex` does not win", async () => {
    // The one configuration that can fail: a slot that sets `display`, on a part that carries
    // `hidden`, still mounted while closed. Reaching it means opting out of *both* Chakra defaults,
    // which is why every other test in this file passes it by.
    //
    // `.drawer__content` declares `display: flex`, which beats any user-agent `[hidden]` rule — what
    // hides a closed panel here is Panda's preflight,
    // `[hidden]:where(:not([hidden='until-found'])) { display: none !important }`. A consumer who
    // turns preflight off gets a closed drawer that is fully visible, with no error anywhere.
    mounted = mount(() => <Basic lazyMount={false} unmountOnExit={false} />);
    const content = partOf(mounted.container, "content");

    expect(content.hidden).toBe(true);
    expect(getComputedStyle(content).display).toBe("none");

    partOf(mounted.container, "trigger").click();
    await settle();

    // The slot's `display` was live the whole time — this is the declaration `!important` was
    // beating, and asserting it is what stops the test passing on an element with no CSS at all.
    expect(getComputedStyle(content).display).toBe("flex");
    expect(getComputedStyle(content).flexDirection).toBe("column");
  });

  it("keeps both defaults when a wrapper forwards them as `undefined`", async () => {
    // `withDefaults`, not `merge({ lazyMount: true }, props)`: `merge` resolves a key by presence, so
    // a wrapper spreading two unset props would win with `undefined` and leave the panel in the
    // served markup and never remove it (`CLAUDE.md`, *The third hazard*). `Basic` forwards them
    // exactly this way, which is what every other test here rides on.
    mounted = mount(() => (
      <Drawer.Root lazyMount={undefined} unmountOnExit={undefined}>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Content>body</Drawer.Content>
      </Drawer.Root>
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

describe("Drawer — the styles a drawer's slot recipe really generated", () => {
  // Computed styles, never class names: a Panda class whose CSS was never generated renders nothing
  // and raises no error, so `classList.contains("drawer__content")` passes on a drawer with no
  // panel, no scrim and no stacking at all (`CLAUDE.md`, *silent unstyling*).

  it("puts the twice-listed `backdrop` slot on the element exactly once", () => {
    // The generated `drawerSlotNames` carries eleven entries for ten slots — `backdrop` is listed
    // twice. Both entries build the same class into the same key, so the `Object.fromEntries` that
    // assembles the map collapses them and nothing in the component has to de-duplicate anything.
    //
    // Read off the raw attribute: `classList` is an ordered *set*, so it would collapse a genuine
    // duplicate before this assertion ever saw it.
    mounted = mount(() => <Basic defaultOpen />);
    const backdrop = partOf(mounted.container, "backdrop");

    const emitted = (backdrop.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter((name) => name === "drawer__backdrop");

    expect(emitted).toHaveLength(1);
    expect(getComputedStyle(backdrop).position).toBe("fixed");
  });

  it("pins the panel to the end edge by default, and slides it in from there", async () => {
    // `placement` is the variant Dialog has no equivalent of — Dialog's three values are vertical
    // alignments, these four are edges. The recipe's own `defaultVariants` is what resolves `end`;
    // nothing in the component restates it, so this is also the assertion that would catch a
    // hand-written default drifting away from the preset.
    mounted = mount(() => <Basic defaultOpen />);
    const { container } = mounted;

    await settle();

    expect(getComputedStyle(partOf(container, "positioner")).justifyContent).toBe("flex-end");
    expect(getComputedStyle(partOf(container, "content")).animationName).toBe(
      "slide-from-right-full, fade-in",
    );
  });

  it('pins it to the start edge under `placement="start"`, and reverses the slide', async () => {
    mounted = mount(() => <Basic defaultOpen placement="start" />);
    const { container } = mounted;

    await settle();

    const positioner = partOf(container, "positioner");
    const content = partOf(container, "content");

    expect(getComputedStyle(positioner).justifyContent).toBe("flex-start");
    expect(getComputedStyle(positioner).alignItems).toBe("stretch");
    expect(getComputedStyle(content).animationName).toBe("slide-from-left-full, fade-in");
  });

  it('swaps to the block axis under `placement="bottom"`', async () => {
    // The two edge pairs style *different* properties: `start`/`end` set `justify-content` and leave
    // `align-items: stretch`, `top`/`bottom` do the reverse. A recipe that styled one property for
    // all four would pass both tests above and fail this one.
    mounted = mount(() => <Basic defaultOpen placement="bottom" />);
    const { container } = mounted;

    await settle();

    const positioner = partOf(container, "positioner");

    expect(getComputedStyle(positioner).alignItems).toBe("flex-end");
    expect(getComputedStyle(partOf(container, "content")).animationName).toBe(
      "slide-from-bottom-full, fade-in",
    );
  });

  it("reads `--layer-index` back out through the recipe's `z-index`", async () => {
    // `.drawer__content` is `z-index: calc(var(--drawer-z-index) + var(--layer-index, 0))`, and
    // `--drawer-z-index` is the `popover` token, 1500. `@zag-js/dismissable` writes `--layer-index`
    // imperatively into the same `style` attribute Solid binds from `getContentProps()`; one drawer
    // reads the fallback and is indistinguishable from an element that never got the property, so
    // two stacked drawers are what tell them apart.
    mounted = mount(() => (
      <Drawer.Root defaultOpen>
        <Drawer.Content data-probe="outer">
          <Drawer.Root defaultOpen>
            <Drawer.Content data-probe="inner">nested</Drawer.Content>
          </Drawer.Root>
        </Drawer.Content>
      </Drawer.Root>
    ));

    const outer = probeIn(mounted.container, "outer");
    const inner = probeIn(mounted.container, "inner");

    await vi.waitFor(() => expect(inner.style.getPropertyValue("--layer-index")).toBe("1"));

    expect(getComputedStyle(outer).zIndex).toBe("1500");
    expect(getComputedStyle(inner).zIndex).toBe("1501");
  });
});

describe("Drawer — one machine, two components, two recipes", () => {
  it("styles the same part differently from a Dialog given the same variant props", () => {
    // The B1 batch's own proof, and the only thing in this file that can see the recipe *binding*: a
    // Drawer accidentally wired to `dialogRecipe` runs the same machine, emits the same
    // `data-scope="dialog"`, the same parts, the same ARIA and the same presence behaviour — every
    // other test here passes on it. What it cannot fake is the computed style, because the two
    // recipes resolve `size="xs"` to different tokens: `sizes.sm` (24rem) for a dialog, `sizes.xs`
    // (20rem) for a drawer.
    //
    // Both are mounted in one tree so the measurement is one layout pass in one viewport, and both
    // are found by probe — two components on one machine both emit `data-part="content"`.
    mounted = mount(() => (
      <div>
        <Dialog.Root defaultOpen size="xs">
          <Dialog.Positioner data-probe="dialog-positioner">
            <Dialog.Content data-probe="dialog-content">dialog</Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
        <Drawer.Root defaultOpen size="xs">
          <Drawer.Positioner data-probe="drawer-positioner">
            <Drawer.Content data-probe="drawer-content">drawer</Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      </div>
    ));
    const { container } = mounted;

    const dialogContent = getComputedStyle(probeIn(container, "dialog-content"));
    const drawerContent = getComputedStyle(probeIn(container, "drawer-content"));

    expect(dialogContent.maxWidth).toBe("384px");
    expect(drawerContent.maxWidth).toBe("320px");

    // A second part, on a declaration neither recipe puts in a variant: the base `positioner` slot
    // centres a dialog and leaves a drawer to its `placement`, which defaults to the end edge.
    expect(getComputedStyle(probeIn(container, "dialog-positioner")).justifyContent).toBe("center");
    expect(getComputedStyle(probeIn(container, "drawer-positioner")).justifyContent).toBe(
      "flex-end",
    );
  });
});

describe("Drawer — the action trigger, the one part with a handler of its own", () => {
  function WithAction(props: { type?: "button" | "submit"; onClick?: () => void }) {
    return (
      <Drawer.Root defaultOpen>
        <Drawer.Content>
          <Drawer.ActionTrigger data-probe="action" type={props.type} onClick={props.onClick}>
            Cancel
          </Drawer.ActionTrigger>
        </Drawer.Content>
      </Drawer.Root>
    );
  }

  it("closes the drawer, after running the consumer's own handler", async () => {
    const onClick = vi.fn();
    mounted = mount(() => <WithAction onClick={onClick} />);
    const { container } = mounted;

    actionIn(container).click();
    await settle();

    expect(onClick).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(partIn(container, "content")).toBeNull());
  });

  it("stays a `button` when a drawer's wrapper forwards `type={undefined}`", () => {
    // `withDefaults`, not a JSX attribute before the spread: `merge` resolves a key by presence, so
    // a wrapper spreading an unset `type` would win with `undefined` and this button would submit
    // whatever form it sits in (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => <WithAction type={undefined} />);

    expect(actionIn(mounted.container).type).toBe("button");
  });

  it("keeps the content a `div` when a wrapper forwards `as={undefined}`", () => {
    // `as: props.as ?? "div"`, resolved by value. The panel's element type decides what a recipe
    // selector, a snapshot and a screen reader all see, and a `??` is the only thing between a
    // forwarded unset prop and `renderStyled` being handed `undefined` as a component.
    mounted = mount(() => (
      <Drawer.Root defaultOpen>
        <Drawer.Content as={undefined} data-probe="content">
          body
        </Drawer.Content>
      </Drawer.Root>
    ));

    expect(probeIn(mounted.container, "content").tagName).toBe("DIV");
  });
});

describe("Drawer — the a11y baseline of an open modal drawer", () => {
  /**
   * A drawer with no glyph-only control in it. Every part of `Basic` except the `✕`, which axe
   * declines to measure for contrast ("element content contains only non-text characters") and
   * which would otherwise buy an allowance that says nothing about the port.
   */
  function Labelled() {
    return (
      <Drawer.Root>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Filters</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Drawer.Description>Narrow the results.</Drawer.Description>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.ActionTrigger>Cancel</Drawer.ActionTrigger>
              <Drawer.CloseTrigger>Close</Drawer.CloseTrigger>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    );
  }

  it("runs clean closed, and carries one inherited incomplete open", async () => {
    // Closed is clean outright — the content is unmounted, so the trigger emits no `aria-controls`
    // and there is no dangling IDREF to flag.
    //
    // Open, axe returns `aria-hidden-focus` as **incomplete**, on the trigger: the machine's
    // `@zag-js/aria-hidden` blanket marks the page behind the modal `aria-hidden` without taking it
    // out of the tab order, and axe declines to decide whether the trigger is still tabbable. The
    // gap is real and it is upstream's — `ariaHidden` calls `hideOthers` unconditionally — so Chakra
    // v3 scores exactly this, and it is inherited here unchanged because a drawer is that same
    // machine.
    mounted = mount(() => <Labelled />);
    const { container } = mounted;

    await expectNoA11yViolations(container);

    partOf(container, "trigger").click();
    await settle();

    // Not "two frames after the click": mid-slide the panel is at ~0.03 opacity and axe computes a
    // real, failing `color-contrast` ratio against it — a violation that comes and goes with the
    // animation's progress. Waiting for the enter animation to finish is what makes this
    // deterministic.
    const content = partOf(container, "content");
    await vi.waitFor(() => expect(getComputedStyle(content).opacity).toBe("1"));

    await expectNoA11yViolations(container, { allowIncomplete: ["aria-hidden-focus"] });
  });
});

describe("Drawer — server render, then hydrate a closed drawer", () => {
  it("reuses every server node across all three roots", () => {
    // The half neither other project can see. The three roots contribute three different numbers of
    // hydration keys — nothing, a whole tree, and a whole tree that lives in a `<Portal>` — so the
    // strategy each machine resolved on the server decides the key of everything after it. If the
    // two sides disagree, `hydrate()` either claims a server node under a different client tree or
    // gives up and client-renders, and **both are silent**.
    const { container, dispose } = hydrateFixture(drawerServerHtml, () => <Tree />);

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

  it("resolves the same `placement` classes on both builds", () => {
    // The one thing a Drawer can get wrong that a Dialog cannot: the eager root sets
    // `placement="start"`, so the panel's class string is a variant resolution rather than a
    // constant. A server that resolved it differently would leave the hydrated panel styled by
    // whichever side won — which is invisible in the markup and visible here as the edge it pins to.
    const { container, dispose } = hydrateFixture(drawerServerHtml, () => <Tree />);

    const positioner = container.querySelector('[data-probe="eager-positioner"]');
    if (!(positioner instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its eager positioner");
    }

    expect(getComputedStyle(positioner).justifyContent).toBe("flex-start");

    dispose();
  });

  it("keeps the sibling after a `<Portal>` aligned on both builds", () => {
    // The Portal renders nothing on the server and consumes exactly one child id there; its client
    // counterpart consumes one too and mounts its content in `document.body`. If those two numbers
    // disagreed, every hydration key after the portal would shift — and this span, the first thing
    // after it, is what would hydrate against the wrong node.
    const { container, dispose } = hydrateFixture(drawerServerHtml, () => <Tree />);

    const after = container.querySelector('[data-probe="after-portal"]');
    expect(after?.textContent).toBe("after");
    expect(container.querySelector('[data-probe="portal-content"]')).toBeNull();
    expect(document.querySelector('[data-probe="portal-content"]')).not.toBeNull();

    dispose();
  });

  it("runs the machine after hydration, on the server's own nodes", async () => {
    const { container, dispose } = hydrateFixture(drawerServerHtml, () => <Tree />);

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
