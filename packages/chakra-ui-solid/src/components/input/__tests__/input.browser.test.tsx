import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { input } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Input, InputPropsProvider } from "../input";

let mounted: MountedElement<HTMLInputElement> | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Input", () => {
  it("renders an input at the recipe's defaults", () => {
    // A bare `input` is auto-width with a UA border, so all four of these are the recipe
    // answering: `md` is the default step and `outline` the default variant.
    mounted = mountElement<HTMLInputElement>(() => <Input />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("INPUT");
    expect(style.height).toBe("40px");
    expect(style.fontSize).toBe("14px");
    expect(style.borderBottomWidth).toBe("1px");
    expect(style.width).toBe(`${mounted.container.clientWidth}px`);
  });

  it("publishes its height as `--input-height`, which is what sits beside the field", () => {
    // The one value that leaves the recipe: `input-group` reads it back to compute the padding
    // that clears a start or end element.
    mounted = mountElement<HTMLInputElement>(() => <Input size="lg" />);

    expect(getComputedStyle(mounted.element).getPropertyValue("--input-height")).toBe("2.75rem");
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "xl">("xs");
    mounted = mountElement<HTMLInputElement>(() => <Input size={size()} />);

    expect(getComputedStyle(mounted.element).height).toBe("32px");
    flush(() => setSize("xl"));
    expect(getComputedStyle(mounted.element).height).toBe("48px");
  });

  it("keeps only the bottom edge when flushed", () => {
    // `flushed` is the variant that subtracts: no radius and no horizontal padding, so the field
    // sits flat against whatever is beside it.
    mounted = mountElement<HTMLInputElement>(() => <Input variant="flushed" />);
    const style = getComputedStyle(mounted.element);

    expect(style.borderRadius).toBe("0px");
    expect(style.paddingLeft).toBe("0px");
    expect(style.borderBottomWidth).toBe("1px");
  });

  it("fills instead of outlining when subtle", () => {
    mounted = mountElement<HTMLInputElement>(() => <Input variant="subtle" />);

    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The recipe lands in `@layer recipes`, below the `@layer utilities` a style prop emits into,
    // so `fontSize` wins against the default `md` step rather than racing it on source order.
    mounted = mountElement<HTMLInputElement>(() => <Input fontSize="2xl" />);

    expect(getComputedStyle(mounted.element).fontSize).toBe("24px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement<HTMLInputElement>(() => <Input unstyled fontSize="2xl" />);
    const style = getComputedStyle(mounted.element);

    expect(style.height).not.toBe("40px");
    expect(style.fontSize).toBe("24px");
  });

  it("takes the CSS custom property that recolours the focus ring", () => {
    // `--focus-color` and `--error-color` are the recipe's own seams — recolouring the ring needs
    // neither a variant nor an override of the `boxShadow` the variant computes.
    mounted = mountElement<HTMLInputElement>(() => <Input css={{ "--focus-color": "lime" }} />);

    expect(getComputedStyle(mounted.element).getPropertyValue("--focus-color")).toBe("lime");
  });

  // `aria-invalid` rather than a `<Field.Root invalid>` around it: the recipe reads
  // `:is(:invalid, [data-invalid], [aria-invalid=true])`, and the attribute is what Field sets.
  //
  // What these pin is a **cascade** outcome, not a declaration. Panda nests a recipe's base styles
  // as `@layer recipes { @layer _base { … } …variants… }`, and unlayered rules in a layer beat that
  // layer's sub-layers whatever their specificity — so the flat `variant` border colour used to
  // defeat the far more specific invalid rule in `base`, and an invalid field rendered in its
  // resting colour. The preset copies each conditional base block into the variant values, which
  // puts a `--variant_outline:is(:invalid, …)` rule beside `--variant_outline` in one layer and
  // hands the decision back to specificity — what the React runtime's merge into one class does for
  // free.
  describe.each(["outline", "subtle", "flushed"] as const)("when invalid and %s", (variant) => {
    it("borders in the error colour rather than the variant's", () => {
      mounted = mountElement<HTMLInputElement>(() => (
        <Input variant={variant} aria-invalid="true" />
      ));

      // `border.error` is `red.500` in the light palette these tests render against.
      expect(getComputedStyle(mounted.element).borderColor).toBe("rgb(239, 68, 68)");
    });

    it("takes the `--error-color` seam", () => {
      mounted = mountElement<HTMLInputElement>(() => (
        <Input variant={variant} aria-invalid="true" css={{ "--error-color": "green" }} />
      ));

      expect(getComputedStyle(mounted.element).borderColor).toBe("rgb(0, 128, 0)");
    });
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement<HTMLInputElement>(() => <Input size="lg" variant="subtle" />);

    expect(mounted.element.hasAttribute("size")).toBe(false);
    expect(mounted.element.hasAttribute("variant")).toBe(false);
    // The seam omits those keys by literal name, so the tuple and the recipe have to stay one
    // list — and this recipe orders them `size` first, where Badge's is the other way round.
    expect(input.variantKeys).toEqual(["size", "variant"]);
  });

  it("forwards the native attributes an input is for", () => {
    mounted = mountElement<HTMLInputElement>(() => (
      <Input type="email" placeholder="Enter your email" disabled />
    ));

    expect(mounted.element.type).toBe("email");
    expect(mounted.element.placeholder).toBe("Enter your email");
    expect(mounted.element.disabled).toBe(true);
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement<HTMLInputElement>(() => (
      <InputPropsProvider value={{ size: "lg" }}>
        <Input />
      </InputPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).height).toBe("44px");
  });

  it("lets a local prop beat the provider", () => {
    mounted = mountElement<HTMLInputElement>(() => (
      <InputPropsProvider value={{ size: "lg" }}>
        <Input size="xs" />
      </InputPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).height).toBe("32px");
  });

  it("keeps the provider's value when a wrapper forwards an unset `size`", () => {
    // The seam's merge resolves by *value*, not by presence. Spelled `merge(context, props)` it
    // resolves by presence, and `<Input size={props.size}>` in a wrapper with nothing set beats
    // the provider with `undefined` — the subtree silently drops back to the recipe's `md`.
    mounted = mountElement<HTMLInputElement>(() => (
      <InputPropsProvider value={{ size: "lg" }}>
        <Input size={undefined} />
      </InputPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).height).toBe("44px");
  });
});
