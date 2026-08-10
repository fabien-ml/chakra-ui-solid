import { describe, expect, it } from "vitest";
import { chakraSolidPreset } from "../preset";
import { componentNameFor, recipeKeys, slotRecipeKeys } from "../recipe-registry";

/**
 * `staticCss: ["*"]` on every recipe is the single line the whole styling layer rests on. Panda
 * generates CSS by scanning source files, and **no recipe variant this library emits is ever written
 * in a consumer's source** — they write `<Button size="lg">` and never import the generated recipe
 * module. A recipe that lost its `staticCss` key would render every one of its variants as a class
 * with no rule: an unstyled component, no error, and a green suite.
 *
 * So these tests count. One missing entry out of 75 is exactly the failure that has nothing else
 * watching for it.
 */

type RecipeExtension = Record<string, { staticCss?: unknown; jsx?: string[] }>;

const extension = chakraSolidPreset.theme?.extend as
  | { recipes?: RecipeExtension; slotRecipes?: RecipeExtension; tokens?: unknown }
  | undefined;

describe("theme.extend — the staticCss declarations", () => {
  it("gives every one of the 75 recipes a `staticCss: ['*']`", () => {
    const declared = { ...extension?.recipes, ...extension?.slotRecipes };
    const missing = [...recipeKeys, ...slotRecipeKeys].filter(
      (key) => JSON.stringify(declared[key]?.staticCss) !== JSON.stringify(["*"]),
    );

    expect(missing).toEqual([]);
    expect(Object.keys(declared)).toHaveLength(75);
  });

  it("declares the atomic and slot recipes under their own keys", () => {
    // They are two different Panda config sections, and a slot recipe declared under `recipes`
    // merges into nothing.
    expect(Object.keys(extension?.recipes ?? {})).toEqual(recipeKeys);
    expect(Object.keys(extension?.slotRecipes ?? {})).toEqual(slotRecipeKeys);
  });

  it("carries the ported `container` body alongside its declaration", () => {
    // The one recipe with nothing upstream to merge into: `theme.extend` deep-merges, so a key the
    // inherited theme does not have is *created* by this entry — body and `staticCss` together, or
    // Panda registers a declaration for a recipe that does not exist and `container(…)` is not
    // generated at all.
    const container = extension?.recipes?.container as
      | { className?: string; jsx?: string[] }
      | undefined;
    expect(container?.className).toBe("container");
    expect(container?.jsx).toEqual(["Container"]);
  });

  it("keeps `swittch` under its misspelled key while hinting the real component name", () => {
    expect(extension?.slotRecipes?.swittch).toEqual({ staticCss: ["*"], jsx: ["Switch"] });
  });

  it("hints each recipe's jsx name from its `className`", () => {
    const declared = { ...extension?.recipes, ...extension?.slotRecipes };
    const wrong = [...recipeKeys, ...slotRecipeKeys].filter(
      (key) => declared[key]?.jsx?.[0] !== componentNameFor(key),
    );

    expect(wrong).toEqual([]);
  });
});

describe("theme.extend — the token delta", () => {
  it("adds `cursor.switch` and nothing else", () => {
    // The upstream preset registers this token as `swittch` while its own Switch recipe references
    // `cursor: "switch"`, so the reference resolves to nothing and Switch silently loses its
    // pointer cursor. One key restores it. Any *second* token here would be a theme fork, which
    // `CLAUDE.md`, *Reference use* forbids — this assertion is what keeps the delta one key wide.
    expect(extension?.tokens).toEqual({ cursor: { switch: { value: "pointer" } } });
  });

  it("extends the theme rather than replacing it", () => {
    // `theme.extend` deep-merges into the inherited bodies; a bare `theme` would replace Chakra's
    // outright and re-emit every recipe we are supposed to be inheriting.
    expect(Object.keys(chakraSolidPreset.theme ?? {})).toEqual(["extend"]);
  });
});

describe("the preset's own chain and atomic staticCss", () => {
  it("declares the base preset itself, rather than leaving it to a config file", () => {
    // `eject: true` drops Panda's defaults, and `@chakra-ui/panda-preset` declares no base of its
    // own while reaching for `utilities: { extend }`. Left to a config file the fix **fails open**:
    // a consumer who omits the line gets no style-prop utilities and no `_hover`/`_open`
    // conditions, and nothing errors.
    const names = (chakraSolidPreset.presets ?? []).map((entry) =>
      typeof entry === "string" ? entry : (entry as { name?: string }).name,
    );
    expect(names).toEqual(["@pandacss/preset-base", "@chakra-ui/panda-preset"]);
  });

  it("pre-generates the atomic values a component's own logic picks", () => {
    // The atomic half of the same problem: `display: inline-flex` toggled by a `Flex` prop, a
    // `colorPalette` a component defaults or a wrapper forwards, and the layout shorthands whose
    // matching Panda pattern does not carry them — `Wrap`'s `direction`, `Stack`'s `wrap`, all of
    // `Group`'s. None appears in a consumer's source, so none is extracted. The last two rows are
    // a *mapping* of one of those props rather than the prop itself: StackSeparator's line is
    // `borderTopWidth` in a column stack and `borderInlineStartWidth` in a row one, which is why
    // they alone carry `responsive: true` — a responsive `direction` makes the mapped value
    // responsive too.
    expect(chakraSolidPreset.staticCss?.css).toEqual([
      { properties: { display: ["flex", "inline-flex", "grid", "inline-grid"] } },
      {
        properties: {
          colorPalette: [
            "gray",
            "red",
            "orange",
            "green",
            "blue",
            "yellow",
            "teal",
            "purple",
            "pink",
            "cyan",
          ],
        },
      },
      { properties: { flexDirection: ["row", "column", "row-reverse", "column-reverse"] } },
      { properties: { flexWrap: ["wrap", "nowrap", "wrap-reverse"] } },
      {
        properties: {
          alignItems: ["flex-start", "flex-end", "center", "baseline", "stretch", "start", "end"],
        },
      },
      {
        properties: {
          justifyContent: [
            "flex-start",
            "flex-end",
            "center",
            "space-between",
            "space-around",
            "space-evenly",
            "start",
            "end",
          ],
        },
      },
      { properties: { borderTopWidth: ["1px", "0"] }, responsive: true },
      { properties: { borderInlineStartWidth: ["1px", "0"] }, responsive: true },
    ]);
  });

  it("declares no top-level `staticCss.recipes`", () => {
    // Deliberate, and the opposite of `chakraConfig()`'s block: a top-level recipe block here would
    // compete with a consumer's own, because spreading a config is shallow. The per-recipe
    // declarations above ride `theme.extend`'s deep merge instead.
    expect(chakraSolidPreset.staticCss?.recipes).toBeUndefined();
  });
});
