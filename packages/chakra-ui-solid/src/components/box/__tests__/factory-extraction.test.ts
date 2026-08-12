import { readFileSync } from "node:fs";
import { declarationsForClassList } from "@chakra-ui-solid/internal-test-utils/stylesheet";
import { css, cva } from "@chakra-ui-solid/styled-system/css";
import { describe, expect, it } from "vitest";

/**
 * **The `chakra` factory's only real gate.**
 *
 * Panda registers a factory from an import whose name is the configured `jsxFactory` and whose
 * module is in `importMap.jsx`. Get either wrong and `<chakra.div>` produces **zero** rules — no
 * error, no warning, an element with a class attribute nothing in the sheet answers. Every runtime
 * test in this repo passes in that state, because `css()` computes a class either way. So the
 * question has to be asked of a real `panda cssgen` run over a consumer's source, which is what
 * `__fixtures__/consumer` is and what `pnpm --filter chakra-ui-solid cssgen` produces.
 *
 * It lives beside Box because the consumer fixture does — one fixture app, one Panda run, and the
 * factory is a second thing that app now writes.
 *
 * Every expected class is **computed** by calling `css()` / `cva()` here rather than typed out as
 * `bg_teal.400`, so a failure says "the extractor did not emit what the runtime computes" rather
 * than pinning today's class-name format. The declarations are then resolved through the consumer's
 * own sheet, because a class name on its own proves nothing.
 */

// Read off disk rather than imported as `?raw`: Vitest's default `css: false` replaces a CSS
// module's contents with an empty string in a node project, and every assertion below would then
// pass or fail against nothing.
const consumerStylesheet = readFileSync(
  new URL("./__fixtures__/consumer/consumer.css", import.meta.url),
  "utf8",
);

function consumerDeclarations(classList: string): Record<string, string> {
  return declarationsForClassList(classList, consumerStylesheet);
}

describe("the `chakra` factory reaches a consumer's extractor", () => {
  it("emits a rule for the JSX-namespace form", () => {
    // `chakra.div` is lowercase, so `matchTag`'s `isUpperCase` fallback declines it. This case
    // passes only because `jsxFactory: "chakra"` and `importMap.jsx` are both set — it is the one
    // that fails first when either goes.
    expect(consumerDeclarations(css({ marginTop: "7", background: "teal.400" }))).toEqual({
      "margin-top": "var(--chakra-spacing-7)",
      background: "var(--chakra-colors-teal-400)",
    });
  });

  it("emits a rule for a style config handed to the function form", () => {
    const link = cva({ base: { textDecorationLine: "underline", color: "purple.500" } });

    expect(consumerDeclarations(link())).toEqual({
      "text-decoration-line": "underline",
      color: "var(--chakra-colors-purple-500)",
    });
  });

  it("emits a rule for every branch of a variant, not only the default", () => {
    const button = cva({
      base: { fontWeight: "bold" },
      variants: {
        tone: { solid: { background: "blue.600" }, subtle: { background: "blue.100" } },
      },
      defaultVariants: { tone: "solid" },
    });

    expect(consumerDeclarations(button())).toMatchObject({
      "font-weight": "var(--chakra-font-weights-bold)",
      background: "var(--chakra-colors-blue-600)",
    });
    // The source only ever writes `tone="subtle"`, and the default is `solid`. A consumer switching
    // a variant at runtime needs both, and only the config — not the JSX — can say so.
    expect(consumerDeclarations(button({ tone: "subtle" }))).toMatchObject({
      background: "var(--chakra-colors-blue-100)",
    });
  });

  it("emits a rule for the config passed alongside the options argument", () => {
    expect(consumerDeclarations(cva({ base: { fill: "orange.500" } })())).toEqual({
      fill: "var(--chakra-colors-orange-500)",
    });
  });

  it("emits a style prop written on a component the factory returned", () => {
    expect(consumerDeclarations(css({ paddingInline: "3" }))).toEqual({
      "padding-inline": "var(--chakra-spacing-3)",
    });
  });

  it("finds nothing for a class the consumer's source never wrote", () => {
    // The negative control. Without it every assertion above could be passing on a lookup that
    // matches everything, which is precisely the failure they exist to catch.
    expect(consumerDeclarations(css({ background: "yellow.300" }))).toEqual({});
  });
});
