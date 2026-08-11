import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, For, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Group } from "../group";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function positions(): Array<string | null> {
  if (mounted === undefined) {
    throw new Error("nothing mounted");
  }
  return [...mounted.element.children].map((child) =>
    child.hasAttribute("data-first")
      ? "first"
      : child.hasAttribute("data-last")
        ? "last"
        : child.hasAttribute("data-between")
          ? "between"
          : null,
  );
}

describe("Group", () => {
  it("lays its children out inline with the shorthand defaults", () => {
    mounted = mountElement(() => (
      <Group>
        <button type="button">one</button>
        <button type="button">two</button>
      </Group>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("inline-flex");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("flex-start");
    expect(style.flexDirection).toBe("row");
  });

  it("marks each child's position, which is what `attached` styles select on", () => {
    mounted = mountElement(() => (
      <Group attached>
        <button type="button">one</button>
        <button type="button">two</button>
        <button type="button">three</button>
      </Group>
    ));

    expect(positions()).toEqual(["first", "between", "last"]);
    // The seam between neighbours is collapsed by the compound variant, which only matches because
    // the attributes above are on the elements.
    expect(getComputedStyle(mounted.element.children[0] as Element).marginInlineEnd).toBe("-1px");
  });

  it("publishes each child's index for the stacking variants", () => {
    mounted = mountElement(() => (
      <Group stacking="last-on-top">
        <button type="button">one</button>
        <button type="button">two</button>
      </Group>
    ));
    const second = mounted.element.children[1];
    if (!(second instanceof HTMLElement)) {
      throw new Error("expected two children");
    }

    expect(second.style.getPropertyValue("--group-index")).toBe("1");
    expect(second.style.getPropertyValue("--group-count")).toBe("2");
    expect(getComputedStyle(second).zIndex).toBe("1");
  });

  it("leaves a lone child undecorated", () => {
    mounted = mountElement(() => (
      <Group>
        <button type="button">only</button>
      </Group>
    ));
    expect(positions()).toEqual([null]);
  });

  it("skips a child the predicate rejects, and does not count it", () => {
    mounted = mountElement(() => (
      <Group skip={(child) => child.tagName === "HR"}>
        <button type="button">one</button>
        <hr />
        <button type="button">two</button>
      </Group>
    ));
    expect(positions()).toEqual(["first", null, "last"]);
  });

  it("re-marks the positions when the child list changes", () => {
    const [labels, setLabels] = createSignal(["one", "two"]);
    mounted = mountElement(() => (
      <Group>
        <For each={labels()}>{(label) => <button type="button">{label}</button>}</For>
      </Group>
    ));

    expect(positions()).toEqual(["first", "last"]);
    flush(() => setLabels(["one", "two", "three"]));
    expect(positions()).toEqual(["first", "between", "last"]);
  });
});
