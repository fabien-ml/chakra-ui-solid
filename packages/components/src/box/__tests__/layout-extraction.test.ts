import { readFileSync } from "node:fs";
import { declarationsForClassList } from "@chakra-ui-solid/internal-test-utils/stylesheet";
import { css } from "@chakra-ui-solid/styled-system/css";
import { circle, spacer, square } from "@chakra-ui-solid/styled-system/patterns";
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

  it("finds nothing for a class no source on either side wrote", () => {
    // The negative control. Without it every case above could be passing on a lookup that matches
    // everything, which is exactly the failure they exist to catch.
    expect(consumerDeclarations(css({ letterSpacing: "widest" }))).toEqual({});
  });
});
