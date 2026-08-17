import segmentGroupServerHtml from "virtual:hydration-fixture?id=segment-group";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, For } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Fieldset } from "../../fieldset";
import type {
  CreateSegmentGroupReturn,
  SegmentGroupItemState,
  SegmentGroupValueChangeDetails,
} from "../index";
import { createSegmentGroup, SegmentGroup } from "../index";
import { Tree } from "./segment-group.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a segmented control runs exactly one machine
 * for N segments — no presence, no per-segment service — so one turn of the queue is the whole wait.
 */
const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/**
 * An element by part, **scope-qualified with this component's own name**: the machine is
 * `@zag-js/radio-group` and every getter stamps `radio-group`, so finding anything at all here is
 * also the proof that the renamed anatomy landed over it.
 */
function partOf(container: ParentNode, part: string, scope = "segment-group"): HTMLElement {
  const element = container.querySelector(`[data-scope="${scope}"][data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

/** Every element of one part, in document order — the shape a repeated part is tested in. */
function partsOf(container: ParentNode, part: string): HTMLElement[] {
  return [
    ...container.querySelectorAll(`[data-scope="segment-group"][data-part="${part}"]`),
  ].filter((element): element is HTMLElement => element instanceof HTMLElement);
}

/** One segment's element of a part, found by the segment's own id rather than by position. */
function partForValue(container: ParentNode, part: string, value: string): HTMLElement {
  const found = partsOf(container, part).find((element) => element.id.endsWith(`:${value}`));
  if (found === undefined) {
    throw new Error(`expected a [data-part="${part}"] element for the "${value}" segment`);
  }
  return found;
}

function testId(container: ParentNode, id: string): HTMLElement {
  const element = container.querySelector(`[data-testid="${id}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-testid="${id}"] element`);
  }
  return element;
}

/** The real controls — the only things a click, a form and a screen reader actually touch. */
function inputsIn(container: ParentNode): HTMLInputElement[] {
  return [...container.querySelectorAll("input[type=radio]")].filter(
    (element): element is HTMLInputElement => element instanceof HTMLInputElement,
  );
}

/** The four inline custom properties the machine writes onto the indicator from the checked rect. */
function measuredRect(indicator: HTMLElement): Record<string, string> {
  return {
    left: indicator.style.getPropertyValue("--left"),
    top: indicator.style.getPropertyValue("--top"),
    width: indicator.style.getPropertyValue("--width"),
    height: indicator.style.getPropertyValue("--height"),
  };
}

const FRAMEWORKS = ["next", "vite", "astro"];

/**
 * Every prop is forwarded **by name** rather than spread, which is what puts each of them on the
 * forwarded-`undefined` path on every test in this file.
 */
function Basic(props: {
  defaultValue?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  itemDisabled?: boolean;
  name?: string;
  onValueChange?: (details: SegmentGroupValueChangeDetails) => void;
  orientation?: "horizontal" | "vertical";
  readOnly?: boolean;
  required?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  unstyled?: boolean;
  value?: string | null;
}) {
  return (
    <SegmentGroup.Root
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      invalid={props.invalid}
      name={props.name}
      onValueChange={props.onValueChange}
      orientation={props.orientation}
      readOnly={props.readOnly}
      required={props.required}
      size={props.size}
      unstyled={props.unstyled}
      value={props.value}
    >
      <SegmentGroup.Indicator />
      <For each={FRAMEWORKS}>
        {(framework) => (
          <SegmentGroup.Item
            value={framework}
            disabled={framework === "vite" ? props.itemDisabled : undefined}
          >
            <SegmentGroup.ItemText data-testid={`text-${framework}`}>
              {framework}
            </SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        )}
      </For>
    </SegmentGroup.Root>
  );
}

describe("SegmentGroup — a real machine through the adapter", () => {
  it("picks a segment on a click anywhere in it, because each item is a label", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partForValue(container, "item", "astro").click();
    await settle();

    expect(partForValue(container, "item", "astro").dataset.state).toBe("checked");
    expect(inputsIn(container).find((input) => input.value === "astro")?.checked).toBe(true);
  });

  it("moves the picked state between segments rather than accumulating it", async () => {
    mounted = mount(() => <Basic defaultValue="next" />);
    const { container } = mounted;

    partForValue(container, "item", "astro").click();
    await settle();

    const states = partsOf(container, "item").map((item) => item.dataset.state);
    expect(states).toEqual(["unchecked", "unchecked", "checked"]);
  });

  it("reports a controlled change upward rather than making it itself", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => <Basic value="next" onValueChange={onValueChange} />);
    const { container } = mounted;

    partForValue(container, "item", "astro").click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith({ value: "astro" });
    expect(partForValue(container, "item", "next").dataset.state).toBe("checked");
  });

  it("takes no click on a disabled segment while the rest of the group still works", async () => {
    mounted = mount(() => <Basic itemDisabled />);
    const { container } = mounted;

    partForValue(container, "item", "vite").click();
    await settle();
    expect(partForValue(container, "item", "vite").dataset.state).toBe("unchecked");

    partForValue(container, "item", "astro").click();
    await settle();
    expect(partForValue(container, "item", "astro").dataset.state).toBe("checked");
  });

  it("hands the machine to a `SegmentGroup.Context` render prop that returns JSX", async () => {
    mounted = mount(() => (
      <SegmentGroup.Root defaultValue="next">
        <SegmentGroup.Items items={FRAMEWORKS} />
        <SegmentGroup.Context>
          {(group) => <span data-testid="picked">{group.value}</span>}
        </SegmentGroup.Context>
      </SegmentGroup.Root>
    ));
    const { container } = mounted;

    expect(testId(container, "picked").textContent).toBe("next");

    partForValue(container, "item", "astro").click();
    await settle();

    // Tracked, because the callback returned JSX rather than a bare expression — the call happens
    // once, in the part's body, which is not a tracking scope.
    expect(testId(container, "picked").textContent).toBe("astro");
  });

  it("hands one segment's state to a `SegmentGroup.ItemContext` render prop", async () => {
    mounted = mount(() => (
      <SegmentGroup.Root>
        <SegmentGroup.Item value="next">
          <SegmentGroup.ItemText>Next</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
          <SegmentGroup.ItemContext>
            {(item) => <span data-testid="state">{String(item.checked)}</span>}
          </SegmentGroup.ItemContext>
        </SegmentGroup.Item>
      </SegmentGroup.Root>
    ));
    const { container } = mounted;

    expect(testId(container, "state").textContent).toBe("false");

    partForValue(container, "item", "next").click();
    await settle();
    expect(testId(container, "state").textContent).toBe("true");
  });

  it("drives a `RootProvider` from a machine the consumer owns", async () => {
    let group: CreateSegmentGroupReturn | undefined;

    mounted = mount(() => {
      group = createSegmentGroup({ defaultValue: "next" });
      return (
        <SegmentGroup.RootProvider value={group}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={FRAMEWORKS} />
        </SegmentGroup.RootProvider>
      );
    });
    const { container } = mounted;

    expect(group?.value).toBe("next");

    group?.setValue("astro");
    await settle();
    expect(partForValue(container, "item", "astro").dataset.state).toBe("checked");

    // No `defaultProps` on this Root, so the machine's own `vertical` stands — the one place in
    // this component where the orientation is not defaulted for you.
    expect(partOf(container, "root").getAttribute("aria-orientation")).toBe("vertical");
  });

  it("inherits a surrounding fieldset's states and its legend id", () => {
    mounted = mount(() => (
      <Fieldset.Root id="framework" disabled invalid>
        <Fieldset.Legend>Framework</Fieldset.Legend>
        <SegmentGroup.Root>
          <SegmentGroup.Items items={FRAMEWORKS} />
        </SegmentGroup.Root>
      </Fieldset.Root>
    ));
    const { container } = mounted;

    expect(partOf(container, "root").getAttribute("aria-labelledby")).toBe(
      "fieldset::framework::legend",
    );
    expect(partOf(container, "item").dataset.disabled).toBe("");
    expect(partOf(container, "item").dataset.invalid).toBe("");
  });

  it("defaults the orientation to horizontal, and takes vertical through to the machine", async () => {
    // The trap this row carries. `radioGroup` lets the machine's `vertical` stand and `radioCard`
    // never lets the prop reach the machine at all; here Chakra's `forwardProps: ["orientation"]`
    // plus a `"horizontal"` default means the same word has to do both jobs — the keyboard model
    // *and* the layout, which the recipe reads back off `data-orientation`.
    mounted = mount(() => <Basic />);
    expect(partOf(mounted.container, "root").getAttribute("aria-orientation")).toBe("horizontal");
    expect(getComputedStyle(partOf(mounted.container, "root")).flexDirection).toBe("row");

    mounted.dispose();
    mounted = mount(() => <Basic orientation="vertical" />);
    expect(partOf(mounted.container, "root").getAttribute("aria-orientation")).toBe("vertical");
    expect(getComputedStyle(partOf(mounted.container, "root")).flexDirection).toBe("column");
    await settle();
  });

  it("keeps that default when a wrapper forwards `orientation={undefined}`", () => {
    // `merge` resolves by presence, so `merge({ orientation: "horizontal" }, props)` would hand the
    // machine an `undefined` and it would fall back to its own `vertical` — a segmented control
    // stacked in a column with nothing to say why (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => <SegmentGroup.Root orientation={undefined} />);
    const root = partOf(mounted.container, "root");

    expect(root.getAttribute("aria-orientation")).toBe("horizontal");
    expect(root.dataset.orientation).toBe("horizontal");
  });

  it("keeps the raw `orientation` prop off the element the machine already described", () => {
    mounted = mount(() => <Basic orientation="vertical" />);
    expect(partOf(mounted.container, "root").getAttribute("orientation")).toBeNull();
  });
});

