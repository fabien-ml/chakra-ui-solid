import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Float } from "../float";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/** The offsets are percentages of the parent, so the assertion is where the element lands in it. */
function floatWithin(ui: () => ReturnType<typeof Float>): {
  style: CSSStyleDeclaration;
  parent: DOMRect;
  floated: DOMRect;
} {
  mounted = mountElement(() => (
    <div style={{ position: "relative", width: "200px", height: "100px" }}>{ui()}</div>
  ));
  const floated = mounted.element.firstElementChild;
  if (!(floated instanceof HTMLElement)) {
    throw new Error("expected Float to render");
  }
  return {
    style: getComputedStyle(floated),
    parent: mounted.element.getBoundingClientRect(),
    floated: floated.getBoundingClientRect(),
  };
}

describe("Float", () => {
  it("defaults to the top-end corner, straddling it", () => {
    const { style, parent, floated } = floatWithin(() => <Float>3</Float>);

    expect(style.position).toBe("absolute");
    // Not `inline-flex`: absolute positioning blockifies `display`, so the pattern's `inline-flex`
    // is only ever observable as `flex`. What is observable is the centring below.
    expect(style.display).toBe("flex");
    expect(style.alignItems).toBe("center");
    // `translate: 50% -50%` at the corner puts the element's centre on the corner itself.
    expect(floated.left + floated.width / 2).toBeCloseTo(parent.right, 1);
    expect(floated.top + floated.height / 2).toBeCloseTo(parent.top, 1);
  });

  it("places against the opposite corner", () => {
    const { parent, floated } = floatWithin(() => <Float placement="bottom-start">3</Float>);

    expect(floated.left + floated.width / 2).toBeCloseTo(parent.left, 1);
    expect(floated.top + floated.height / 2).toBeCloseTo(parent.bottom, 1);
  });

  it("pushes in by a spacing token, on both axes from one prop", () => {
    const { style } = floatWithin(() => (
      <Float placement="bottom-end" offset="2">
        3
      </Float>
    ));

    // `offset` feeds `offsetX` and `offsetY` alike, and `2` resolves through the spacing scale.
    expect(style.insetBlockEnd).toBe("8px");
    expect(style.insetInlineEnd).toBe("8px");
  });

  it("centres on an edge for a `-center` placement", () => {
    const { parent, floated } = floatWithin(() => <Float placement="middle-center">3</Float>);

    expect(floated.left + floated.width / 2).toBeCloseTo(parent.left + parent.width / 2, 1);
    expect(floated.top + floated.height / 2).toBeCloseTo(parent.top + parent.height / 2, 1);
  });
});
