import { css, cx } from "@chakra-ui-solid/styled-system/css";
import type { JsxStyleProps } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { type RenderStyledOptions, renderStyled } from "../render-styled";

/**
 * The factory's own tests. `Box` proves the same mechanism end to end against a real stylesheet
 * (`box.browser.test.tsx`); this file is the unit half, and the two are not substitutes: a
 * computed style cannot show the *order* of the class tokens that produced it, and this project has
 * no element to compute one on.
 *
 * Asserting a class string is legitimate here and only here — `renderStyled`'s composition is a
 * pure function whose output IS a string, and the `unit` project has no DOM. In `ssr` and `browser`
 * a class-name assertion is banned and `check:style-contract` rule 3 enforces it
 * (`testing.md` §2.3).
 *
 * Every expected value is computed by calling `css()` in the test rather than typed out as `p_4`,
 * so the assertions say *"the factory composed what Panda emits"* rather than pinning today's
 * class-name format.
 */

/** What the factory takes: DOM props ∪ style props ∪ the `css` escape hatch. */
type StyledProps = JsxStyleProps & JSX.HTMLAttributes<HTMLElement>;

/**
 * The props the factory hands to the element, captured without rendering one.
 *
 * A `render` prop short-circuits `renderElement` before it reaches `<Dynamic>`, so this exercises
 * the whole factory — key partition, renames, class composition — with no DOM in sight. The
 * returned object is the live reactive bag, so a later read of `.class` recomputes.
 */
function computedProps(
  options: Omit<RenderStyledOptions<StyledProps>, "render">,
): Record<string, unknown> {
  let captured: Record<string, unknown> | undefined;
  renderStyled<StyledProps>({
    ...options,
    render: (props) => {
      captured = props as Record<string, unknown>;
      return undefined;
    },
  });
  if (captured === undefined) {
    throw new Error("renderStyled did not invoke the render prop");
  }
  return captured;
}

function computedClass(options: Omit<RenderStyledOptions<StyledProps>, "render">): string {
  return computedProps(options).class as string;
}

describe("renderStyled — class precedence", () => {
  it("orders recipe class, then style props, then the consumer's class", () => {
    // Low → high. The order is the whole contract of the seam: the recipe supplies the theme, style
    // props override it, and the consumer's own class is appended last so it wins ties. Nothing but
    // the composed string can show it — in a browser the cascade has already collapsed the three
    // into one answer.
    const className = computedClass({
      as: "div",
      props: { p: "4", class: "consumer" } as StyledProps,
      recipeClass: () => "recipe-content",
    });

    const stylePropClass = css({ p: "4" });
    expect(className.indexOf("recipe-content")).toBeLessThan(className.indexOf(stylePropClass));
    expect(className.indexOf(stylePropClass)).toBeLessThan(className.indexOf("consumer"));
  });

  it("composes exactly the recipe class plus what `css()` emits, and nothing else", () => {
    expect(
      computedClass({
        as: "div",
        props: { p: "4" } as StyledProps,
        recipeClass: () => "recipe-content",
      }),
    ).toBe(cx("recipe-content", css({ p: "4" })));
  });

  it("emits no stray whitespace when there is no recipe and no consumer class", () => {
    // `cx` is handed two `undefined`s here. A join that did not drop them would put a leading and a
    // trailing space on every unstyled element's class attribute.
    const className = computedClass({ as: "div", props: { p: "4" } as StyledProps });
    expect(className).toBe(css({ p: "4" }));
    expect(className).toBe(className.trim());
  });

  it("lets a style prop beat the `css` escape hatch, as Chakra does", () => {
    // Chakra's `useResolvedProps` ends its merge with the style props —
    // `css(cvaStyles, ...cssStyles, propStyles)` — so the escape hatch is a *default* a caller can
    // still override per property, not a trump card (`__internal__/decisions.md`, *Style props outrank the `css` prop*).
    expect(
      computedClass({ as: "div", props: { m: "2", css: { margin: "6" } } as StyledProps }),
    ).toBe(css({ margin: "2" }));
  });

  it("still applies a `css` entry no style prop contests", () => {
    // The other half of the same order: losing a tie is per property, not per object.
    expect(
      computedClass({
        as: "div",
        props: { m: "2", css: { margin: "6", color: "red" } } as StyledProps,
      }),
    ).toBe(css({ margin: "6", color: "red" }, { margin: "2" }));
  });

  it("merges the array form of `css` left to right", () => {
    // Addition 1. `css()` is variadic, so the array is spread rather than merged by hand.
    expect(
      computedClass({
        as: "div",
        props: { css: [{ margin: "2" }, { margin: "6" }] } as StyledProps,
      }),
    ).toBe(css({ margin: "6" }));
  });

  it("keeps the `css` key out of the style-prop list", () => {
    // `isCssProperty("css")` is true, but `css` holds a *nested* style object rather than a
    // per-prop value: folded in with the others Panda emits garbage like `color:css_red`. The
    // factory excludes the key by name and passes its value as a sibling `css()` argument.
    const className = computedClass({
      as: "div",
      props: { css: { color: "red" } } as StyledProps,
    });
    expect(className).toBe(css({ color: "red" }));
    expect(className).not.toContain("css_");
  });
});

