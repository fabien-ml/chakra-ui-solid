import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { CheckIcon } from "../../icons";
import { List, type ListRootProps } from "../index";

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

describe("List — anatomy", () => {
  it("renders a ul of li, each part in its own slot", () => {
    mounted = mount(() => (
      <List.Root data-probe="root">
        <List.Item data-probe="item">First</List.Item>
        <List.Item>Second</List.Item>
      </List.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("UL");
    expect(probe(container, "item").tagName).toBe("LI");

    expect(getComputedStyle(probe(container, "root")).display).toBe("flex");
    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "item")).whiteSpace).toBe("normal");
  });

  it("names itself a list, and keeps doing so when a wrapper forwards `role` unset", () => {
    // Safari drops list semantics from a `ul` whose `list-style` is `none`, which `variant="plain"`
    // is — and `merge` resolves by presence, so a forwarded `undefined` would delete the default
    // silently (`CLAUDE.md`, *The third hazard*).
    //
    // Spelled through a real wrapper rather than as `role={undefined}`, which the a11y lint reads
    // as an invalid role. This is the shape the hazard actually takes anyway: a component that
    // passes its own optional `role` down without knowing whether the caller set one.
    const Forwarding = (props: Pick<ListRootProps, "role">) => (
      <List.Root data-probe="forwarded" role={props.role} />
    );

    mounted = mount(() => (
      <>
        <List.Root data-probe="default" />
        <Forwarding />
        <List.Root data-probe="local" role="presentation" />
      </>
    ));
    const container = mounted.container;

    expect(probe(container, "default").getAttribute("role")).toBe("list");
    expect(probe(container, "forwarded").getAttribute("role")).toBe("list");
    expect(probe(container, "local").getAttribute("role")).toBe("presentation");
  });

  it("renders an ordered list through `as`, keeping the root's slot", () => {
    mounted = mount(() => (
      <List.Root data-probe="root" as="ol">
        <List.Item>First</List.Item>
      </List.Root>
    ));
    const root = probe(mounted.container, "root");

    expect(root.tagName).toBe("OL");
    expect(root.getAttribute("role")).toBe("list");
    expect(getComputedStyle(root).flexDirection).toBe("column");
  });
});

describe("List — the recipe", () => {
  it("restores the browser's markers on `marker` and lays the item out inline on `plain`", () => {
    const [variant, setVariant] = createSignal<"marker" | "plain">("marker");
    mounted = mount(() => (
      <List.Root data-probe="root" variant={variant()}>
        <List.Item data-probe="item">First</List.Item>
      </List.Root>
    ));
    const container = mounted.container;

    // `list-style: revert` hands the `ul` back its user-agent marker; `plain` never sets it, so the
    // reset the preset applies to every list stands.
    expect(getComputedStyle(probe(container, "root")).listStyleType).toBe("disc");
    expect(getComputedStyle(probe(container, "item")).alignItems).toBe("normal");

    flush(() => setVariant("plain"));

    expect(getComputedStyle(probe(container, "root")).listStyleType).toBe("none");
    expect(getComputedStyle(probe(container, "item")).alignItems).toBe("flex-start");
  });

  it("aligns an item's own children through `align`", () => {
    mounted = mount(() => (
      <List.Root data-probe="root" variant="plain" align="center">
        <List.Item data-probe="item">
          <List.Indicator data-probe="indicator">✓</List.Indicator>
          First
        </List.Item>
      </List.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "item")).alignItems).toBe("center");
    // The indicator's own box: it reserves the space the marker would have taken.
    expect(getComputedStyle(probe(container, "indicator")).marginInlineEnd).toBe("8px");
    expect(getComputedStyle(probe(container, "indicator")).verticalAlign).toBe("middle");
    expect(getComputedStyle(probe(container, "indicator")).flexShrink).toBe("0");
  });

  it("keeps the two variant props off the element", () => {
    mounted = mount(() => <List.Root data-probe="root" variant="plain" align="end" />);
    const root = probe(mounted.container, "root");

    expect(root.hasAttribute("variant")).toBe(false);
    expect(root.hasAttribute("align")).toBe(false);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <List.Root data-probe="root" unstyled>
        <List.Item data-probe="item">
          <List.Indicator data-probe="indicator">✓</List.Indicator>
          First
        </List.Item>
      </List.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("row");
    expect(getComputedStyle(probe(container, "indicator")).marginInlineEnd).toBe("0px");
  });
});

describe("List — props context and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <List.RootPropsProvider value={{ variant: "plain" }}>
        <List.Root data-probe="inherited" />
        <List.Root data-probe="forwarded" variant={undefined} />
        <List.Root data-probe="local" variant="marker" />
      </List.RootPropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).listStyleType).toBe("none");
    expect(getComputedStyle(probe(container, "forwarded")).listStyleType).toBe("none");
    expect(getComputedStyle(probe(container, "local")).listStyleType).toBe("disc");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <List.Item />);
      dispose();
    }).toThrow(/List sub-components must be rendered inside a List root component/);
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => (
      <List.Root variant="plain">
        <List.Item>
          {/* A glyph, the way upstream's own example fills it — a bare `✓` is a non-BMP character
              axe reports as an undecidable contrast check rather than as text. */}
          <List.Indicator>
            <CheckIcon boxSize="1em" />
          </List.Indicator>
          Shipped
        </List.Item>
        <List.Item>
          <List.Indicator>
            <CheckIcon boxSize="1em" />
          </List.Indicator>
          Reviewed
        </List.Item>
      </List.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});
