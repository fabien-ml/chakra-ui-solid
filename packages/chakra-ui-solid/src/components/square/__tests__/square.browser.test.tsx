import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Square } from "../square";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Square", () => {
  it("maps `size` to both dimensions through a sizes token", () => {
    mounted = mountElement(() => <Square size="10" />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("40px");
    expect(style.height).toBe("40px");
    expect(style.display).toBe("flex");
    expect(style.alignItems).toBe("center");
  });

  it("neither grows nor shrinks in a flex line", () => {
    mounted = mountElement(() => <Square size="20" />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("80px");
    expect(style.flexGrow).toBe("0");
    expect(style.flexShrink).toBe("0");
  });

  it("tracks a reactive `size`", () => {
    // Both values are written literally above, which is what puts their rules in the stylesheet.
    // A size no source file spells has no rule and the square silently renders at `auto` — the
    // same constraint every style prop carries, not one Square adds.
    const [size, setSize] = createSignal("10");
    mounted = mountElement(() => <Square size={size()} />);

    expect(getComputedStyle(mounted.element).width).toBe("40px");
    flush(() => setSize("20"));
    expect(getComputedStyle(mounted.element).width).toBe("80px");
  });

  it("lets the consumer's `css` win", () => {
    mounted = mountElement(() => <Square size="10" css={{ width: "4" }} />);
    expect(getComputedStyle(mounted.element).width).toBe("16px");
  });
});