describe("SegmentGroup — shape E, reused on a third recipe", () => {
  /** A segment whose parts report what the item context handed them. */
  function Probe(props: { value: string }) {
    const seen: SegmentGroupItemState[] = [];
    return (
      <SegmentGroup.Item value={props.value}>
        <SegmentGroup.ItemContext>
          {(item) => {
            seen.push(item);
            return <span data-testid={`seen-${props.value}`}>{String(seen.length)}</span>;
          }}
        </SegmentGroup.ItemContext>
      </SegmentGroup.Item>
    );
  }

  it("builds one context per segment, once, and keeps it across state changes", async () => {
    mounted = mount(() => (
      <SegmentGroup.Root defaultValue="next">
        <For each={FRAMEWORKS}>{(framework) => <Probe value={framework} />}</For>
      </SegmentGroup.Root>
    ));
    const { container } = mounted;

    for (const framework of FRAMEWORKS) {
      expect(testId(container, `seen-${framework}`).textContent, framework).toBe("1");
    }

    partForValue(container, "item", "astro").click();
    await settle();

    // A state change re-reads the context; it never rebuilds it.
    for (const framework of FRAMEWORKS) {
      expect(testId(container, `seen-${framework}`).textContent, framework).toBe("1");
    }
  });

  it("round-trips each segment's props bag through the Root's getters, live", async () => {
    const [value, setValue] = createSignal("next");

    mounted = mount(() => (
      <SegmentGroup.Root>
        <SegmentGroup.Item value={value()}>
          <SegmentGroup.ItemText>Framework</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      </SegmentGroup.Root>
    ));
    const { container } = mounted;

    expect(inputsIn(container)[0]?.value).toBe("next");
    expect(partOf(container, "item-text").id).toContain(":label:next");

    // The bag is getters over the props, so a signal-driven `value` moves every part with it — and
    // the machine still owns the ids, because the bag went back through *its* getters.
    setValue("astro");
    await settle();

    expect(inputsIn(container)[0]?.value).toBe("astro");
    expect(partOf(container, "item-text").id).toContain(":label:astro");
  });

  it("builds the context inside a `<For>` with no untracked read", () => {
    // A `<For>` callback is a strict-read phase in SolidJS 2.0, so a `[STRICT_READ_UNTRACKED]`
    // here would be a genuine defect rather than a missing wrapper. `mount` throws on one.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    mounted = mount(() => <Basic defaultValue="vite" />);

    const messages = [...warn.mock.calls, ...error.mock.calls].flat().map(String);
    expect(messages.filter((message) => message.includes("STRICT_READ_UNTRACKED"))).toEqual([]);
    expect(partForValue(mounted.container, "item", "vite").dataset.state).toBe("checked");

    warn.mockRestore();
    error.mockRestore();
  });

  it("resolves the class map once on the Root, so every segment wears one string", () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    expect(new Set(partsOf(container, "item").map((item) => item.className)).size).toBe(1);
    expect(new Set(partsOf(container, "item-text").map((text) => text.className)).size).toBe(1);
  });

  it("throws from a part written outside an Item, naming the one to add", () => {
    expect(() =>
      mount(() => (
        <SegmentGroup.Root>
          <SegmentGroup.ItemText>Next</SegmentGroup.ItemText>
        </SegmentGroup.Root>
      )),
    ).toThrow(/SegmentGroup\.Item/);
  });

  it("throws from a part written outside a Root, naming that one too", () => {
    expect(() => mount(() => <SegmentGroup.Indicator />)).toThrow(/SegmentGroup/);
  });
});

