import { css } from "@chakra-ui-solid/styled-system/css";
import { isCssProperty } from "@chakra-ui-solid/styled-system/is-valid-prop";
import { describe, expect, it } from "vitest";
import { HTML_PROP_RENAMES } from "../html-props";

// The `unit` project is the one place a class *string* is the legitimate subject of an assertion:
// `css()` is a pure function whose output IS a string, and there is no element here to have a
// computed style. Everywhere an element exists — `ssr` and `browser` — a class-name assertion is
// banned and `check:style-contract` rule 3 enforces it (`testing.md` §2.3).

describe("the style-prop vocabulary", () => {
  it("recognises Chakra's shorthands, including the 17 our preset aliases", () => {
    for (const name of ["p", "bg", "mt", "_hover", "colorPalette"]) {
      expect(isCssProperty(name), `${name} should be a style prop`).toBe(true);
    }
    for (const alias of ["bgImg", "bgPos", "gapX", "gapY", "textDecor", "overscroll"]) {
      expect(isCssProperty(alias), `${alias} is one of Chakra's 95 shorthands`).toBe(true);
    }
  });

  it("keeps Panda's own shorthands for the properties we aliased", () => {
    // `utilities.extend` merges a property's config shallowly, so declaring `shorthand: ["bgImg"]`
    // alone would *replace* `bgImage` rather than join it. The preset reads Panda's existing names
    // and appends; this is what says so.
    for (const pandaName of ["bgImage", "bgPosition", "roundedEndEnd", "roundedStartStart"]) {
      expect(isCssProperty(pandaName), `${pandaName} is Panda's own name and must survive`).toBe(
        true,
      );
    }
  });

  it("excludes `dir`, which every machine emits as a DOM attribute", () => {
    // 320 sites across the machine set emit `dir`. The moment it becomes a style prop the factory
    // folds it into a class on every part of every component instead of setting the attribute —
    // silently. `check:style-prop-collisions` is the standing form of this assertion.
    expect(isCssProperty("dir")).toBe(false);
  });

  it("treats `css` as a style prop, which is why the factory excludes it by name", () => {
    // `css` is a *nested* style object, not a per-prop value: folded in with the others it emits
    // garbage like `color:css_red`. The factory drops it from the key list and passes it as a
    // sibling `css()` argument instead.
    expect(isCssProperty("css")).toBe(true);
  });
});

describe("the `css` escape hatch, in both forms", () => {
  it("merges an array left to right, later winning", () => {
    // Addition 1: `css()` is variadic, so the array form is a spread rather than a manual merge.
    const single = css({ padding: "4" }, { padding: "8" });
    const spread = css({ padding: "4" }, ...[{ padding: "8" }]);
    expect(spread).toBe(single);
    expect(css({ padding: "4" }, { padding: "8" })).toBe(css({ padding: "8" }));
  });
});

describe("the five `html*` renames", () => {
  it("maps each to the attribute the style prop of the same name displaces", () => {
    expect(HTML_PROP_RENAMES).toEqual({
      htmlSize: "size",
      htmlWidth: "width",
      htmlHeight: "height",
      htmlTranslate: "translate",
      htmlContent: "content",
    });
  });

  it("covers every displaced name that is a style prop here", () => {
    // Four of the five escape hatches earn their place by measurement: `width`, `height`,
    // `translate` and `content` are style props, so the bare attribute never reaches the element.
    for (const displaced of ["width", "height", "translate", "content"]) {
      expect(isCssProperty(displaced), `${displaced} should be a style prop`).toBe(true);
    }
  });

  it("keeps `htmlSize` even though `size` is not a style prop in this vocabulary", () => {
    // Measured, and it contradicts the reasoning the rename was argued from: Panda's base preset
    // has no `size` utility and `@chakra-ui/panda-preset` adds `boxSize` rather than `size`, so
    // bare `size` here is an ordinary attribute. In Chakra it IS a style prop — its own Emotion
    // preset declares one — which is why the escape hatch exists there.
    //
    // The prop stays, because dropping it would diverge from Chakra's surface for no gain, and it
    // costs nothing: `htmlSize` renames to `size` and reaches the element either way.
    expect(isCssProperty("size")).toBe(false);
    expect(HTML_PROP_RENAMES.htmlSize).toBe("size");
  });
});
