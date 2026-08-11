import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { VisuallyHidden } from "../visually-hidden";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("VisuallyHidden", () => {
  it("clips the element away without taking it out of the accessibility tree", () => {
    mounted = mountElement(() => <VisuallyHidden>skip to content</VisuallyHidden>);
    const style = getComputedStyle(mounted.element);

    expect(style.position).toBe("absolute");
    expect(style.width).toBe("1px");
    expect(style.height).toBe("1px");
    expect(style.overflow).toBe("hidden");
    expect(style.whiteSpace).toBe("nowrap");

    // The two that would remove it from the accessibility tree, which is the point of the whole
    // component. Asserted as an outcome rather than trusted from the style object above.
    expect(style.display).not.toBe("none");
    expect(style.visibility).toBe("visible");
  });
});
