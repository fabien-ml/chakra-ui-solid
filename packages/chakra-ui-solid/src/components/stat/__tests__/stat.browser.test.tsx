import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Stat, StatGroup } from "../index";

/**
 * Computed styles throughout, never class names: `sva()` computes a class whether or not Panda
 * generated a rule for it, so a class-name assertion passes on a completely unstyled element.
 */

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function probe(container: ParentNode, name: string): HTMLElement {
  const element = container.querySelector(`[data-probe="${name}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-probe="${name}"] element`);
  }
  return element;
}

function Visitors(props: { size?: "sm" | "md" | "lg" }) {
  return (
    <Stat.Root data-probe="root" size={props.size}>
      <Stat.Label data-probe="label">Unique visitors</Stat.Label>
      <Stat.ValueText data-probe="value">
        192.1 <Stat.ValueUnit data-probe="unit">k</Stat.ValueUnit>
      </Stat.ValueText>
      <Stat.HelpText data-probe="help">since last month</Stat.HelpText>
    </Stat.Root>
  );
}

describe("Stat — anatomy", () => {
  it("renders a description list, each part in its own slot", () => {
    mounted = mount(() => <Visitors />);
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("DL");
    expect(probe(container, "label").tagName).toBe("DT");
    expect(probe(container, "value").tagName).toBe("DD");
    // A `span` inside a `dl` — not markup a `dl` allows, and exactly what upstream renders.
    expect(probe(container, "help").tagName).toBe("SPAN");

    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "root")).flexGrow).toBe("1");
    expect(getComputedStyle(probe(container, "label")).columnGap).toBe("6px");
    expect(getComputedStyle(probe(container, "value")).fontWeight).toBe("600");
    // The unit sits inside the value and undoes its weight rather than inheriting it.
    expect(getComputedStyle(probe(container, "unit")).fontWeight).toBe("400");
  });

  it("gives each trend arrow its glyph and its `data-type`, both as defaults", () => {
    mounted = mount(() => (
      <Stat.Root>
        <Stat.HelpText>
          <Stat.UpIndicator data-probe="up" />
          <Stat.DownIndicator data-probe="down" />
        </Stat.HelpText>
      </Stat.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "up").getAttribute("data-type")).toBe("up");
    expect(probe(container, "down").getAttribute("data-type")).toBe("down");
    expect(probe(container, "up").querySelector("svg")).not.toBeNull();
    expect(probe(container, "down").querySelector("svg")).not.toBeNull();

    // The attribute is the whole of what separates them: one selector each, two colours.
    const up = getComputedStyle(probe(container, "up")).color;
    const down = getComputedStyle(probe(container, "down")).color;
    expect(up).not.toBe(down);
    expect(getComputedStyle(probe(container, "up")).justifyContent).toBe("center");
  });

  it("keeps `data-type` when a wrapper forwards it unset", () => {
    // `merge` resolves a key by presence, so a forwarded `undefined` would delete the default and
    // the arrow would lose its colour (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => (
      <Stat.Root>
        <Stat.UpIndicator data-probe="up" data-type={undefined} />
      </Stat.Root>
    ));

    expect(probe(mounted.container, "up").getAttribute("data-type")).toBe("up");
  });

  it("lets a consumer replace an arrow entirely", () => {
    mounted = mount(() => (
      <Stat.Root>
        <Stat.UpIndicator data-probe="up">▲</Stat.UpIndicator>
      </Stat.Root>
    ));
    const up = probe(mounted.container, "up");

    expect(up.querySelector("svg")).toBeNull();
    expect(up.textContent).toBe("▲");
  });

  it("draws no arrow for a `null` child, and still draws one for an omitted child", () => {
    // `{cond() ? <Icon/> : null}` is ordinary Solid, and Chakra's `mergeProps` yields a default
    // only to `undefined` — so a `null` child empties the span upstream. `??` would put the arrow
    // back and quietly overrule what the consumer wrote. One helper mints both indicators, so the
    // down arrow is the same getter.
    mounted = mount(() => (
      <Stat.Root>
        <Stat.HelpText>
          <Stat.UpIndicator data-probe="null-up">{null}</Stat.UpIndicator>
          <Stat.UpIndicator data-probe="omitted-up" />
          <Stat.DownIndicator data-probe="null-down">{null}</Stat.DownIndicator>
          <Stat.DownIndicator data-probe="omitted-down" />
        </Stat.HelpText>
      </Stat.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "null-up").querySelector("svg")).toBeNull();
    expect(probe(container, "omitted-up").querySelector("svg")).not.toBeNull();
    expect(probe(container, "null-down").querySelector("svg")).toBeNull();
    expect(probe(container, "omitted-down").querySelector("svg")).not.toBeNull();
  });

  it("sizes an arrow's glyph to the text it sits in", () => {
    mounted = mount(() => (
      <Stat.Root>
        <Stat.HelpText data-probe="help">
          <Stat.UpIndicator data-probe="up" />
          23.36%
        </Stat.HelpText>
      </Stat.Root>
    ));
    const glyph = probe(mounted.container, "up").querySelector("svg");
    if (glyph === null) {
      throw new Error("expected the indicator to hold a glyph");
    }

    const indicatorFontSize = Number.parseFloat(
      getComputedStyle(probe(mounted.container, "up")).fontSize,
    );
    expect(Number.parseFloat(getComputedStyle(glyph).width)).toBeCloseTo(indicatorFontSize, 1);
  });
});

