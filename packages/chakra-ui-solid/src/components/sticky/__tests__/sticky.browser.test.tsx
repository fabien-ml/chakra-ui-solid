import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Sticky } from "../sticky";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Sticky", () => {
  it("sticks to the top edge", () => {
    mounted = mountElement(() => <Sticky>header</Sticky>);
    const style = getComputedStyle(mounted.element);

    expect(style.position).toBe("sticky");
    expect(style.top).toBe("0px");
  });

  it("takes a different offset from the `top` style prop", () => {
    mounted = mountElement(() => <Sticky top="4">header</Sticky>);
    expect(getComputedStyle(mounted.element).top).toBe("16px");
  });
});
