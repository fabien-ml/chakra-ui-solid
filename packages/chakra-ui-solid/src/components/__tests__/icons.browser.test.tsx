import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { CheckIcon, CloseIcon, EllipsisIcon, EllpsisIcon } from "../icons";

let mounted: MountedElement<SVGElement | HTMLElement> | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The internal glyphs are `chakra.svg`, which makes their framing — `fill`, `stroke` and the three
 * `stroke*` props — **style props rather than DOM attributes**: Panda claims every one of them, so
 * each resolves to a class instead of reaching the element.
 *
 * That is the silent-unstyling hazard on this file. A class Panda never generated renders nothing
 * and raises nothing, so a glyph whose framing failed to extract comes out as a filled black blob
 * with every attribute assertion still green. Only computed styles can see it.
 */
describe("the internal glyph set", () => {
  it("draws a stroked glyph with its framing extracted", () => {
    mounted = mountElement<SVGElement>(() => <CheckIcon />);
    const style = getComputedStyle(mounted.element);

    // Each of these is a value the SVG default contradicts — unset, `fill` is black rather than
    // `none` and `stroke-width` is 1 — so a class that failed to generate fails here rather than
    // rendering a filled black blob.
    expect(style.fill).toBe("none");
    expect(style.strokeWidth).toBe("2px");
    expect(style.strokeLinecap).toBe("round");
    expect(style.stroke).toBe(style.color);
  });

  it("draws a filled glyph with its framing extracted", () => {
    mounted = mountElement<SVGElement>(() => <CloseIcon />);
    const style = getComputedStyle(mounted.element);

    // `fill: currentColor`, so it tracks the text colour rather than staying the SVG default black.
    expect(style.fill).toBe(style.color);
    expect(style.fill).not.toBe("rgb(0, 0, 0)");
    expect(mounted.element.querySelector("path")?.getAttribute("fill-rule")).toBe("evenodd");
  });

  it("takes `currentColor` from the text around it", () => {
    // What every call site relies on: the glyph is never given a colour, the part it sits in is.
    mounted = mountElement(() => (
      <div style={{ color: "rgb(255, 0, 0)" }}>
        <CheckIcon />
      </div>
    ));
    const glyph = mounted.element.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(getComputedStyle(glyph as SVGSVGElement).stroke).toBe("rgb(255, 0, 0)");
  });

  it("takes a style prop, which is why these are not leaf svgs", () => {
    // `<CheckIcon boxSize="1em" />` is how menu, select, clipboard and code-block size theirs.
    mounted = mountElement<SVGElement>(() => <CheckIcon boxSize="4" />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("16px");
    expect(style.height).toBe("16px");
  });

  it("marks itself decorative", () => {
    mounted = mountElement<SVGElement>(() => <CheckIcon />);

    expect(mounted.element.getAttribute("aria-hidden")).toBe("true");
  });

  it("ships the upstream typo as a second name for one glyph", () => {
    // `breadcrumb` imports `EllpsisIcon` and `pagination` imports `EllipsisIcon`. Renaming either
    // would break the port's 1:1 with a file we do not own.
    expect(EllpsisIcon).not.toBe(EllipsisIcon);

    mounted = mountElement<SVGElement>(() => <EllpsisIcon />);
    expect(mounted.element.querySelectorAll("circle")).toHaveLength(3);
  });
});
