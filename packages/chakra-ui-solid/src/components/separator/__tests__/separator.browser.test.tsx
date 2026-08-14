import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { separator } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Separator, SeparatorPropsProvider } from "../separator";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const thicknessOf = (element: Element) =>
  getComputedStyle(element).getPropertyValue("--separator-thickness").trim();

describe("Separator", () => {
  it("renders a horizontal rule at the recipe's defaults", () => {
    mounted = mountElement(() => <Separator />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("SPAN");
    expect(style.display).toBe("block");
    expect(thicknessOf(mounted.element)).toBe("1px");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderInlineStartWidth).toBe("0px");
    expect(style.borderTopStyle).toBe("solid");
  });

  it("announces itself as a separator with an orientation", () => {
    mounted = mountElement(() => <Separator />);

    expect(mounted.element.getAttribute("role")).toBe("separator");
    expect(mounted.element.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("moves the border to the inline start when vertical", () => {
    mounted = mountElement(() => <Separator orientation="vertical" height="4" />);
    const style = getComputedStyle(mounted.element);

    expect(style.borderInlineStartWidth).toBe("1px");
    expect(style.borderTopWidth).toBe("0px");
    expect(mounted.element.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("becomes decorative when the orientation is responsive", () => {
    // `aria-orientation` takes one value and a breakpoint-conditional orientation has several, so
    // rather than announce whichever was written first the element drops out of the a11y tree.
    // Chakra's own rule, and its docs page says so.
    mounted = mountElement(() => (
      <Separator orientation={{ base: "vertical", sm: "horizontal" }} />
    ));

    expect(mounted.element.getAttribute("role")).toBe("presentation");
    expect(mounted.element.hasAttribute("aria-orientation")).toBe(false);
  });

  it("lets a consumer's own `role` and `aria-orientation` win", () => {
    // Both are written before the props spread, upstream included, so the component's answer is a
    // starting point rather than the last word — a `role="presentation"` that type-checks and does
    // nothing would be the defect.
    mounted = mountElement(() => (
      <Separator role="presentation" aria-orientation="horizontal" orientation="vertical" />
    ));

    expect(mounted.element.getAttribute("role")).toBe("presentation");
    expect(mounted.element.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("tracks an orientation that changes, in the role as well as the styles", () => {
    const [orientation, setOrientation] = createSignal<"horizontal" | "vertical">("horizontal");
    mounted = mountElement(() => <Separator orientation={orientation()} height="4" />);

    expect(mounted.element.getAttribute("aria-orientation")).toBe("horizontal");
    flush(() => setOrientation("vertical"));
    expect(mounted.element.getAttribute("aria-orientation")).toBe("vertical");
    expect(getComputedStyle(mounted.element).borderInlineStartWidth).toBe("1px");
  });

  it("sets the thickness from `size`, through the custom property the recipe declares", () => {
    const [size, setSize] = createSignal<"xs" | "lg">("xs");
    mounted = mountElement(() => <Separator size={size()} />);

    expect(thicknessOf(mounted.element)).toBe("0.5px");
    flush(() => setSize("lg"));
    expect(thicknessOf(mounted.element)).toBe("3px");
    expect(getComputedStyle(mounted.element).borderTopWidth).toBe("3px");
  });

  it("resolves `variant` to a different border style", () => {
    mounted = mountElement(() => <Separator variant="dashed" />);

    expect(getComputedStyle(mounted.element).borderTopStyle).toBe("dashed");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement(() => <Separator borderTopWidth="8px" />);

    expect(getComputedStyle(mounted.element).borderTopWidth).toBe("8px");
  });

  it("drops the recipe entirely when unstyled, and keeps the role", () => {
    mounted = mountElement(() => <Separator unstyled />);
    const style = getComputedStyle(mounted.element);

    expect(style.borderTopWidth).toBe("0px");
    // The role is this component's, not the recipe's — unstyling drops paint, never semantics.
    expect(mounted.element.getAttribute("role")).toBe("separator");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => <Separator variant="dotted" size="lg" orientation="vertical" />);

    expect(mounted.element.hasAttribute("size")).toBe(false);
    expect(mounted.element.hasAttribute("variant")).toBe(false);
    expect(mounted.element.hasAttribute("orientation")).toBe(false);
    // The seam omits those keys by literal name, so a variant added to the recipe upstream and not
    // to the tuple would reach the DOM as an attribute.
    expect(separator.variantKeys).toEqual(["variant", "orientation", "size"]);
  });

  it("takes props from a provider above it, which the React version's does not", () => {
    // A recorded divergence, and the repairing kind: upstream's `useRecipeResult` never reads the
    // props context — only its `withContext` does — so `SeparatorPropsProvider` changes nothing at
    // all there, styles included (`roadmap.md`, the `separator` row).
    mounted = mountElement(() => (
      <SeparatorPropsProvider value={{ size: "lg", orientation: "vertical" }}>
        <Separator height="4" />
      </SeparatorPropsProvider>
    ));

    expect(thicknessOf(mounted.element)).toBe("3px");
    expect(mounted.element.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("keeps the provider's value when a wrapper forwards an unset `size`", () => {
    mounted = mountElement(() => (
      <SeparatorPropsProvider value={{ size: "lg" }}>
        <Separator size={undefined} />
      </SeparatorPropsProvider>
    ));

    expect(thicknessOf(mounted.element)).toBe("3px");
  });
});
