import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Card } from "../index";

/**
 * Every assertion here reads a **computed style**, never a class name: Panda's `sva()` computes a
 * class whether or not a rule was ever generated for it, so `classList.contains("card__body")`
 * passes on a completely unstyled element.
 *
 * The values are the recipe's own. `--card-padding` is declared by the root's size variant and read
 * by all three boxes, so one padding assertion says both classes landed.
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

function Basic(props: { size?: "sm" | "md" | "lg"; variant?: "elevated" | "outline" | "subtle" }) {
  return (
    <Card.Root data-probe="root" size={props.size} variant={props.variant}>
      <Card.Header data-probe="header">
        <Card.Title data-probe="title">Nue Camp</Card.Title>
        <Card.Description data-probe="description">A card about one subject.</Card.Description>
      </Card.Header>
      <Card.Body data-probe="body">Body</Card.Body>
      <Card.Footer data-probe="footer">Footer</Card.Footer>
    </Card.Root>
  );
}

describe("Card — anatomy", () => {
  it("renders each part as its own element, dressed in its own slot", () => {
    mounted = mount(() => <Basic />);
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("DIV");
    expect(probe(container, "title").tagName).toBe("H3");
    expect(probe(container, "description").tagName).toBe("P");

    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "body")).padding).toBe("24px");
    expect(getComputedStyle(probe(container, "footer")).alignItems).toBe("center");
    expect(getComputedStyle(probe(container, "title")).fontWeight).toBe("600");
  });

  it("carries no `data-scope` or `data-part` — this family's anatomy applies none", () => {
    // Upstream's `withContext` writes a class and nothing else, so nothing here is addressable by
    // `[data-scope]`. Selectors in the recipe read the classes instead.
    mounted = mount(() => <Basic />);

    expect(mounted.container.querySelector("[data-scope]")).toBeNull();
    expect(mounted.container.querySelector("[data-part]")).toBeNull();
  });
});

describe("Card — the recipe", () => {
  it("sizes every slot from the Root, and re-resolves them when the size changes", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => <Basic size={size()} />);
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "body")).padding).toBe("16px");
    expect(getComputedStyle(probe(container, "title")).fontSize).toBe("16px");

    flush(() => setSize("lg"));

    expect(getComputedStyle(probe(container, "body")).padding).toBe("28px");
    expect(getComputedStyle(probe(container, "title")).fontSize).toBe("20px");
  });

  it("keeps the two variant props off the element", () => {
    mounted = mount(() => <Basic size="sm" variant="subtle" />);
    const root = probe(mounted.container, "root");

    // Neither is an attribute a `div` has, and neither is a style prop `renderStyled` swallows —
    // forwarded, both would reach the DOM.
    expect(root.hasAttribute("size")).toBe(false);
    expect(root.hasAttribute("variant")).toBe(false);
  });

  it("draws a shadow on `elevated` and a border on `outline`", () => {
    mounted = mount(() => (
      <>
        <Card.Root data-probe="elevated" variant="elevated" />
        <Card.Root data-probe="outline" variant="outline" />
      </>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "elevated")).boxShadow).not.toBe("none");
    expect(getComputedStyle(probe(container, "outline")).borderTopWidth).toBe("1px");
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Card.Root data-probe="root" unstyled>
        <Card.Body data-probe="body" />
      </Card.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).display).toBe("block");
    expect(getComputedStyle(probe(container, "body")).padding).toBe("0px");
  });
});

describe("Card — props context", () => {
  it("supplies the Root's props from above, and a local prop still wins", () => {
    mounted = mount(() => (
      <Card.PropsProvider value={{ size: "sm" }}>
        <Card.Root>
          <Card.Body data-probe="inherited" />
        </Card.Root>
        <Card.Root size="lg">
          <Card.Body data-probe="local" />
        </Card.Root>
      </Card.PropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).padding).toBe("16px");
    expect(getComputedStyle(probe(container, "local")).padding).toBe("28px");
  });

  it("keeps the provider's value when a Root forwards the same prop unset", () => {
    // `merge` resolves a key by presence, so a wrapper forwarding `size={props.size}` with nothing
    // set would otherwise beat the provider with `undefined` (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => (
      <Card.PropsProvider value={{ size: "sm" }}>
        <Card.Root size={undefined}>
          <Card.Body data-probe="body" />
        </Card.Root>
      </Card.PropsProvider>
    ));

    expect(getComputedStyle(probe(mounted.container, "body")).padding).toBe("16px");
  });
});

describe("Card — polymorphism and a11y", () => {
  it("takes `as` on a part", () => {
    mounted = mount(() => (
      <Card.Root>
        <Card.Title as="h2" data-probe="title">
          Nue Camp
        </Card.Title>
      </Card.Root>
    ));

    expect(probe(mounted.container, "title").tagName).toBe("H2");
    expect(getComputedStyle(probe(mounted.container, "title")).fontWeight).toBe("600");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Card.Body />);
      dispose();
    }).toThrow(/Card sub-components must be rendered inside a Card root component/);
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => <Basic />);

    await expectNoA11yViolations(mounted.container);
  });
});
