import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Strong } from "../strong";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Strong", () => {
  it("renders a `strong` at the theme's semibold, not the UA's bold", () => {
    mounted = mountElement(() => <Strong>important</Strong>);

    expect(mounted.element.tagName).toBe("STRONG");
    expect(getComputedStyle(mounted.element).fontWeight).toBe("600");
  });
});