describe("SegmentGroup — the `Items` shortcut", () => {
  it("renders three parts per entry, from either spelling", () => {
    mounted = mount(() => (
      <SegmentGroup.Root defaultValue="react">
        <SegmentGroup.Items items={["plain", { value: "react", label: "React", disabled: true }]} />
      </SegmentGroup.Root>
    ));
    const { container } = mounted;

    expect(partsOf(container, "item")).toHaveLength(2);
    expect(partsOf(container, "item-text").map((text) => text.textContent)).toEqual([
      "plain",
      "React",
    ]);
    expect(inputsIn(container).map((input) => input.value)).toEqual(["plain", "react"]);
    expect(partForValue(container, "item", "react").dataset.disabled).toBe("");
  });

  it("keeps every segment's element across a change to the list, because it is index-keyed", async () => {
    // `<For each keyed={false}>` is SolidJS 2.0's spelling of `<Index>`, and it is what this
    // shortcut owes the indicator: `normalize()` builds fresh objects whenever `items` does, so the
    // default identity-keyed `<For>` would replace every `<label>` on the tick — including the one
    // the machine had measured, whose rect the highlight is mid-transition to.
    const [items, setItems] = createSignal(["one", "two"]);

    mounted = mount(() => (
      <SegmentGroup.Root defaultValue="one">
        <SegmentGroup.Items items={items()} />
      </SegmentGroup.Root>
    ));
    const { container } = mounted;
    const first = partForValue(container, "item", "one");

    setItems(["one", "three"]);
    await settle();

    expect(partForValue(container, "item", "one")).toBe(first);
    expect(partsOf(container, "item-text").map((text) => text.textContent)).toEqual([
      "one",
      "three",
    ]);
  });

  it("applies its own props to every segment, over the entry's", () => {
    mounted = mount(() => (
      <SegmentGroup.Root>
        <SegmentGroup.Items items={["one", "two"]} disabled data-testid="segment" />
      </SegmentGroup.Root>
    ));
    const { container } = mounted;

    for (const item of partsOf(container, "item")) {
      expect(item.dataset.disabled).toBe("");
      expect(item.dataset.testid).toBe("segment");
    }
  });
});

