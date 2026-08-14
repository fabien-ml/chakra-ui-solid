import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Blockquote } from "../index";

/**
 * Computed styles throughout, never class names: `sva()` computes a class whether or not Panda
 * generated a rule for it, so a class-name assertion passes on a completely unstyled element.
 */

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function probe(container: ParentNode, name: string): HTMLElement | SVGElement {
  const element = container.querySelector(`[data-probe="${name}"]`);
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
    throw new Error(`expected the tree to render a [data-probe="${name}"] element`);
  }
  return element;
}

function Basic(props: {
  variant?: "subtle" | "solid" | "plain";
  justify?: "start" | "center" | "end";
}) {
  return (
    <Blockquote.Root data-probe="root" variant={props.variant} justify={props.justify}>
      <Blockquote.Icon data-probe="icon" />
      <Blockquote.Content data-probe="content" cite="https://example.com">
        If anyone thinks he is something when he is nothing, he deceives himself.
      </Blockquote.Content>
      <Blockquote.Caption data-probe="caption">
        — <cite>Uzumaki Naruto</cite>
      </Blockquote.Caption>
    </Blockquote.Root>
  );
}

describe("Blockquote — anatomy", () => {
  it("renders a figure holding a blockquote and its caption", () => {
    mounted = mount(() => <Basic />);
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("FIGURE");
    expect(probe(container, "content").tagName).toBe("BLOCKQUOTE");
    expect(probe(container, "caption").tagName).toBe("FIGCAPTION");
    // `cite` is the machine-readable source, and it is an attribute the element really has.
    expect(probe(container, "content").getAttribute("cite")).toBe("https://example.com");
  });

  it("dresses the Root and every part in its own slot", () => {
    mounted = mount(() => <Basic />);
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "caption")).fontSize).toBe("14px");
    // The icon is the one part whose element is a **component** rather than a tag, so its slot's
    // class has to survive being handed to `chakra.svg`.
    expect(getComputedStyle(probe(container, "icon")).width).toBe("20px");
  });
});

describe("Blockquote — the recipe", () => {
  it("draws the rule on `subtle` and `solid`, and drops it on `plain`", () => {
    const [variant, setVariant] = createSignal<"subtle" | "plain">("subtle");
    mounted = mount(() => <Basic variant={variant()} />);
    const root = probe(mounted.container, "root");

    expect(getComputedStyle(root).borderInlineStartWidth).toBe("4px");

    flush(() => setVariant("plain"));

    expect(getComputedStyle(root).borderInlineStartWidth).toBe("0px");
    // The padding stays on `plain` — only the rule goes.
    expect(getComputedStyle(root).paddingInlineStart).toBe("20px");
  });

  it("aligns the quote from `justify`", () => {
    mounted = mount(() => <Basic justify="center" />);

    expect(getComputedStyle(probe(mounted.container, "root")).textAlign).toBe("center");
  });

  it("keeps the two variant props off the element", () => {
    mounted = mount(() => <Basic variant="solid" justify="end" />);
    const root = probe(mounted.container, "root");

    expect(root.hasAttribute("variant")).toBe(false);
    expect(root.hasAttribute("justify")).toBe(false);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Blockquote.Root data-probe="root" unstyled>
        <Blockquote.Caption data-probe="caption">Uzumaki Naruto</Blockquote.Caption>
      </Blockquote.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).display).toBe("block");
    expect(getComputedStyle(probe(container, "caption")).fontSize).toBe("16px");
  });
});

describe("Blockquote — props context and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <Blockquote.PropsProvider value={{ justify: "center" }}>
        <Blockquote.Root data-probe="inherited" />
        {/* `merge` resolves by presence, so an unset forward would beat the provider with
            `undefined` (`CLAUDE.md`, *The third hazard*). */}
        <Blockquote.Root data-probe="forwarded" justify={undefined} />
        <Blockquote.Root data-probe="local" justify="end" />
      </Blockquote.PropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).textAlign).toBe("center");
    expect(getComputedStyle(probe(container, "forwarded")).textAlign).toBe("center");
    expect(getComputedStyle(probe(container, "local")).textAlign).toBe("end");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Blockquote.Content />);
      dispose();
    }).toThrow(/Blockquote sub-components must be rendered inside a Blockquote root component/);
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => <Basic />);

    await expectNoA11yViolations(mounted.container);
  });
});
