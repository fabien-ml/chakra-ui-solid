import { describe, expect, it } from "vitest";
import { componentNameFor, recipeKeys, slotRecipeKeys } from "../contract";
import { chakraSolidPreset, createChakraSolidPreset } from "../preset";
import { chakraSkin, defineSkin } from "../skin";

/**
 * What the preset declares per recipe, now that it declares no `staticCss`.
 *
 * Panda generates CSS by scanning source files, and **no recipe variant this library emits is ever
 * written in a consumer's source** — they write `<Button size="lg">` and never import the generated
 * recipe module. A recipe whose values were never generated renders every one of them as a class
 * with no rule: an unstyled component, no error, and a green suite. `staticCss: ["*"]` on all 75
 * bodies used to be the answer, at 354 kB of CSS for an app that imports Button;
 * `recipe-gate-plugin.ts` is, and `recipe-gate.test.ts` is where that half is asserted.
 *
 * What is left here is one `jsx` hint per recipe, and nothing depends on it.
 */

type RecipeExtension = Record<string, { staticCss?: unknown; jsx?: string[] }>;

const extension = chakraSolidPreset.theme?.extend as
  | { recipes?: RecipeExtension; slotRecipes?: RecipeExtension; tokens?: unknown }
  | undefined;

function presetNamesOf(preset: { presets?: unknown[] }): Array<string | undefined> {
  return (preset.presets ?? []).map((entry) =>
    typeof entry === "string" ? entry : (entry as { name?: string }).name,
  );
}

/** The chain's middle entry — the fixed half, read back out of the preset that assembles it. */
const anatomyPreset = (chakraSolidPreset.presets ?? [])[1] as {
  theme?: { recipes?: Record<string, { className?: string }>; slotRecipes?: object };
  utilities?: { extend?: object };
  conditions?: unknown;
};

describe("theme.extend — the recipe declarations", () => {
  it("declares no `staticCss` on any of the 75 recipes", () => {
    // The gate's whole saving is this absence: a body's `staticCss` is assigned *over* whatever the
    // config asked for that recipe, so one left behind would ungate it for every consumer.
    const declared = { ...extension?.recipes, ...extension?.slotRecipes };
    const stillDeclaring = [...recipeKeys, ...slotRecipeKeys].filter(
      (key) => declared[key]?.staticCss !== undefined,
    );

    expect(stillDeclaring).toEqual([]);
    expect(Object.keys(declared)).toHaveLength(75);
  });

  it("declares the atomic and slot recipes under their own keys", () => {
    // They are two different Panda config sections, and a slot recipe declared under `recipes`
    // merges into nothing.
    expect(Object.keys(extension?.recipes ?? {})).toEqual(recipeKeys);
    expect(Object.keys(extension?.slotRecipes ?? {})).toEqual(slotRecipeKeys);
  });

  it("declares `container` as an ordinary recipe rather than a body smuggled through `extend`", () => {
    // `container` used to arrive here whole, because it was the one recipe the dependency did not
    // carry and `theme.extend` *creates* a key the base theme lacks. Now that the bodies are
    // vendored, `chakra/recipes/index.ts` registers it beside the other eighteen and this entry is
    // the same bare hint every other recipe gets.
    expect(extension?.recipes?.container).toEqual({ jsx: ["Container"] });
    expect(anatomyPreset.theme?.recipes?.container?.className).toBe("container");
  });

  it("keeps `swittch` under its misspelled key while hinting the real component name", () => {
    expect(extension?.slotRecipes?.swittch).toEqual({ jsx: ["Switch"] });
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
    //
    // Chakra's preset arrives as the second and third entries rather than as one, in the position
    // the single entry held: `anatomy` for the recipe bodies, utilities and conditions, the skin
    // for the tokens and the compositions.
    expect(presetNamesOf(chakraSolidPreset)).toEqual([
      "@pandacss/preset-base",
      "@chakra-ui-solid/anatomy",
      "@chakra-ui-solid/skin",
    ]);
  });

  it("pre-generates the atomic values a component's own logic picks", () => {
    // The atomic half of the same problem: `display: inline-flex` toggled by a `Flex` prop, and the
    // layout shorthands whose matching Panda pattern does not carry them — `Wrap`'s `direction`,
    // `Stack`'s `wrap`, all of `Group`'s. None appears in a consumer's source, so none is
    // extracted. The last two rows are a *mapping* of one of those props rather than the prop
    // itself: StackSeparator's line is `borderTopWidth` in a column stack and
    // `borderInlineStartWidth` in a row one, which is why they alone carry `responsive: true` — a
    // responsive `direction` makes the mapped value responsive too.
    //
    // Everything from `captionSide` down is the same bar reached from the other direction: a
    // component supplies the value through `withDefaults`, because the extractable spelling — a
    // JSX attribute before the props spread — is deleted by a wrapper forwarding the prop unset
    // (measured). The value then lives only in an object literal, which no extractor reads. Eight
    // rows, seven components: `Table.Caption`'s side, `Circle`'s radius, `ColorSwatch.Mix`'s
    // clipping, `IconButton`'s two paddings and its `_icon` font size, `Field.ErrorIcon`'s
    // `boxSize`, `LinkBox`'s `position`, and `SkeletonText`'s stack width. `Stat.Group`'s four
    // moved the same way and needed no row — `display`, `flexWrap`, `justifyContent` and
    // `alignItems` are already in the lists above.
    //
    // **A component picking the value is the bar, and the list is exhaustive on purpose.** There is
    // no row for `colorPalette`: no component in this library defaults or forwards one, and a
    // *consumer's* runtime-valued `colorPalette` is the form the library forbids rather than a case
    // to pre-generate. Every literal form still emits without it — plain, responsive object, and
    // forwarded through a wrapper, since the call site is the literal.
    expect(chakraSolidPreset.staticCss?.css).toEqual([
      { properties: { display: ["flex", "inline-flex", "grid", "inline-grid"] } },
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
      { properties: { captionSide: ["bottom"] } },
      { properties: { borderRadius: ["9999px"] } },
      { properties: { overflow: ["hidden"] } },
      { properties: { paddingInline: ["0"] } },
      { properties: { paddingBlock: ["0"] } },
      { properties: { fontSize: ["1.2em"] }, conditions: ["icon"] },
      { properties: { boxSize: ["1em"] } },
      { properties: { position: ["relative"] } },
      { properties: { width: ["full"] } },
      { properties: { borderTopWidth: ["1px", "0"] }, responsive: true },
      { properties: { borderInlineStartWidth: ["1px", "0"] }, responsive: true },
    ]);
  });

  it("declares no top-level `staticCss.recipes`", () => {
    // Deliberate, and the opposite of `defineChakraConfig()`'s block: a top-level recipe block here would
    // compete with a consumer's own, because spreading a config is shallow. The per-recipe
    // declarations above ride `theme.extend`'s deep merge instead.
    expect(chakraSolidPreset.staticCss?.recipes).toBeUndefined();
  });
});

