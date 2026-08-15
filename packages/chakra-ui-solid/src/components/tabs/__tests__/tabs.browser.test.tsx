import tabsServerHtml from "virtual:hydration-fixture?id=tabs";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TabsNavigateDetails, TabsValueChangeDetails } from "../index";
import { Tabs } from "../index";
import { Tree } from "./tabs.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a set of tabs runs one machine per panel on top
 * of its own: the tabs machine's value change is what every `@zag-js/presence` watches. So `settle`
 * is two turns, and anything the machine schedules in a `raf` — focus moves, the indicator's
 * measurement, `syncTabIndex` — is waited for with `vi.waitFor`.
 */
const settle = async () => {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  await new Promise<void>((resolve) => queueMicrotask(resolve));
};

function partOf(container: ParentNode, part: string): HTMLElement {
  const element = container.querySelector(`[data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

/**
 * A trigger by the value it selects — `data-value` is what the machine puts its `value` on the DOM
 * as. Narrowed to `HTMLElement` rather than to a button, because `as="a"` is a supported spelling and
 * the `navigate` case below uses it.
 */
function triggerFor(container: ParentNode, value: string): HTMLElement {
  const element = container.querySelector(`[data-part="trigger"][data-value="${value}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a trigger for "${value}"`);
  }
  return element;
}

/** A panel by value. It carries no `data-value`, so every tree below probes its own. */
const panelIn = (container: ParentNode, value: string) =>
  container.querySelector(`[data-probe="panel-${value}"]`);

function panelFor(container: ParentNode, value: string): HTMLElement {
  const element = panelIn(container, value);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a panel for "${value}"`);
  }
  return element;
}

/**
 * The tablist owns the arrow handler, so a key press is dispatched from the trigger and bubbles —
 * which is also what a real key press does, and what the handler's `contains` check requires.
 */
function pressKey(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

/**
 * Four tabs, one of them disabled, and a panel each — Ark's own fixture for this row, so the
 * keyboard cases here answer the same questions its suite asks.
 *
 * Every prop is forwarded **by name** rather than spread, which is what puts each of them on the
 * forwarded-`undefined` path on every test in this file.
 */
function Basic(props: {
  activationMode?: "manual" | "automatic";
  composite?: boolean;
  defaultValue?: string | null;
  deselectable?: boolean;
  fitted?: boolean;
  justify?: "start" | "center" | "end";
  lazyMount?: boolean;
  loopFocus?: boolean;
  onValueChange?: (details: TabsValueChangeDetails) => void;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  unmountOnExit?: boolean;
  unstyled?: boolean;
  value?: string | null;
  variant?: "line" | "subtle" | "enclosed" | "outline" | "plain";
}) {
  return (
    <Tabs.Root
      activationMode={props.activationMode}
      composite={props.composite}
      defaultValue={props.defaultValue}
      deselectable={props.deselectable}
      fitted={props.fitted}
      justify={props.justify}
      lazyMount={props.lazyMount}
      loopFocus={props.loopFocus}
      onValueChange={props.onValueChange}
      orientation={props.orientation}
      size={props.size}
      unmountOnExit={props.unmountOnExit}
      unstyled={props.unstyled}
      value={props.value}
      variant={props.variant}
    >
      <Tabs.List>
        <Tabs.Trigger value="react">React</Tabs.Trigger>
        <Tabs.Trigger value="solid">Solid</Tabs.Trigger>
        <Tabs.Trigger value="svelte" disabled>
          Svelte
        </Tabs.Trigger>
        <Tabs.Trigger value="vue">Vue</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="react" data-probe="panel-react">
        React panel
      </Tabs.Content>
      <Tabs.Content value="solid" data-probe="panel-solid">
        Solid panel
      </Tabs.Content>
      <Tabs.Content value="svelte" data-probe="panel-svelte">
        Svelte panel
      </Tabs.Content>
      <Tabs.Content value="vue" data-probe="panel-vue">
        Vue panel
      </Tabs.Content>
    </Tabs.Root>
  );
}

describe("Tabs — a real machine through the adapter", () => {
  it("selects a tab on click, and both halves of the pair follow", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => <Basic defaultValue="react" onValueChange={onValueChange} />);
    const { container } = mounted;

    triggerFor(container, "solid").click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith({ value: "solid" });
    expect(triggerFor(container, "solid").getAttribute("aria-selected")).toBe("true");
    expect(triggerFor(container, "react").getAttribute("aria-selected")).toBe("false");
    expect(panelFor(container, "solid").hidden).toBe(false);

    // Hidden in the same turn the new panel appears in, with no frame in between. The presence layer
    // still merges its own `hidden` over Zag's `hidden: !selected`, so a node with a real exit
    // animation survives to run it — but it asks the element's computed style for that answer
    // synchronously instead of waiting for the machine's `raf`. `.tabs__content` declares no
    // animation, so the two panels are never in flow at once: the frame the React version never
    // shows, and the layout jump that came with it.
    expect(panelFor(container, "react").hidden).toBe(true);
  });

  it("reports a controlled value upward rather than changing it itself", async () => {
    const onValueChange = vi.fn();
    const [value, setValue] = createSignal("react");

    mounted = mount(() => <Basic value={value()} onValueChange={onValueChange} />);
    const { container } = mounted;

    triggerFor(container, "solid").click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith({ value: "solid" });
    expect(panelFor(container, "react").hidden).toBe(false);
    expect(panelFor(container, "solid").hidden).toBe(true);

    setValue("solid");
    await settle();

    expect(panelFor(container, "solid").hidden).toBe(false);
    expect(panelFor(container, "react").hidden).toBe(true);
  });

  it("selects the tab an arrow key moves to under `automatic`, and only focuses it under `manual`", async () => {
    mounted = mount(() => <Basic defaultValue="react" />);
    const automatic = mounted.container;

    triggerFor(automatic, "react").focus();
    await settle();
    pressKey(triggerFor(automatic, "react"), "ArrowRight");

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(triggerFor(automatic, "solid"));
      expect(triggerFor(automatic, "solid").getAttribute("aria-selected")).toBe("true");
    });

    mounted.dispose();
    mounted = mount(() => <Basic defaultValue="react" activationMode="manual" />);
    const manual = mounted.container;

    triggerFor(manual, "react").focus();
    await settle();
    pressKey(triggerFor(manual, "react"), "ArrowRight");

    await vi.waitFor(() => expect(document.activeElement).toBe(triggerFor(manual, "solid")));
    expect(triggerFor(manual, "solid").getAttribute("aria-selected")).toBe("false");
    expect(triggerFor(manual, "react").getAttribute("aria-selected")).toBe("true");
  });

  it("moves to the first and last enabled trigger on Home and End", async () => {
    // `getElements` filters `:not([disabled])`, so End lands on Vue rather than on the disabled
    // Svelte between them — the same query every arrow move walks.
    mounted = mount(() => <Basic defaultValue="solid" activationMode="manual" />);
    const { container } = mounted;

    triggerFor(container, "solid").focus();
    await settle();
    pressKey(triggerFor(container, "solid"), "End");

    await vi.waitFor(() => expect(document.activeElement).toBe(triggerFor(container, "vue")));

    pressKey(triggerFor(container, "vue"), "Home");

    await vi.waitFor(() => expect(document.activeElement).toBe(triggerFor(container, "react")));
  });

  it("wraps arrow focus by default, and stops at the end when `loopFocus` is off", async () => {
    mounted = mount(() => <Basic defaultValue="vue" activationMode="manual" />);
    const looping = mounted.container;

    triggerFor(looping, "vue").focus();
    await settle();
    pressKey(triggerFor(looping, "vue"), "ArrowRight");

    await vi.waitFor(() => expect(document.activeElement).toBe(triggerFor(looping, "react")));

    mounted.dispose();
    mounted = mount(() => <Basic defaultValue="vue" activationMode="manual" loopFocus={false} />);
    const bounded = mounted.container;

    triggerFor(bounded, "vue").focus();
    await settle();
    pressKey(triggerFor(bounded, "vue"), "ArrowRight");

    await settle();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(document.activeElement).toBe(triggerFor(bounded, "vue"));
  });

  it("swaps the live arrow axis and the tablist's `aria-orientation` on `orientation`", async () => {
    mounted = mount(() => <Basic defaultValue="react" orientation="vertical" />);
    const { container } = mounted;

    expect(partOf(container, "list").getAttribute("aria-orientation")).toBe("vertical");
    expect(partOf(container, "root").dataset.orientation).toBe("vertical");

    triggerFor(container, "react").focus();
    await settle();

    // The horizontal keys are inert now — the machine's `keyMap` returns early on `isVertical`.
    pressKey(triggerFor(container, "react"), "ArrowRight");
    await settle();
    expect(document.activeElement).toBe(triggerFor(container, "react"));

    pressKey(triggerFor(container, "react"), "ArrowDown");
    await vi.waitFor(() => expect(document.activeElement).toBe(triggerFor(container, "solid")));
  });

  it("takes no focus and no selection from a disabled trigger", async () => {
    mounted = mount(() => <Basic defaultValue="react" />);
    const { container } = mounted;
    const disabled = triggerFor(container, "svelte");

    expect(disabled.hasAttribute("disabled")).toBe(true);
    expect(disabled.dataset.disabled).toBe("");

    disabled.click();
    await settle();

    expect(document.activeElement).not.toBe(disabled);
    expect(panelFor(container, "svelte").hidden).toBe(true);
    expect(triggerFor(container, "react").getAttribute("aria-selected")).toBe("true");
  });

  it("takes every trigger out of the tab order under `composite={false}`, and still moves `focusedValue`", async () => {
    // The mode for a set of tabs nested inside a widget that owns the focus. `focusNextTab` swaps
    // `triggerEl.focus()` for a direct `focusedValue` write, so the focus ring never moves and
    // `data-focus` does — which is the only observable difference and the reason this needs its own
    // test rather than an assertion on `tabIndex` alone.
    mounted = mount(() => <Basic defaultValue="react" composite={false} activationMode="manual" />);
    const { container } = mounted;

    for (const value of ["react", "solid", "svelte", "vue"]) {
      expect(triggerFor(container, value).tabIndex, value).toBe(-1);
    }
    expect(panelFor(container, "react").tabIndex).toBe(-1);

    triggerFor(container, "react").focus();
    await settle();
    pressKey(triggerFor(container, "react"), "ArrowRight");

    await vi.waitFor(() => expect(triggerFor(container, "solid").dataset.focus).toBe(""));
    expect(document.activeElement).toBe(triggerFor(container, "react"));
  });

  it("clears the selection when a selected trigger is clicked under `deselectable`", async () => {
    mounted = mount(() => <Basic defaultValue="react" deselectable />);
    const { container } = mounted;

    triggerFor(container, "react").click();
    await settle();

    expect(triggerFor(container, "react").getAttribute("aria-selected")).toBe("false");
    expect(panelFor(container, "react").hidden).toBe(true);
  });

  it("calls `navigate` when the newly selected trigger is an anchor", async () => {
    // `navigateIfNeeded` runs off the machine's `watch` on `value`, so it is a *change* that fires
    // it — never the initial `defaultValue`. Passing our own `navigate` replaces the machine's
    // default, which would otherwise click the link for real.
    //
    // `render`, not `as="a"`: `TabsTriggerProps` is the button's prop set, so `href` has nowhere to
    // land under `as`. `render` is where the anchor's own attributes are typed — it is this library's
    // spelling of the React version's `asChild`, where the `href` sits on the child element for the
    // same reason.
    const navigate = vi.fn();
    const [value, setValue] = createSignal("home");

    mounted = mount(() => (
      <Tabs.Root value={value()} navigate={navigate}>
        <Tabs.List>
          <Tabs.Trigger value="home">Home</Tabs.Trigger>
          <Tabs.Trigger
            value="docs"
            render={(triggerProps) => (
              <a {...(triggerProps as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} href="/docs" />
            )}
          >
            Docs
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    ));

    setValue("docs");

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledOnce());
    const details = navigate.mock.calls[0]?.[0] as TabsNavigateDetails;
    expect(details.value).toBe("docs");
    expect(details.node).toBe(triggerFor(mounted.container, "docs"));
    expect(details.href).toMatch(/\/docs$/);
  });

  it("lets `ids` rename a panel, with the trigger's `aria-controls` following it", () => {
    // `ids.content` is a function of the value, where Collapsible's is a plain string — one Root
    // names N panels. The `id` and the IDREF come from two different `connect()` getters, so this is
    // the pair agreeing rather than one attribute being renamed.
    mounted = mount(() => (
      <Tabs.Root defaultValue="react" ids={{ content: (value) => `panel-${value}` }}>
        <Tabs.List>
          <Tabs.Trigger value="react">React</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="react" data-probe="panel-react">
          React panel
        </Tabs.Content>
      </Tabs.Root>
    ));
    const { container } = mounted;

    expect(panelFor(container, "react").id).toBe("panel-react");
    expect(triggerFor(container, "react").getAttribute("aria-controls")).toBe("panel-react");
  });
});

describe("Tabs — one presence per panel, and the strategy over them", () => {
  it("mounts every panel by default, with the unselected ones hidden and closed", () => {
    // The inversion of Dialog's rule that a presence is created on the Root: N panels each animate
    // on their own schedule, so each `Tabs.Content` builds its own presence from the Root's render
    // strategy. Under Chakra's defaults — `lazyMount` and `unmountOnExit` both `false` — that means
    // every one of them is real markup from the start.
    mounted = mount(() => <Basic defaultValue="react" />);
    const { container } = mounted;

    expect(panelFor(container, "react").hidden).toBe(false);
    expect(panelFor(container, "react").dataset.state).toBe("open");

    for (const value of ["solid", "svelte", "vue"]) {
      expect(panelFor(container, value).hidden, value).toBe(true);
      expect(panelFor(container, value).dataset.state, value).toBe("closed");
    }
  });

  it("mounts a `lazyMount` panel on its first selection, and leaves it there", async () => {
    mounted = mount(() => <Basic defaultValue="react" lazyMount />);
    const { container } = mounted;

    expect(panelIn(container, "react")).not.toBeNull();
    expect(panelIn(container, "solid")).toBeNull();

    triggerFor(container, "solid").click();
    await settle();
    expect(panelIn(container, "solid")).not.toBeNull();

    triggerFor(container, "react").click();
    await settle();
    expect(panelFor(container, "solid").hidden).toBe(true);
    expect(panelIn(container, "solid")).not.toBeNull();
  });

  it("removes the previously selected panel under `lazyMount unmountOnExit`", async () => {
    // `vi.waitFor`, not a fixed number of turns: the presence machine reads the element's computed
    // `animation-name` inside a `raf` before it decides whether to suspend the unmount. `immediate`
    // does not shorten that at our pin — `@zag-js/presence@1.43.0` declares the prop and never reads
    // it — so nothing here may depend on it.
    mounted = mount(() => <Basic defaultValue="react" lazyMount unmountOnExit />);
    const { container } = mounted;

    expect(panelIn(container, "react")).not.toBeNull();

    triggerFor(container, "solid").click();
    await settle();

    expect(panelIn(container, "solid")).not.toBeNull();
    await vi.waitFor(() => expect(panelIn(container, "react")).toBeNull());
  });

  it("never has two panels in flow, on any frame between one selection and the next", async () => {
    // The regression this file exists to hold. Every other assertion here samples *after* the
    // machine has settled, which is exactly when the defect is already over: the outgoing panel used
    // to stay un-hidden for the one frame the presence machine spent in a `raf` deciding whether an
    // exit animation existed, so both panels were in flow and the page jumped by the height
    // difference. Sampling per frame is the only thing that can see it.
    mounted = mount(() => <Basic defaultValue="react" />);
    const { container } = mounted;

    const panels = [...container.querySelectorAll('[data-part="content"]')] as HTMLElement[];
    const inFlow = () => panels.filter((panel) => !panel.hasAttribute("hidden")).length;

    triggerFor(container, "solid").click();

    const perFrame: number[] = [];
    for (let frame = 0; frame < 4; frame++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      perFrame.push(inFlow());
    }

    expect(perFrame).toEqual([1, 1, 1, 1]);
  });
});

describe("Tabs — the styles the slot recipe really generated", () => {
  // Computed styles, never class names: a Panda class whose CSS was never generated renders nothing
  // and raises no error, so `classList.contains("tabs__trigger")` passes on a set of tabs with no
  // height, no rule under the list and no padding on any panel (`CLAUDE.md`, *silent unstyling*).

  it("gives a trigger the height its `size` variant declared, through the root's custom property", () => {
    // **The proof the recipe is generated.** `40px` here means four independent things resolved: the
    // root's `size` variant set `--tabs-height`, the `sizes.10` token behind it exists, the root slot
    // class landed on the root, and `.tabs__trigger { height: var(--tabs-height) }` landed on the
    // trigger. Any one of them missing and the height is the button's content box instead.
    for (const [size, height] of [
      ["sm", "36px"],
      ["md", "40px"],
      ["lg", "44px"],
    ] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic defaultValue="react" size={size} />);
      const trigger = triggerFor(mounted.container, "react");

      expect(getComputedStyle(trigger).height, size).toBe(height);
    }
  });

  it("keeps the default `md` when the `size` variant is left unset", () => {
    // The recipe's own `defaultVariants`, not a literal restated on the Root — which is why
    // `TabsVariantProps` declares no `@default` for it.
    mounted = mount(() => <Basic defaultValue="react" />);

    expect(getComputedStyle(triggerFor(mounted.container, "react")).height).toBe("40px");
  });

  it("reads the list's `display` from the base layer under `plain` and the variant layer under `line`", () => {
    // Two layers in one assertion pair. `.tabs__list` declares `inline-flex` and only
    // `.tabs__list--variant_line` overrides it to `flex` — there is no `--variant_plain` rule for the
    // list at all — so `flex` proves the variant layer landed and `inline-flex` proves the base one
    // did.
    mounted = mount(() => <Basic defaultValue="react" variant="line" />);
    expect(getComputedStyle(partOf(mounted.container, "list")).display).toBe("flex");

    mounted.dispose();
    mounted = mount(() => <Basic defaultValue="react" variant="plain" />);
    expect(getComputedStyle(partOf(mounted.container, "list")).display).toBe("inline-flex");
  });

  it("pads the selected panel from the `[data-orientation=horizontal]` arm", () => {
    // `padding-top: var(--tabs-content-padding)`, and the property is set on the ROOT by the size
    // variant — so this is inheritance across two elements as well as a conditional selector.
    mounted = mount(() => <Basic defaultValue="react" />);

    expect(getComputedStyle(panelFor(mounted.container, "react")).paddingTop).toBe("16px");
  });

  it("lays the root out by orientation", () => {
    mounted = mount(() => <Basic defaultValue="react" />);
    expect(getComputedStyle(partOf(mounted.container, "root")).display).toBe("block");

    mounted.dispose();
    mounted = mount(() => <Basic defaultValue="react" orientation="vertical" />);
    expect(getComputedStyle(partOf(mounted.container, "root")).display).toBe("flex");
  });

  it("stretches the triggers under `fitted` and packs them under `justify`", () => {
    mounted = mount(() => <Basic defaultValue="react" fitted />);
    expect(getComputedStyle(triggerFor(mounted.container, "react")).flexGrow).toBe("1");

    mounted.dispose();
    mounted = mount(() => <Basic defaultValue="react" justify="center" />);
    expect(getComputedStyle(partOf(mounted.container, "list")).justifyContent).toBe("center");
  });

  it("leaves every part with the browser's own styles under a Root-level `unstyled`", () => {
    // Asserted as a computed **fallback**, never as an absent class: a missing class name and a class
    // whose CSS was never generated look identical from the DOM, so only what the element actually
    // computes can tell the opt-out from the failure it is supposed to be distinguishable from.
    mounted = mount(() => <Basic defaultValue="react" unstyled />);
    const { container } = mounted;

    expect(getComputedStyle(partOf(container, "root")).position).toBe("static");
    expect(getComputedStyle(partOf(container, "list")).display).toBe("block");
    expect(getComputedStyle(triggerFor(container, "react")).height).not.toBe("40px");
    expect(getComputedStyle(panelFor(container, "react")).paddingTop).toBe("0px");
  });

  it("gives the content group a class the sheet declares no rules for", () => {
    // **The vacuous case, and it is upstream's own.** `tabs__contentGroup` is one of the recipe's six
    // slot names and its body is empty, so the class lands on the element and carries nothing. That
    // is why this part must never be used as the silent-unstyling probe: it would pass on a
    // stylesheet that was never generated at all.
    mounted = mount(() => (
      <Tabs.Root defaultValue="react">
        <Tabs.ContentGroup data-probe="group">
          <Tabs.Content value="react" data-probe="panel-react">
            React panel
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    ));

    const group = mounted.container.querySelector('[data-probe="group"]');
    if (!(group instanceof HTMLElement)) {
      throw new Error("expected the tree to render a content group");
    }

    expect(group.classList.contains("tabs__contentGroup")).toBe(true);
    expect(group.hasAttribute("data-part")).toBe(false);
    expect(declarationCountFor(".tabs__contentGroup")).toBe(0);
    // The control: the sibling slot on the same recipe does carry rules, so a zero above is a fact
    // about this slot rather than about the walk.
    expect(declarationCountFor(".tabs__content")).toBeGreaterThan(0);
  });
});

/** How many declarations the loaded stylesheets apply to one selector, `@layer` nesting included. */
function declarationCountFor(selector: string): number {
  let total = 0;

  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
        total += rule.style.length;
      }
      const nested = (rule as CSSGroupingRule).cssRules as CSSRuleList | undefined;
      if (nested !== undefined) {
        visit(nested);
      }
    }
  };

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // A cross-origin sheet refuses `cssRules`; ours is injected inline and never does.
    }
  }

  return total;
}

describe("Tabs — the two seams where the machine writes the DOM behind Solid's back", () => {
  it("lets `syncTabIndex` take the selected panel out of the tab order when it has focusables", async () => {
    // Two writers on one attribute, measured rather than reasoned about. Solid binds `tabindex` from
    // `getContentProps()` — a constant `0` while `composite` — and the machine *removes* it from
    // inside a `raf` when the panel contains something focusable, so the panel does not become a
    // second tab stop in front of its own link. Solid never puts it back, because the value it is
    // bound to never changed and its `style`/attribute effects only write on a diff.
    mounted = mount(() => (
      <Tabs.Root defaultValue="react">
        <Tabs.List>
          <Tabs.Trigger value="react">React</Tabs.Trigger>
          <Tabs.Trigger value="solid">Solid</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="react" data-probe="panel-react">
          <a href="#docs">a focusable child</a>
        </Tabs.Content>
        <Tabs.Content value="solid" data-probe="panel-solid">
          nothing focusable
        </Tabs.Content>
      </Tabs.Root>
    ));
    const { container } = mounted;

    await vi.waitFor(() =>
      expect(panelFor(container, "react").hasAttribute("tabindex")).toBe(false),
    );

    // The panel with nothing focusable keeps the tab stop, which is what makes its content reachable
    // by keyboard at all — the two branches of the same `raf`.
    triggerFor(container, "solid").click();
    await settle();

    await vi.waitFor(() => expect(panelFor(container, "solid").getAttribute("tabindex")).toBe("0"));
    // A machine-driven update has run over the first panel since — Solid did not restore what the
    // machine removed.
    expect(panelFor(container, "react").hasAttribute("tabindex")).toBe(false);
  });

  it("un-hides the indicator only once the machine has measured a trigger", async () => {
    // `hidden` is `isRectEmpty(rect)` and `indicatorRect` starts `null`, so the element is served and
    // mounted hidden and un-hides itself off the machine's first measurement. `--width` is what
    // `.tabs__indicator { width: var(--width) }` reads, so the bar has no size until then either.
    mounted = mount(() => <Basic defaultValue="react" />);
    const { container } = mounted;
    const indicator = partOf(container, "indicator");

    await vi.waitFor(() => expect(indicator.hidden).toBe(false));

    // `offsetWidth`, which the machine rounds, is what `--width` carries — so the bar's own computed
    // width is compared against that rather than against the trigger's fractional layout width.
    const trigger = triggerFor(container, "react");
    expect(indicator.style.getPropertyValue("--width")).toBe(`${trigger.offsetWidth}px`);
    expect(getComputedStyle(indicator).width).toBe(`${trigger.offsetWidth}px`);

    triggerFor(container, "solid").click();

    await vi.waitFor(() =>
      expect(indicator.style.getPropertyValue("--left")).toBe(
        `${triggerFor(container, "solid").offsetLeft}px`,
      ),
    );
  });
});

describe("Tabs — the defaults a forwarded `undefined` must not delete", () => {
  it("keeps all five machine defaults when a wrapper forwards every one of them unset", async () => {
    // The only thing in the repo pinning the adapter's `compact()` at
    // `packages/core/src/zag/machine.ts:96`. `createTabs` writes no `withDefaults` call: the
    // machine's own `props({ props })` block is `{ orientation: "horizontal", activationMode:
    // "automatic", loopFocus: true, composite: true, defaultValue: null, ...props }`, and that spread
    // is a presence merge — an `undefined` in the bag would overwrite every default with nothing. The
    // adapter dropping the undefined keys before the spread is what makes this pass, and `Basic`
    // forwards all five on every other test in this file.
    mounted = mount(() => (
      <Basic
        activationMode={undefined}
        composite={undefined}
        defaultValue={undefined}
        loopFocus={undefined}
        orientation={undefined}
      />
    ));
    const { container } = mounted;

    // `defaultValue: null` — nothing selected, rather than a crash or a first tab picked by accident.
    expect(partOf(container, "root").dataset.orientation).toBe("horizontal");
    expect(partOf(container, "list").getAttribute("aria-orientation")).toBe("horizontal");
    for (const value of ["react", "solid", "vue"]) {
      expect(triggerFor(container, value).getAttribute("aria-selected"), value).toBe("false");
    }
    // `composite: true` — a panel is focusable, and the selected trigger takes the set's one tab stop.
    expect(panelFor(container, "react").tabIndex).toBe(0);

    triggerFor(container, "vue").click();
    await settle();
    expect(triggerFor(container, "vue").tabIndex).toBe(0);
    expect(triggerFor(container, "react").tabIndex).toBe(-1);

    // `activationMode: "automatic"` selects what the arrow moves to, and `loopFocus: true` wraps past
    // the last trigger to reach it.
    triggerFor(container, "vue").focus();
    await settle();
    pressKey(triggerFor(container, "vue"), "ArrowRight");

    await vi.waitFor(() =>
      expect(triggerFor(container, "react").getAttribute("aria-selected")).toBe("true"),
    );
  });

  it("falls back to each part's own element when a wrapper forwards `as={undefined}`", () => {
    // `??`, never `merge`: a wrapper spreading an unset `as` resolves by presence and would hand
    // every part `undefined`, which `<Dynamic>` renders as nothing at all (`CLAUDE.md`, *The third
    // hazard*).
    mounted = mount(() => (
      <Tabs.Root as={undefined} defaultValue="react">
        <Tabs.List as={undefined}>
          <Tabs.Trigger as={undefined} value="react">
            React
          </Tabs.Trigger>
          <Tabs.Indicator as={undefined} />
        </Tabs.List>
        <Tabs.ContentGroup as={undefined} data-probe="group">
          <Tabs.Content as={undefined} value="react" data-probe="panel-react">
            React panel
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    ));
    const { container } = mounted;

    expect(partOf(container, "root").tagName).toBe("DIV");
    expect(partOf(container, "list").tagName).toBe("DIV");
    expect(partOf(container, "trigger").tagName).toBe("BUTTON");
    expect(partOf(container, "indicator").tagName).toBe("DIV");
    expect(panelFor(container, "react").tagName).toBe("DIV");
    expect(container.querySelector('[data-probe="group"]')?.tagName).toBe("DIV");
  });

  it("keeps both render-strategy defaults when a wrapper forwards them as `undefined`", () => {
    // `false`/`false` is what `RenderStrategyProps` declares and what Chakra leaves alone — it passes
    // Tabs no `defaultProps` at all, unlike Dialog. A presence merge here would flip the served shape
    // from "every panel present" to "only the selected one", silently.
    mounted = mount(() => (
      <Basic defaultValue="react" lazyMount={undefined} unmountOnExit={undefined} />
    ));

    expect(panelIn(mounted.container, "solid")).not.toBeNull();
    expect(panelFor(mounted.container, "solid").hidden).toBe(true);
  });

  it("stays a `button` when a wrapper forwards `type={undefined}` to a trigger", () => {
    // The default is the machine's, not ours, and it survives for a different reason than a
    // `withDefaults` one would: the adapter's `mergeProps` resolves a non-composing key to the last
    // **defined** value, so an `undefined` from the consumer does not delete it. Without that this
    // control submits whatever form it sits in (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => (
      <Tabs.Root defaultValue="react">
        <Tabs.List>
          <Tabs.Trigger value="react" type={undefined}>
            React
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    ));

    expect(triggerFor(mounted.container, "react").getAttribute("type")).toBe("button");
  });
});

