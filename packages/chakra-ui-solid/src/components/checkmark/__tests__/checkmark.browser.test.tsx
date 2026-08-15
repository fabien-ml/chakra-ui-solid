import checkmarkServerHtml from "virtual:hydration-fixture?id=checkmark";
import {
  hydrateFixture,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import { checkmark } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Checkmark } from "../checkmark";
import { Tree } from "./checkmark.ssr-entry";

let mounted: MountedElement<SVGElement> | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("Checkmark", () => {
  it("renders an svg carrying the recipe's base", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("svg");
    expect(style.display).toBe("inline-flex");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
    expect(style.flexShrink).toBe("0");
    expect(style.borderTopWidth).toBe("1px");
    // `borderRadius: "l1"` is a layer-radius token, so an unresolved one is `0px` — which is also
    // what a square checkbox looks like, and the only thing that tells them apart is this number.
    expect(style.borderRadius).not.toBe("0px");
  });

  it("draws the presentation attributes as real styles, not as SVG defaults", () => {
    // The five that are **style props** on this stack rather than DOM attributes: written anywhere
    // Panda cannot read them statically they generate nothing, and the browser falls back to the
    // SVG defaults — `stroke-width: 1px`, `fill: black`, a mitred join — which draws a thin black
    // tick instead of a thick round one and raises no error anywhere.
    mounted = mountElement<SVGElement>(() => <Checkmark checked />);
    const style = getComputedStyle(mounted.element);

    expect(style.strokeWidth).toBe("3px");
    expect(style.fill).toBe("none");
    expect(style.strokeLinecap).toBe("round");
    expect(style.strokeLinejoin).toBe("round");
    expect(style.stroke).not.toBe("none");
  });

  it("resolves `size` to real dimensions", () => {
    for (const [size, width] of [
      ["xs", "12px"],
      ["sm", "16px"],
      ["md", "20px"],
      ["lg", "24px"],
    ] as const) {
      mounted = mountElement<SVGElement>(() => <Checkmark size={size} />);
      const style = getComputedStyle(mounted.element);

      expect(style.width, size).toBe(width);
      expect(style.height, size).toBe(width);
      mounted.dispose();
      mounted = undefined;
    }
  });

  it("insets the glyph on the two sizes that can spare it", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark size="sm" />);
    expect(getComputedStyle(mounted.element).paddingTop).toBe("0px");
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Checkmark size="lg" />);
    expect(getComputedStyle(mounted.element).paddingTop).toBe("2px");
  });

  it("keeps the recipe's defaults when a wrapper forwards a variant unset", () => {
    // The third hazard, from the other side: nothing here declares a default, because `size` and
    // `variant` live in the recipe's `defaultVariants`. That only holds because Panda's generated
    // recipe compacts its argument before spreading it over the defaults — an implementation this
    // asserts rather than assumes, since a checkmark with no size resolves to its intrinsic box
    // and looks like nothing at all.
    mounted = mountElement<SVGElement>(() => (
      <Checkmark checked size={undefined} variant={undefined} />
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("20px");
    expect(style.backgroundColor).not.toBe(TRANSPARENT);
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "lg">("xs");
    mounted = mountElement<SVGElement>(() => <Checkmark size={size()} />);

    expect(getComputedStyle(mounted.element).width).toBe("12px");
    flush(() => setSize("lg"));
    expect(getComputedStyle(mounted.element).width).toBe("24px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark size="sm" boxSize="10" />);

    expect(getComputedStyle(mounted.element).width).toBe("40px");
  });
});

describe("the three states", () => {
  it("reports each one on `data-state`, including the resting one", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark />);
    expect(mounted.element.getAttribute("data-state")).toBe("unchecked");
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Checkmark checked />);
    expect(mounted.element.getAttribute("data-state")).toBe("checked");
    mounted.dispose();

    // Indeterminate beats checked when both are set, which is Chakra's precedence.
    mounted = mountElement<SVGElement>(() => <Checkmark checked indeterminate />);
    expect(mounted.element.getAttribute("data-state")).toBe("indeterminate");
  });

  it("draws the glyph the state calls for, and nothing at rest", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark />);
    expect(mounted.element.querySelector("polyline")).toBeNull();
    expect(mounted.element.querySelector("path")).toBeNull();
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Checkmark checked />);
    expect(mounted.element.querySelector("polyline")?.getAttribute("points")).toBe(
      "20 6 9 17 4 12",
    );
    expect(mounted.element.querySelector("path")).toBeNull();
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Checkmark indeterminate />);
    expect(mounted.element.querySelector("path")?.getAttribute("d")).toBe("M5 12h14");
    expect(mounted.element.querySelector("polyline")).toBeNull();
  });

  it("swaps the glyph when the state changes", () => {
    const [checked, setChecked] = createSignal(false);
    mounted = mountElement<SVGElement>(() => <Checkmark checked={checked()} />);

    expect(mounted.element.querySelector("polyline")).toBeNull();
    flush(() => setChecked(true));
    expect(mounted.element.querySelector("polyline")).not.toBeNull();
  });

  it("paints the box only once it is checked", () => {
    // The assertion that proves the `data-state` string and the recipe agree: every variant's paint
    // rule reads `:is([data-state=checked], [data-state=indeterminate])`, so a typo in either half
    // leaves an unpainted box with a tick drawn on it and no error.
    mounted = mountElement<SVGElement>(() => <Checkmark />);
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Checkmark checked />);
    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Checkmark indeterminate />);
    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
  });

  it("dims a disabled one and takes the cursor with it", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark checked disabled />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.getAttribute("data-disabled")).toBe("");
    expect(style.opacity).toBe("0.5");
    expect(style.cursor).toBe("not-allowed");
  });

  it("leaves `data-disabled` off an enabled one, as Chakra's `dataAttr` does", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark checked />);

    expect(mounted.element.hasAttribute("data-disabled")).toBe(false);
    expect(getComputedStyle(mounted.element).opacity).toBe("1");
  });
});

