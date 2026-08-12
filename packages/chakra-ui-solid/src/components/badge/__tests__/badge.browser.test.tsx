import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { badge } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Badge, BadgePropsProvider } from "../badge";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("Badge", () => {
  it("renders a span at the recipe's defaults", () => {
    // A bare `span` is `display: inline` with the document's own font size and weight, so all four
    // of these are the recipe answering rather than the browser: `sm` is the default step and
    // `subtle` the default variant.
    mounted = mountElement(() => <Badge>New</Badge>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("SPAN");
    expect(style.display).toBe("inline-flex");
    expect(style.fontSize).toBe("12px");
    expect(style.minHeight).toBe("20px");
    expect(style.fontWeight).toBe("500");
  });

  it("takes its colour from `colorPalette`, which is why the recipe names none", () => {
    mounted = mountElement(() => <Badge colorPalette="green">New</Badge>);

    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(220, 252, 231)");
  });

  it("resolves `variant` to a different fill", () => {
    // `solid` paints `colorPalette.solid` where `subtle` paints `colorPalette.subtle`, so the two
    // differ on the same palette — and `plain` is the one that drops the box entirely.
    mounted = mountElement(() => (
      <Badge colorPalette="green" variant="solid">
        New
      </Badge>
    ));

    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(22, 163, 74)");
  });

  it("keeps `plain` boxless", () => {
    mounted = mountElement(() => (
      <Badge colorPalette="green" variant="plain">
        New
      </Badge>
    ));

    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "md">("xs");
    mounted = mountElement(() => <Badge size={size()}>New</Badge>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("10px");
    flush(() => setSize("md"));
    expect(getComputedStyle(mounted.element).fontSize).toBe("14px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The recipe lands in `@layer recipes`, below the `@layer utilities` a style prop emits into,
    // so `fontSize` wins against the default `sm` step rather than racing it on source order.
    mounted = mountElement(() => <Badge fontSize="2xl">New</Badge>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("24px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => (
      <Badge unstyled colorPalette="green" fontSize="2xl">
        New
      </Badge>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("inline");
    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.fontSize).toBe("24px");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => (
      <Badge variant="solid" size="lg">
        New
      </Badge>
    ));

    expect(mounted.element.hasAttribute("size")).toBe(false);
    expect(mounted.element.hasAttribute("variant")).toBe(false);
    // The seam omits those keys by literal name, because `omit` narrows by the keys it is handed
    // and a `string[]` narrows nothing. This is what keeps the two lists one list: a variant added
    // to the recipe upstream and not to the tuple would reach the DOM as an attribute.
    expect(badge.variantKeys).toEqual(["variant", "size"]);
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <BadgePropsProvider value={{ size: "md" }}>
        <Badge>New</Badge>
      </BadgePropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("14px");
  });

  it("lets a local prop beat the provider", () => {
    mounted = mountElement(() => (
      <BadgePropsProvider value={{ size: "md" }}>
        <Badge size="xs">New</Badge>
      </BadgePropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("10px");
  });

  it("keeps the provider's value when a wrapper forwards an unset `size`", () => {
    // The seam's merge resolves by *value*, not by presence. Spelled `merge(context, props)` it
    // resolves by presence, and `<Badge size={props.size}>` in a wrapper with nothing set beats
    // the provider with `undefined` — the subtree silently drops back to the recipe's `sm`.
    mounted = mountElement(() => (
      <BadgePropsProvider value={{ size: "md" }}>
        <Badge size={undefined}>New</Badge>
      </BadgePropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("14px");
  });
});
