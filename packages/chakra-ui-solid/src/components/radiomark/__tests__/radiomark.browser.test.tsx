import radiomarkServerHtml from "virtual:hydration-fixture?id=radiomark";
import {
  hydrateFixture,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import { radiomark } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Radiomark } from "../radiomark";
import { Tree } from "./radiomark.ssr-entry";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

/** The dot, as an element rather than as a class name — a `.dot` with no CSS behind it is invisible. */
function dotOf(element: Element): HTMLElement {
  const dot = element.querySelector(".dot");
  if (!(dot instanceof HTMLElement)) {
    throw new Error("expected the radiomark to contain a `.dot` element");
  }
  return dot;
}

describe("Radiomark", () => {
  it("renders a span carrying the recipe's base", () => {
    mounted = mountElement(() => <Radiomark />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("SPAN");
    expect(style.display).toBe("inline-flex");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
    expect(style.flexShrink).toBe("0");
    expect(style.verticalAlign).toBe("top");
    expect(style.borderTopWidth).toBe("1px");
    // A radiomark is a circle, and `borderRadius: "full"` is the only thing that makes it one. An
    // unresolved radius token computes to `0px`, which is a square that raises no error.
    expect(style.borderRadius).not.toBe("0px");
  });

  it("resolves `size` to real dimensions", () => {
    for (const [size, width] of [
      ["xs", "12px"],
      ["sm", "16px"],
      ["md", "20px"],
      ["lg", "24px"],
    ] as const) {
      mounted = mountElement(() => <Radiomark size={size} />);
      const style = getComputedStyle(mounted.element);

      expect(style.width, size).toBe(width);
      expect(style.height, size).toBe(width);
      mounted.dispose();
      mounted = undefined;
    }
  });

  it("keeps the recipe's defaults when a wrapper forwards a variant unset", () => {
    // The third hazard, from the other side: nothing here declares a default, because `size` and
    // `variant` live in the recipe's `defaultVariants`. That only holds because Panda's generated
    // recipe compacts its argument before spreading it over the defaults — an implementation this
    // asserts rather than assumes, since a radiomark with no size resolves to its intrinsic box and
    // looks like nothing at all.
    mounted = mountElement(() => <Radiomark checked size={undefined} variant={undefined} />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("20px");
    expect(style.backgroundColor).not.toBe(TRANSPARENT);
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "lg">("xs");
    mounted = mountElement(() => <Radiomark size={size()} />);

    expect(getComputedStyle(mounted.element).width).toBe("12px");
    flush(() => setSize("lg"));
    expect(getComputedStyle(mounted.element).width).toBe("24px");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement(() => <Radiomark size="sm" boxSize="10" />);

    expect(getComputedStyle(mounted.element).width).toBe("40px");
  });
});

describe("the dot", () => {
  it("is drawn only once it is checked", () => {
    mounted = mountElement(() => <Radiomark />);
    expect(mounted.element.querySelector(".dot")).toBeNull();
    mounted.dispose();

    mounted = mountElement(() => <Radiomark checked />);
    expect(mounted.element.querySelector(".dot")).not.toBeNull();
  });

  it("appears and disappears when the state changes", () => {
    const [checked, setChecked] = createSignal(false);
    mounted = mountElement(() => <Radiomark checked={checked()} />);

    expect(mounted.element.querySelector(".dot")).toBeNull();
    flush(() => setChecked(true));
    expect(mounted.element.querySelector(".dot")).not.toBeNull();
    flush(() => setChecked(false));
    expect(mounted.element.querySelector(".dot")).toBeNull();
  });

  it("takes its whole appearance from the parent's `.radiomark .dot` rule", () => {
    // The assertion the class name cannot make. `class="dot"` is a literal in the markup that the
    // parent recipe's descendant selector depends on — a typo in either half leaves a `span` with no
    // width, no colour and no error, inside a circle that still looks right.
    mounted = mountElement(() => <Radiomark checked size="lg" />);
    const style = getComputedStyle(dotOf(mounted.element));

    expect(style.backgroundColor).not.toBe(TRANSPARENT);
    expect(style.borderRadius).not.toBe("0px");
    expect(style.scale).toBe("0.4");
    // `height: 100%` / `width: 100%` resolve against the parent's **content** box, so a 24px circle
    // with a 1px border on each side gives the dot 22px — before the scale, which is a paint-time
    // transform and does not change the computed box.
    expect(style.width).toBe("22px");
    expect(style.height).toBe("22px");
  });

  it('is widened by `variant="outline"`, which is the only variant that touches it', () => {
    mounted = mountElement(() => <Radiomark checked />);
    expect(getComputedStyle(dotOf(mounted.element)).scale).toBe("0.4");
    mounted.dispose();

    mounted = mountElement(() => <Radiomark checked variant="outline" />);
    expect(getComputedStyle(dotOf(mounted.element)).scale).toBe("0.6");
  });
});

describe("the two states", () => {
  it("reports checked on `data-checked` and paints the circle with it", () => {
    // The assertion that proves the attribute and the recipe agree: every variant's paint rule reads
    // `:is(:checked, [data-checked], [aria-checked=true], [data-state=checked])`, so a typo in
    // either half leaves an unpainted circle with a dot in it and no error.
    mounted = mountElement(() => <Radiomark />);
    expect(mounted.element.hasAttribute("data-checked")).toBe(false);
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
    mounted.dispose();

    mounted = mountElement(() => <Radiomark checked />);
    expect(mounted.element.getAttribute("data-checked")).toBe("");
    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
  });

  it("dims a disabled one and takes the cursor with it", () => {
    mounted = mountElement(() => <Radiomark checked disabled />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.getAttribute("data-disabled")).toBe("");
    expect(style.opacity).toBe("0.5");
    expect(style.cursor).toBe("not-allowed");
  });

  it("leaves `data-disabled` off an enabled one, as Chakra's `dataAttr` does", () => {
    mounted = mountElement(() => <Radiomark checked />);

    expect(mounted.element.hasAttribute("data-disabled")).toBe(false);
    expect(getComputedStyle(mounted.element).opacity).toBe("1");
  });
});

describe("the four variants", () => {
  it("fills `solid` only once it is checked", () => {
    mounted = mountElement(() => <Radiomark variant="solid" />);
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
    mounted.dispose();

    mounted = mountElement(() => <Radiomark variant="solid" checked />);
    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
  });

  it("gives `subtle` a tint before it is checked", () => {
    mounted = mountElement(() => <Radiomark variant="subtle" />);

    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
  });

  it("gives `outline` a border rather than a fill when checked", () => {
    mounted = mountElement(() => <Radiomark variant="outline" checked />);
    const style = getComputedStyle(mounted.element);

    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.borderTopColor).not.toBe(TRANSPARENT);
  });

  it("gives `inverted` a background before it is checked, where `outline` has none", () => {
    mounted = mountElement(() => <Radiomark variant="inverted" />);
    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
    mounted.dispose();

    mounted = mountElement(() => <Radiomark variant="outline" />);
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
  });

  it("fills an `outline` circle with `filled`, which is what it is for", () => {
    mounted = mountElement(() => <Radiomark variant="outline" />);
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
    mounted.dispose();

    mounted = mountElement(() => <Radiomark variant="outline" filled />);
    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe(TRANSPARENT);
  });

  it("has no `plain`, where Checkmark does — four values, not five", () => {
    expect(radiomark.variantMap.variant).toEqual(["solid", "subtle", "outline", "inverted"]);
  });
});

describe("what it forwards, and what it keeps", () => {
  it("drops the recipe entirely when unstyled, and keeps the dot for the consumer's styles", () => {
    // The consumer case: both `RadioGroupItemControl` and `RadioCardItemIndicator` render it this
    // way and hand it their own slot's styles, whose base carries the same `& .dot` block the recipe
    // does. So the class has to survive the opt-out — an `unstyled` Radiomark whose dot went with
    // the circle draws an empty ring.
    mounted = mountElement(() => <Radiomark checked unstyled />);
    const style = getComputedStyle(mounted.element);

    expect(style.borderTopWidth).toBe("0px");
    expect(style.width).not.toBe("20px");
    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(mounted.element.querySelector(".dot")).not.toBeNull();
  });

  it("lets an unstyled one be re-dressed through `css`, which is the consumer path", () => {
    mounted = mountElement(() => (
      <Radiomark
        checked
        unstyled
        css={{ boxSize: "8", "& .dot": { bg: "red.500", scale: "0.5" } }}
      />
    ));

    expect(getComputedStyle(mounted.element).width).toBe("32px");
    const style = getComputedStyle(dotOf(mounted.element));
    expect(style.backgroundColor).not.toBe(TRANSPARENT);
    expect(style.scale).toBe("0.5");
  });

  it("keeps a caller's class alongside the recipe's", () => {
    mounted = mountElement(() => <Radiomark class="mine" />);

    expect(mounted.element.classList.contains("mine")).toBe(true);
    expect(getComputedStyle(mounted.element).display).toBe("inline-flex");
  });

  it("keeps the recipe's variant props and its state props off the element", () => {
    mounted = mountElement(() => <Radiomark size="lg" variant="outline" filled checked disabled />);

    for (const attribute of ["size", "variant", "filled", "checked", "disabled"]) {
      expect(mounted?.element.hasAttribute(attribute), attribute).toBe(false);
    }
    // The tuple omits by literal name, because `omitProps` narrows by the keys it is handed and a
    // `string[]` narrows nothing. This is what keeps the two lists one list: a variant added to the
    // recipe upstream and not to the tuple would reach the DOM as an attribute.
    expect(radiomark.variantKeys).toEqual(["variant", "size", "filled"]);
  });

  it("lets a caller override the state attributes, which is Chakra's prop order", () => {
    mounted = mountElement(() => <Radiomark data-checked="" />);

    expect(mounted.element.getAttribute("data-checked")).toBe("");
  });

  it("draws its own dot and drops the caller's children", () => {
    mounted = mountElement(() => (
      <Radiomark checked>
        <span class="mine">intruder</span>
      </Radiomark>
    ));

    expect(mounted.element.querySelector(".mine")).toBeNull();
    expect(mounted.element.querySelector(".dot")).not.toBeNull();
  });
});

describe("Radiomark — server render, then hydrate", () => {
  it("reuses every server node across both branches", () => {
    // The half neither other project can see. A checked one renders a `span.dot` and an unchecked
    // one renders nothing, so the branch the server took decides the hydration key of every sibling
    // after it. If the two sides disagree, `hydrate()` either claims a server node under a different
    // client tree or gives up and client-renders, and **both are silent**: the dot and the styles
    // still look right.
    const { container, dispose } = hydrateFixture(radiomarkServerHtml, () => <Tree />);

    const unchecked = container.querySelector('[data-probe="unchecked"]');
    const checked = container.querySelector('[data-probe="checked"]');
    const unstyled = container.querySelector('[data-probe="unstyled"]');
    if (
      !(unchecked instanceof HTMLElement) ||
      !(checked instanceof HTMLElement) ||
      !(unstyled instanceof HTMLElement)
    ) {
      throw new Error("the hydrated tree is missing its probe elements");
    }

    expect(unchecked.querySelector(".dot")).toBeNull();
    expect(checked.querySelector(".dot")).not.toBeNull();

    // The classes have to survive on the server's own nodes rather than on nodes a fallback rebuilt,
    // and the `unstyled` one is where the two sides take different paths through the class getter —
    // the recipe drops out and only the `css` prop names the dot.
    expect(getComputedStyle(checked).width).toBe("24px");
    expect(getComputedStyle(unstyled).borderTopWidth).toBe("0px");
    expect(getComputedStyle(dotOf(unstyled)).backgroundColor).not.toBe(TRANSPARENT);

    dispose();
  });
});