describe("the variants past `solid`", () => {
  it("gives `outline` a border rather than a fill when checked", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark variant="outline" checked />);
    const style = getComputedStyle(mounted.element);

    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.borderTopColor).not.toBe(TRANSPARENT);
  });

  it("gives `subtle` a tint before it is checked", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark variant="subtle" />);

    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
  });

  it("leaves `plain` without a box at all", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark variant="plain" checked />);
    const style = getComputedStyle(mounted.element);

    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.borderTopColor).toBe(TRANSPARENT);
  });

  it("fills an `outline` box with `filled`, which is what it is for", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark variant="outline" />);
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
    mounted.dispose();

    mounted = mountElement<SVGElement>(() => <Checkmark variant="outline" filled />);
    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
  });
});

describe("what it forwards, and what it keeps", () => {
  it("drops the recipe entirely when unstyled, and keeps the stroke that draws the tick", () => {
    // The consumer case: both `CheckboxIndicator` and `CheckboxCardIndicator` render it this way
    // and hand it their own slot's styles. The presentation styles are not the recipe's, so they
    // have to survive — an `unstyled` Checkmark whose stroke went with the box draws nothing.
    mounted = mountElement<SVGElement>(() => <Checkmark checked unstyled />);
    const style = getComputedStyle(mounted.element);

    expect(style.borderTopWidth).toBe("0px");
    expect(style.width).not.toBe("20px");
    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.strokeWidth).toBe("3px");
    expect(style.fill).toBe("none");
    expect(mounted.element.querySelector("polyline")).not.toBeNull();
  });

  it("keeps a caller's class alongside the recipe's", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark class="mine" />);

    expect(mounted.element.classList.contains("mine")).toBe(true);
    expect(getComputedStyle(mounted.element).display).toBe("inline-flex");
  });

  it("keeps the recipe's variant props and its state props off the element", () => {
    mounted = mountElement<SVGElement>(() => (
      <Checkmark size="lg" variant="outline" filled checked indeterminate disabled />
    ));

    for (const attribute of ["size", "variant", "filled", "checked", "indeterminate", "disabled"]) {
      expect(mounted?.element.hasAttribute(attribute), attribute).toBe(false);
    }
    // The tuple omits by literal name, because `omitProps` narrows by the keys it is handed and a
    // `string[]` narrows nothing. This is what keeps the two lists one list: a variant added to the
    // recipe upstream and not to the tuple would reach the DOM as an attribute.
    expect(checkmark.variantKeys).toEqual(["size", "variant", "filled"]);
  });

  it("lets a caller override the state attributes, which is Chakra's prop order", () => {
    mounted = mountElement<SVGElement>(() => <Checkmark data-state="checked" />);

    expect(mounted.element.getAttribute("data-state")).toBe("checked");
  });

  it("draws its own glyph and drops the caller's children", () => {
    mounted = mountElement<SVGElement>(() => (
      <Checkmark checked>
        <circle cx="12" cy="12" r="4" />
      </Checkmark>
    ));

    expect(mounted.element.querySelector("circle")).toBeNull();
    expect(mounted.element.querySelector("polyline")).not.toBeNull();
  });
});

describe("Checkmark — server render, then hydrate", () => {
  it("reuses every server node across all three branches", () => {
    // The half neither other project can see. A `Switch` renders one arm, and the three arms are
    // three different node counts — a `path`, a `polyline`, or nothing — so the branch the server
    // took decides the hydration key of every sibling after it. If the two sides disagree,
    // `hydrate()` either claims a server node under a different client tree or gives up and
    // client-renders, and **both are silent**: the glyph and the styles still look right.
    const { container, dispose } = hydrateFixture(checkmarkServerHtml, () => <Tree />);

    const checked = container.querySelector('[data-probe="checked"]');
    const indeterminate = container.querySelector('[data-probe="indeterminate"]');
    const unstyled = container.querySelector('[data-probe="unstyled"]');
    if (
      !(checked instanceof SVGElement) ||
      !(indeterminate instanceof SVGElement) ||
      !(unstyled instanceof SVGElement)
    ) {
      throw new Error("the hydrated tree is missing its probe elements");
    }

    expect(checked.querySelector("polyline")).not.toBeNull();
    expect(indeterminate.querySelector("path")).not.toBeNull();

    // The classes have to survive on the server's own nodes rather than on nodes a fallback
    // rebuilt, and the `unstyled` one is where the two sides take different paths through the class
    // getter — the recipe drops out and only the presentation styles remain.
    expect(getComputedStyle(checked).width).toBe("24px");
    expect(getComputedStyle(unstyled).strokeWidth).toBe("3px");
    expect(getComputedStyle(unstyled).borderTopWidth).toBe("0px");

    dispose();
  });
});
