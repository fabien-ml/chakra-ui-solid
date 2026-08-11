import { readFileSync } from "node:fs";
import { declarationsForClassList } from "@chakra-ui-solid/internal-test-utils/stylesheet";
import { css } from "@chakra-ui-solid/styled-system/css";
import { circle, flex, float, spacer, square, wrap } from "@chakra-ui-solid/styled-system/patterns";
import { describe, expect, it } from "vitest";

/**
 * **The layout tier's real gate: does a consumer's Panda run emit rules for what our runtime
 * computes?**
 *
 * A browser test proves our own stylesheet answers our own class names. It cannot see the failure
 * this file exists for, because that failure lives in *someone else's* build: their extractor and
 * our runtime have to arrive at the same class name from different inputs, and when they do not,
 * the component renders unstyled with nothing anywhere to say so.
 *
 * Two channels feed their sheet, and every case below names which one it is testing:
 *
 * - **The library channel** — a style config handed to `chakra()` inside a component. Their build
 *   reads it out of our published files, which is why `panda.config.ts` beside this fixture globs
 *   our sources the way the install docs glob `dist/**​/*.jsx`.
 * - **The pattern channel** — a value only *their* source spells, `<Square size="12">`. Panda's own
 *   patterns claim the JSX names `Square`, `Circle`, `Center`, `Spacer` and friends, so their
 *   extractor runs the pattern's mapping over that line. Reusing `pattern.raw()` in the component
 *   is what makes the two sides agree; re-implementing `size → boxSize` would not.
 *
 * Every expected class is **computed** rather than typed out, so a failure says "the extractor did
 * not emit what the runtime computes" instead of pinning today's class-name format.
 */

const consumerStylesheet = readFileSync(
  new URL("./__fixtures__/consumer/consumer.css", import.meta.url),
  "utf8",
);

function consumerDeclarations(classList: string): Record<string, string> {
  return declarationsForClassList(classList, consumerStylesheet);
}

