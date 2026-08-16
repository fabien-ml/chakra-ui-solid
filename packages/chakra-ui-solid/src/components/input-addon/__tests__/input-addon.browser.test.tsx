import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { inputAddon } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { InputAddon } from "../input-addon";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

type AddonSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** Every step, with the field height it publishes as `--input-height`. */
const HEIGHT_PER_SIZE: ReadonlyArray<readonly [AddonSize, string]> = [
  ["2xs", "1.75rem"],
  ["xs", "2rem"],
  ["sm", "2.25rem"],
  ["md", "2.5rem"],
  ["lg", "2.75rem"],
  ["xl", "3rem"],
  ["2xl", "4rem"],
];

describe("InputAddon", () => {
  it("renders a div at the recipe's defaults", () => {
    // A bare `div` is a block with no border, no background and the document's font size, so every
    // one of these is the recipe answering: `md` is the default step and `outline` the default
    // variant.
    mounted = mountElement(() => <InputAddon>https://</InputAddon>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("DIV");
    expect(style.display).toBe("flex");
    expect(style.alignItems).toBe("center");
    expect(style.fontSize).toBe("14px");
    expect(style.paddingLeft).toBe("12px");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).toBe("rgb(228, 228, 231)");
    expect(style.backgroundColor).toBe("rgb(244, 244, 245)");
  });

  it.each(HEIGHT_PER_SIZE)("republishes `--input-height` at size %s", (size, height) => {
    // Every step declares it, not just the default — this is the value `input-group` reads back to
    // compute the padding that clears a start or end element, and a step that dropped it would
    // compute that against nothing.
    mounted = mountElement(() => <InputAddon size={size}>https://</InputAddon>);

    expect(getComputedStyle(mounted.element).getPropertyValue("--input-height")).toBe(height);
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "2xl">("xs");
    mounted = mountElement(() => <InputAddon size={size()}>https://</InputAddon>);

    expect(getComputedStyle(mounted.element).paddingLeft).toBe("8px");
    flush(() => setSize("2xl"));
    expect(getComputedStyle(mounted.element).paddingLeft).toBe("20px");
  });

  it("fills more strongly behind a transparent border when subtle", () => {
    // `subtle` keeps the 1px border so the box does not shift between variants — it just paints it
    // transparent, which is the difference from `outline` that a background check alone would miss.
    mounted = mountElement(() => <InputAddon variant="subtle">https://</InputAddon>);
    const style = getComputedStyle(mounted.element);

    expect(style.backgroundColor).toBe("rgb(228, 228, 231)");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).toBe(TRANSPARENT);
  });

  it("keeps only the bottom edge when flushed", () => {
    // `flushed` is the variant that subtracts: no fill, no radius and no horizontal padding, so the
    // addon sits flat against the field beside it.
    mounted = mountElement(() => <InputAddon variant="flushed">https://</InputAddon>);
    const style = getComputedStyle(mounted.element);

    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.borderRadius).toBe("0px");
    expect(style.paddingLeft).toBe("0px");
    expect(style.borderBottomWidth).toBe("1px");
    expect(style.borderTopWidth).toBe("0px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The recipe lands in `@layer recipes`, below the `@layer utilities` a style prop emits into,
    // so `bg` wins against the default `outline` fill rather than racing it on source order.
    mounted = mountElement(() => <InputAddon bg="red.500">https://</InputAddon>);

    expect(getComputedStyle(mounted.element).backgroundColor).toBe("rgb(239, 68, 68)");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement(() => (
      <InputAddon unstyled fontSize="2xl">
        https://
      </InputAddon>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("block");
    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.borderTopWidth).toBe("0px");
    expect(style.fontSize).toBe("24px");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => (
      <InputAddon size="lg" variant="subtle">
        https://
      </InputAddon>
    ));

    expect(mounted.element.hasAttribute("size")).toBe(false);
    expect(mounted.element.hasAttribute("variant")).toBe(false);
    // The seam omits those keys by literal name, so the tuple and the recipe have to stay one
    // list: a variant added to the recipe upstream and not to the tuple would reach the DOM as an
    // attribute.
    expect(inputAddon.variantKeys).toEqual(["size", "variant"]);
  });

  it("falls back to the recipe's `md` when a wrapper forwards an unset `size`", () => {
    // The seam resolves by *value*, not by presence, so an unset forwarded `size` leaves the
    // recipe's own default in place rather than overriding it with `undefined` and emitting a
    // variant class for nothing.
    mounted = mountElement(() => <InputAddon size={undefined}>https://</InputAddon>);

    expect(getComputedStyle(mounted.element).paddingLeft).toBe("12px");
  });
});
