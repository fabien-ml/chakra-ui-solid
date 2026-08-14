import {
  expectNoA11yViolations,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import { link } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Link, LinkPropsProvider } from "../link";
import { LinkBox, LinkOverlay } from "../link-box";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Link", () => {
  it("renders an anchor at the recipe's defaults", () => {
    mounted = mountElement(() => <Link href="#target">Visit</Link>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("A");
    expect(mounted.element.getAttribute("href")).toBe("#target");
    expect(style.display).toBe("inline-flex");
    expect(style.alignItems).toBe("center");
    // `plain` is the default, and it is the one that carries no underline until hover — which is
    // the only observable difference between the two variants at rest.
    expect(style.textDecorationLine).toBe("none");
  });

  it("underlines at rest on `underline`", () => {
    mounted = mountElement(() => (
      <Link href="#target" variant="underline">
        Visit
      </Link>
    ));

    expect(getComputedStyle(mounted.element).textDecorationLine).toBe("underline");
  });

  it("takes its colour from `colorPalette`, which is why the recipe names none", () => {
    mounted = mountElement(() => (
      <Link href="#target" colorPalette="teal">
        Visit
      </Link>
    ));

    expect(getComputedStyle(mounted.element).color).toBe("rgb(12, 93, 86)");
  });

  it("tracks a variant that changes", () => {
    const [variant, setVariant] = createSignal<"plain" | "underline">("plain");
    mounted = mountElement(() => (
      <Link href="#target" variant={variant()}>
        Visit
      </Link>
    ));

    expect(getComputedStyle(mounted.element).textDecorationLine).toBe("none");
    flush(() => setVariant("underline"));
    expect(getComputedStyle(mounted.element).textDecorationLine).toBe("underline");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement(() => (
      <Link href="#target" display="block">
        Visit
      </Link>
    ));

    expect(getComputedStyle(mounted.element).display).toBe("block");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => (
      <Link href="#target" unstyled color="red.500">
        Visit
      </Link>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("inline");
    expect(style.color).toBe("rgb(239, 68, 68)");
  });

  it("keeps the recipe's variant prop off the element", () => {
    mounted = mountElement(() => (
      <Link href="#target" variant="underline">
        Visit
      </Link>
    ));

    expect(mounted.element.hasAttribute("variant")).toBe(false);
    expect(link.variantKeys).toEqual(["variant"]);
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <LinkPropsProvider value={{ variant: "underline" }}>
        <Link href="#target">Visit</Link>
      </LinkPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).textDecorationLine).toBe("underline");
  });

  it("keeps the provider's value when a wrapper forwards an unset `variant`", () => {
    mounted = mountElement(() => (
      <LinkPropsProvider value={{ variant: "underline" }}>
        <Link href="#target" variant={undefined}>
          Visit
        </Link>
      </LinkPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).textDecorationLine).toBe("underline");
  });

  it("hands the computed props to `render`, which is how a router's own link is wrapped", () => {
    // Chakra spells this `asChild`. `render` is the Solid-native form: the anchor's computed props
    // — class included — are handed to the caller to place, rather than cloned onto an element that
    // was already built.
    mounted = mountElement(() => (
      <Link
        href="#target"
        variant="underline"
        render={(anchorProps) => <a {...anchorProps} data-router="yes" />}
      />
    ));

    expect(mounted.element.getAttribute("data-router")).toBe("yes");
    expect(getComputedStyle(mounted.element).textDecorationLine).toBe("underline");
  });

  it("has no accessibility violations", async () => {
    mounted = mountElement(() => <Link href="#target">Visit the docs</Link>);

    await expectNoA11yViolations(mounted.element);
  });
});

describe("LinkBox", () => {
  const overlayOf = (root: Element) => {
    const overlay = root.querySelector(".chakra-linkbox__overlay");
    if (!(overlay instanceof HTMLElement)) {
      throw new Error("the box is missing its overlay");
    }
    return overlay;
  };

  it("positions itself, so the overlay's pseudo element has something to fill", () => {
    mounted = mountElement(() => (
      <LinkBox>
        <LinkOverlay href="#target">Read more</LinkOverlay>
      </LinkBox>
    ));

    expect(getComputedStyle(mounted.element).position).toBe("relative");
    // `static`, which is what makes the overlay's `::before` resolve against the box above rather
    // than against the anchor itself — the whole mechanism in one declaration.
    expect(getComputedStyle(overlayOf(mounted.element)).position).toBe("static");
  });

  it("lets a consumer's own `position` win, because it is a style prop before the spread", () => {
    mounted = mountElement(() => (
      <LinkBox position="absolute">
        <LinkOverlay href="#target">Read more</LinkOverlay>
      </LinkBox>
    ));

    expect(getComputedStyle(mounted.element).position).toBe("absolute");
  });

  it("lifts an inner link above the overlay, and leaves the overlay itself alone", () => {
    // The rule the `:not(.chakra-linkbox__overlay)` clause exists for: without it the overlay
    // would lift itself too and the box would stop being one big link, with nothing to say so.
    mounted = mountElement(() => (
      <LinkBox>
        <LinkOverlay href="#target">Read more</LinkOverlay>
        <a href="#inner" data-probe="inner">
          Inner
        </a>
      </LinkBox>
    ));

    const inner = mounted.element.querySelector('[data-probe="inner"]');
    if (!(inner instanceof HTMLElement)) {
      throw new Error("the box is missing its inner link");
    }

    expect(getComputedStyle(inner).position).toBe("relative");
    expect(getComputedStyle(inner).zIndex).toBe("1");
    expect(getComputedStyle(overlayOf(mounted.element)).zIndex).toBe("auto");
  });

  it("keeps a consumer's class beside the one the mechanism depends on", () => {
    mounted = mountElement(() => (
      <LinkBox class="card">
        <LinkOverlay class="stretch" href="#target">
          Read more
        </LinkOverlay>
      </LinkBox>
    ));

    expect(mounted.element.classList.contains("card")).toBe(true);
    expect(mounted.element.classList.contains("chakra-linkbox")).toBe(true);
    expect(overlayOf(mounted.element).classList.contains("stretch")).toBe(true);
  });

  it("has no accessibility violations", async () => {
    mounted = mountElement(() => (
      <LinkBox as="article">
        <LinkOverlay href="#target">Chakra V3 Workshop</LinkOverlay>
      </LinkBox>
    ));

    await expectNoA11yViolations(mounted.element);
  });
});