describe("Stat — the recipe", () => {
  it("resizes the value and nothing else", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => <Visitors size={size()} />);
    const container = mounted.container;

    const labelSize = getComputedStyle(probe(container, "label")).fontSize;
    expect(getComputedStyle(probe(container, "value")).fontSize).toBe("20px");

    flush(() => setSize("lg"));

    expect(getComputedStyle(probe(container, "value")).fontSize).toBe("30px");
    // The label held its own size across the change — `size` reaches one slot.
    expect(getComputedStyle(probe(container, "label")).fontSize).toBe(labelSize);
  });

  it("keeps the variant prop off the element", () => {
    mounted = mount(() => <Visitors size="lg" />);

    expect(probe(mounted.container, "root").hasAttribute("size")).toBe(false);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Stat.Root data-probe="root" unstyled>
        <Stat.ValueText data-probe="value">192.1k</Stat.ValueText>
      </Stat.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("row");
    expect(getComputedStyle(probe(container, "value")).fontWeight).toBe("400");
  });
});

describe("Stat — the group, props context and a11y", () => {
  it("lays the row out and supplies `size` to every Stat inside it", () => {
    mounted = mount(() => (
      <StatGroup data-probe="group" size="lg">
        <Stat.Root>
          <Stat.ValueText data-probe="inherited">345,670</Stat.ValueText>
        </Stat.Root>
        <Stat.Root size="sm">
          <Stat.ValueText data-probe="local">45</Stat.ValueText>
        </Stat.Root>
      </StatGroup>
    ));
    const container = mounted.container;
    const group = probe(container, "group");

    expect(group.getAttribute("role")).toBe("group");
    expect(getComputedStyle(group).display).toBe("flex");
    expect(getComputedStyle(group).flexWrap).toBe("wrap");
    expect(getComputedStyle(group).justifyContent).toBe("space-around");
    expect(getComputedStyle(group).alignItems).toBe("flex-start");
    // The variant is the group's input, not the div's.
    expect(group.hasAttribute("size")).toBe(false);

    expect(getComputedStyle(probe(container, "inherited")).fontSize).toBe("30px");
    expect(getComputedStyle(probe(container, "local")).fontSize).toBe("20px");
  });

  it("keeps the four layout defaults when a wrapper forwards them unset", () => {
    // The measurement behind the `withDefaults` bag. Written as `display="flex" … {...props}` the
    // defaults are *gone* here: a JSX spread is a presence merge, so each forwarded `undefined`
    // wins, `css()` receives `undefined`, no rule is emitted, and the row flattens to a block
    // (`CLAUDE.md`, *The third hazard*).
    const Forwarding = (props: {
      display?: "flex" | "block";
      flexWrap?: "wrap" | "nowrap";
      justifyContent?: "space-around" | "center";
      alignItems?: "flex-start" | "center";
    }) => (
      <StatGroup
        data-probe="group"
        display={props.display}
        flexWrap={props.flexWrap}
        justifyContent={props.justifyContent}
        alignItems={props.alignItems}
      >
        <Stat.Root>
          <Stat.ValueText>345,670</Stat.ValueText>
        </Stat.Root>
      </StatGroup>
    );

    mounted = mount(() => <Forwarding />);
    const group = probe(mounted.container, "group");

    expect(getComputedStyle(group).display).toBe("flex");
    expect(getComputedStyle(group).flexWrap).toBe("wrap");
    expect(getComputedStyle(group).justifyContent).toBe("space-around");
    expect(getComputedStyle(group).alignItems).toBe("flex-start");
  });

  it("re-resolves every Stat below the group when its size changes", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => (
      <StatGroup size={size()}>
        <Stat.Root>
          <Stat.ValueText data-probe="value">345,670</Stat.ValueText>
        </Stat.Root>
      </StatGroup>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "value")).fontSize).toBe("20px");

    flush(() => setSize("lg"));

    expect(getComputedStyle(probe(container, "value")).fontSize).toBe("30px");
  });

  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <Stat.PropsProvider value={{ size: "lg" }}>
        <Stat.Root>
          <Stat.ValueText data-probe="inherited">192.1k</Stat.ValueText>
        </Stat.Root>
        <Stat.Root size={undefined}>
          <Stat.ValueText data-probe="forwarded">192.1k</Stat.ValueText>
        </Stat.Root>
        <Stat.Root size="sm">
          <Stat.ValueText data-probe="local">192.1k</Stat.ValueText>
        </Stat.Root>
      </Stat.PropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).fontSize).toBe("30px");
    expect(getComputedStyle(probe(container, "forwarded")).fontSize).toBe("30px");
    expect(getComputedStyle(probe(container, "local")).fontSize).toBe("20px");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Stat.Label />);
      dispose();
    }).toThrow(/Stat sub-components must be rendered inside a Stat root component/);
  });

  it("has no a11y violations without a help text", async () => {
    mounted = mount(() => (
      <StatGroup>
        <Stat.Root>
          <Stat.Label>Unique visitors</Stat.Label>
          <Stat.ValueText>
            192.1 <Stat.ValueUnit>k</Stat.ValueUnit>
          </Stat.ValueText>
        </Stat.Root>
      </StatGroup>
    ));

    await expectNoA11yViolations(mounted.container);
  });

  it("carries one inherited markup violation once a help text is added, and nothing else", async () => {
    // **Inherited, and measured rather than predicted.** `Stat.HelpText` is a `span` and the Root
    // is a `dl`, which may only directly contain `dt`, `dd`, `div`, `script` and `template` —
    // upstream renders exactly this pair, so the React version's markup is invalid the same way.
    // Both wrong the same way, so it ships and this pins that one violation. A consumer who needs
    // valid markup passes `as="dd"`.
    mounted = mount(() => <Visitors />);

    await expect(expectNoA11yViolations(mounted.container)).rejects.toThrow(
      /^axe-core found 1 violation\(s\):\n- \[serious\] definition-list/,
    );
  });

  it("clears that violation when the help text is rendered as a `dd`", async () => {
    mounted = mount(() => (
      <Stat.Root>
        <Stat.Label>Unique visitors</Stat.Label>
        <Stat.ValueText>192.1k</Stat.ValueText>
        <Stat.HelpText as="dd">since last month</Stat.HelpText>
      </Stat.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});
