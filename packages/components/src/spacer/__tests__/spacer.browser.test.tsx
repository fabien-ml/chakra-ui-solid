import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Spacer } from "../spacer";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Spacer", () => {
  it("grows from a zero basis and stretches across", () => {
    mounted = mountElement(() => <Spacer />);
    const style = getComputedStyle(mounted.element);

    expect(style.flexGrow).toBe("1");
    expect(style.flexShrink).toBe("1");
    expect(style.flexBasis).toBe("0%");
    expect(style.alignSelf).toBe("stretch");
    expect(style.justifySelf).toBe("stretch");
  });

  it("takes up the room its siblings leave", () => {
    mounted = mountElement(() => (
      <div style={{ display: "flex", width: "300px" }}>
        <div style={{ width: "100px" }} />
        <Spacer />
      </div>
    ));
    const spacer = mounted.element.lastElementChild;
    if (!(spacer instanceof HTMLElement)) {
      throw new Error("expected the Spacer to render");
    }

    expect(spacer.getBoundingClientRect().width).toBe(200);
  });
});
