import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, For, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { DataList } from "../index";

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

function probeAll(container: ParentNode, name: string): HTMLElement[] {
  return [...container.querySelectorAll(`[data-probe="${name}"]`)].filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
}

const facts = [
  { label: "First Name", value: "Jassie" },
  { label: "Last Name", value: "Bhatia" },
  { label: "Email", value: "jassie@jassie.dev" },
];

describe("DataList — anatomy", () => {
  it("renders a dl whose items are divs of dt and dd", () => {
    mounted = mount(() => (
      <DataList.Root data-probe="root">
        <DataList.Item data-probe="item">
          <DataList.ItemLabel data-probe="label">Name</DataList.ItemLabel>
          <DataList.ItemValue data-probe="value">John Doe</DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("DL");
    expect(probe(container, "item").tagName).toBe("DIV");
    expect(probe(container, "label").tagName).toBe("DT");
    expect(probe(container, "value").tagName).toBe("DD");

    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "label")).alignItems).toBe("center");
    // The value takes the width the label does not, and may shrink below its content.
    expect(getComputedStyle(probe(container, "value")).minWidth).toBe("0px");
    expect(getComputedStyle(probe(container, "value")).flexGrow).toBe("1");
  });

  it("styles every repeat of the item from one class map", () => {
    // The part is minted once and rendered per fact — there is nothing per-instance about it, and
    // this is the assertion that says so rather than assuming it.
    mounted = mount(() => (
      <DataList.Root size="lg">
        <For each={facts}>
          {(fact) => (
            <DataList.Item data-probe="item">
              <DataList.ItemLabel data-probe="label">{fact.label}</DataList.ItemLabel>
              <DataList.ItemValue>{fact.value}</DataList.ItemValue>
            </DataList.Item>
          )}
        </For>
      </DataList.Root>
    ));
    const container = mounted.container;

    const items = probeAll(container, "item");
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(getComputedStyle(item).fontSize).toBe("16px");
    }
    for (const label of probeAll(container, "label")) {
      expect(getComputedStyle(label).columnGap).toBe("4px");
    }
  });
});

describe("DataList — the recipe", () => {
  it("puts the label beside its value on `horizontal` and above it on `vertical`", () => {
    const [orientation, setOrientation] = createSignal<"vertical" | "horizontal">("vertical");
    mounted = mount(() => (
      <DataList.Root orientation={orientation()}>
        <DataList.Item data-probe="item">
          <DataList.ItemLabel data-probe="label">Name</DataList.ItemLabel>
          <DataList.ItemValue>John Doe</DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "item")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "label")).minWidth).toBe("auto");

    flush(() => setOrientation("horizontal"));

    expect(getComputedStyle(probe(container, "item")).flexDirection).toBe("row");
    // The 120px column is what lines a stack of horizontal items up with each other.
    expect(getComputedStyle(probe(container, "label")).minWidth).toBe("120px");
  });

  it("moves the whole scale with `size`", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => (
      <DataList.Root data-probe="root" size={size()}>
        <DataList.Item data-probe="item">
          <DataList.ItemLabel>Name</DataList.ItemLabel>
        </DataList.Item>
      </DataList.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).rowGap).toBe("12px");
    expect(getComputedStyle(probe(container, "item")).fontSize).toBe("12px");

    flush(() => setSize("lg"));

    expect(getComputedStyle(probe(container, "root")).rowGap).toBe("20px");
    expect(getComputedStyle(probe(container, "item")).fontSize).toBe("16px");
  });

  it("mutes the value instead of the label on `bold`", () => {
    mounted = mount(() => (
      <>
        <DataList.Root variant="subtle">
          <DataList.Item>
            <DataList.ItemLabel data-probe="subtle-label">Name</DataList.ItemLabel>
            <DataList.ItemValue data-probe="subtle-value">John Doe</DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root variant="bold">
          <DataList.Item>
            <DataList.ItemLabel data-probe="bold-label">Name</DataList.ItemLabel>
            <DataList.ItemValue data-probe="bold-value">John Doe</DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>
      </>
    ));
    const container = mounted.container;

    const subtleLabel = getComputedStyle(probe(container, "subtle-label")).color;
    const subtleValue = getComputedStyle(probe(container, "subtle-value")).color;
    const boldLabel = getComputedStyle(probe(container, "bold-label")).color;
    const boldValue = getComputedStyle(probe(container, "bold-value")).color;

    // The pair swaps: whichever half is muted on one variant is the plain one on the other.
    expect(subtleLabel).toBe(boldValue);
    expect(subtleValue).toBe(boldLabel);
    expect(getComputedStyle(probe(container, "bold-label")).fontWeight).toBe("500");
  });

  it("keeps the three variant props off the element", () => {
    mounted = mount(() => (
      <DataList.Root data-probe="root" orientation="horizontal" size="lg" variant="bold" />
    ));
    const root = probe(mounted.container, "root");

    expect(root.hasAttribute("orientation")).toBe(false);
    expect(root.hasAttribute("size")).toBe(false);
    expect(root.hasAttribute("variant")).toBe(false);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <DataList.Root data-probe="root" unstyled>
        <DataList.Item data-probe="item">
          <DataList.ItemLabel data-probe="label">Name</DataList.ItemLabel>
        </DataList.Item>
      </DataList.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("row");
    expect(getComputedStyle(probe(container, "label")).alignItems).toBe("normal");
  });
});

describe("DataList — props context and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <DataList.PropsProvider value={{ size: "lg" }}>
        <DataList.Root>
          <DataList.Item data-probe="inherited">
            <DataList.ItemLabel>Name</DataList.ItemLabel>
          </DataList.Item>
        </DataList.Root>
        {/* `merge` resolves by presence, so an unset forward would beat the provider with
            `undefined` (`CLAUDE.md`, *The third hazard*). */}
        <DataList.Root size={undefined}>
          <DataList.Item data-probe="forwarded">
            <DataList.ItemLabel>Name</DataList.ItemLabel>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root size="sm">
          <DataList.Item data-probe="local">
            <DataList.ItemLabel>Name</DataList.ItemLabel>
          </DataList.Item>
        </DataList.Root>
      </DataList.PropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).fontSize).toBe("16px");
    expect(getComputedStyle(probe(container, "forwarded")).fontSize).toBe("16px");
    expect(getComputedStyle(probe(container, "local")).fontSize).toBe("12px");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <DataList.ItemLabel />);
      dispose();
    }).toThrow(/DataList sub-components must be rendered inside a DataList root component/);
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => (
      <DataList.Root orientation="horizontal">
        <For each={facts}>
          {(fact) => (
            <DataList.Item>
              <DataList.ItemLabel>{fact.label}</DataList.ItemLabel>
              <DataList.ItemValue>{fact.value}</DataList.ItemValue>
            </DataList.Item>
          )}
        </For>
      </DataList.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});
