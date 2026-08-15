import { type MountedElement, mount, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { icon } from "@chakra-ui-solid/styled-system/recipes";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { createIcon } from "../create-icon";
import { Icon, IconPropsProvider } from "../icon";

/**
 * A glyph the way an icon package ships one: its own `svg`, drawn at `1em` in `currentColor`, taking
 * whatever props it is handed.
 *
 * Its path fills the 24×24 viewBox **exactly**, which is what makes the assertions below able to see
 * the failure they exist for. A glyph framed by a second `svg` draws inside *that* viewport, so its
 * ink measures the inner box while the element under test measures the outer one — the two rects
 * agree only when the recipe reached the `svg` that actually draws.
 */
function StarIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    // `aria-hidden` before the spread, overwritten with the same `"true"` Icon computes. It is here
    // for the linter, which cannot see an attribute arriving in a spread.
    <svg aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path d="M0 0h24v24H0z" />
    </svg>
  );
}

/** The glyph's drawn box and the element's box, as one comparison. */
function boxes(element: SVGElement) {
  const glyph = element.querySelector("path");
  if (glyph === null) {
    throw new Error("expected the rendered svg to hold the glyph");
  }
  return { element: element.getBoundingClientRect(), glyph: glyph.getBoundingClientRect() };
}

