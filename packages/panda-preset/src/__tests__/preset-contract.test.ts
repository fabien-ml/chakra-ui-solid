/**
 * The preset contract — one warning per thing a preset can get wrong that stays green.
 *
 * The plugin is driven **directly**, with a hand-built resolved theme, rather than through a
 * fixture `cssgen` per row. A `config:resolved` hook is a pure function of the config it is handed,
 * and what this file has to assert is the *message*: a warning nobody can act on is the failure
 * mode here, and a stylesheet cannot show one.
 *
 * The one thing a real run does prove — that a correct preset says nothing — is the gate on
 * `pnpm cssgen`, where three repo runs and the fixture's own all go through this hook.
 */

import type { Config } from "@pandacss/dev";
import basePreset from "@pandacss/preset-base";
import { afterEach, describe, expect, it, vi } from "vitest";
import { animationStyles } from "../chakra/animation-styles";
import { keyframes } from "../chakra/keyframes";
import { layerStyles } from "../chakra/layer-styles";
import { recipes } from "../chakra/recipes";
import { semanticTokens } from "../chakra/semantic-tokens";
import { slotRecipes } from "../chakra/slot-recipes";
import { textStyles } from "../chakra/text-styles";
import { tokens } from "../chakra/tokens";
import { utilities } from "../chakra/utilities";
import { presetContractPlugin } from "../preset-contract";

type Hooks = NonNullable<NonNullable<Config["plugins"]>[number]["hooks"]>;
type Bodies = Record<string, Record<string, unknown>>;
type Theme = Record<string, unknown>;

/**
 * What Panda hands `config:resolved`: every preset in the chain merged, `extend` folded in.
 *
 * `utilities` is the merge Panda's own `mergeExtensions` performs — `@pandacss/preset-base` under
 * Chakra's `extend`, which is where `boxSize` gets its `sizes` scale and therefore where the
 * `sizes.5` row below is decided.
 */
function configFor(theme: Theme): Config {
  return { theme, utilities: { ...basePreset.utilities, ...utilities } } as Config;
}

function warningsFor(config: Config): string[] {
  // Cleared rather than freshly installed: `vi.spyOn` hands back the spy already on `console.warn`,
  // so a second call in one test would otherwise read the first call's warnings back.
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  warn.mockClear();

  (presetContractPlugin().hooks as Hooks)["config:resolved"]?.({ config } as never);

  return warn.mock.calls.map(([message]) => String(message));
}

function warningsForTheme(theme: Theme): string[] {
  return warningsFor(configFor(theme));
}

afterEach(() => {
  vi.restoreAllMocks();
});

const chakraRecipes = recipes as unknown as Bodies;
const chakraSlotRecipes = slotRecipes as unknown as Bodies;

/** Chakra's own preset as Panda resolves it — the one theme that satisfies the contract today. */
const CHAKRA_THEME: Theme = {
  tokens,
  semanticTokens,
  textStyles,
  layerStyles,
  animationStyles,
  keyframes,
  recipes: chakraRecipes,
  slotRecipes: chakraSlotRecipes,
};

function themeWith(patch: Theme): Theme {
  return { ...CHAKRA_THEME, ...patch };
}

/** A preset is written by editing bodies, so every case below is Chakra's with one body changed. */
function bodiesWith(
  table: Bodies,
  key: string,
  patch: Record<string, unknown> | undefined,
): Bodies {
  const edited = { ...table };
  if (patch === undefined) {
    delete edited[key];
  } else {
    edited[key] = { ...table[key], ...patch };
  }
  return edited;
}

function withoutTheDialogBackdrop(): Bodies {
  const dialog = chakraSlotRecipes.dialog as { slots: string[] };
  return bodiesWith(chakraSlotRecipes, "dialog", {
    slots: dialog.slots.filter((slot) => slot !== "backdrop"),
  });
}

describe("Chakra's own bodies", () => {
  it("produce no output at all", () => {
    // The hard half of every check here, and the reason the token vocabulary is Chakra's own names
    // rather than every string a body contains: a recipe body is full of values that are not tokens
    // — `cursor: pointer`, `borderColor: currentColor`, `zIndex: 1`, `width: 100%` — and a walker
    // that read every one of them as a reference would warn about ~130 names on a stylesheet that
    // is completely correct, which is worse than no check.
    expect(warningsForTheme(CHAKRA_THEME)).toEqual([]);
  });
});

