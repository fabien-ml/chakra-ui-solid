import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Quote } from "../quote";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Quote", () => {
  it("renders a bold `q`", () => {
    mounted = mountElement(() => <Quote>quoted</Quote>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("Q");
    expect(style.fontWeight).toBe("700");
    expect(style.lineHeight).toBe(`${Number.parseFloat(style.fontSize) * 1.2}px`);
  });
});