let mounted: MountedElement<SVGElement> | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Icon", () => {
  it("renders an svg carrying the recipe's base", () => {
    mounted = mountElement<SVGElement>(() => <Icon />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("svg");
    expect(style.display).toBe("inline-block");
    expect(style.flexShrink).toBe("0");
    expect(style.verticalAlign).toBe("middle");
  });

  it("gives the default `inherit` size no dimensions of its own", () => {
    // `inherit: {}` upstream — deliberately empty, so the glyph inside or the surrounding text
    // decides. This is what would catch someone "fixing" it with a `1em` box Chakra does not have:
    // the default has to compute like `inherit` and unlike any sized variant.
    mounted = mountElement<SVGElement>(() => <Icon />);
    const bare = getComputedStyle(mounted.element).width;
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Icon size="inherit" />);
    expect(getComputedStyle(mounted.element).width).toBe(bare);
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Icon size="md" />);
    expect(getComputedStyle(mounted.element).width).not.toBe(bare);
  });

  it("resolves `size` to real dimensions", () => {
    // The size variants are the whole recipe past the base, and an unresolved one leaves the svg at
    // its intrinsic box — visible here as a width that is not 24px, which is the silent-unstyling
    // case this asserts against.
    mounted = mountElement<SVGElement>(() => <Icon size="lg" />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("24px");
    expect(style.height).toBe("24px");
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "2xl">("xs");
    mounted = mountElement<SVGElement>(() => <Icon size={size()} />);

    expect(getComputedStyle(mounted.element).width).toBe("12px");
    flush(() => setSize("2xl"));
    expect(getComputedStyle(mounted.element).width).toBe("32px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The recipe emits into `@layer recipes` and `boxSize` into `@layer utilities` above it, so the
    // caller's box wins over the variant's without either being `!important`.
    mounted = mountElement<SVGElement>(() => <Icon size="sm" boxSize="10" />);

    expect(getComputedStyle(mounted.element).width).toBe("40px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement<SVGElement>(() => <Icon unstyled size="lg" color="red" />);
    const style = getComputedStyle(mounted.element);

    // `block` rather than the recipe's `inline-block`: Panda's preflight resets every replaced
    // element that way, and dropping the recipe drops back to it rather than to nothing.
    expect(style.display).toBe("block");
    expect(style.width).not.toBe("24px");
    expect(style.color).toBe("rgb(255, 0, 0)");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement<SVGElement>(() => <Icon size="lg" />);

    expect(mounted.element.hasAttribute("size")).toBe(false);
    // The tuple omits by literal name, because `omit` narrows by the keys it is handed and a
    // `string[]` narrows nothing. This is what keeps the two lists one list: a variant added to the
    // recipe upstream and not to the tuple would reach the DOM as an attribute.
    expect(icon.variantKeys).toEqual(["size"]);
  });

  describe("the glyph is the element the recipe lands on", () => {
    // Every other test in this file mounts a bare `<Icon />` and reads the element it renders, which
    // is why all of them passed while four of the six Icons on the docs page drew a glyph at half its
    // box: they never asked what was *inside*. These do.

    it("`as` renders one svg, and it is the one holding the glyph", () => {
      mounted = mountElement<SVGElement>(() => <Icon as={StarIcon} size="lg" />);

      // A nested `svg` establishes its own viewport, so the recipe would be sizing an empty wrapper
      // around a glyph resolving `1em` against the inherited font size instead.
      expect(mounted.element.querySelector("svg")).toBeNull();

      const { element, glyph } = boxes(mounted.element);
      expect(element.width).toBe(24);
      expect(glyph.width).toBe(element.width);
      expect(glyph.height).toBe(element.height);
    });

    it("`render` does the same, for a glyph written at the call site", () => {
      mounted = mountElement<SVGElement>(() => (
        <Icon
          size="lg"
          render={(props) => <StarIcon {...(props as JSX.SvgSVGAttributes<SVGSVGElement>)} />}
        />
      ));

      expect(mounted.element.querySelector("svg")).toBeNull();

      const { element, glyph } = boxes(mounted.element);
      expect(element.width).toBe(24);
      expect(glyph.width).toBe(element.width);
    });

    it("frames raw glyph contents in its own svg, which is still one svg", () => {
      mounted = mountElement<SVGElement>(() => (
        <Icon size="lg" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" />
        </Icon>
      ));

      expect(mounted.element.querySelector("svg")).toBeNull();

      const { element, glyph } = boxes(mounted.element);
      expect(element.width).toBe(24);
      expect(glyph.width).toBe(element.width);
    });

    it("leaves the glyph at the surrounding font size when `size` is unset", () => {
      // The default `inherit` sets no box, so what decides is the glyph's own `1em` — the case the
      // docs' `box-property-card` renders, and the one that drew a 300×150 replaced-element box back
      // when an unsized wrapper was doing the drawing.
      const tree = mount(() => (
        <div style={{ "font-size": "20px" }}>
          <Icon as={StarIcon} />
        </div>
      ));
      try {
        const rendered = tree.container.querySelector("svg");
        if (rendered === null) {
          throw new Error("expected an svg");
        }
        expect(rendered.getBoundingClientRect().width).toBe(20);
      } finally {
        tree.dispose();
      }
    });
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement<SVGElement>(() => (
      <IconPropsProvider value={{ size: "lg" }}>
        <Icon />
      </IconPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).width).toBe("24px");
  });

  it("lets a local prop beat the provider", () => {
    mounted = mountElement<SVGElement>(() => (
      <IconPropsProvider value={{ size: "lg" }}>
        <Icon size="xs" />
      </IconPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).width).toBe("12px");
  });

  it("keeps the provider's value when a local prop is forwarded unset", () => {
    mounted = mountElement<SVGElement>(() => (
      <IconPropsProvider value={{ size: "lg" }}>
        <Icon size={undefined} />
      </IconPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).width).toBe("24px");
  });

  describe("the two attributes it defaults", () => {
    it("is decorative and unfocusable out of the box", () => {
      mounted = mountElement<SVGElement>(() => <Icon />);

      expect(mounted.element.getAttribute("aria-hidden")).toBe("true");
      expect(mounted.element.getAttribute("focusable")).toBe("false");
    });

    it("keeps both when a wrapper forwards them unset", () => {
      // The third hazard: as JSX attributes before the spread these would be deleted by the
      // `undefined` the wrapper carries, and the icon would start being announced beside the label
      // it decorates.
      mounted = mountElement<SVGElement>(() => (
        <Icon aria-hidden={undefined} focusable={undefined} />
      ));

      expect(mounted.element.getAttribute("aria-hidden")).toBe("true");
      expect(mounted.element.getAttribute("focusable")).toBe("false");
    });

    it("gives way to a caller who labels the icon instead", () => {
      mounted = mountElement<SVGElement>(() => <Icon aria-hidden="false" aria-label="Rating" />);

      expect(mounted.element.getAttribute("aria-hidden")).toBe("false");
      expect(mounted.element.getAttribute("aria-label")).toBe("Rating");
    });

    it("gives way to a provider too, which a JSX attribute would not", () => {
      mounted = mountElement<SVGElement>(() => (
        <IconPropsProvider value={{ "aria-hidden": "false" }}>
          <Icon />
        </IconPropsProvider>
      ));

      expect(mounted.element.getAttribute("aria-hidden")).toBe("false");
    });
  });
});

describe("createIcon", () => {
  it("draws the `d` shorthand in currentColor", () => {
    const DotIcon = createIcon({ d: "M12 12h.01" });
    mounted = mountElement<SVGElement>(() => <DotIcon />);
    const path = mounted.element.querySelector("path");

    expect(path?.getAttribute("d")).toBe("M12 12h.01");
    expect(path?.getAttribute("fill")).toBe("currentColor");
  });

  it("renders whatever `path` returns, including several elements", () => {
    const ArrowIcon = createIcon({
      path: () => (
        <>
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </>
      ),
    });
    mounted = mountElement<SVGElement>(() => <ArrowIcon />);

    expect(mounted.element.querySelectorAll("path")).toHaveLength(2);
  });

  it("is an Icon, so the recipe and the style props work on it", () => {
    const DotIcon = createIcon({ d: "M12 12h.01" });
    mounted = mountElement<SVGElement>(() => <DotIcon size="lg" color="red" />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("24px");
    expect(style.color).toBe("rgb(255, 0, 0)");
    expect(mounted.element.getAttribute("aria-hidden")).toBe("true");
  });

  it("draws its glyph in its own svg, with nothing nested inside it", () => {
    // `createIcon` is Chakra's `asChild={false}` route: the paths are contents, not an element, so
    // the `svg` this renders is the only one and the recipe is already on it.
    const BoxedIcon = createIcon({ d: "M0 0h24v24H0z" });
    mounted = mountElement<SVGElement>(() => <BoxedIcon size="lg" />);

    expect(mounted.element.querySelector("svg")).toBeNull();

    const { element, glyph } = boxes(mounted.element);
    expect(element.width).toBe(24);
    expect(glyph.width).toBe(element.width);
  });

  it("defaults the viewBox, and takes the caller's over it", () => {
    const WideIcon = createIcon({ viewBox: "0 0 32 32", d: "M16 16h.01" });
    const PlainIcon = createIcon({ d: "M12 12h.01" });

    mounted = mountElement<SVGElement>(() => <PlainIcon />);
    expect(mounted.element.getAttribute("viewBox")).toBe("0 0 24 24");
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <WideIcon />);
    expect(mounted.element.getAttribute("viewBox")).toBe("0 0 32 32");
  });

  it("applies `defaultProps`, and loses to a caller who passes the same prop", () => {
    const BoxedIcon = createIcon({ d: "M12 12h.01", defaultProps: { size: "sm" } });

    mounted = mountElement<SVGElement>(() => <BoxedIcon />);
    expect(getComputedStyle(mounted.element).width).toBe("16px");
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <BoxedIcon size="2xl" />);
    expect(getComputedStyle(mounted.element).width).toBe("32px");
  });

  it("keeps `defaultProps` when a wrapper forwards the prop unset", () => {
    const BoxedIcon = createIcon({ d: "M12 12h.01", defaultProps: { size: "sm" } });
    mounted = mountElement<SVGElement>(() => <BoxedIcon size={undefined} />);

    expect(getComputedStyle(mounted.element).width).toBe("16px");
  });

  it("names the component for the devtools", () => {
    const HeartIcon = createIcon({ displayName: "HeartIcon", d: "M12 12h.01" });

    expect(HeartIcon.name).toBe("HeartIcon");
  });
});
