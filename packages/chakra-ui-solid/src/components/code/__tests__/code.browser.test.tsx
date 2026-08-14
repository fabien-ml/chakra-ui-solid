import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { code } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Code, CodePropsProvider } from "../code";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("Code", () => {
  it("renders a code element at the recipe's defaults", () => {
    mounted = mountElement(() => <Code>console.log()</Code>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("CODE");
    expect(style.display).toBe("inline-flex");
    expect(style.fontSize).toBe("12px");
    // The one thing that is Code's rather than Badge's: the same variants over a monospace base.
    // A bare `code` element is monospace in the UA sheet too, so what this pins is that the recipe
    // names the *token* family — `var(--chakra-fonts-mono)` resolves to a stack starting with a
    // named face, where the UA default is the bare `monospace` keyword.
    expect(style.fontFamily).not.toBe("monospace");
  });

  it("takes its colour from `colorPalette`, which is why the recipe names none", () => {
    mounted = mountElement(() => <Code colorPalette="green">console.log()</Code>);

    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(220, 252, 231)");
  });

  it("resolves `variant` to a different fill", () => {
    mounted = mountElement(() => (
      <Code colorPalette="green" variant="solid">
        console.log()
      </Code>
    ));

    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(22, 163, 74)");
  });

  it("keeps `plain` boxless", () => {
    mounted = mountElement(() => (
      <Code colorPalette="green" variant="plain">
        console.log()
      </Code>
    ));

    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "md">("xs");
    mounted = mountElement(() => <Code size={size()}>console.log()</Code>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("10px");
    flush(() => setSize("md"));
    expect(getComputedStyle(mounted.element).fontSize).toBe("14px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement(() => <Code fontSize="2xl">console.log()</Code>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("24px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => (
      <Code unstyled colorPalette="green" fontSize="2xl">
        console.log()
      </Code>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("inline");
    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.fontSize).toBe("24px");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => (
      <Code variant="solid" size="lg">
        console.log()
      </Code>
    ));

    expect(mounted.element.hasAttribute("size")).toBe(false);
    expect(mounted.element.hasAttribute("variant")).toBe(false);
    // The seam omits those keys by literal name, so a variant added to the recipe upstream and not
    // to the tuple would reach the DOM as an attribute.
    expect(code.variantKeys).toEqual(["variant", "size"]);
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <CodePropsProvider value={{ size: "md" }}>
        <Code>console.log()</Code>
      </CodePropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("14px");
  });

  it("keeps the provider's value when a wrapper forwards an unset `size`", () => {
    // The seam's merge resolves by *value*, not by presence — spelled `merge(context, props)` a
    // wrapper with nothing set would beat the provider with `undefined`.
    mounted = mountElement(() => (
      <CodePropsProvider value={{ size: "md" }}>
        <Code size={undefined}>console.log()</Code>
      </CodePropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("14px");
  });
});