describe("the anatomy/skin split", () => {
  it("claims every key the vendored preset declares, in one half or the other", () => {
    // **The invariant the whole seam rests on**, and the last thing left of it now that there is no
    // dependency to diff against. Chakra's own `index.ts` declares these nine theme keys plus
    // `utilities`, `conditions` and `globalCss`; each has to land in exactly one half. A key a
    // Chakra bump adds and neither half claims goes missing from every consumer's sheet with
    // nothing to say so.
    const { globalCss, recipes, slotRecipes, ...skinTheme } = chakraSkin;

    expect(new Set([...Object.keys(anatomyPreset.theme ?? {}), ...Object.keys(skinTheme)])).toEqual(
      new Set([
        "breakpoints",
        "keyframes",
        "tokens",
        "semanticTokens",
        "recipes",
        "slotRecipes",
        "textStyles",
        "layerStyles",
        "animationStyles",
      ]),
    );
    // The three non-theme keys split two to the anatomy, one to the skin. `conditions` is the whole
    // of Chakra's own: `_icon` is how a recipe reaches the svg inside a control it does not own the
    // markup of.
    expect(anatomyPreset.conditions).toEqual({ extend: { icon: "& :where(svg)" } });
    expect(Object.keys(anatomyPreset.utilities?.extend ?? {})).toContain("focusRing");
    expect(globalCss).toBeTypeOf("object");
    // Deltas are typed on `Skin` and Chakra's own carries none — it is the look itself, not an
    // override of it.
    expect([recipes, slotRecipes]).toEqual([undefined, undefined]);
  });

  it("puts the skin it was given into the chain", () => {
    // The parameter is the seam; without this the default export would be the only thing exercised
    // and `createChakraSolidPreset` could ignore its argument entirely.
    const preset = createChakraSolidPreset(defineSkin({ breakpoints: { sm: "1px" } }));
    const skin = (preset.presets ?? [])[2] as { theme?: { breakpoints?: unknown } };

    expect(presetNamesOf(preset)).toEqual(presetNamesOf(chakraSolidPreset));
    expect(skin.theme?.breakpoints).toEqual({ sm: "1px" });
  });
});
