/**
 * The skin contract — three warnings for the three things a skin can get wrong that stay green.
 *
 * The plugin is driven **directly**, with a hand-built resolved config, rather than through a
 * fixture `cssgen` per row. A `config:resolved` hook is a pure function of the config it is handed,
 * and what this file has to assert is the *message*: a warning nobody can act on is the failure
 * mode here, and a stylesheet cannot show one.
 *
 * The one thing a real run does prove — that a correct skin says nothing — is the gate on
 * `pnpm cssgen`, where three repo runs and the skin fixture's own all go through this hook.
 */

import type { Config } from "@pandacss/dev";
import basePreset from "@pandacss/preset-base";
import { afterEach, describe, expect, it, vi } from "vitest";
import { anatomy } from "../anatomy";
import { chakraSkin, defineSkin, type Skin } from "../skin";
import { skinContractPlugin } from "../skin-contract";

type Hooks = NonNullable<NonNullable<Config["plugins"]>[number]["hooks"]>;

/**
 * What Panda hands `config:resolved`: every preset in the chain merged, `extend` folded in.
 *
 * The two keys this plugin reads are the two assembled here. `utilities` is the merge Panda's own
 * `mergeExtensions` performs — `@pandacss/preset-base` under Chakra's `extend`, which is where
 * `boxSize` gets its `sizes` scale and therefore where the `sizes.5` row below is decided.
 */
function resolvedConfigWith(skin: Skin): Config {
  const { globalCss, recipes, slotRecipes, ...theme } = skin;
  return {
    theme,
    utilities: { ...basePreset.utilities, ...anatomy.utilities?.extend },
  } as Config;
}

function warningsFor(skin: Skin, config: Config = resolvedConfigWith(skin)): string[] {
  // Cleared rather than freshly installed: `vi.spyOn` hands back the spy already on `console.warn`,
  // so a second call in one test would otherwise read the first call's warnings back.
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  warn.mockClear();

  (skinContractPlugin(skin).hooks as Hooks)["config:resolved"]?.({ config } as never);

  return warn.mock.calls.map(([message]) => String(message));
}

afterEach(() => {
  vi.restoreAllMocks();
});

/** A skin the way one is actually written: spread Chakra's, override what you mean to change. */
function skinWithout(category: "sizes" | "spacing", token: string): Skin {
  const scale = { ...(chakraSkin.tokens?.[category] as Record<string, unknown>) };
  delete scale[token];
  return defineSkin({
    ...chakraSkin,
    tokens: { ...chakraSkin.tokens, [category]: scale } as Skin["tokens"],
  });
}