describe("Tabs — the props context, and which side of it wins", () => {
  it("reaches a Root that passes nothing", () => {
    mounted = mount(() => (
      <Tabs.PropsProvider value={{ variant: "plain" }}>
        <Basic defaultValue="react" />
      </Tabs.PropsProvider>
    ));

    // `plain` leaves the list on the base layer's `inline-flex`; `line` — the recipe's own default —
    // would have overridden it to `flex`.
    expect(getComputedStyle(partOf(mounted.container, "list")).display).toBe("inline-flex");
  });

  it("loses to a Root that passes the same prop itself", () => {
    // Chakra's order, and resolved by **value** rather than presence: `withContextDefaults` is what
    // stops a wrapper forwarding an unset `variant` from beating the provider above it with
    // `undefined`.
    mounted = mount(() => (
      <Tabs.PropsProvider value={{ variant: "plain" }}>
        <Basic defaultValue="react" variant="line" />
      </Tabs.PropsProvider>
    ));

    expect(getComputedStyle(partOf(mounted.container, "list")).display).toBe("flex");
  });

  it("does not reach a Root through a forwarded `undefined`", () => {
    mounted = mount(() => (
      <Tabs.PropsProvider value={{ variant: "plain" }}>
        <Basic defaultValue="react" variant={undefined} />
      </Tabs.PropsProvider>
    ));

    expect(getComputedStyle(partOf(mounted.container, "list")).display).toBe("inline-flex");
  });
});

