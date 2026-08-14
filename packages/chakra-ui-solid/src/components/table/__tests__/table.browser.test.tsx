import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, For, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Table } from "../index";

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

const items = [
  { id: 1, name: "Laptop", category: "Electronics", price: "$999.00" },
  { id: 2, name: "Coffee Maker", category: "Home Appliances", price: "$49.99" },
  { id: 3, name: "Desk Chair", category: "Furniture", price: "$150.00" },
];

describe("Table — anatomy", () => {
  it("renders a real table, each section in its own slot", () => {
    mounted = mount(() => (
      <Table.Root data-probe="root">
        <Table.Caption data-probe="caption">Product inventory</Table.Caption>
        <Table.Header data-probe="header">
          <Table.Row data-probe="header-row">
            <Table.ColumnHeader data-probe="column-header">Product</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body data-probe="body">
          <Table.Row data-probe="row">
            <Table.Cell data-probe="cell">Laptop</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer data-probe="footer">
          <Table.Row>
            <Table.Cell>Total</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("TABLE");
    expect(probe(container, "caption").tagName).toBe("CAPTION");
    expect(probe(container, "header").tagName).toBe("THEAD");
    expect(probe(container, "body").tagName).toBe("TBODY");
    expect(probe(container, "footer").tagName).toBe("TFOOT");
    expect(probe(container, "row").tagName).toBe("TR");
    expect(probe(container, "column-header").tagName).toBe("TH");
    expect(probe(container, "cell").tagName).toBe("TD");

    expect(getComputedStyle(probe(container, "root")).borderCollapse).toBe("collapse");
    expect(getComputedStyle(probe(container, "root")).fontVariantNumeric).toBe(
      "lining-nums tabular-nums",
    );
    expect(getComputedStyle(probe(container, "column-header")).fontWeight).toBe("500");
    expect(getComputedStyle(probe(container, "column-header")).textAlign).toBe("start");
    expect(getComputedStyle(probe(container, "cell")).textAlign).toBe("start");
    expect(getComputedStyle(probe(container, "footer")).fontWeight).toBe("500");
  });

  it("styles every repeat of the row and cell from one class map", () => {
    // The parts are minted once and rendered per item — there is nothing per-instance about them,
    // and this is the assertion that says so rather than assuming it.
    mounted = mount(() => (
      <Table.Root size="lg">
        <Table.Body>
          <For each={items}>
            {(item) => (
              <Table.Row data-probe="row">
                <Table.Cell data-probe="cell">{item.name}</Table.Cell>
                <Table.Cell data-probe="cell">{item.category}</Table.Cell>
                <Table.Cell data-probe="cell">{item.price}</Table.Cell>
              </Table.Row>
            )}
          </For>
        </Table.Body>
      </Table.Root>
    ));
    const container = mounted.container;

    expect(probeAll(container, "row")).toHaveLength(3);
    expect(probeAll(container, "cell")).toHaveLength(9);
    for (const cell of probeAll(container, "cell")) {
      expect(getComputedStyle(cell).paddingInlineStart).toBe("16px");
      expect(getComputedStyle(cell).borderBottomWidth).toBe("1px");
    }
  });

  it("scrolls inside a ScrollArea that belongs to no Root", () => {
    // The one part of the family with no slot and no context — it wraps the table rather than
    // being part of it, so it renders with nothing above it.
    mounted = mount(() => (
      <Table.ScrollArea data-probe="scroll-area" maxW="xl">
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Laptop</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    ));
    const scrollArea = probe(mounted.container, "scroll-area");

    expect(getComputedStyle(scrollArea).overflow).toBe("auto");
    expect(getComputedStyle(scrollArea).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(scrollArea).display).toBe("block");
  });

  it("takes a colgroup and cols that the recipe styles nothing of", () => {
    mounted = mount(() => (
      <Table.Root>
        <Table.ColumnGroup data-probe="colgroup">
          <Table.Column data-probe="col" htmlWidth="50%" />
          <Table.Column />
        </Table.ColumnGroup>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Laptop</Table.Cell>
            <Table.Cell>Electronics</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "colgroup").tagName).toBe("COLGROUP");
    expect(probe(container, "col").tagName).toBe("COL");
    // `htmlWidth`, because `width` is a style prop here and a `col` only honours the attribute.
    expect(probe(container, "col").getAttribute("width")).toBe("50%");
  });
});

describe("Table — the caption's one default", () => {
  it("sits below the table unless `captionSide` says otherwise", () => {
    mounted = mount(() => (
      <>
        <Table.Root>
          <Table.Caption data-probe="default">Product inventory</Table.Caption>
        </Table.Root>
        <Table.Root>
          <Table.Caption data-probe="top" captionSide="top">
            Product inventory
          </Table.Caption>
        </Table.Root>
      </>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "default")).captionSide).toBe("bottom");
    expect(getComputedStyle(probe(container, "top")).captionSide).toBe("top");
  });

  it("keeps the default when a wrapper forwards `captionSide` unset", () => {
    // The measurement behind `TableCaption`'s `withDefaults`. Written as
    // `captionSide="bottom" {...props}` the default is *gone* here: a JSX spread is a presence
    // merge, so the forwarded `undefined` wins, `css()` receives `undefined`, and no rule is
    // emitted (`CLAUDE.md`, *The third hazard*).
    const Forwarding = (props: { captionSide?: "top" | "bottom" }) => (
      <Table.Root>
        <Table.Caption data-probe="forwarded" captionSide={props.captionSide}>
          Product inventory
        </Table.Caption>
      </Table.Root>
    );

    mounted = mount(() => <Forwarding />);

    expect(getComputedStyle(probe(mounted.container, "forwarded")).captionSide).toBe("bottom");
  });
});

describe("Table — the recipe", () => {
  it("boxes the table on `outline` and rules each row off on `line`", () => {
    const [variant, setVariant] = createSignal<"line" | "outline">("line");
    mounted = mount(() => (
      <Table.Root data-probe="root" variant={variant()}>
        <Table.Header data-probe="header">
          <Table.Row>
            <Table.ColumnHeader>Product</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row data-probe="row">
            <Table.Cell data-probe="cell">Laptop</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).boxShadow).toBe("none");
    expect(getComputedStyle(probe(container, "cell")).borderBottomWidth).toBe("1px");
    const lineHeaderBg = getComputedStyle(probe(container, "header")).backgroundColor;

    flush(() => setVariant("outline"));

    expect(getComputedStyle(probe(container, "root")).boxShadow).not.toBe("none");
    // `outline` moves the rule from the cell to the row and tints the header.
    expect(getComputedStyle(probe(container, "cell")).borderBottomWidth).toBe("0px");
    expect(getComputedStyle(probe(container, "header")).backgroundColor).not.toBe(lineHeaderBg);
  });

  it("stripes odd rows on `striped`", () => {
    const [striped, setStriped] = createSignal(false);
    mounted = mount(() => (
      <Table.Root striped={striped()}>
        <Table.Body>
          <Table.Row>
            <Table.Cell data-probe="odd">Laptop</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell data-probe="even">Coffee Maker</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    ));
    const container = mounted.container;

    const plainOdd = getComputedStyle(probe(container, "odd")).backgroundColor;
    expect(getComputedStyle(probe(container, "even")).backgroundColor).toBe(plainOdd);

    flush(() => setStriped(true));

    expect(getComputedStyle(probe(container, "odd")).backgroundColor).not.toBe(plainOdd);
    expect(getComputedStyle(probe(container, "even")).backgroundColor).toBe(plainOdd);
  });

  it("rules between columns on `showColumnBorder`, except the last", () => {
    mounted = mount(() => (
      <Table.Root showColumnBorder>
        <Table.Body>
          <Table.Row>
            <Table.Cell data-probe="first">Laptop</Table.Cell>
            <Table.Cell data-probe="last">Electronics</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "first")).borderInlineEndWidth).toBe("1px");
    expect(getComputedStyle(probe(container, "last")).borderInlineEndWidth).toBe("0px");
  });

  it("pins the header row on `stickyHeader`", () => {
    mounted = mount(() => (
      <Table.ScrollArea maxH="80px">
        <Table.Root stickyHeader>
          <Table.Header>
            <Table.Row data-probe="header-row">
              <Table.ColumnHeader>Product</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row data-probe="body-row">
              <Table.Cell>Laptop</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    ));
    const container = mounted.container;

    // Scoped to the header's own rows through `& :where(tr)`, so a body row is untouched.
    expect(getComputedStyle(probe(container, "header-row")).position).toBe("sticky");
    expect(getComputedStyle(probe(container, "body-row")).position).toBe("static");
  });

  it("moves the cell padding and the type scale with `size`", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => (
      <Table.Root data-probe="root" size={size()}>
        <Table.Body>
          <Table.Row>
            <Table.Cell data-probe="cell">Laptop</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "cell")).paddingInlineStart).toBe("8px");
    expect(getComputedStyle(probe(container, "root")).fontSize).toBe("14px");

    flush(() => setSize("lg"));

    expect(getComputedStyle(probe(container, "cell")).paddingInlineStart).toBe("16px");
    expect(getComputedStyle(probe(container, "root")).fontSize).toBe("16px");
  });

  it("keeps the six variant props off the element", () => {
    mounted = mount(() => (
      <Table.Root
        data-probe="root"
        variant="outline"
        size="lg"
        interactive
        stickyHeader
        striped
        showColumnBorder
      />
    ));
    const root = probe(mounted.container, "root");

    for (const key of [
      "variant",
      "size",
      "interactive",
      "stickyHeader",
      "striped",
      "showColumnBorder",
    ]) {
      expect(root.hasAttribute(key)).toBe(false);
    }
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Table.Root data-probe="root" unstyled>
        <Table.Caption data-probe="caption">Product inventory</Table.Caption>
        <Table.Body>
          <Table.Row>
            <Table.Cell data-probe="cell">Laptop</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    ));
    const container = mounted.container;

    // Not `border-collapse`: Panda's preflight sets `collapse` on every `table`, so it says
    // nothing about whether the recipe's own root class is there. `font-variant-numeric` is only
    // ever the recipe's.
    expect(getComputedStyle(probe(container, "root")).fontVariantNumeric).toBe("normal");
    expect(getComputedStyle(probe(container, "cell")).paddingInlineStart).toBe("0px");
    // The caption's own default is a style prop, not part of the recipe, so `unstyled` leaves it.
    expect(getComputedStyle(probe(container, "caption")).captionSide).toBe("bottom");
  });
});

