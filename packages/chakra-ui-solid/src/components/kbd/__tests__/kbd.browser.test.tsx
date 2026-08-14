import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { kbd } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Kbd, KbdPropsProvider } from "../kbd";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("Kbd", () => {
  it("renders a kbd element at the recipe's defaults", () => {
    mounted = mountElement(() => <Kbd>Shift + Tab</Kbd>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("KBD");
    expect(style.display).toBe("inline-flex");
    // `md` — the default step, not the browser's: a bare `kbd` is `inline` at the document's own
    // size with no height at all.
    expect(style.fontSize).toBe("14px");
    expect(style.height).toBe("20px");
    // The base's own rule, and the one that lets a whole chord live in one element.
    expect(style.wordSpacing).toBe("-7px");
  });

  it("draws the raised cap with a thicker bottom border than its other three", () => {
    mounted = mountElement(() => <Kbd>⌘</Kbd>);
    const style = getComputedStyle(mounted.element);

    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderBottomWidth).toBe("2px");
  });

  it("keeps `plain` boxless", () => {
    mounted = mountElement(() => <Kbd variant="plain">⌘</Kbd>);
    const style = getComputedStyle(mounted.element);

    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.borderBottomWidth).toBe("0px");
  });

  it("takes its colour from `colorPalette`, which is why the recipe names none", () => {
    mounted = mountElement(() => (
      <Kbd colorPalette="green" variant="subtle">
        ⌘
      </Kbd>
    ));

    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(187, 247, 208)");
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mountElement(() => <Kbd size={size()}>⌘</Kbd>);

    expect(getComputedStyle(mounted.element).height).toBe("18px");
    flush(() => setSize("lg"));
    expect(getComputedStyle(mounted.element).height).toBe("24px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement(() => <Kbd fontSize="2xl">⌘</Kbd>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("24px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => (
      <Kbd unstyled fontSize="2xl">
        ⌘
      </Kbd>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("inline");
    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.fontSize).toBe("24px");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => (
      <Kbd variant="outline" size="lg">
        ⌘
      </Kbd>
    ));

    expect(mounted.element.hasAttribute("size")).toBe(false);
    expect(mounted.element.hasAttribute("variant")).toBe(false);
    expect(kbd.variantKeys).toEqual(["variant", "size"]);
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <KbdPropsProvider value={{ size: "lg" }}>
        <Kbd>⌘</Kbd>
      </KbdPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).height).toBe("24px");
  });

  it("keeps the provider's value when a wrapper forwards an unset `size`", () => {
    mounted = mountElement(() => (
      <KbdPropsProvider value={{ size: "lg" }}>
        <Kbd size={undefined}>⌘</Kbd>
      </KbdPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).height).toBe("24px");
  });
});