describe("Tabs — the a11y baseline of five shapes", () => {
  it("runs clean on the default tree, and on the four configurations that change its markup", async () => {
    // Five trees rather than one, because each of them rewrites an ARIA relationship: `lazyMount`
    // removes the panels an `aria-controls` could name, `vertical` sets `aria-orientation`, a
    // disabled trigger adds `aria-disabled`, and `composite={false}` takes every `tabIndex` to `-1`.
    //
    // Zero allowances is the expectation for this row. In particular the roleless `Tabs.Indicator`
    // inside the tablist raises no `aria-required-children`: axe only requires that a `tablist`'s
    // *owned* elements be tabs, and a `div` with no role owns nothing. Nothing here invents a role
    // for it, and nothing should.
    const trees = {
      default: () => <Basic defaultValue="react" />,
      lazyMount: () => <Basic defaultValue="react" lazyMount />,
      vertical: () => <Basic defaultValue="react" orientation="vertical" />,
      disabled: () => <Basic defaultValue="svelte" />,
      nonComposite: () => <Basic defaultValue="react" composite={false} />,
    };

    for (const [name, tree] of Object.entries(trees)) {
      mounted?.dispose();
      const current = mount(tree);
      mounted = current;

      // Not "one turn after mount": the indicator is served `hidden` and un-hides itself off the
      // machine's first measurement, so an axe run before that is scoring a tree the reader never
      // sees.
      await vi.waitFor(() => expect(partOf(current.container, "indicator").hidden).toBe(false));

      await expectNoA11yViolations(current.container).catch((error: Error) => {
        throw new Error(`${name}: ${error.message}`);
      });
    }
  });
});

