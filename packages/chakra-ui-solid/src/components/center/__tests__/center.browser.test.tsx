import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Center } from "../center";

// Computed styles, never class names: `css()` computes a class whether or not Panda generated a
// rule for it, so `classList.contains("d_flex")` passes on a completely unstyled element.

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Center", () => {
  it("centres on both axes", () => {
    mounted = mountElement(() => <Center>child</Center>);
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("flex");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
  });

  it("flips to `inline-flex` for the `inline` variant", () => {
    // The variant is a runtime toggle no consumer source spells, so its rule exists only because
    // the preset's `staticCss` pre-generated `display: inline-flex`.
    mounted = mountElement(() => <Center inline>child</Center>);
    expect(getComputedStyle(mounted.element).display).toBe("inline-flex");
  });

  it("lets a style prop beat the base", () => {
    mounted = mountElement(() => <Center display="block">child</Center>);
    expect(getComputedStyle(mounted.element).display).toBe("block");
  });
});