describe("a skin that leaves a token undefined", () => {
  it("names the literal Panda emits in its place", () => {
    // **The failure that actually happened.** A proof run omitted `sizes.5` and Panda silently
    // emitted `width: 5px` where the default emits `width: var(--chakra-sizes-5)` — not unstyled,
    // *wrong*, and green in every test in the repo. `5px` is the whole value of this warning to
    // someone reading their terminal: it is the string they can search their stylesheet for.
    const [warning, ...rest] = warningsFor(skinWithout("sizes", "5"));

    expect(warning).toMatch(/`sizes\.5` → \w+: 5px\b/);
    expect(warning).toContain("leaves 1 token(s)");
    expect(rest).toEqual([]);
  });

  it("names the token itself when the name is not a bare number", () => {
    const l3 = { ...(chakraSkin.semanticTokens?.radii as Record<string, unknown>) };
    delete l3.l3;
    const skin = defineSkin({
      ...chakraSkin,
      semanticTokens: { ...chakraSkin.semanticTokens, radii: l3 } as Skin["semanticTokens"],
    });

    // No `px` on this one: Panda puts the name through raw, so the declaration reads
    // `border-radius: l3` and the reader has a different string to search for.
    expect(warningsFor(skin)[0]).toMatch(/`radii\.l3` → \w+: l3\b/);
  });

  it("counts every missing token and lists the first ten", () => {
    // A skin written from scratch rather than from `chakraSkin` misses most of the table at once,
    // and a console line carrying 130 names is one nobody reads.
    const [warning] = warningsFor(defineSkin({}));

    expect(warning).toMatch(/leaves 1\d\d token\(s\)/);
    expect(warning?.match(/→/g)).toHaveLength(10);
    expect(warning).toMatch(/and 1\d+ more/);
  });

  it("resolves a token that is also a branch, which Panda spells `DEFAULT`", () => {
    // `colors.bg` is a value *and* a family: Chakra writes `{ DEFAULT: {…}, panel: {…}, subtle: {…} }`
    // and Panda resolves a bare `bg` through the `DEFAULT`. Read literally the name would come out
    // as `bg.DEFAULT`, which no recipe body ever writes — so `bg`, `fg` and `border`, three of the
    // most-referenced tokens in the anatomy, would drop out of the check with nothing to say so.
    const colors = { ...(chakraSkin.semanticTokens?.colors as Record<string, unknown>) };
    const withoutDefault = { ...(colors.bg as Record<string, unknown>) };
    delete withoutDefault.DEFAULT;
    colors.bg = withoutDefault;

    const skin = defineSkin({
      ...chakraSkin,
      semanticTokens: { ...chakraSkin.semanticTokens, colors } as Skin["semanticTokens"],
    });

    expect(warningsFor(skin)[0]).toMatch(/leaves 1 token\(s\).*`colors\.bg` → /);
  });

  it("does not read a value the utility supplies itself as a token reference", () => {
    // A utility whose `values` is a **function** builds its set from a scale *and* from literals of
    // its own: `maxWidth` is `sizes` plus `auto`, `screen`, `1/2`. A value in the literal half needs
    // no token at all, so warning about it would send the reader looking for a declaration that is
    // already correct — and Chakra's `sizes` scale collides with those literals 278 times.
    const skin = skinWithout("sizes", "80");
    expect(warningsFor(skin)[0]).toContain("`sizes.80` → maxWidth");

    const config = resolvedConfigWith(skin);
    (config.utilities as Record<string, unknown>).maxWidth = {
      className: "max-w",
      values: (scale: (category: string) => object) => ({ ...scale("sizes"), "80": "20rem" }),
    };

    expect(warningsFor(skin, config)).toEqual([]);
  });

  it("says nothing about a token the consumer's own config puts back", () => {
    // Resolution goes through the **resolved** config, so a token restored anywhere in the chain
    // counts — which is also why the check cannot be run against the skin object alone.
    const skin = skinWithout("spacing", "4");
    const config = resolvedConfigWith(skin);
    const spacing = config.theme?.tokens?.spacing as Record<string, unknown>;
    spacing["4"] = { value: "1rem" };

    expect(warningsFor(skin, config)).toEqual([]);
  });
});

describe("a skin's inert recipe knobs", () => {
  it("warns that `defaultVariants` are compiled into the runtime and cannot move", () => {
    const skin = defineSkin({
      ...chakraSkin,
      recipes: { button: { defaultVariants: { variant: "outline" } } },
    });

    const [warning] = warningsFor(skin);

    expect(warning).toContain("`defaultVariants` are inert");
    expect(warning).toContain("`button.variant`");
  });

  it("stays quiet when the delta restates the anatomy's own default", () => {
    const skin = defineSkin({
      ...chakraSkin,
      recipes: { button: { defaultVariants: { variant: "solid" } } },
    });

    expect(warningsFor(skin)).toEqual([]);
  });

  it("warns that `compoundVariants` never apply, and names what does", () => {
    const skin = defineSkin({
      ...chakraSkin,
      slotRecipes: {
        dialog: { compoundVariants: [{ size: "sm", placement: "top", css: { content: {} } }] },
      },
    });

    const [warning] = warningsFor(skin);

    expect(warning).toContain("`compoundVariants` never apply");
    expect(warning).toContain("`dialog`");
    expect(warning).toContain('"&.button--variant_outline"');
  });
});

describe("Chakra's own skin", () => {
  it("produces no output at all", () => {
    // The hard half of this check, and the reason the reference set is built against `chakraSkin`
    // rather than against the token tables alone: a recipe body is full of values that are not
    // tokens — `cursor: pointer`, `borderColor: currentColor`, `zIndex: 1`, `width: 100%` — and a
    // walker that read every one of them as a reference would warn about ~130 names on a
    // stylesheet that is completely correct, which is worse than no check.
    expect(warningsFor(chakraSkin)).toEqual([]);
  });
});
