import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Span } from "../span";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Span", () => {
  it("renders a `span` and takes style props", () => {
    mounted = mountElement(() => <Span p="4">text</Span>);

    expect(mounted.element.tagName).toBe("SPAN");
    expect(getComputedStyle(mounted.element).padding).toBe("16px");
  });

  it("adds no styles of its own", () => {
    mounted = mountElement(() => <Span>text</Span>);
    expect(mounted.element.getAttribute("class")).toBe("");
  });
});