describe("Tabs — server render, then hydrate a selected set", () => {
  /** A probe on the hydrated tree; the entry gives every element one, machine part or not. */
  function probeIn(container: ParentNode, probe: string): HTMLElement {
    const element = container.querySelector(`[data-probe="${probe}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`the hydrated tree is missing its [data-probe="${probe}"] element`);
    }
    return element;
  }

  it("reuses every server node, and mounts only the panels the server sent", () => {
    // The half neither other project can see. `hydrateFixture` asserts the contract itself —
    // hydration was silent, no element was added or dropped, every server node survived as the same
    // object — so what is left here is the shape each root was *supposed* to arrive in.
    const { container, dispose } = hydrateFixture(tabsServerHtml, () => <Tree />);

    // Root a — nothing lazy, so both panels are in the markup and the de-selected one is `hidden`.
    expect(probeIn(container, "a-content-react").hidden).toBe(false);
    expect(probeIn(container, "a-content-solid").hidden).toBe(true);

    // Root b — `lazyMount unmountOnExit`, so two of the three panels contribute no hydration keys on
    // either side. The `ContentGroup` around them is not a machine part and has no presence of its
    // own, so its own key is fixed whatever the panels do.
    const group = probeIn(container, "b-group");
    expect(group.children).toHaveLength(1);
    expect(probeIn(container, "b-content-one").hidden).toBe(false);
    expect(container.querySelector('[data-probe="b-content-two"]')).toBeNull();
    expect(container.querySelector('[data-probe="b-content-three"]')).toBeNull();

    dispose();
  });

  it("clears the `data-ssr` the server wrote on every trigger", async () => {
    // The attribute divergence, and the only assertion in this file where the two builds *disagreeing*
    // is the correct outcome. `context.ssr` starts `true` and the machine's `entry` action clears it —
    // and `entry` runs when a machine starts, which never happens on a server. So a trigger still
    // carrying `data-ssr` after hydration is one whose machine never started, which is what a silent
    // client-render fallback looks like from the outside.
    expect(tabsServerHtml.match(/data-ssr/g)).toHaveLength(
      (tabsServerHtml.match(/data-part="trigger"/g) ?? []).length,
    );

    const { container, dispose } = hydrateFixture(tabsServerHtml, () => <Tree />);

    // Synchronously, with no waiting: `useMachine` starts the machine in an effect, and Solid flushes
    // a hydration render's effects before `hydrate()` returns. So the very first frame a reader could
    // see already has the served flag off every trigger.
    expect(container.querySelectorAll('[data-part="trigger"][data-ssr]')).toHaveLength(0);

    // And the flag's one consumer hands over in the same breath: the `plain` recipe paints the
    // selected trigger's background from `[data-selected][data-ssr]` so a served page is not missing
    // its highlight, and the indicator — served `hidden`, since its rect starts empty — takes that job
    // over once it has measured a trigger, which is a `raf` away.
    await vi.waitFor(() => expect(probeIn(container, "a-indicator").hidden).toBe(false));

    dispose();
  });

  it("keeps the sibling after a render prop and a `render`ed anchor aligned", () => {
    // Neither the `Tabs.Context` render prop nor the anchor has an element the machine owns, and
    // both sit before `after` in document order. If either spent a different number of hydration
    // keys on the two builds, this span is the first thing that would hydrate against the wrong
    // node — and `hydrateFixture`'s node-reuse check is what would catch it.
    const { container, dispose } = hydrateFixture(tabsServerHtml, () => <Tree />);

    expect(probeIn(container, "after").textContent).toBe("after");
    // The render prop is called in the part's body rather than a tracking scope, so it returns JSX
    // and the `Show` inside it is what reads the machine.
    expect(probeIn(container, "c-label").textContent).toBe("home");

    const anchor = probeIn(container, "c-trigger-docs");
    expect(anchor.tagName).toBe("A");
    expect(anchor.getAttribute("href")).toBe("/docs");
    expect(anchor.dataset.part).toBe("trigger");

    dispose();
  });

  it("runs the machine after hydration, on the server's own nodes", async () => {
    const { container, dispose } = hydrateFixture(tabsServerHtml, () => <Tree />);

    const solidTrigger = probeIn(container, "a-trigger-solid");
    const solidPanel = probeIn(container, "a-content-solid");
    const reactPanel = probeIn(container, "a-content-react");

    solidTrigger.click();

    // Not `settle()`: a de-selected panel is not hidden in the same turn. Its presence keeps
    // `hidden: false` until the `raf` in which it reads `animation-name` and finds nothing to wait
    // for, so the pair only settles a frame later.
    await vi.waitFor(() => {
      expect(solidPanel.hidden).toBe(false);
      expect(reactPanel.hidden).toBe(true);
    });

    // `createUniqueId()` is a different function in the server build and the hydrating client build,
    // and they agree only while both walk the same counter. An id that shifted would leave the
    // trigger's IDREF pointing at nothing.
    expect(solidTrigger.getAttribute("aria-controls")).toBe(solidPanel.id);
    expect(document.getElementById(solidPanel.id)).toBe(solidPanel);

    // The same objects the server sent, still — the machine drove them rather than replacing them.
    expect(probeIn(container, "a-content-solid")).toBe(solidPanel);
    expect(probeIn(container, "a-content-react")).toBe(reactPanel);

    dispose();
  });

  it("mounts a panel the server never sent, under `unmountOnExit`", async () => {
    // The count divergence, driven the only direction a consumer can drive it: root b served one
    // panel of three, and selecting another has to build an element that was in neither build's
    // markup — beside a `ContentGroup` the server did send, which keeps its own node.
    const { container, dispose } = hydrateFixture(tabsServerHtml, () => <Tree />);

    const group = probeIn(container, "b-group");
    probeIn(container, "b-trigger-two").click();

    await vi.waitFor(() =>
      expect(group.querySelector('[data-probe="b-content-two"]')).not.toBeNull(),
    );
    await vi.waitFor(() =>
      expect(container.querySelector('[data-probe="b-content-one"]')).toBeNull(),
    );
    expect(probeIn(container, "b-group")).toBe(group);

    dispose();
  });
});