describe("a preset that does not satisfy the contract", () => {
  it("names a recipe no body declares", () => {
    const [warning, ...rest] = warningsForTheme(
      themeWith({ recipes: bodiesWith(chakraRecipes, "button", undefined) }),
    );

    expect(warning).toContain("1 recipe.");
    expect(warning).toContain("recipes (1)");
    expect(warning).toContain("`button`");
    expect(rest).toEqual([]);
  });

  it("counts a key our own jsx hint left behind as a recipe with no body", () => {
    // **The measured sharp edge, and the reason presence of the key proves nothing.** A preset's
    // bare `theme.recipes` replaces the whole table, and our library layer's `theme.extend` then
    // writes a `jsx` tracking hint under all 75 contract keys — so `badge`, which the preset never
    // mentioned, comes out as `{ jsx: ["Badge"] }`, with no `className`, no `base` and no error.
    const [warning] = warningsForTheme(
      themeWith({ recipes: { ...chakraRecipes, badge: { jsx: ["Badge"] } } }),
    );

    expect(warning).toContain("1 recipe.");
    expect(warning).toContain("`badge`");
  });

  it("names a className that is not the contract's", () => {
    // The quietest failure in the package: our runtime computes `button--size_md` from the
    // contract, so a preset spelling it `btn` emits every rule and dresses nothing in them.
    const [warning] = warningsForTheme(
      themeWith({ recipes: bodiesWith(chakraRecipes, "button", { className: "btn" }) }),
    );

    expect(warning).toContain("1 class name.");
    expect(warning).toContain("`button` is `btn`, not `button`");
  });

  it("names a slot the body does not style", () => {
    const [warning] = warningsForTheme(themeWith({ slotRecipes: withoutTheDialogBackdrop() }));

    // Once, not twice: upstream's `dialog` lists `backdrop` in its `slots` array twice and the
    // contract records that verbatim, but omitting it is one mistake.
    expect(warning).toContain("1 slot.");
    expect(warning?.match(/`dialog\.backdrop`/g)).toHaveLength(1);
  });

  it("names a variant key the body does not declare", () => {
    const button = chakraRecipes.button as { variants: Record<string, unknown> };
    const { size, ...withoutSize } = button.variants;
    const [warning] = warningsForTheme(
      themeWith({ recipes: bodiesWith(chakraRecipes, "button", { variants: withoutSize }) }),
    );

    expect(warning).toContain("1 variant key.");
    expect(warning).toContain("`button.size`");
  });

  it("names a variant value the body does not declare", () => {
    const button = chakraRecipes.button as { variants: Record<string, Record<string, unknown>> };
    const { xs, ...sizesWithoutXs } = button.variants.size ?? {};
    const [warning] = warningsForTheme(
      themeWith({
        recipes: bodiesWith(chakraRecipes, "button", {
          variants: { ...button.variants, size: sizesWithoutXs },
        }),
      }),
    );

    expect(warning).toContain("1 variant value.");
    expect(warning).toContain("`button.size.xs`");
  });

  it("names a `defaultVariants` the compiled runtime disagrees with", () => {
    // Our runtime is compiled with the contract's defaults — `createRecipe('button', { size: 'md',
    // variant: 'solid' }, [])` — so `<Button>` goes on emitting `button--size_md` whatever the
    // stylesheet resolves for itself, and the preset author sees their default ignored.
    const [warning] = warningsForTheme(
      themeWith({
        recipes: bodiesWith(chakraRecipes, "button", {
          defaultVariants: { size: "sm", variant: "solid" },
        }),
      }),
    );

    expect(warning).toContain("1 default variant.");
    expect(warning).toContain("`button.size` is `sm`, not `md`");
  });

  it("names a default the preset leaves unset", () => {
    const [warning] = warningsForTheme(
      themeWith({ recipes: bodiesWith(chakraRecipes, "button", { defaultVariants: {} }) }),
    );

    expect(warning).toContain("2 default variants.");
    expect(warning).toContain("`button.size` is unset, not `md`");
  });

  it("does not read a boolean default written as its class-name spelling as a disagreement", () => {
    // Panda names a boolean variant's classes `"true"` and `"false"`, so the contract lists those
    // two strings under `alert.inline` while the default it resolves is a real `false`. Comparing
    // values rather than spellings would report all three of the boolean defaults as wrong on a
    // preset that resolves exactly what Chakra's own does.
    const alert = chakraSlotRecipes.alert as { defaultVariants: Record<string, unknown> };
    expect(alert.defaultVariants.inline).toBe(false);

    expect(
      warningsForTheme(
        themeWith({
          slotRecipes: bodiesWith(chakraSlotRecipes, "alert", {
            defaultVariants: { ...alert.defaultVariants, inline: "false" },
          }),
        }),
      ),
    ).toEqual([]);
  });

  it("reports counts per category before it names anything", () => {
    // A preset written from zero misses whole categories at once, and ten truncated names out of
    // one of them say nothing about the size of what is left. This one has written its slot
    // recipes, none of its atomic ones and no token table — the shape of a real half-finished job.
    const [warning] = warningsForTheme({ slotRecipes: withoutTheDialogBackdrop() });

    expect(warning).toMatch(/contract: 19 recipes, 1 slot, 1\d\d tokens\./);
    expect(warning).toMatch(/tokens \(1\d\d\) — .+ and 1\d+ more/);
    // Ten names per category and no more, whatever the count says.
    expect(warning?.match(/→/g)).toHaveLength(10);
    expect(warning?.match(/`\w+`,/g)?.length).toBeLessThanOrEqual(10);
  });

  it("does not also report the slots and variants of a recipe it called missing", () => {
    // 37 missing recipes would otherwise drag their 476 slots and 490 variant values into the same
    // line, which is the console output the counts exist to prevent.
    const [warning] = warningsForTheme(
      themeWith({ slotRecipes: bodiesWith(chakraSlotRecipes, "dialog", undefined) }),
    );

    expect(warning).toContain("`dialog`");
    expect(warning).not.toContain("`dialog.backdrop`");
    expect(warning).not.toContain("slots (");
  });
});