describe("renderStyled — `unstyled`", () => {
  it("suppresses the recipe class and leaves everything else standing", () => {
    // Addition 2, and the part that is easy to get wrong in the pleasant direction: `unstyled` opts
    // out of the *theme*, not of styling. Style props and the `css` prop still apply.
    const className = computedClass({
      as: "div",
      props: { p: "4", css: { margin: "6" }, unstyled: true } as StyledProps,
      recipeClass: () => "recipe-content",
    });

    expect(className).not.toContain("recipe-content");
    expect(className).toBe(css({ margin: "6" }, { p: "4" }));
  });

  it("keeps the recipe class for any value other than `true`", () => {
    // The gate is `=== true`, so an unset optional prop forwarded by a wrapper
    // (`unstyled={props.unstyled}` with nothing set) cannot silently strip a component's theme.
    for (const unstyled of [undefined, false]) {
      expect(
        computedClass({
          as: "div",
          props: { unstyled } as StyledProps,
          recipeClass: () => "recipe-content",
        }),
      ).toContain("recipe-content");
    }
  });

  it("re-reads `unstyled` on every class computation, so it can be toggled", () => {
    const [unstyled, setUnstyled] = createSignal(false);
    const props = computedProps({
      as: "div",
      props: {
        get unstyled() {
          return unstyled();
        },
      } as StyledProps,
      recipeClass: () => "recipe-content",
    });

    expect(props.class).toContain("recipe-content");
    // Solid 2.0 defers a plain write until the next flush; read without it and this would assert
    // the pre-write value and pass for the wrong reason.
    flush(() => setUnstyled(true));
    expect(props.class).not.toContain("recipe-content");
  });
});

describe("renderStyled — what reaches the element", () => {
  it("forwards DOM props and withholds everything the factory consumed", () => {
    const props = computedProps({
      as: "div",
      props: {
        id: "target",
        "aria-label": "styled",
        p: "4",
        _hover: { padding: "8" },
        css: { margin: "2" },
        unstyled: false,
        class: "consumer",
      } as StyledProps,
      recipeClass: () => "recipe-content",
    });
    const keys = Object.keys(props);

    expect(keys).toContain("id");
    expect(keys).toContain("aria-label");
    // A style prop that reached the element would be rendered as an attribute — `<div p="4">` —
    // which is invalid HTML the browser keeps and nothing warns about.
    for (const consumed of ["p", "_hover", "css", "unstyled"]) {
      expect(keys, `${consumed} must not reach the element`).not.toContain(consumed);
    }
    // `class` is present, but as the *composed* value rather than the consumer's own.
    expect(props.class).not.toBe("consumer");
  });

  it("strips `as` and `render` even when handed a raw component props bag", () => {
    // Box passes its own props straight through, `as` and all. Stripping them here is what lets a
    // caller do that without splitting the bag first.
    const props = computedProps({
      as: "section",
      props: { as: "section", id: "target" } as unknown as StyledProps,
    });
    expect(Object.keys(props)).not.toContain("as");
    expect(Object.keys(props)).not.toContain("render");
  });

  it("renames the five `html*` escape hatches to the attributes they stand in for", () => {
    // Addition 3, at the factory rather than through Box. `width`, `height`, `translate` and
    // `content` are style props here, so without the rename the attribute is folded into a class
    // and the element never gets it — silently, which is this repo's characteristic failure.
    const props = computedProps({
      as: "img",
      props: {
        htmlSize: 3,
        htmlWidth: 40,
        htmlHeight: 20,
        htmlTranslate: "no",
        htmlContent: "probe",
      } as unknown as StyledProps,
    });

    expect(props).toMatchObject({
      size: 3,
      width: 40,
      height: 20,
      translate: "no",
      content: "probe",
    });
    for (const renamed of ["htmlSize", "htmlWidth", "htmlHeight", "htmlTranslate", "htmlContent"]) {
      expect(Object.keys(props), `${renamed} is not an HTML attribute`).not.toContain(renamed);
    }
  });

  it("carries the attribute and the style prop of the same name at once", () => {
    // The case the escape hatch exists for: `<Box as="img" width="10" htmlWidth={40}>` must set the
    // CSS width *and* the intrinsic attribute. They collide on one name in Chakra's surface, so the
    // factory has to keep them apart.
    const props = computedProps({
      as: "img",
      props: { width: "10", htmlWidth: 40 } as unknown as StyledProps,
    });

    expect(props.width).toBe(40);
    expect(props.class).toBe(css({ width: "10" }));
  });

  it("keeps a rename as reactive as the prop it renames", () => {
    // The renames are defined as getters for this reason. A plain object would snapshot the value
    // at render time, and a `htmlWidth={size()}` would never update.
    const [width, setWidth] = createSignal(40);
    const props = computedProps({
      as: "img",
      props: {
        get htmlWidth() {
          return width();
        },
      } as unknown as StyledProps,
    });

    expect(props.width).toBe(40);
    flush(() => setWidth(80));
    expect(props.width).toBe(80);
  });
});

describe("renderStyled — reactivity", () => {
  it("recomputes the class when a style-prop value changes", () => {
    // The key list is computed once, because which keys are style props is static for a render;
    // only the values are read lazily, in the class getter. This is what says the values stayed
    // lazy.
    const [padding, setPadding] = createSignal("2");
    const props = computedProps({
      as: "div",
      props: {
        get p() {
          return padding();
        },
      } as StyledProps,
    });

    expect(props.class).toBe(css({ p: "2" }));
    flush(() => setPadding("8"));
    expect(props.class).toBe(css({ p: "8" }));
  });

  it("recomputes the class when the recipe's own accessor changes", () => {
    // The seam is an `Accessor`, not a string, precisely so a Root whose `size` variant changes
    // re-styles every part. Read once and cached, a `<Dialog size={size()}>` would style itself at
    // its first value and stay there.
    const [variant, setVariant] = createSignal("recipe-content--sm");
    const props = computedProps({
      as: "div",
      props: {} as StyledProps,
      recipeClass: () => variant(),
    });

    expect(props.class).toContain("recipe-content--sm");
    flush(() => setVariant("recipe-content--lg"));
    expect(props.class).toContain("recipe-content--lg");
  });
});
