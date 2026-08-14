import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { CheckIcon } from "../../icons";
import { EmptyState } from "../index";

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

function Cart(props: { size?: "sm" | "md" | "lg" }) {
  return (
    <EmptyState.Root data-probe="root" size={props.size}>
      <EmptyState.Content data-probe="content">
        <EmptyState.Indicator data-probe="indicator">
          <CheckIcon />
        </EmptyState.Indicator>
        <EmptyState.Title data-probe="title">Your cart is empty</EmptyState.Title>
        <EmptyState.Description data-probe="description">
          Explore our products and add items to your cart
        </EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

describe("EmptyState — anatomy", () => {
  it("renders each part in its own slot, with the centring on the content", () => {
    mounted = mount(() => <Cart />);
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("DIV");
    expect(probe(container, "title").tagName).toBe("H3");
    expect(probe(container, "description").tagName).toBe("P");

    // The Root only spans and pads — the column and the centring belong to the content.
    expect(getComputedStyle(probe(container, "root")).display).toBe("block");
    expect(getComputedStyle(probe(container, "content")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "content")).alignItems).toBe("center");
    expect(getComputedStyle(probe(container, "title")).fontWeight).toBe("600");
  });

  it("sizes the glyph to the indicator's own font size", () => {
    mounted = mount(() => <Cart size="lg" />);
    const glyph = probe(mounted.container, "indicator").querySelector("svg");
    if (glyph === null) {
      throw new Error("expected the indicator to hold a glyph");
    }

    // `1em` against the indicator's `6xl`, so a consumer's icon needs no size of its own.
    const indicatorFontSize = Number.parseFloat(
      getComputedStyle(probe(mounted.container, "indicator")).fontSize,
    );
    expect(Number.parseFloat(getComputedStyle(glyph).width)).toBeCloseTo(indicatorFontSize, 1);
  });
});

describe("EmptyState — the recipe", () => {
  it("moves the padding, the gap, the title and the glyph together", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => <Cart size={size()} />);
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).paddingInlineStart).toBe("16px");
    expect(getComputedStyle(probe(container, "content")).rowGap).toBe("16px");
    expect(getComputedStyle(probe(container, "title")).fontSize).toBe("16px");
    expect(getComputedStyle(probe(container, "indicator")).fontSize).toBe("24px");

    flush(() => setSize("lg"));

    expect(getComputedStyle(probe(container, "root")).paddingInlineStart).toBe("48px");
    expect(getComputedStyle(probe(container, "content")).rowGap).toBe("32px");
    expect(getComputedStyle(probe(container, "title")).fontSize).toBe("20px");
    // The glyph moves furthest of the four — `2xl` to `6xl`.
    expect(getComputedStyle(probe(container, "indicator")).fontSize).toBe("60px");
  });

  it("keeps the variant prop off the element", () => {
    mounted = mount(() => <Cart size="lg" />);

    expect(probe(mounted.container, "root").hasAttribute("size")).toBe(false);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <EmptyState.Root data-probe="root" unstyled>
        <EmptyState.Content data-probe="content">
          <EmptyState.Title data-probe="title">Nothing here</EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).paddingInlineStart).toBe("0px");
    expect(getComputedStyle(probe(container, "content")).flexDirection).toBe("row");
    expect(getComputedStyle(probe(container, "title")).fontWeight).toBe("400");
  });
});

describe("EmptyState — props context and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <EmptyState.PropsProvider value={{ size: "lg" }}>
        <EmptyState.Root data-probe="inherited" />
        {/* `merge` resolves by presence, so an unset forward would beat the provider with
            `undefined` (`CLAUDE.md`, *The third hazard*). */}
        <EmptyState.Root data-probe="forwarded" size={undefined} />
        <EmptyState.Root data-probe="local" size="sm" />
      </EmptyState.PropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).paddingInlineStart).toBe("48px");
    expect(getComputedStyle(probe(container, "forwarded")).paddingInlineStart).toBe("48px");
    expect(getComputedStyle(probe(container, "local")).paddingInlineStart).toBe("16px");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <EmptyState.Title />);
      dispose();
    }).toThrow(/EmptyState sub-components must be rendered inside a EmptyState root component/);
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => <Cart />);

    await expectNoA11yViolations(mounted.container);
  });
});
