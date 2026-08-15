import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { spinner } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Spinner, SpinnerPropsProvider } from "../spinner";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Spinner", () => {
  it("renders a ring at the recipe's default diameter", () => {
    mounted = mountElement(() => <Spinner />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("SPAN");
    expect(style.display).toBe("inline-block");
    expect(style.width).toBe("20px");
    expect(style.height).toBe("20px");
  });

  it("resolves `size` to real dimensions", () => {
    // The size variant sets `--spinner-size` and the base reads it for both axes, so an unresolved
    // variant leaves the custom property undefined and the span collapses to nothing — visible
    // here as a width of 0, which is exactly the silent-unstyling case this asserts against.
    mounted = mountElement(() => <Spinner size="lg" />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("32px");
    expect(style.height).toBe("32px");
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "lg">("xs");
    mounted = mountElement(() => <Spinner size={size()} />);

    expect(getComputedStyle(mounted.element).width).toBe("12px");
    flush(() => setSize("lg"));
    expect(getComputedStyle(mounted.element).width).toBe("32px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The docs page's own thickness example: the recipe draws a 2px ring in `@layer recipes`, and
    // `borderWidth` emits into `@layer utilities` above it.
    mounted = mountElement(() => <Spinner borderWidth="4px" />);

    expect(getComputedStyle(mounted.element).borderTopWidth).toBe("4px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => <Spinner unstyled paddingInline="10" />);
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("inline");
    expect(style.animationName).toBe("none");
    expect(style.paddingInlineStart).toBe("40px");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => <Spinner size="lg" />);

    expect(mounted.element.hasAttribute("size")).toBe(false);
    // The seam omits those keys by literal name, because `omit` narrows by the keys it is
    // handed and a `string[]` narrows nothing. This is what keeps the two lists one list: a variant
    // added to the recipe upstream and not to the tuple would reach the DOM as an attribute.
    expect(spinner.variantKeys).toEqual(["size"]);
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <SpinnerPropsProvider value={{ size: "lg" }}>
        <Spinner />
      </SpinnerPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).width).toBe("32px");
  });

  it("lets a local prop beat the provider", () => {
    mounted = mountElement(() => (
      <SpinnerPropsProvider value={{ size: "lg" }}>
        <Spinner size="xs" />
      </SpinnerPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).width).toBe("12px");
  });
});
