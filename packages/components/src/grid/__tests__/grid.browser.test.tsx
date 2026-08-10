import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Grid } from "../grid";
import { GridItem } from "../grid-item";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Grid", () => {
  it("is a grid container by default", () => {
    mounted = mountElement(() => <Grid>content</Grid>);
    expect(getComputedStyle(mounted.element).display).toBe("grid");
  });

  it("routes an unbounded track list through a custom property", () => {
    mounted = mountElement(() => <Grid templateColumns="repeat(3, 40px)">content</Grid>);
    const style = getComputedStyle(mounted.element);

    // The whole point of the route: this value is in no stylesheet anywhere, and it resolves.
    expect(style.gridTemplateColumns).toBe("40px 40px 40px");
    expect(style.getPropertyValue("--grid-template-columns")).toBe("repeat(3, 40px)");
  });

  it("leaves an unset property at its initial value rather than at something broken", () => {
    // Every declaration in the base is always present, so each one reads a custom property that is
    // usually not set. An unset `var()` is invalid at computed-value time, which resolves to the
    // initial value — the same thing an absent declaration gives. Asserted as behaviour, because
    // `getComputedStyle` reports a grid container's *used* track list rather than `none`.
    mounted = mountElement(() => (
      <Grid>
        <span>one</span>
        <span>two</span>
      </Grid>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.gridAutoFlow).toBe("row");
    expect(style.gridColumn).toBe("auto");

    const [first, second] = [...mounted.element.children].map((child) =>
      child.getBoundingClientRect(),
    );
    if (first === undefined || second === undefined) {
      throw new Error("expected two children");
    }
    expect(second.left).toBe(first.left);
    expect(second.top).toBeGreaterThan(first.top);
  });

  it("flips to `inline-grid` when `inline` is set", () => {
    mounted = mountElement(() => <Grid inline>content</Grid>);
    expect(getComputedStyle(mounted.element).display).toBe("inline-grid");
  });

  it("tracks a reactive track list", () => {
    const [columns, setColumns] = createSignal("repeat(2, 40px)");
    mounted = mountElement(() => <Grid templateColumns={columns()}>content</Grid>);

    expect(getComputedStyle(mounted.element).gridTemplateColumns).toBe("40px 40px");
    flush(() => setColumns("repeat(3, 20px)"));
    expect(getComputedStyle(mounted.element).gridTemplateColumns).toBe("20px 20px 20px");
  });

  it("keeps the consumer's own inline `style`", () => {
    mounted = mountElement(() => (
      <Grid templateColumns="repeat(2, 10px)" style={{ opacity: "0.5" }}>
        content
      </Grid>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.opacity).toBe("0.5");
    expect(style.gridTemplateColumns).toBe("10px 10px");
  });
});

describe("GridItem", () => {
  function renderInGrid(item: () => ReturnType<typeof GridItem>): CSSStyleDeclaration {
    mounted = mountElement(() => (
      <Grid templateColumns="repeat(4, 25px)" templateRows="repeat(4, 25px)">
        {item()}
      </Grid>
    ));
    const cell = mounted.element.firstElementChild;
    if (!(cell instanceof HTMLElement)) {
      throw new Error("expected the GridItem to render");
    }
    return getComputedStyle(cell);
  }

  it("turns a span into a pair of grid lines", () => {
    expect(renderInGrid(() => <GridItem colSpan={2}>cell</GridItem>).gridColumn).toBe(
      "span 2 / span 2",
    );
  });

  it("lets an explicit start line beat the one the span implies", () => {
    expect(
      renderInGrid(() => (
        <GridItem colSpan={2} colStart={3}>
          cell
        </GridItem>
      )).gridColumn,
    ).toBe("3 / span 2");
  });

  it("places by named area", () => {
    expect(renderInGrid(() => <GridItem area="header">cell</GridItem>).gridArea).toBe("header");
  });

  it("declares no placement at all when it is given none", () => {
    // The trap this shape exists for: an always-on `grid-area` reading an unset custom property is
    // a *shorthand* invalid at computed-value time, and it would reset every line property that
    // `colSpan` had just set.
    const style = renderInGrid(() => <GridItem>cell</GridItem>);

    expect(style.gridColumn).toBe("auto");
    expect(style.gridRow).toBe("auto");
  });
});