describe("a preset that leaves a token undefined", () => {
  /** A preset is written the way one actually is: keep Chakra's tables, edit what you mean to. */
  function themeWithout(category: "sizes" | "spacing", token: string): Theme {
    const scale = { ...(tokens[category] as Record<string, unknown>) };
    delete scale[token];
    return themeWith({ tokens: { ...tokens, [category]: scale } });
  }

  it("names the literal Panda emits in its place", () => {
    // **The failure that actually happened.** A proof run omitted `sizes.5` and Panda silently
    // emitted `width: 5px` where the default emits `width: var(--chakra-sizes-5)` — not unstyled,
    // *wrong*, and green in every test in the repo. `5px` is the whole value of this warning to
    // someone reading their terminal: it is the string they can search their stylesheet for.
    const [warning, ...rest] = warningsForTheme(themeWithout("sizes", "5"));

    expect(warning).toMatch(/`sizes\.5` → \w+: 5px\b/);
    expect(warning).toContain("1 token.");
    expect(rest).toEqual([]);
  });

  it("names the token itself when the name is not a bare number", () => {
    const radii = { ...(semanticTokens.radii as Record<string, unknown>) };
    delete radii.l3;

    // No `px` on this one: Panda puts the name through raw, so the declaration reads
    // `border-radius: l3` and the reader has a different string to search for.
    expect(
      warningsForTheme(themeWith({ semanticTokens: { ...semanticTokens, radii } }))[0],
    ).toMatch(/`radii\.l3` → \w+: l3\b/);
  });

  it("counts every missing token and lists the first ten", () => {
    // A preset that supplies bodies and no tokens at all misses most of the table at once, and a
    // console line carrying 130 names is one nobody reads.
    const [warning] = warningsForTheme({ recipes: chakraRecipes, slotRecipes: chakraSlotRecipes });

    expect(warning).toMatch(/1\d\d tokens\./);
    expect(warning?.match(/→/g)).toHaveLength(10);
    expect(warning).toMatch(/and 1\d+ more/);
  });

  it("resolves a token that is also a branch, which Panda spells `DEFAULT`", () => {
    // `colors.bg` is a value *and* a family: Chakra writes `{ DEFAULT: {…}, panel: {…}, subtle: {…} }`
    // and Panda resolves a bare `bg` through the `DEFAULT`. Read literally the name would come out
    // as `bg.DEFAULT`, which no recipe body ever writes — so `bg`, `fg` and `border`, three of the
    // most-referenced tokens in the contract, would drop out of the check with nothing to say so.
    const colors = { ...(semanticTokens.colors as Record<string, unknown>) };
    const withoutDefault = { ...(colors.bg as Record<string, unknown>) };
    delete withoutDefault.DEFAULT;
    colors.bg = withoutDefault;

    expect(
      warningsForTheme(themeWith({ semanticTokens: { ...semanticTokens, colors } }))[0],
    ).toMatch(/1 token\..*`colors\.bg` → /s);
  });

  it("does not read a value the utility supplies itself as a token reference", () => {
    // A utility whose `values` is a **function** builds its set from a scale *and* from literals of
    // its own: `maxWidth` is `sizes` plus `auto`, `screen`, `1/2`. A value in the literal half needs
    // no token at all, so warning about it would send the reader looking for a declaration that is
    // already correct — and Chakra's `sizes` scale collides with those literals 278 times.
    const theme = themeWithout("sizes", "80");
    expect(warningsForTheme(theme)[0]).toContain("`sizes.80` → maxWidth");

    const config = configFor(theme);
    (config.utilities as Record<string, unknown>).maxWidth = {
      className: "max-w",
      values: (scale: (category: string) => object) => ({ ...scale("sizes"), "80": "20rem" }),
    };

    expect(warningsFor(config)).toEqual([]);
  });

  it("says nothing about a token the consumer's own config puts back", () => {
    // Resolution goes through the **resolved** theme, so a token restored anywhere in the chain
    // counts — which is also why the check cannot be run against a preset object alone.
    const theme = themeWithout("spacing", "4");
    const scales = theme.tokens as Record<string, Record<string, unknown>>;
    scales.spacing = { ...scales.spacing, "4": { value: "1rem" } };

    expect(warningsForTheme(theme)).toEqual([]);
  });
});

describe("a preset's compoundVariants", () => {
  it("never apply, and the warning names what does", () => {
    const [warning] = warningsForTheme(
      themeWith({
        slotRecipes: bodiesWith(chakraSlotRecipes, "dialog", {
          compoundVariants: [{ size: "sm", placement: "top", css: { content: {} } }],
        }),
      }),
    );

    expect(warning).toContain("`compoundVariants` never apply");
    expect(warning).toContain("`dialog`");
    expect(warning).toContain('"&.button--variant_outline"');
  });
});
