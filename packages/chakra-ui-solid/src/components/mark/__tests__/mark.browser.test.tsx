import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { mark } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Mark, MarkPropsProvider } from "../mark";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("Mark", () => {
  it("renders a mark element with the browser's own highlight neutralised", () => {
    // The whole point of the base: a bare `<mark>` is black on yellow in every UA sheet, and every
    // colour this component shows is meant to come from `colorPalette` instead. An unstyled one
    // would still be yellow and nothing would say so.
    mounted = mountElement(() => <Mark>design system</Mark>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("MARK");
    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.whiteSpace).toBe("nowrap");
  });

  it("has no default variant, so a bare Mark is the base alone", () => {
    // `markRecipe` declares no `defaultVariants` — the one atomic recipe in this batch that does
    // not — which is why {@link MarkProps.variant} carries no `@default` tag.
    expect(mark.variantKeys).toEqual(["variant"]);
    expect(mark()).toBe(mark({}));
  });

  it("fills from `colorPalette` on `subtle`", () => {
    mounted = mountElement(() => (
      <Mark colorPalette="green" variant="subtle">
        design system
      </Mark>
    ));

    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(220, 252, 231)");
  });

  it("tracks a variant that changes", () => {
    const [variant, setVariant] = createSignal<"text" | "solid">("text");
    mounted = mountElement(() => (
      <Mark colorPalette="green" variant={variant()}>
        design system
      </Mark>
    ));

    expect(getComputedStyle(mounted.element).fontWeight).toBe("500");
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
    flush(() => setVariant("solid"));
    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(22, 163, 74)");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement(() => (
      <Mark variant="solid" colorPalette="green" bg="blue.500">
        design system
      </Mark>
    ));

    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(59, 130, 246)");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => (
      <Mark unstyled fontSize="2xl">
        design system
      </Mark>
    ));
    const style = getComputedStyle(mounted.element);

    // Unstyled means the UA sheet is back, yellow highlight and all — which is exactly what the
    // opt-out promises, and why the base above is worth pinning.
    expect(style.whiteSpace).toBe("normal");
    expect(style.fontSize).toBe("24px");
  });

  it("keeps the recipe's variant prop off the element", () => {
    mounted = mountElement(() => <Mark variant="solid">design system</Mark>);

    expect(mounted.element.hasAttribute("variant")).toBe(false);
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <MarkPropsProvider value={{ variant: "text" }}>
        <Mark>design system</Mark>
      </MarkPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontWeight).toBe("500");
  });

  it("keeps the provider's value when a wrapper forwards an unset `variant`", () => {
    mounted = mountElement(() => (
      <MarkPropsProvider value={{ variant: "text" }}>
        <Mark variant={undefined}>design system</Mark>
      </MarkPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontWeight).toBe("500");
  });
});
