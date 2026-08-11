import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Wrap, WrapItem } from "../wrap";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Wrap", () => {
  it("wraps its children with Chakra's default gap", () => {
    mounted = mountElement(() => <Wrap>content</Wrap>);
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("flex");
    expect(style.flexWrap).toBe("wrap");
    // `0.5rem`, and specifically not Panda's `wrap` pattern default of `8px` — the same computed
    // length only while the root font size is 16px.
    expect(style.gap).toBe("8px");
  });

  it("takes a gap from the style prop", () => {
    mounted = mountElement(() => <Wrap gap="4">content</Wrap>);
    expect(getComputedStyle(mounted.element).gap).toBe("16px");
  });

  it("maps `align` and `justify`, which the Panda pattern also maps", () => {
    mounted = mountElement(() => (
      <Wrap align="center" justify="space-between">
        content
      </Wrap>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("space-between");
  });

  it("maps `direction`, which it does not", () => {
    // Panda's `wrap` pattern has no `direction`, so this value reaches a stylesheet only through
    // the preset's `staticCss`. The value is held in a signal precisely so that no literal is
    // extractable from this file — which makes the assertion the `staticCss` entry's own gate, and
    // keeps `direction: column` out of the sheet. That second rule is what a *consumer* writing
    // `<Wrap direction="column">` gets alongside the useful one: `direction` is a real CSS
    // property, so the pattern passing the prop through emits a declaration no browser parses.
    const [direction] = createSignal<"column">("column");
    mounted = mountElement(() => <Wrap direction={direction()}>content</Wrap>);
    expect(getComputedStyle(mounted.element).flexDirection).toBe("column");
  });

  it("carries Chakra's marker class alongside the computed one", () => {
    mounted = mountElement(() => <Wrap class="mine">content</Wrap>);

    expect(mounted.element.classList.contains("chakra-wrap")).toBe(true);
    expect(mounted.element.classList.contains("mine")).toBe(true);
  });
});

describe("WrapItem", () => {
  it("keeps its content at the top of the line", () => {
    mounted = mountElement(() => <WrapItem>content</WrapItem>);
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("flex");
    expect(style.alignItems).toBe("flex-start");
  });
});
