import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { AspectRatio } from "../aspect-ratio";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * Rendered at a fixed width so the ratio is a height in pixels rather than a percentage string.
 *
 * The child is always an **element**: `& > *:not(style)` is what lifts it out of flow, and a bare
 * text node is not matched by it — so text would stack under the reserved box and add its own
 * height, which is the same thing Chakra's `Children.only` is guarding.
 */
function measure(ui: () => ReturnType<typeof AspectRatio>): DOMRect {
  mounted = mountElement(() => <div style={{ width: "200px" }}>{ui()}</div>);
  const box = mounted.element.firstElementChild;
  if (!(box instanceof HTMLElement)) {
    throw new Error("expected AspectRatio to render");
  }
  return box.getBoundingClientRect();
}

describe("AspectRatio", () => {
  it("holds its child at 4/3 by default", () => {
    expect(
      measure(() => (
        <AspectRatio>
          <span>content</span>
        </AspectRatio>
      )).height,
    ).toBeCloseTo(150, 1);
  });

  it("holds any ratio it is given — a number no stylesheet could have anticipated", () => {
    // 200 / (16/9) = 112.5. The percentage is computed at render time and rides a custom property,
    // which is the only route open to a value with no finite set behind it.
    expect(
      measure(() => (
        <AspectRatio ratio={16 / 9}>
          <span>content</span>
        </AspectRatio>
      )).height,
    ).toBeCloseTo(112.5, 1);
  });

  it("tracks a reactive ratio", () => {
    const [ratio, setRatio] = createSignal(1);
    mounted = mountElement(() => (
      <div style={{ width: "200px" }}>
        <AspectRatio ratio={ratio()}>
          <span>content</span>
        </AspectRatio>
      </div>
    ));
    const box = mounted.element.firstElementChild;
    if (!(box instanceof HTMLElement)) {
      throw new Error("expected AspectRatio to render");
    }

    expect(box.getBoundingClientRect().height).toBeCloseTo(200, 1);
    flush(() => setRatio(2));
    expect(box.getBoundingClientRect().height).toBeCloseTo(100, 1);
  });

  it("stretches its child over the reserved box", () => {
    mounted = mountElement(() => (
      <div style={{ width: "200px" }}>
        <AspectRatio ratio={2}>
          <span>content</span>
        </AspectRatio>
      </div>
    ));
    const child = mounted.element.querySelector("span");
    if (!(child instanceof HTMLElement)) {
      throw new Error("expected the child to render");
    }
    const style = getComputedStyle(child);

    expect(style.position).toBe("absolute");
    expect(child.getBoundingClientRect().height).toBeCloseTo(100, 1);
  });
});
