import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { AbsoluteCenter } from "../absolute-center";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The offsets are asserted as **geometry**, not as `left`/`top` strings: for a positioned element
 * `getComputedStyle` reports the *used* value, so `insetStart: 50%` reads back as a pixel length
 * that says nothing about whether the centring worked.
 */
function offsetsWithin(ui: () => ReturnType<typeof AbsoluteCenter>): { x: number; y: number } {
  mounted = mountElement(() => (
    <div style={{ position: "relative", width: "200px", height: "100px" }}>{ui()}</div>
  ));
  const centered = mounted.element.firstElementChild;
  if (!(centered instanceof HTMLElement)) {
    throw new Error("expected AbsoluteCenter to render");
  }

  const parent = mounted.element.getBoundingClientRect();
  const child = centered.getBoundingClientRect();
  return {
    x: child.left + child.width / 2 - (parent.left + parent.width / 2),
    y: child.top + child.height / 2 - (parent.top + parent.height / 2),
  };
}

describe("AbsoluteCenter", () => {
  it("defaults to centring on both axes", () => {
    expect(offsetsWithin(() => <AbsoluteCenter>badge</AbsoluteCenter>)).toEqual({ x: 0, y: 0 });
  });

  it("centres the horizontal axis alone", () => {
    const { x, y } = offsetsWithin(() => <AbsoluteCenter axis="horizontal">badge</AbsoluteCenter>);

    expect(x).toBe(0);
    // Vertically it sits at the top edge, so its centre is half its own height below the parent's.
    expect(y).toBeLessThan(0);
  });

  it("centres the vertical axis alone", () => {
    const { x, y } = offsetsWithin(() => <AbsoluteCenter axis="vertical">badge</AbsoluteCenter>);

    expect(y).toBe(0);
    expect(x).toBeLessThan(0);
  });

  it("positions absolutely", () => {
    mounted = mountElement(() => <AbsoluteCenter>badge</AbsoluteCenter>);
    expect(getComputedStyle(mounted.element).position).toBe("absolute");
  });
});