describe("the layout tier reaches a consumer's extractor", () => {
  it("emits a style prop written on any of them — the channel every component shares", () => {
    // `Em` has no Panda pattern behind its name and no runtime-valued props, so this is the whole
    // of what a consumer's own source contributes: `jsxStyleProps: "all"` over a capitalized tag.
    expect(consumerDeclarations(css({ letterSpacing: "wide" }))).toEqual({
      "letter-spacing": "var(--letter-spacings-wide)",
    });
  });

  it("emits Center's base and its `inline` variant", () => {
    // Library channel. The variant is also why the preset pre-generates `display: inline-flex` —
    // nothing in a consumer's source has to spell it for the toggle to work.
    expect(
      consumerDeclarations(
        css({ display: "inline-flex", alignItems: "center", justifyContent: "center" }),
      ),
    ).toEqual({ display: "inline-flex", "align-items": "center", "justify-content": "center" });
  });

  it("emits AbsoluteCenter's axis variant", () => {
    expect(consumerDeclarations(css({ insetStart: "50%", translate: "-50%" }))).toEqual({
      "inset-inline-start": "50%",
      translate: "-50%",
    });
  });

  it("emits Square's `size`, mapped by the same pattern the component calls", () => {
    // Pattern channel. `square.raw` here IS the call `square.tsx` makes; the fixture writes
    // `<Square size="12">` and nothing else, so a mapping drift shows up as a missing rule.
    expect(consumerDeclarations(css(square.raw({ size: "12" })))).toMatchObject({
      width: "var(--sizes-12)",
      height: "var(--sizes-12)",
      display: "flex",
    });
  });

  it("emits Circle's rounding alongside the same size mapping", () => {
    expect(consumerDeclarations(css(circle.raw({ size: "12" })))).toMatchObject({
      "border-radius": "9999px",
      width: "var(--sizes-12)",
    });
  });

  it("emits Spacer's base", () => {
    expect(consumerDeclarations(css(spacer.raw()))).toMatchObject({
      flex: "1 1 0%",
      "align-self": "stretch",
      "justify-self": "stretch",
    });
  });

  it("emits the declarations VisuallyHidden actually renders", () => {
    // Panda's `visuallyHidden` pattern claims this JSX name too, and answers with a *different*
    // class — its `srOnly` utility, one rule carrying every declaration. Ours is Chakra's explicit
    // style object, so the classes our runtime computes can only come from the library channel.
    // That is the case this asserts; the pattern's own rule is harmless and unused.
    expect(consumerDeclarations(css({ position: "absolute", clip: "rect(0, 0, 0, 0)" }))).toEqual({
      position: "absolute",
      clip: "rect(0, 0, 0, 0)",
    });
  });

  it("emits Sticky's base and Strong's weight", () => {
    expect(consumerDeclarations(css({ position: "sticky", top: 0 }))).toEqual({
      position: "sticky",
      top: "0",
    });
    expect(consumerDeclarations(css({ fontWeight: "semibold" }))).toEqual({
      "font-weight": "var(--font-weights-semibold)",
    });
  });

  it("emits every Flex shorthand, mapped by the pattern the component calls", () => {
    // The case the whole "reuse the pattern" rule exists for. `direction="row-reverse"` is a
    // *prop*: nothing in this library spells `flexDirection: "row-reverse"`, so the rule can only
    // come from the consumer's own line — through Panda's `flex` pattern, which claims this JSX
    // name. `flex.raw` here is the call `flex.tsx` makes.
    expect(
      consumerDeclarations(css(flex.raw({ direction: "row-reverse", align: "center", grow: "1" }))),
    ).toEqual({
      display: "flex",
      "flex-direction": "row-reverse",
      "align-items": "center",
      "flex-grow": "1",
    });
  });

  it("emits Grid's static rules, which is all its build has to emit", () => {
    // The opposite case, and the reason Grid takes the custom-property route: Panda's `grid`
    // pattern claims the name `Grid` and knows `columns`/`minChildWidth`/`gap`, so the consumer's
    // `templateColumns="repeat(3, 1fr)"` falls through to `...rest`, is not a CSS property, and
    // produces **no rule at all**. What their build must emit is the `var()` rule instead — and
    // that comes from the library channel, where it is a literal.
    expect(
      consumerDeclarations(css({ gridTemplateColumns: "var(--grid-template-columns)" })),
    ).toEqual({ "grid-template-columns": "var(--grid-template-columns)" });
    expect(consumerDeclarations(css({ gridColumnStart: "var(--grid-item-column-start)" }))).toEqual(
      {
        "grid-column-start": "var(--grid-item-column-start)",
      },
    );
  });

  it("emits Wrap's default gap and the shorthands its pattern carries", () => {
    // Panda's `wrap` pattern defaults `gap` to `8px` and Chakra's Wrap to `0.5rem`, so the default
    // is passed in rather than inherited — and it is a literal in the component's own style config,
    // which is what puts it in their sheet.
    expect(consumerDeclarations(css({ gap: "0.5rem" }))).toEqual({ gap: "0.5rem" });
    expect(
      consumerDeclarations(css(wrap.raw({ justify: "space-around", gap: "3" }))),
    ).toMatchObject({
      "justify-content": "space-around",
      "flex-wrap": "wrap",
      gap: "var(--spacing-3)",
    });
  });

  it("emits Stack's shorthands through the pattern that claims its name", () => {
    // Panda's `stack` pattern maps `direction` / `align` / `justify` exactly as `flex` does, so the
    // component calling `flex.raw` and the consumer's build calling the other one arrive at the
    // same classes. What the component does **not** reuse is that pattern's `gap: 8px` default,
    // which is a class no source in this library spells — Chakra's `0.5rem` is a literal in the
    // component's own style config instead, and asserted with Wrap's above.
    expect(
      consumerDeclarations(css(flex.raw({ direction: "row", justify: "space-evenly" }))),
    ).toEqual({
      display: "flex",
      "flex-direction": "row",
      "justify-content": "space-evenly",
    });
  });

  it("emits both of StackSeparator's borders, at every breakpoint", () => {
    // Neither value is a literal anywhere: the separator's line is a *mapping* of the Stack's
    // direction, so `staticCss` is the only thing that puts these rules in either stylesheet. The
    // responsive half is the same mapping under a `direction={{ base, md }}`, and the conditional
    // rules are read off the sheet text because `consumerDeclarations` deliberately ignores
    // anything under a `@media`.
    expect(
      consumerDeclarations(css({ borderTopWidth: "1px", borderInlineStartWidth: "0" })),
    ).toEqual({ "border-top-width": "1px", "border-inline-start-width": "0" });
    expect(
      consumerDeclarations(css({ borderTopWidth: "0", borderInlineStartWidth: "1px" })),
    ).toEqual({ "border-top-width": "0", "border-inline-start-width": "1px" });
    expect(consumerStylesheet).toContain("md\\:bd-t-w_0");
    expect(consumerStylesheet).toContain("md\\:bd-s-w_1px");
  });

  it("emits the shorthand keywords no pattern claims", () => {
    // `Wrap`'s `direction` and all of `Group`'s, which no pattern maps — these come from the
    // preset's `staticCss` and from nowhere else. `column-reverse` is written in no source file on
    // either side, which is exactly the point.
    expect(consumerDeclarations(css({ flexDirection: "column-reverse" }))).toEqual({
      "flex-direction": "column-reverse",
    });
    expect(consumerDeclarations(css({ alignItems: "stretch" }))).toEqual({
      "align-items": "stretch",
    });
  });

  it("emits Group's recipe, variants and compound variants", () => {
    expect(
      consumerDeclarations(css({ gap: "var(--group-gap, 0.5rem)", isolation: "isolate" })),
    ).toEqual({ gap: "var(--group-gap, 0.5rem)", isolation: "isolate" });
  });

  it("emits every Float placement through the pattern that also defines it", () => {
    // Panda's `float` pattern computes what Chakra's Float computes — the same nine placements, the
    // same `offsetX ?? offset` fallback, the same defaults — so the component reuses it whole and
    // the consumer's own `<Float placement="bottom-center" offset="1">` is mapped by the same code.
    // Nothing here needs a custom property or a `staticCss` row.
    expect(
      consumerDeclarations(css(float.raw({ placement: "bottom-center", offset: "1" }))),
    ).toMatchObject({
      position: "absolute",
      "inset-block-end": "var(--spacing-1)",
      translate: "-50% 50%",
    });
  });

  it("emits the rules AspectRatio and Bleed feed at runtime", () => {
    // Two `var()` routes, and what their build must carry is the rule rather than the value: the
    // ratio is an arbitrary number and the bleed amounts are per-edge. Both are literals in the
    // components' own style configs, so both come from the library channel — as does SimpleGrid's
    // track list, through the Grid it delegates to.
    expect(
      consumerDeclarations(css({ marginInlineStart: "calc(var(--bleed-inline-start, 0) * -1)" })),
    ).toEqual({ "margin-inline-start": "calc(var(--bleed-inline-start, 0) * -1)" });

    // AspectRatio's declaration lives on a `::before`, which `declarationsForClassList` cannot
    // resolve — it reads rules whose selector *is* the class. The sheet text is the assertion.
    expect(consumerStylesheet).toContain("padding-bottom: var(--aspect-ratio-padding)");
  });

  it("emits Container's recipe, which no channel above could have carried", () => {
    // A third channel, and the only component here that uses it: the recipe is *declared in the
    // preset*, so a consumer's build emits it from their config rather than from either source
    // tree — which is what the ported `container` body plus its `staticCss: ["*"]` buys. The class
    // is the recipe's own name, and the variant is the half nobody's source spells.
    expect(consumerDeclarations("container")).toMatchObject({
      position: "relative",
      "max-width": "var(--sizes-8xl)",
      "margin-inline": "auto",
    });
    expect(consumerDeclarations("container--centerContent_true")).toEqual({
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
    });
  });

  it("finds nothing for a class no source on either side wrote", () => {
    // The negative control. Without it every case above could be passing on a lookup that matches
    // everything, which is exactly the failure they exist to catch.
    expect(consumerDeclarations(css({ letterSpacing: "widest" }))).toEqual({});
  });
});
