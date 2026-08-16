import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, For, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Group } from "../group";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * A rounded child, so a collapsed corner reads `0px` against a corner that is still `8px`. The
 * radius is an inline style and the seam's is `!important` — upstream's `0!`, carried over — which
 * is the only reason the seam wins here; drop the `!` and every assertion below reads `8px`.
 */
function Child(props: { skip?: boolean; children: string }) {
  return (
    <button
      type="button"
      data-group-skip={props.skip === true ? "" : undefined}
      style="border-radius: 8px"
    >
      {props.children}
    </button>
  );
}

type Seam = "first" | "between" | "last" | null;

/**
 * Which corners the row collapsed on each child — the only thing left to read, now that a position
 * is a selector rather than an attribute. The suite runs LTR, so the row's start corner is the left
 * one; the vertical spelling gets its own reader below.
 */
function horizontalSeams(): Seam[] {
  return childStyles().map((style) => {
    const start = style.borderTopLeftRadius === "0px";
    const end = style.borderTopRightRadius === "0px";
    return start && end ? "between" : end ? "first" : start ? "last" : null;
  });
}

function verticalSeams(): Seam[] {
  return childStyles().map((style) => {
    const start = style.borderTopLeftRadius === "0px";
    const end = style.borderBottomLeftRadius === "0px";
    return start && end ? "between" : end ? "first" : start ? "last" : null;
  });
}

function childStyles(): CSSStyleDeclaration[] {
  if (mounted === undefined) {
    throw new Error("nothing mounted");
  }
  return [...mounted.element.children].map((child) => getComputedStyle(child));
}

function layers(): string[] {
  return childStyles().map((style) => style.zIndex);
}

describe("Group", () => {
  it("lays its children out inline with the shorthand defaults", () => {
    mounted = mountElement(() => (
      <Group>
        <Child>one</Child>
        <Child>two</Child>
      </Group>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("inline-flex");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("flex-start");
    expect(style.flexDirection).toBe("row");
  });

  it("collapses the seam between each pair of neighbours", () => {
    mounted = mountElement(() => (
      <Group attached>
        <Child>one</Child>
        <Child>two</Child>
        <Child>three</Child>
      </Group>
    ));

    expect(horizontalSeams()).toEqual(["first", "between", "last"]);
    // The overlap that makes two 1px borders read as one.
    expect(childStyles().map((style) => style.marginInlineEnd)).toEqual(["-1px", "-1px", "0px"]);
  });

  it("collapses the seam along the other axis when the group is vertical", () => {
    mounted = mountElement(() => (
      <Group attached orientation="vertical">
        <Child>one</Child>
        <Child>two</Child>
        <Child>three</Child>
      </Group>
    ));

    expect(verticalSeams()).toEqual(["first", "between", "last"]);
    expect(childStyles().map((style) => style.marginBottom)).toEqual(["-1px", "-1px", "0px"]);
  });

  it("leaves a lone child alone", () => {
    mounted = mountElement(() => (
      <Group attached>
        <Child>only</Child>
      </Group>
    ));

    expect(horizontalSeams()).toEqual([null]);
  });

  it("does not count a child that has taken itself out of the row", () => {
    mounted = mountElement(() => (
      <Group attached>
        <Child>addon</Child>
        <Child skip>icon</Child>
        <Child>input</Child>
        <Child skip>icon</Child>
        <Child>addon</Child>
      </Group>
    ));

    expect(horizontalSeams()).toEqual(["first", null, "between", null, "last"]);
  });

  it("positions from the row rather than from the DOM, so a leading skip shifts nothing", () => {
    mounted = mountElement(() => (
      <Group attached>
        <Child skip>icon</Child>
        <Child>one</Child>
        <Child>two</Child>
      </Group>
    ));

    expect(horizontalSeams()).toEqual([null, "first", "last"]);
  });

  it("leaves the row alone when skipping is what reduced it to one", () => {
    mounted = mountElement(() => (
      <Group attached>
        <Child skip>icon</Child>
        <Child>only</Child>
        <Child skip>icon</Child>
      </Group>
    ));

    expect(horizontalSeams()).toEqual([null, null, null]);
  });

  it("re-collapses the seam when the child list changes", () => {
    const [labels, setLabels] = createSignal(["one", "two"]);
    mounted = mountElement(() => (
      <Group attached>
        <For each={labels()}>{(label) => <Child>{label}</Child>}</For>
      </Group>
    ));

    expect(horizontalSeams()).toEqual(["first", "last"]);
    flush(() => setLabels(["one", "two", "three"]));
    expect(horizontalSeams()).toEqual(["first", "between", "last"]);
  });

  it("layers each child by its position in the row", () => {
    mounted = mountElement(() => (
      <Group stacking="last-on-top">
        <Child>one</Child>
        <Child>two</Child>
        <Child>three</Child>
      </Group>
    ));

    expect(layers()).toEqual(["0", "1", "2"]);
  });

  it("counts from the end of the row for `first-on-top`", () => {
    mounted = mountElement(() => (
      <Group stacking="first-on-top">
        <Child>one</Child>
        <Child>two</Child>
        <Child>three</Child>
      </Group>
    ));

    expect(layers()).toEqual(["3", "2", "1"]);
  });

  it("puts every child past the eighth on one shared layer above the counted ones", () => {
    const labels = Array.from({ length: 10 }, (_, index) => String(index));
    mounted = mountElement(() => (
      <Group stacking="first-on-top">
        <For each={labels}>{(label) => <Child>{label}</Child>}</For>
      </Group>
    ));

    // The ladder's ceiling, and the whole of the divergence it costs: the two overflow children tie
    // with each other instead of ordering, but they still sit above the eight the ladder counted.
    expect(layers()).toEqual(["9", "9", "8", "7", "6", "5", "4", "3", "2", "1"]);
  });
});
