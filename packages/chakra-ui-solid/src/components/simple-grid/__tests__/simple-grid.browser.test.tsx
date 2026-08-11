import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { SimpleGrid } from "../simple-grid";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * Three children, always: `repeat(auto-fit, …)` **collapses** a track nothing was placed in, so a
 * one-child grid reports `300px 0px 0px` however many tracks the track list asked for.
 */
function tracks(ui: () => ReturnType<typeof SimpleGrid>): string {
  mounted = mountElement(() => <div style={{ width: "300px" }}>{ui()}</div>);
  const grid = mounted.element.firstElementChild;
  if (!(grid instanceof HTMLElement)) {
    throw new Error("expected SimpleGrid to render");
  }
  return getComputedStyle(grid).gridTemplateColumns;
}

describe("SimpleGrid", () => {
  it("splits the row into equal columns", () => {
    expect(
      tracks(() => (
        <SimpleGrid columns={3}>
          <span>one</span>
          <span>two</span>
          <span>three</span>
        </SimpleGrid>
      )),
    ).toBe("100px 100px 100px");
  });

  it("fits as many columns as a sizes token allows", () => {
    // `sizes.20` is 5rem — 80px — so a 300px row takes three of them.
    expect(
      tracks(() => (
        <SimpleGrid minChildWidth="20">
          <span>one</span>
          <span>two</span>
          <span>three</span>
        </SimpleGrid>
      )),
    ).toBe("100px 100px 100px");
  });

  it("takes a raw length too, and a number as pixels", () => {
    expect(
      tracks(() => (
        <SimpleGrid minChildWidth="140px">
          <span>one</span>
          <span>two</span>
        </SimpleGrid>
      )),
    ).toBe("150px 150px");
    expect(
      tracks(() => (
        <SimpleGrid minChildWidth={140}>
          <span>one</span>
          <span>two</span>
        </SimpleGrid>
      )),
    ).toBe("150px 150px");
  });

  it("lets `minChildWidth` win over `columns`, as Chakra does", () => {
    expect(
      tracks(() => (
        <SimpleGrid columns={5} minChildWidth="140px">
          <span>one</span>
          <span>two</span>
        </SimpleGrid>
      )),
    ).toBe("150px 150px");
  });

  it("is still a Grid, and still takes Grid's own props", () => {
    mounted = mountElement(() => (
      <SimpleGrid columns={2} autoFlow="column">
        content
      </SimpleGrid>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("grid");
    expect(style.gridAutoFlow).toBe("column");
  });
});