describe("SegmentGroup — the styles the slot recipe really generated", () => {
  it("lays the track out and paints its groove", () => {
    mounted = mount(() => <Basic />);
    const root = getComputedStyle(partOf(mounted.container, "root"));

    expect(root.display).toBe("inline-flex");
    expect(root.flexDirection).toBe("row");
    // `bg.muted`, which is `gray.100` in light mode — the recessed track the segments sit in.
    expect(root.backgroundColor).toBe("rgb(244, 244, 245)");
    expect(root.position).toBe("relative");
    expect(root.isolation).toBe("isolate");
    expect(root.boxShadow).not.toBe("none");
    expect(root.borderTopLeftRadius).not.toBe("0px");
  });

  it("centres each segment and gives it the separator rule the recipe draws", () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const item = partForValue(container, "item", "vite");

    expect(getComputedStyle(item).display).toBe("flex");
    expect(getComputedStyle(item).alignItems).toBe("center");
    expect(getComputedStyle(item).justifyContent).toBe("center");
    expect(getComputedStyle(item).position).toBe("relative");

    // The hairline between two segments is a `::before` on the item, not a border — and the
    // `_horizontal` block is what gives it a width rather than a height.
    const separator = getComputedStyle(item, "::before");
    expect(separator.content).toBe('""');
    expect(separator.position).toBe("absolute");
    expect(separator.width).toBe("1px");
    expect(separator.opacity).toBe("1");

    // The first segment never shows one, which is the `:first-of-type` arm of the same rule.
    expect(getComputedStyle(partForValue(container, "item", "next"), "::before").opacity).toBe("0");
  });

  it("turns the separator on its side under a vertical orientation", () => {
    mounted = mount(() => <Basic orientation="vertical" />);
    const separator = getComputedStyle(partForValue(mounted.container, "item", "vite"), "::before");

    expect(separator.height).toBe("1px");
  });

  it("sizes the segments from every one of the four `size` variants", () => {
    const heights: Record<string, string> = { xs: "24px", sm: "32px", md: "40px", lg: "44px" };
    const padding: Record<string, string> = { xs: "12px", sm: "16px", md: "16px", lg: "18px" };

    for (const size of ["xs", "sm", "md", "lg"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic size={size} />);
      const item = getComputedStyle(partForValue(mounted.container, "item", "next"));

      expect(item.height, size).toBe(heights[size]);
      expect(item.paddingInlineStart, size).toBe(padding[size]);
    }
  });

  it("keeps the default `md` when the `size` variant is left unset", () => {
    mounted = mount(() => <Basic size={undefined} />);
    expect(getComputedStyle(partForValue(mounted.container, "item", "next")).height).toBe("40px");
  });

  it("dims a disabled group without changing what it draws", () => {
    mounted = mount(() => <Basic disabled />);
    expect(getComputedStyle(partForValue(mounted.container, "item", "next")).opacity).toBe("0.5");
  });

  it("leaves every part with the browser's own styles under a Root-level `unstyled`", () => {
    mounted = mount(() => <Basic unstyled defaultValue="next" />);
    const { container } = mounted;

    expect(getComputedStyle(partOf(container, "root")).display).toBe("block");
    expect(getComputedStyle(partOf(container, "root")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(partForValue(container, "item", "next")).height).not.toBe("40px");

    // The indicator keeps `position: absolute`, because that is the **machine's** inline style
    // rather than the recipe's — `unstyled` opts out of the theme, not out of the behaviour. What
    // it does drop is the paint: no background, no shadow, and a `--width` nothing reads.
    const indicator = getComputedStyle(partOf(container, "indicator"));
    expect(indicator.position).toBe("absolute");
    expect(indicator.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(indicator.boxShadow).toBe("none");
  });

  it("keeps that opt-out when a wrapper forwards `unstyled={undefined}`", () => {
    mounted = mount(() => <Basic unstyled={undefined} />);
    expect(getComputedStyle(partOf(mounted.container, "root")).display).toBe("inline-flex");
  });

  it("takes its variant from a `PropsProvider`, and lets a Root beat it", () => {
    mounted = mount(() => (
      <SegmentGroup.PropsProvider value={{ size: "lg" }}>
        <SegmentGroup.Root data-testid="from-provider">
          <SegmentGroup.Items items={["one"]} />
        </SegmentGroup.Root>
        <SegmentGroup.Root size="xs" data-testid="own">
          <SegmentGroup.Items items={["two"]} />
        </SegmentGroup.Root>
      </SegmentGroup.PropsProvider>
    ));
    const { container } = mounted;

    expect(getComputedStyle(partForValue(container, "item", "one")).height).toBe("44px");
    expect(getComputedStyle(partForValue(container, "item", "two")).height).toBe("24px");
  });

  it("keeps the provider's variant when a Root forwards an unset one", () => {
    // `withContextDefaults` resolves by value, so a wrapper spelling `size={props.size}` with
    // nothing to forward does not beat the provider above it with `undefined`.
    mounted = mount(() => (
      <SegmentGroup.PropsProvider value={{ size: "lg" }}>
        <Basic size={undefined} />
      </SegmentGroup.PropsProvider>
    ));

    expect(getComputedStyle(partForValue(mounted.container, "item", "next")).height).toBe("44px");
  });
});

describe("SegmentGroup — the indicator the machine measures", () => {
  /** The machine starts in `onSettled`, and clearing `data-ssr` is its own signal that it has. */
  async function started(container: ParentNode): Promise<void> {
    await vi.waitFor(() => expect(partOf(container, "item").hasAttribute("data-ssr")).toBe(false));
  }

  it("writes the checked segment's offset rect as four inline custom properties", async () => {
    mounted = mount(() => <Basic defaultValue="vite" />);
    const { container } = mounted;
    await started(container);

    const item = partForValue(container, "item", "vite");
    const indicator = partOf(container, "indicator");

    await vi.waitFor(() => expect(measuredRect(indicator).width).not.toBe(""));

    // The four are `dom.getOffsetRect(radioEl)` verbatim, and the offset parent is the root, whose
    // `position: relative` the machine's own inline style supplies.
    expect(measuredRect(indicator)).toEqual({
      left: `${item.offsetLeft}px`,
      top: `${item.offsetTop}px`,
      width: `${item.offsetWidth}px`,
      height: `${item.offsetHeight}px`,
    });

    // …and the recipe reads all four back through `var()`, which is the half no attribute assertion
    // can see. A `--width` that arrived under a different name leaves the highlight at zero.
    const drawn = getComputedStyle(indicator);
    expect(drawn.width).toBe(`${item.offsetWidth}px`);
    expect(drawn.height).toBe(`${item.offsetHeight}px`);
    expect(drawn.left).toBe(`${item.offsetLeft}px`);
    expect(drawn.position).toBe("absolute");
    // `zIndex: -1` against the root's `isolation: isolate` is what keeps it behind the labels.
    expect(drawn.zIndex).toBe("-1");
    // `--segment-indicator-bg` is `colors.bg` in light mode; `--segment-indicator-shadow` is
    // `shadows.sm`. Both are declared on the root and read here.
    expect(drawn.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(drawn.boxShadow).not.toBe("none");
  });

  it("stays out of the document's way while nothing is picked", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    await started(container);

    const indicator = partOf(container, "indicator");
    expect(indicator.hasAttribute("hidden")).toBe(true);
    expect(getComputedStyle(indicator).display).toBe("none");
  });

  it("does not slide on the first paint, and does on a real change", async () => {
    mounted = mount(() => <Basic defaultValue="next" />);
    const { container } = mounted;
    await started(container);

    const indicator = partOf(container, "indicator");
    await vi.waitFor(() => expect(measuredRect(indicator).width).not.toBe(""));

    // `animateIndicator` starts `false`, so the highlight appears where it belongs rather than
    // travelling in from the corner of the track.
    expect(getComputedStyle(indicator).transitionProperty).toBe("none");
    expect(getComputedStyle(indicator).transitionDuration).toBe("0s");

    const before = measuredRect(indicator);
    partForValue(container, "item", "astro").click();
    await settle();

    const after = measuredRect(indicator);
    expect(after.left).not.toBe(before.left);
    expect(after.left).toBe(`${partForValue(container, "item", "astro").offsetLeft}px`);
    // …and `syncIndicatorAnimation` turned the transition on for the move, which is what
    // `--transition-property` names.
    expect(getComputedStyle(indicator).transitionProperty).toBe("left, top, width, height");
  });

  it("lets a consumer's own inline style sit on top of the four rather than replace them", async () => {
    mounted = mount(() => (
      <SegmentGroup.Root defaultValue="one">
        <SegmentGroup.Indicator style={{ "border-width": "2px" }} />
        <SegmentGroup.Items items={["one", "two"]} />
      </SegmentGroup.Root>
    ));
    const { container } = mounted;
    await started(container);

    const indicator = partOf(container, "indicator");
    await vi.waitFor(() => expect(measuredRect(indicator).width).not.toBe(""));

    expect(indicator.style.borderWidth).toBe("2px");
    expect(measuredRect(indicator).width).not.toBe("");
  });

  it("takes the recipe's own custom properties from a `css` prop on the Root", async () => {
    // The documented way to repaint the highlight, and the one the docs page shows.
    mounted = mount(() => (
      <SegmentGroup.Root defaultValue="one" css={{ "--segment-indicator-bg": "colors.teal.500" }}>
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={["one", "two"]} />
      </SegmentGroup.Root>
    ));
    const { container } = mounted;
    await started(container);

    expect(getComputedStyle(partOf(container, "indicator")).backgroundColor).toBe(
      "rgb(20, 184, 166)",
    );
  });
});

describe("SegmentGroup — `data-ssr`, the stand-in for a highlight nothing has measured", () => {
  /**
   * The served page, in the document with no script having run against it — which is the only state
   * the `&[data-state=checked][data-ssr]` rule is ever visible in.
   */
  function serveOnly(html: string): { container: HTMLElement; remove: () => void } {
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    return { container, remove: () => container.remove() };
  }

  function probeIn(container: ParentNode, probe: string): HTMLElement {
    const element = container.querySelector(`[data-probe="${probe}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`the tree is missing its [data-probe="${probe}"] element`);
    }
    return element;
  }

  it("paints the served segment the highlight it cannot draw yet", () => {
    // **This row's reason to exist.** `segmentGroup` and `tabs` are the only two recipes in the
    // preset that select on `data-ssr`, and the flag is written by a machine named after neither.
    // Without the rule a served segmented control shows no selection at all until the machine boots
    // and the indicator measures a rect — a flash on every hard reload, and nothing reports it.
    const { container, remove } = serveOnly(segmentGroupServerHtml);

    const checked = getComputedStyle(probeIn(container, "a-item-astro"));
    expect(checked.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(checked.boxShadow).not.toBe("none");
    expect(checked.borderTopLeftRadius).not.toBe("0px");

    const resting = getComputedStyle(probeIn(container, "a-item-next"));
    expect(resting.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(resting.boxShadow).toBe("none");

    // And the element that will take the job over is not drawing yet: no rect, so `hidden`.
    expect(getComputedStyle(probeIn(container, "a-indicator")).display).toBe("none");

    remove();
  });

  it("hands the drawing to the indicator once the machine starts, on the same nodes", async () => {
    expect(segmentGroupServerHtml).toContain("data-ssr");

    const { container, dispose } = hydrateFixture(segmentGroupServerHtml, () => <Tree />);
    const item = probeIn(container, "a-item-astro");
    const indicator = probeIn(container, "a-indicator");

    await vi.waitFor(() => expect(item.hasAttribute("data-ssr")).toBe(false));

    // The stand-in is gone from the segment…
    expect(getComputedStyle(item).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(item).boxShadow).toBe("none");

    // …and the indicator the server sent `hidden`, with none of the four properties, is now drawing
    // the same box over the same segment.
    await vi.waitFor(() => expect(indicator.style.getPropertyValue("--width")).not.toBe(""));
    expect(indicator.hasAttribute("hidden")).toBe(false);
    expect(getComputedStyle(indicator).width).toBe(`${item.offsetWidth}px`);
    expect(getComputedStyle(indicator).left).toBe(`${item.offsetLeft}px`);
    expect(getComputedStyle(indicator).backgroundColor).toBe("rgb(255, 255, 255)");

    dispose();
  });

  it("clears the flag on the item and its text, and never wrote it on the rest", async () => {
    const { container, dispose } = hydrateFixture(segmentGroupServerHtml, () => <Tree />);
    const item = probeIn(container, "a-item-next");

    await vi.waitFor(() => expect(item.hasAttribute("data-ssr")).toBe(false));
    expect(probeIn(container, "a-text-next").hasAttribute("data-ssr")).toBe(false);
    expect(probeIn(container, "a-root").hasAttribute("data-ssr")).toBe(false);
    expect(probeIn(container, "a-indicator").hasAttribute("data-ssr")).toBe(false);

    dispose();
  });
});

describe("SegmentGroup — accessibility", () => {
  /**
   * The one allowance a bare segmented control buys, and it is **upstream's shape rather than
   * ours**.
   *
   * `getRootProps()` writes `aria-labelledby` unconditionally, pointing at the machine's `label`
   * id — and this component ships **no `Label` part**: the anatomy names the slot, the recipe gives
   * it no body, and Chakra exports no component for it. So a `<SegmentGroup.Root>` standing alone
   * always references an element that does not exist, on chakra-ui.com exactly as here, and axe
   * declines to judge the IDREF rather than failing it.
   *
   * The composition that clears it is the last case below, which buys no allowance: a
   * `Fieldset.Legend` supplies the id the machine then adopts as its own. That is what a labelled
   * segmented control is in both libraries (`CLAUDE.md`, *the port rule* — both are wrong the same
   * way, so ours is too).
   */
  const UNLABELLED_GROUP_INCOMPLETE = ["aria-valid-attr-value"] as const;

  it("has no violations in any of the states a page really serves", async () => {
    const cases: Array<[string, () => Element, readonly string[]]> = [
      ["default", () => mount(() => <Basic />).container, UNLABELLED_GROUP_INCOMPLETE],
      [
        "checked",
        () => mount(() => <Basic defaultValue="next" />).container,
        UNLABELLED_GROUP_INCOMPLETE,
      ],
      ["disabled", () => mount(() => <Basic disabled />).container, UNLABELLED_GROUP_INCOMPLETE],
      ["invalid", () => mount(() => <Basic invalid />).container, UNLABELLED_GROUP_INCOMPLETE],
      [
        "item disabled",
        () => mount(() => <Basic itemDisabled />).container,
        UNLABELLED_GROUP_INCOMPLETE,
      ],
      [
        "vertical",
        () => mount(() => <Basic orientation="vertical" />).container,
        UNLABELLED_GROUP_INCOMPLETE,
      ],
      [
        // The composition a segmented control is normally written in — and the one that buys **no
        // allowance**, because the legend is a real element the machine's `aria-labelledby` can
        // point at.
        "in a fieldset",
        () =>
          mount(() => (
            <Fieldset.Root>
              <Fieldset.Legend>Framework</Fieldset.Legend>
              <SegmentGroup.Root defaultValue="next">
                <SegmentGroup.Indicator />
                <SegmentGroup.Items items={FRAMEWORKS} />
              </SegmentGroup.Root>
            </Fieldset.Root>
          )).container,
        [],
      ],
    ];

    for (const [name, render, allowIncomplete] of cases) {
      mounted?.dispose();
      mounted = undefined;
      const container = render();
      // `name` is only here so a failure says which state it was in; axe reports against the
      // container it was handed.
      try {
        await expectNoA11yViolations(container, { allowIncomplete });
      } catch (failure) {
        throw new Error(`${name}: ${(failure as Error).message}`);
      }
      container.remove();
    }
  });
});

describe("SegmentGroup — server render, then hydrate", () => {
  function probeIn(container: ParentNode, probe: string): HTMLElement {
    const element = container.querySelector(`[data-probe="${probe}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`the hydrated tree is missing its [data-probe="${probe}"] element`);
    }
    return element;
  }

  it("reuses every server node across a hand-written list, the shortcut and an empty group", () => {
    // `hydrateFixture` asserts the contract itself — hydration was silent, no element was added or
    // dropped, every server node survived as the same object — so what is left here is the shape
    // the tree was *supposed* to arrive in. The half this subject adds: a `<For>` and an
    // index-keyed `<SegmentGroup.Items>` of the same length have to spend keys identically, or the
    // sibling after them lands on the wrong node.
    const { container, dispose } = hydrateFixture(segmentGroupServerHtml, () => <Tree />);

    expect(
      container.querySelectorAll('[data-scope="segment-group"][data-part="item"]'),
    ).toHaveLength(12);

    expect(probeIn(container, "a-text-astro").textContent).toBe("astro");
    expect((probeIn(container, "a-input-astro") as HTMLInputElement).checked).toBe(true);
    expect((probeIn(container, "a-input-next") as HTMLInputElement).checked).toBe(false);

    // The render prop is called in the part's body rather than a tracking scope, so it returns JSX
    // and the `Show` inside it is what reads the segment.
    expect(probeIn(container, "c-state-one").textContent).toBe("picked");
    expect(probeIn(container, "c-state-two").textContent).toBe("—");

    expect(probeIn(container, "after").textContent).toBe("after");

    dispose();
  });

  it("keeps every segment's ids and slot classes identical on both builds", () => {
    const { container, dispose } = hydrateFixture(segmentGroupServerHtml, () => <Tree />);

    for (const framework of ["next", "vite", "astro", "remix", "nuxt"]) {
      expect(probeIn(container, `a-text-${framework}`).id).toContain(`:label:${framework}`);
    }

    const classes = [...container.querySelectorAll('[data-probe^="a-item-"]')].map(
      (element) => element.className,
    );
    expect(new Set(classes).size).toBe(1);

    dispose();
  });

  it("moves the highlight after hydration, against the nodes the server sent", async () => {
    const { container, dispose } = hydrateFixture(segmentGroupServerHtml, () => <Tree />);
    const indicator = probeIn(container, "a-indicator");

    await vi.waitFor(() => expect(indicator.style.getPropertyValue("--width")).not.toBe(""));

    probeIn(container, "a-item-nuxt").click();
    await vi.waitFor(() => expect(probeIn(container, "a-item-nuxt").dataset.state).toBe("checked"));

    expect(indicator.style.getPropertyValue("--left")).toBe(
      `${probeIn(container, "a-item-nuxt").offsetLeft}px`,
    );

    dispose();
  });
});
