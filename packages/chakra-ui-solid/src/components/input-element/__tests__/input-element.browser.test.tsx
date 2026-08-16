import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "vitest";
import { Group } from "../../group";
import { InputElement } from "../input-element";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * A containing block with **padding**, which is what separates the two things a computed `left`
 * cannot: `insetInlineStart: 0` resolves against the padding box, while an element with no
 * `placement` stays at its static position — the start of the *content* box, 50px in. Read as
 * geometry rather than as `left`/`insetInlineEnd` strings, because `getComputedStyle` reports the
 * used value for a positioned element and `auto` comes back as a pixel length either way.
 */
const PADDING = 50;

function placeWithin(ui: () => JSX.Element): { element: HTMLElement; box: DOMRect } {
  mounted = mountElement(() => (
    <div
      style={{
        position: "relative",
        width: "300px",
        height: "40px",
        padding: `0 ${PADDING}px`,
        "box-sizing": "border-box",
      }}
    >
      {ui()}
    </div>
  ));
  const element = mounted.element.firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected InputElement to render");
  }
  return { element, box: mounted.element.getBoundingClientRect() };
}

describe("InputElement", () => {
  it("lays an overlay over the control rather than beside it", () => {
    mounted = mountElement(() => <InputElement>@</InputElement>);
    const style = getComputedStyle(mounted.element);

    expect(style.position).toBe("absolute");
    expect(style.display).toBe("flex");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
    // Above the control it sits on, and inside the group's own stacking context.
    expect(style.zIndex).toBe("2");
    expect(style.paddingLeft).toBe("12px");
    expect(style.paddingRight).toBe("12px");
  });

  it("fills the height of whatever it is positioned against", () => {
    const { element } = placeWithin(() => <InputElement>@</InputElement>);
    expect(getComputedStyle(element).height).toBe("40px");
  });

  it("pins to the leading edge when placed at the start", () => {
    const { element, box } = placeWithin(() => <InputElement placement="start">@</InputElement>);
    expect(element.getBoundingClientRect().left).toBeCloseTo(box.left, 1);
  });

  it("pins to the trailing edge when placed at the end", () => {
    const { element, box } = placeWithin(() => <InputElement placement="end">.com</InputElement>);
    expect(element.getBoundingClientRect().right).toBeCloseTo(box.right, 1);
  });

  it("has no placement until it is given one", () => {
    // The assertion that there is no `defaultVariants` behind it: a silent `start` would pin this to
    // the padding box and read `box.left`, and upstream has neither default.
    const { element, box } = placeWithin(() => <InputElement>@</InputElement>);
    expect(element.getBoundingClientRect().left).toBeCloseTo(box.left + PADDING, 1);
  });

  it("carries `data-group-skip`", () => {
    mounted = mountElement(() => <InputElement>@</InputElement>);
    expect(mounted.element.getAttribute("data-group-skip")).toBe("");
  });

  it("keeps `data-group-skip` when a consumer forwards an unset value", () => {
    // The forwarded-`undefined` case: a wrapper spreading its own props would delete the attribute
    // if it were written *before* the spread, since `merge` resolves a key by presence.
    mounted = mountElement(() => <InputElement data-group-skip={undefined}>@</InputElement>);
    expect(mounted.element.getAttribute("data-group-skip")).toBe("");
  });

  it("keeps `data-group-skip` when a consumer tries to take it off", () => {
    mounted = mountElement(() => <InputElement data-group-skip={null}>@</InputElement>);
    expect(mounted.element.getAttribute("data-group-skip")).toBe("");
  });

  it("does not take a position in the row it sits in", () => {
    // What the attribute buys: the two controls stay first and last, so their seam collapses between
    // them and the overlay between them collects no corner of its own.
    mounted = mountElement(() => (
      <Group attached>
        <button type="button" style="border-radius: 8px">
          addon
        </button>
        <InputElement style="border-radius: 8px">@</InputElement>
        <button type="button" style="border-radius: 8px">
          addon
        </button>
      </Group>
    ));

    const [first, overlay, last] = [...mounted.element.children].map((child) =>
      getComputedStyle(child),
    );

    expect(first?.borderTopRightRadius).toBe("0px");
    expect(first?.borderTopLeftRadius).toBe("8px");
    expect(last?.borderTopLeftRadius).toBe("0px");
    expect(last?.borderTopRightRadius).toBe("8px");
    expect(overlay?.borderTopLeftRadius).toBe("8px");
    expect(overlay?.borderTopRightRadius).toBe("8px");
  });
});
