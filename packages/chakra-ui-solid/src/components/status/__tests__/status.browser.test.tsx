import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Status } from "../index";

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

/** The dot is `0.64em`, so its width is a fraction of the root's font size rather than a token. */
function dotWidth(container: ParentNode): number {
  return Number.parseFloat(getComputedStyle(probe(container, "indicator")).width);
}

describe("Status", () => {
  it("renders a labelled dot, each part in its own slot", () => {
    mounted = mount(() => (
      <Status.Root data-probe="root" colorPalette="green">
        <Status.Indicator data-probe="indicator" />
        Approved
      </Status.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).display).toBe("inline-flex");
    expect(getComputedStyle(probe(container, "root")).columnGap).toBe("8px");
    // The dot is a filled circle. Its colour is the palette's `solid` step, so the assertion is
    // that something was painted rather than which token it resolved to.
    expect(getComputedStyle(probe(container, "indicator")).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(getComputedStyle(probe(container, "indicator")).borderRadius).toBe("9999px");
    expect(probe(container, "root").textContent).toContain("Approved");
  });

  it("sizes the label from the Root, and the dot follows the font size", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => (
      <Status.Root data-probe="root" size={size()}>
        <Status.Indicator data-probe="indicator" />
        In Review
      </Status.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).fontSize).toBe("12px");
    // `0.64em` against the root's own font size — the dot has no size variant of its own.
    expect(dotWidth(container)).toBeCloseTo(0.64 * 12, 1);

    flush(() => setSize("lg"));

    expect(getComputedStyle(probe(container, "root")).fontSize).toBe("16px");
    expect(dotWidth(container)).toBeCloseTo(0.64 * 16, 1);
  });

  it("keeps the variant prop off the element", () => {
    mounted = mount(() => <Status.Root data-probe="root" size="lg" />);

    expect(probe(mounted.container, "root").hasAttribute("size")).toBe(false);
  });

  it("empties the dot's slot when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Status.Root unstyled data-probe="root">
        <Status.Indicator data-probe="indicator" />
      </Status.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).display).toBe("block");
    expect(getComputedStyle(probe(container, "indicator")).borderRadius).toBe("0px");
  });

  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <Status.PropsProvider value={{ size: "lg" }}>
        <Status.Root data-probe="inherited" />
        {/* `merge` resolves by presence, so an unset forward would beat the provider with
            `undefined` (`CLAUDE.md`, *The third hazard*). */}
        <Status.Root data-probe="forwarded" size={undefined} />
        <Status.Root data-probe="local" size="sm" />
      </Status.PropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).fontSize).toBe("16px");
    expect(getComputedStyle(probe(container, "forwarded")).fontSize).toBe("16px");
    expect(getComputedStyle(probe(container, "local")).fontSize).toBe("12px");
  });

  it("names the family when the dot is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Status.Indicator />);
      dispose();
    }).toThrow(/Status sub-components must be rendered inside a Status root component/);
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => (
      <Status.Root colorPalette="green">
        <Status.Indicator />
        Approved
      </Status.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});