describe("Table — props context and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <Table.RootPropsProvider value={{ size: "lg" }}>
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.Cell data-probe="inherited">Laptop</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
        {/* `merge` resolves by presence, so an unset forward would beat the provider with
            `undefined` (`CLAUDE.md`, *The third hazard*). */}
        <Table.Root size={undefined}>
          <Table.Body>
            <Table.Row>
              <Table.Cell data-probe="forwarded">Laptop</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
        <Table.Root size="sm">
          <Table.Body>
            <Table.Row>
              <Table.Cell data-probe="local">Laptop</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Table.RootPropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).paddingInlineStart).toBe("16px");
    expect(getComputedStyle(probe(container, "forwarded")).paddingInlineStart).toBe("16px");
    expect(getComputedStyle(probe(container, "local")).paddingInlineStart).toBe("8px");
  });

  it("names the family when a slotted part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Table.Row />);
      dispose();
    }).toThrow(/Table sub-components must be rendered inside a Table root component/);
  });

  it("lets the two slotless parts render with no Root above them", () => {
    // `withContext` with no slot reads no context at all, which is what makes the error above an
    // error about a missing Root rather than about a class that does not exist.
    mounted = mount(() => (
      <Table.ColumnGroup data-probe="colgroup">
        <Table.Column />
      </Table.ColumnGroup>
    ));

    expect(probe(mounted.container, "colgroup").tagName).toBe("COLGROUP");
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => (
      <Table.ScrollArea maxW="xl">
        <Table.Root variant="outline" interactive>
          <Table.Caption>Product inventory and pricing information</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Product</Table.ColumnHeader>
              <Table.ColumnHeader>Category</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Price</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <For each={items}>
              {(item) => (
                <Table.Row>
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>{item.category}</Table.Cell>
                  <Table.Cell textAlign="end">{item.price}</Table.Cell>
                </Table.Row>
              )}
            </For>
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});
