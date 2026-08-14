import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { container } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Container, ContainerPropsProvider } from "../container";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Container", () => {
  it("centres a bounded column with the recipe's padding", () => {
    // The recipe body is the one this repo ports rather than inherits, so these three declarations
    // are the whole point: `@chakra-ui/panda-preset` has no `container` key, and without that port
    // every assertion here would read the browser's defaults off a completely unstyled `div`.
    mounted = mountElement(() => <Container>content</Container>);
    const style = getComputedStyle(mounted.element);

    expect(style.position).toBe("relative");
    expect(style.marginInlineStart).toBe(style.marginInlineEnd);
    expect(style.paddingInlineStart).toBe("16px");
    expect(style.maxWidth).toBe("1440px");
  });

  it("stacks its content down the centre with `centerContent`", () => {
    mounted = mountElement(() => <Container centerContent>content</Container>);
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
    expect(style.alignItems).toBe("center");
  });

  it("drops the maximum width with `fluid`", () => {
    mounted = mountElement(() => (
      <Container fluid width="800px">
        content
      </Container>
    ));

    expect(getComputedStyle(mounted.element).maxWidth).toBe("100%");
  });

  it("tracks a variant that changes", () => {
    const [fluid, setFluid] = createSignal(false);
    mounted = mountElement(() => <Container fluid={fluid()}>content</Container>);

    expect(getComputedStyle(mounted.element).maxWidth).toBe("1440px");
    flush(() => setFluid(true));
    expect(getComputedStyle(mounted.element).maxWidth).toBe("100%");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The reason this component goes through `recipeClass` rather than the factory's inline config:
    // a generated recipe lands in `@layer recipes`, below the `@layer utilities` a style prop emits
    // into. An inline `cva` would put both in one layer and let source order decide.
    mounted = mountElement(() => <Container paddingInline="10">content</Container>);

    expect(getComputedStyle(mounted.element).paddingInlineStart).toBe("40px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => (
      <Container unstyled paddingInline="10">
        content
      </Container>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.position).toBe("static");
    expect(style.paddingInlineStart).toBe("40px");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => <Container centerContent>content</Container>);

    expect(mounted.element.hasAttribute("centerContent")).toBe(false);
    expect(mounted.element.hasAttribute("centercontent")).toBe(false);
    // The seam omits those keys by literal name, because `omit` narrows by the keys it is handed
    // and a `string[]` narrows nothing. This is what keeps the two lists one list: a variant added
    // to the recipe and not to the tuple would reach the DOM as an attribute.
    expect(container.variantKeys).toEqual(["centerContent", "fluid"]);
  });

  it("renders the element `as` names", () => {
    mounted = mountElement(() => <Container as="main">content</Container>);

    expect(mounted.element.tagName).toBe("MAIN");
    expect(getComputedStyle(mounted.element).position).toBe("relative");
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <ContainerPropsProvider value={{ fluid: true }}>
        <Container>content</Container>
      </ContainerPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).maxWidth).toBe("100%");
  });

  it("lets a local prop beat the provider", () => {
    mounted = mountElement(() => (
      <ContainerPropsProvider value={{ fluid: true }}>
        <Container fluid={false}>content</Container>
      </ContainerPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).maxWidth).toBe("1440px");
  });

  it("keeps the provider's value when a wrapper forwards an unset `fluid`", () => {
    // The seam's merge resolves by *value*, not by presence. Spelled `merge(context, props)` it
    // resolves by presence, and `<Container fluid={props.fluid}>` in a wrapper with nothing set
    // beats the provider with `undefined` — the subtree silently gets its maximum width back.
    mounted = mountElement(() => (
      <ContainerPropsProvider value={{ fluid: true }}>
        <Container fluid={undefined}>content</Container>
      </ContainerPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).maxWidth).toBe("100%");
  });
});
