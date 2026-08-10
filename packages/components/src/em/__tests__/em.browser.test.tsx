import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Em } from "../em";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Em", () => {
  it("renders an italic `em`", () => {
    mounted = mountElement(() => <Em>emphasis</Em>);

    expect(mounted.element.tagName).toBe("EM");
    expect(getComputedStyle(mounted.element).fontStyle).toBe("italic");
  });
});
