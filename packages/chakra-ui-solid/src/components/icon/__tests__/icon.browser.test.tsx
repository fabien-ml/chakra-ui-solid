import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { icon } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { createIcon } from "../create-icon";
import { Icon, IconPropsProvider } from "../icon";

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
