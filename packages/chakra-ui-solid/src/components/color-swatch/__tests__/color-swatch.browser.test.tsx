import colorSwatchServerHtml from "virtual:hydration-fixture?id=color-swatch";
import {
  hydrateFixture,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import { colorSwatch } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { ColorSwatch, ColorSwatchMix, ColorSwatchPropsProvider } from "../color-swatch";
import { Tree } from "./color-swatch.ssr-entry";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * **`backgroundColor` is meaningless on this component and is never asserted here.** The recipe
 * paints through `background`, whose two layers are a `linear-gradient` of the colour over a
 * `repeating-conic-gradient` checkerboard — so a perfectly working swatch computes
 * `background-color: rgba(0, 0, 0, 0)`, and a completely broken one computes the same. What carries
 * the meaning is `background-image` plus the resolved custom properties, which is what these read.
 */
const colorOf = (element: Element) => getComputedStyle(element).getPropertyValue("--color").trim();
const swatchSizeOf = (element: Element) =>
  getComputedStyle(element).getPropertyValue("--swatch-size").trim();

function expectBothLayers(element: Element, label?: string) {
  const image = getComputedStyle(element).backgroundImage;

  expect(image, label).toContain("linear-gradient");
  expect(image, label).toContain("repeating-conic-gradient");
}

describe("ColorSwatch", () => {
  it("renders a span carrying the recipe's base", () => {
    mounted = mountElement(() => <ColorSwatch value="#bada55" />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("SPAN");
    expect(style.display).toBe("inline-flex");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
    expect(style.flexShrink).toBe("0");
    expectBothLayers(mounted.element);
  });

  it("paints the colour through an inline `--color`, which is the only route it has", () => {
    // The assertion this whole component is built around. `value` is an arbitrary runtime string,
    // so it can never be a Panda class — routed through `css` it would generate no rule, and the
    // swatch would render its checkerboard with no colour over it and no error at all.
    mounted = mountElement(() => <ColorSwatch value="#bada55" />);

    expect(colorOf(mounted.element)).toBe("#bada55");
    expect(mounted.element.style.getPropertyValue("--color")).toBe("#bada55");
    expectBothLayers(mounted.element);
  });

  it("tracks a colour that changes", () => {
    const [value, setValue] = createSignal("#bada55");
    mounted = mountElement(() => <ColorSwatch value={value()} />);

    expect(colorOf(mounted.element)).toBe("#bada55");
    flush(() => setValue("tomato"));
    expect(colorOf(mounted.element)).toBe("tomato");
  });

  it("keeps an alpha colour translucent, so the checkerboard reads through it", () => {
    // The checkerboard is the reason this component exists rather than a plain coloured box, and it
    // only shows when both layers survive — a swatch that lost the conic gradient looks correct on
    // every opaque colour.
    mounted = mountElement(() => <ColorSwatch value="rgba(255, 0, 0, 0.5)" size="xl" />);

    expect(colorOf(mounted.element)).toBe("rgba(255, 0, 0, 0.5)");
    expectBothLayers(mounted.element);
    expect(getComputedStyle(mounted.element).getPropertyValue("--checker-size").trim()).toBe("8px");
  });

  it("layers a caller's inline style over the colour rather than replacing it", () => {
    mounted = mountElement(() => <ColorSwatch value="#bada55" style={{ opacity: "0.5" }} />);

    expect(colorOf(mounted.element)).toBe("#bada55");
    expect(getComputedStyle(mounted.element).opacity).toBe("0.5");
  });
});

describe("the nine sizes", () => {
  it("resolves each to real dimensions", () => {
    for (const [size, box] of [
      ["2xs", "14px"],
      ["xs", "16px"],
      ["sm", "18px"],
      ["md", "20px"],
      ["lg", "24px"],
      ["xl", "28px"],
      ["2xl", "32px"],
    ] as const) {
      mounted = mountElement(() => <ColorSwatch value="#bada55" size={size} />);
      const style = getComputedStyle(mounted.element);

      expect(style.width, size).toBe(box);
      expect(style.height, size).toBe(box);
      mounted.dispose();
      mounted = undefined;
    }
  });

  it("takes the enclosing swatch's size under `inherit`, which is how Mix sizes its cells", () => {
    mounted = mountElement(() => (
      <ColorSwatch value="transparent" size="lg">
        <ColorSwatch value="red" size="inherit" data-probe="inner" />
      </ColorSwatch>
    ));
    const inner = mounted.element.querySelector('[data-probe="inner"]');
    if (!(inner instanceof HTMLElement)) {
      throw new Error("expected an inner swatch");
    }

    // A custom property computes to its *declared* value, not to an absolute length — the recipe
    // sets `--swatch-size: var(--chakra-sizes-6)`, which is `1.5rem`. The resolution to pixels only
    // shows up on the property that reads it, which is why `width` is asserted beside it.
    expect(swatchSizeOf(mounted.element)).toBe("1.5rem");
    expect(swatchSizeOf(inner)).toBe("1.5rem");
    expect(getComputedStyle(inner).width).toBe("24px");
  });

  it("fills its parent under `full`", () => {
    mounted = mountElement(() => (
      <div style={{ width: "60px", height: "60px" }}>
        <ColorSwatch value="red" size="full" data-probe="swatch" />
      </div>
    ));
    const swatch = mounted.element.querySelector('[data-probe="swatch"]');
    if (!(swatch instanceof HTMLElement)) {
      throw new Error("expected a swatch");
    }

    expect(getComputedStyle(swatch).width).toBe("60px");
  });

  it("has nine values, where the two rows before it had four", () => {
    expect(colorSwatch.variantMap.size).toEqual([
      "2xs",
      "xs",
      "sm",
      "md",
      "lg",
      "xl",
      "2xl",
      "inherit",
      "full",
    ]);
  });
});

describe("the three shapes", () => {
  it("resolves each to a real radius", () => {
    for (const [shape, radius] of [
      ["square", "0px"],
      ["circle", "9999px"],
      ["rounded", "2px"],
    ] as const) {
      mounted = mountElement(() => <ColorSwatch value="#bada55" shape={shape} />);

      expect(getComputedStyle(mounted.element).borderRadius, shape).toBe(radius);
      mounted.dispose();
      mounted = undefined;
    }
  });

  it("is `shape`, not the `variant`/`filled` pair the two rows before it had", () => {
    expect(colorSwatch.variantMap.shape).toEqual(["square", "circle", "rounded"]);
    expect(colorSwatch.variantKeys).toEqual(["size", "shape"]);
  });
});

describe("what it forwards, and what it keeps", () => {
  it("keeps `value` off the element and reports it on `data-value`", () => {
    // `value` is not a style prop, so left in the bag `renderStyled` would forward it and the
    // element would render as `<span value="#bada55">` — an attribute a span has no meaning for.
    mounted = mountElement(() => <ColorSwatch value="#bada55" />);

    expect(mounted.element.hasAttribute("value")).toBe(false);
    expect(mounted.element.getAttribute("data-value")).toBe("#bada55");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => <ColorSwatch value="#bada55" size="lg" shape="circle" />);

    for (const attribute of ["size", "shape"]) {
      expect(mounted?.element.hasAttribute(attribute), attribute).toBe(false);
    }
  });

  it("keeps the recipe's defaults when a wrapper forwards a variant unset", () => {
    // The third hazard, from the other side: nothing here declares a default, because `size` and
    // `shape` live in the recipe's `defaultVariants`. A swatch with no size resolves to its
    // intrinsic box, which for an empty span is nothing at all.
    mounted = mountElement(() => (
      <ColorSwatch value="#bada55" size={undefined} shape={undefined} />
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("20px");
    expect(style.borderRadius).toBe("2px");
  });

  it("drops the recipe entirely when unstyled, and keeps the colour", () => {
    mounted = mountElement(() => <ColorSwatch value="#bada55" unstyled />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).not.toBe("20px");
    expect(style.backgroundImage).toBe("none");
    // The opt-out is of the theme, not of the component: `--color` is an inline style, so it
    // survives for whatever styles the consumer supplies instead.
    expect(colorOf(mounted.element)).toBe("#bada55");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement(() => <ColorSwatch value="#bada55" size="sm" boxSize="10" />);

    expect(getComputedStyle(mounted.element).width).toBe("40px");
  });

  it("keeps a caller's class alongside the recipe's", () => {
    mounted = mountElement(() => <ColorSwatch value="#bada55" class="mine" />);

    expect(mounted.element.classList.contains("mine")).toBe(true);
    expect(getComputedStyle(mounted.element).display).toBe("inline-flex");
  });
});

describe("ColorSwatchPropsProvider", () => {
  it("supplies props to every swatch below it", () => {
    mounted = mountElement(() => (
      <ColorSwatchPropsProvider value={{ shape: "circle", size: "lg" }}>
        <ColorSwatch value="#bada55" />
      </ColorSwatchPropsProvider>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.borderRadius).toBe("9999px");
    expect(style.width).toBe("24px");
  });

  it("loses to a swatch that passes the prop itself", () => {
    mounted = mountElement(() => (
      <ColorSwatchPropsProvider value={{ shape: "circle" }}>
        <ColorSwatch value="#bada55" shape="square" />
      </ColorSwatchPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).borderRadius).toBe("0px");
  });

  it("survives a wrapper forwarding the prop unset", () => {
    // The third hazard's own shape. `merge` resolves by presence, so a plain merge would let this
    // `shape={undefined}` beat the provider and square the swatch. `withContextDefaults` resolves
    // by value, which is what Chakra does too.
    mounted = mountElement(() => (
      <ColorSwatchPropsProvider value={{ shape: "circle" }}>
        <ColorSwatch value="#bada55" shape={undefined} />
      </ColorSwatchPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).borderRadius).toBe("9999px");
  });
});

describe("ColorSwatchMix", () => {
  const cellsOf = (element: Element) => [...element.querySelectorAll(":scope > div > span")];
  const gridOf = (element: Element) => {
    const grid = element.querySelector(":scope > div");
    if (!(grid instanceof HTMLElement)) {
      throw new Error("expected the mix to contain a grid");
    }
    return grid;
  };

  it("clips an oversized grid, which is the whole layout", () => {
    // The mechanism, asserted rather than described: each cell is `size="inherit"` and therefore a
    // *full* swatch wide, laid out on a grid two full swatches across. The outer swatch's
    // `overflow: hidden` is what turns that into two halves, and losing it makes the mix spill over
    // everything beside it while still looking plausible on its own.
    mounted = mountElement(() => <ColorSwatchMix items={["red", "pink"]} size="lg" />);

    expect(getComputedStyle(mounted.element).overflow).toBe("hidden");
    expect(getComputedStyle(mounted.element).width).toBe("24px");
    expect(getComputedStyle(gridOf(mounted.element)).gridTemplateColumns).toBe("24px 24px");
  });

  it("gives every cell its own colour and no ring of its own", () => {
    mounted = mountElement(() => <ColorSwatchMix items={["red", "pink"]} size="lg" />);
    const cells = cellsOf(mounted.element);

    expect(cells).toHaveLength(2);
    expect(cells.map(colorOf)).toEqual(["red", "pink"]);
    for (const cell of cells) {
      expect(getComputedStyle(cell).boxShadow).toBe("none");
      expect(getComputedStyle(cell).borderRadius).toBe("0px");
      expectBothLayers(cell);
    }
    // The swatch around them is transparent by definition: it is the frame, and the cells are what
    // is painted.
    expect(colorOf(mounted.element)).toBe("transparent");
  });

  it("spans the last of three across both columns", () => {
    mounted = mountElement(() => <ColorSwatchMix items={["red", "pink", "green"]} size="lg" />);
    const cells = cellsOf(mounted.element);

    expect(cells).toHaveLength(3);
    expect(getComputedStyle(cells[0] as Element).gridColumn).toBe("auto");
    // `width: unset` is what lets the grid stretch it across the span — left at `var(--swatch-size)`
    // it would span two tracks and paint one, which looks like a missing colour.
    expect(getComputedStyle(cells[2] as Element).gridColumn).toBe("span 2 / span 2");
    expect(getComputedStyle(cells[2] as Element).width).toBe("48px");
    expect(getComputedStyle(cells[0] as Element).width).toBe("24px");
  });

  it("leaves four colours in a plain two-by-two", () => {
    mounted = mountElement(() => (
      <ColorSwatchMix items={["lightgreen", "green", "darkgreen", "black"]} size="lg" />
    ));
    const cells = cellsOf(mounted.element);

    expect(cells).toHaveLength(4);
    for (const cell of cells) {
      expect(getComputedStyle(cell).gridColumn).toBe("auto");
      expect(getComputedStyle(cell).width).toBe("24px");
    }
  });

  it("handles a single colour, which upstream's example never shows", () => {
    mounted = mountElement(() => <ColorSwatchMix items={["red"]} size="lg" />);

    expect(cellsOf(mounted.element)).toHaveLength(1);
    expect(getComputedStyle(gridOf(mounted.element)).gridTemplateColumns).toBe("24px 24px");
  });

  it("throws on a fifth colour, as Chakra's does", () => {
    expect(() => mountElement(() => <ColorSwatchMix items={["a", "b", "c", "d", "e"]} />)).toThrow(
      "ColorSwatchMix doesn't support more than 4 colors",
    );
  });

  it("checks the count once, at construction, and says so", () => {
    // **Pinning a Solid limitation, not a preference.** The guard cannot live in the accessor
    // `<For>` reads: throwing from a memo makes Solid 2.0 halt the reactive graph for the whole page
    // (`[REACTIVITY_HALTED]`), after which every later render anywhere silently no-ops — measured,
    // and far worse than the miscount it would catch. So a list that grows past four after mount
    // renders its cells instead of throwing. React re-runs the body and therefore throws; this is
    // the one place the two differ, and it is recorded here rather than left for someone to find.
    const [items, setItems] = createSignal(["a", "b"]);
    mounted = mountElement(() => <ColorSwatchMix items={items()} />);

    expect(() => flush(() => setItems(["a", "b", "c", "d", "e"]))).not.toThrow();
    expect(mounted.element.querySelectorAll("span")).toHaveLength(5);
  });

  it("takes the swatch's own props, so a caller can still shape and size it", () => {
    mounted = mountElement(() => (
      <ColorSwatchMix items={["red", "pink"]} size="2xl" shape="circle" />
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("32px");
    expect(style.borderRadius).toBe("9999px");
  });
});

describe("ColorSwatch — server render, then hydrate", () => {
  it("reuses every server node across all four Mix shapes", () => {
    // The half neither other project can see. `ColorSwatchMix` renders a `<For>` whose length is the
    // subject, so two, three and four colours each consume a different number of hydration keys
    // (`_hk`) and a disagreement shifts every sibling after it. If the two sides diverge, `hydrate()`
    // either claims a server node under a different client tree or gives up and client-renders, and
    // **both are silent**: the colours and the layout still look right.
    const { container, dispose } = hydrateFixture(colorSwatchServerHtml, () => <Tree />);

    const probes = ["single", "two", "three", "four", "from-context"].map((name) => {
      const element = container.querySelector(`[data-probe="${name}"]`);
      if (!(element instanceof HTMLElement)) {
        throw new Error(`the hydrated tree is missing its \`${name}\` probe`);
      }
      return element;
    });
    const [single, two, three, four, fromContext] = probes as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];

    expect(single.querySelectorAll("span")).toHaveLength(0);
    expect(two.querySelectorAll("span")).toHaveLength(2);
    expect(three.querySelectorAll("span")).toHaveLength(3);
    expect(four.querySelectorAll("span")).toHaveLength(4);

    // The inline `--color` has to survive on the server's own nodes rather than on nodes a fallback
    // rebuilt, and so does the class the recipe computed — this is the only subject whose styling
    // arrives by both routes at once.
    expect(colorOf(single)).toBe("#bada55");
    expect(getComputedStyle(single).width).toBe("20px");
    expect(getComputedStyle(three).width).toBe("24px");
    expect(colorOf(fromContext)).toBe("rgba(0, 0, 255, 0.5)");
    expect(getComputedStyle(fromContext).borderRadius).toBe("9999px");
    expectBothLayers(single);

    dispose();
  });
});
