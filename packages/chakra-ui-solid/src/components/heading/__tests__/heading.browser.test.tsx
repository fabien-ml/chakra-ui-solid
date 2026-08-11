import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { heading } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Heading, HeadingPropsProvider } from "../heading";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Heading", () => {
  it("renders an h2 at the recipe's default step", () => {
    // Panda's reset gives every `h1`–`h6` `font-size: inherit; font-weight: inherit`, so both of
    // these are the recipe's answer rather than the browser's — an `h2` with no CSS generated for
    // it computes 16px / 400 here.
    mounted = mountElement(() => <Heading>Some heading text</Heading>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("H2");
    expect(style.fontWeight).toBe("600");
    expect(style.fontSize).toBe("20px");
  });

  it("resolves `size` to a real step", () => {
    mounted = mountElement(() => <Heading size="lg">Some heading text</Heading>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("18px");
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"lg" | "3xl">("lg");
    mounted = mountElement(() => <Heading size={size()}>Some heading text</Heading>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("18px");
    flush(() => setSize("3xl"));
    expect(getComputedStyle(mounted.element).fontSize).toBe("30px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The recipe lands in `@layer recipes`, below the `@layer utilities` a style prop emits into,
    // so `fontSize` wins against the default `xl` step rather than racing it on source order.
    mounted = mountElement(() => <Heading fontSize="sm">Some heading text</Heading>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("14px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => (
      <Heading unstyled fontSize="sm">
        Some heading text
      </Heading>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.fontWeight).toBe("400");
    expect(style.fontSize).toBe("14px");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => <Heading size="lg">Some heading text</Heading>);

    expect(mounted.element.hasAttribute("size")).toBe(false);
    // The seam omits those keys by literal name, because `omit` narrows by the keys it is handed
    // and a `string[]` narrows nothing. This is what keeps the two lists one list: a variant added
    // to the recipe upstream and not to the tuple would reach the DOM as an attribute.
    expect(heading.variantKeys).toEqual(["size"]);
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <HeadingPropsProvider value={{ size: "lg" }}>
        <Heading>Some heading text</Heading>
      </HeadingPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("18px");
  });

  it("lets a local prop beat the provider", () => {
    mounted = mountElement(() => (
      <HeadingPropsProvider value={{ size: "lg" }}>
        <Heading size="3xl">Some heading text</Heading>
      </HeadingPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("30px");
  });
});
