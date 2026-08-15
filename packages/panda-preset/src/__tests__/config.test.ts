import { readFileSync } from "node:fs";
import type { Config } from "@pandacss/dev";
import { describe, expect, it, vi } from "vitest";
import { type ChakraConfigOverrides, defineChakraConfig } from "../config";
import { variantKeysFor } from "../contract";
import { chakraSolidPreset } from "../preset";

/**
 * `defineChakraConfig()` exists for one failure mode with no other guard. In Panda's external-package
 * model the consumer does **not** regenerate the runtime — `css()` comes from our published
 * `@chakra-ui-solid/styled-system` and their Panda run produces only a stylesheet — so the knobs
 * that decide class *names* have to agree across that boundary. Ours emits `p_4`; a consumer whose
 * config hashes gets a sheet full of hashed rules, and every class we compute is absent from it.
 * Nothing errors and every component renders naked.
 *
 * So each knob is asserted **twice**: once against what `defineChakraConfig()` returns, and once
 * against what `packages/styled-system/panda.config.ts` sets. The second half reads that file as
 * *text* rather than importing it, because it imports `@chakra-ui-solid/panda-preset` through the
 * package's `exports` map — pulling it into this package's own program would be a cycle through our
 * `dist/` (D-120). A reformat of that file is a loud failure here; a changed value is the one this
 * catches.
 */

/** The one key the function requires, and the shortest value that satisfies it. */
const MINIMAL = { include: [] } satisfies ChakraConfigOverrides;

/**
 * Where a `staticCss` rule for one of our recipes ends up — its **body**, not the config's
 * `staticCss.recipes`.
 *
 * Panda's `StaticCss.process()` assigns `staticCss.recipes[name] = recipe.staticCss` for every
 * recipe whose body declares one, and our preset declares one on all 75. A config-level rule for any
 * of them is discarded before it is read, so this is the only reachable address.
 */
const bodyStaticCss = (config: Config, recipe: string): unknown => {
  const extend = config.theme?.extend;
  const body = (extend?.recipes?.[recipe] ?? extend?.slotRecipes?.[recipe]) as
    | { staticCss?: unknown }
    | undefined;
  return body?.staticCss;
};

/** Every knob that shapes a class name, and the value both sides must carry. */
const SHARED_KNOBS = {
  hash: false,
  // Panda's own default on both sides, so leaving it inherited made them agree by coincidence and
  // gave a consumer who wrote `separator: "="` nothing to push back. Written out in both configs
  // now, and asserted here, so the agreement is a decision.
  separator: "_",
  eject: true,
  jsxFramework: "solid",
  // Not a name-shaping knob but a name-*existence* one, and it fails the same way: `chakra.button`
  // is lowercase, so without this Panda's `isUpperCase` fallback declines the tag and emits no rule
  // at all for it. Both configs carry it or one of the two sheets is missing every factory rule.
  jsxFactory: "chakra",
  preflight: true,
} as const;

const ourConfigSource = readFileSync(
  new URL("../../../styled-system/panda.config.ts", import.meta.url),
  "utf8",
);

describe("defineChakraConfig — the knobs that must match ours", () => {
  it("returns the agreed value for each one", () => {
    expect(defineChakraConfig(MINIMAL)).toMatchObject(SHARED_KNOBS);
  });

  it("agrees with `packages/styled-system/panda.config.ts` on each one", () => {
    for (const [knob, value] of Object.entries(SHARED_KNOBS)) {
      expect(
        ourConfigSource,
        `packages/styled-system/panda.config.ts must set ${knob}: ${value}`,
      ).toMatch(new RegExp(`^\\s*${knob}: ${JSON.stringify(value)},`, "m"));
    }
  });

  it("namespaces every token variable, and only the variables", () => {
    // `prefix` is the one locked key whose value is an object, so it is asserted here rather than
    // in `SHARED_KNOBS` above — that loop matches source text through `JSON.stringify`, which
    // spells an object nothing in a `.ts` file looks like.
    //
    // `cssVar` alone is the whole point. Panda's string spelling — `prefix: "chakra"` — would
    // prefix class names too, and our published runtime computes `p_4`.
    expect(defineChakraConfig(MINIMAL).prefix).toEqual({ cssVar: "chakra" });
    expect(ourConfigSource).toMatch(/^\s*prefix: \{ cssVar: "chakra" \},/m);
  });

  it("points the extractor at our published package, on both sides", () => {
    // `importMap` says where the styled-system API lives. Both configs set it, and both set the
    // same value: the default is `<outdir>/…`, which our own `css()` imports match only by
    // accident and which the factory does not match at all.
    expect(defineChakraConfig(MINIMAL).importMap).toEqual([
      "@chakra-ui-solid/styled-system",
      { jsx: ["@chakra-ui-solid/core", "chakra-ui-solid"] },
    ]);
    expect(ourConfigSource).toMatch(/^\s*importMap: \[\s*"@chakra-ui-solid\/styled-system",/m);
  });

  it("names every module the `chakra` factory can be imported from", () => {
    // The other half of `jsxFactory`, and the half with no symptom: Panda registers the factory
    // only from an import whose name is `chakra` AND whose module is listed here. Miss a package
    // and a consumer who imported from it gets zero rules and no error — so the list is asserted
    // against the packages that actually export `chakra`, not against itself.
    const [, jsxEntry] = defineChakraConfig(MINIMAL).importMap as [string, { jsx: string[] }];
    expect(jsxEntry.jsx).toEqual(["@chakra-ui-solid/core", "chakra-ui-solid"]);
    expect(ourConfigSource).toMatch(/jsx: \["@chakra-ui-solid\/core", "chakra-ui-solid"\]/);
  });

  it("is a type error to pass one, which is the whole point of the wrapper", () => {
    defineChakraConfig({
      ...MINIMAL,
      // @ts-expect-error — locked: our runtime emits `p_4`, a hashed sheet has no such rule
      hash: true,
    });
    defineChakraConfig({
      ...MINIMAL,
      // @ts-expect-error — locked: `cssVar` is `chakra`, and this spelling renames the rules too
      prefix: "ck",
    });
    defineChakraConfig({
      ...MINIMAL,
      // @ts-expect-error — locked: the sheet would carry `p=4`
      separator: "=",
    });
    defineChakraConfig({
      ...MINIMAL,
      // @ts-expect-error — locked: unregisters the `chakra` factory
      importMap: ["somewhere-else"],
    });
  });

  it("strips one that arrived from an untyped `panda.config.js`", () => {
    // The types cover a `.ts` config. A `.js` one has none, so the spread order inside the function
    // is what stops the key: their bag first, `LOCKED` after it.
    const config = defineChakraConfig({
      ...MINIMAL,
      hash: true,
      prefix: "ck",
    } as unknown as ChakraConfigOverrides);

    expect(config.hash).toBe(false);
    expect(config.prefix).toEqual({ cssVar: "chakra" });
  });
});

describe("defineChakraConfig — the keys it merges rather than replaces", () => {
  it("lists our preset first, so a consumer's own is later and wins", () => {
    const theirs = { name: "mine" };
    const presets = defineChakraConfig({ ...MINIMAL, presets: [theirs] }).presets ?? [];

    expect(presets).toHaveLength(2);
    expect((presets[0] as { name?: string }).name).toBe("@chakra-ui-solid/panda-preset");
    expect(presets[1]).toBe(theirs);
  });

  it("lists exactly ours when a consumer passes none", () => {
    const presets = defineChakraConfig(MINIMAL).presets ?? [];
    expect(presets).toHaveLength(1);
    expect((presets[0] as { name?: string }).name).toBe("@chakra-ui-solid/panda-preset");
  });

  it("carries the preset's own `staticCss.css` even when the consumer declares none", () => {
    // Measured against `mergeConfigs`, and the reason this key cannot be a passthrough: a config's
    // `staticCss.css` **replaces** a preset's whole array — and `staticCss: { extend: { css } }`
    // does exactly the same, so the `extend` escape that rescues `theme` does not rescue this one.
    // Carrying the preset's entries into the config is what makes the union survive.
    expect(defineChakraConfig(MINIMAL).staticCss?.css).toEqual(chakraSolidPreset.staticCss?.css);
  });

  it("concatenates a consumer's `css` entries onto the preset's rather than losing either", () => {
    // The seven the preset declares are what `<Flex inline>`, `<Wrap>` and every `StackSeparator`
    // resolve through: the prop flips a value at runtime, Panda's usage scan cannot see it, and the
    // pre-generated rule is the only thing that makes the prop do anything.
    const theirs = [{ properties: { color: ["red.500"] } }];
    const css = defineChakraConfig({ ...MINIMAL, staticCss: { css: theirs } }).staticCss?.css ?? [];

    const ours = chakraSolidPreset.staticCss?.css ?? [];
    expect(css).toHaveLength(ours.length + 1);
    expect(css.slice(0, ours.length)).toEqual(ours);
    expect(css.at(-1)).toEqual(theirs[0]);
  });

  it("folds `staticCss.extend` in rather than passing it through", () => {
    // The spelling Panda's Extend page tells you to use — it lists `staticCss` among the parts
    // `extend` extends. It does not extend this one: measured on one merge against `conditions`,
    // `globalCss` and `utilities` from that same list, those three keep both sides and `staticCss`
    // keeps only the consumer's, because they are keyed by name and `staticCss.css` is an array.
    // Passed through untouched it would undo the union and take the preset's seven entries with it.
    const theirs = [{ properties: { color: ["red.500"] } }];
    const config = defineChakraConfig({
      ...MINIMAL,
      staticCss: { extend: { css: theirs, recipes: { input: ["*"] } } },
    });

    const ours = chakraSolidPreset.staticCss?.css ?? [];
    expect(config.staticCss?.css).toEqual([...ours, ...theirs]);
    expect(config.staticCss).not.toHaveProperty("extend");
    // `recipes` written under `extend` is placed in the recipe body like any other, rather than
    // being carried here where Panda would overwrite it.
    expect(bodyStaticCss(config, "input")).toEqual(["*"]);
    expect(config.staticCss).not.toHaveProperty("recipes");
  });

  it("keeps both spellings when a consumer somehow uses each", () => {
    const bare = [{ properties: { color: ["red.500"] } }];
    const extended = [{ properties: { margin: ["4"] } }];
    const config = defineChakraConfig({
      ...MINIMAL,
      staticCss: { css: bare, extend: { css: extended } },
    });

    const ours = chakraSolidPreset.staticCss?.css ?? [];
    expect(config.staticCss?.css).toEqual([...ours, ...extended, ...bare]);
  });

  it("merges a consumer's `staticCss.recipes` with the ones `responsive` wrote", () => {
    const config = defineChakraConfig({
      ...MINIMAL,
      responsive: { button: ["size"] },
      staticCss: { recipes: { input: ["*"], button: [{ variant: ["*"] }] } },
    });

    // Both writers reached `button`, so both rules are there rather than one replacing the other —
    // and a consumer's own rules are re-placed into the body too, because a config-level one would
    // be just as dead for them as for ours.
    expect(bodyStaticCss(config, "button")).toEqual([
      "*",
      { size: ["*"], responsive: true },
      { variant: ["*"] },
    ]);
    expect(bodyStaticCss(config, "input")).toEqual(["*"]);
    expect(config.staticCss).not.toHaveProperty("recipes");
  });

  it("is a type error to write `theme` without `extend`", () => {
    defineChakraConfig({
      ...MINIMAL,
      // @ts-expect-error — a bare `theme` drops the preset's whole token table and all 19 recipes
      theme: { tokens: { colors: { brand: { value: "#5b8" } } } },
    });
  });

  it("passes `theme.extend` straight through", () => {
    const extend = { tokens: { colors: { brand: { value: "#5b8" } } } };
    expect(defineChakraConfig({ ...MINIMAL, theme: { extend } }).theme).toEqual({ extend });
  });

  it("appends its plugins after a consumer's, so the locked keys are corrected last", () => {
    const theirs = { name: "mine" };
    const plugins = defineChakraConfig({ ...MINIMAL, plugins: [theirs] }).plugins ?? [];

    expect(plugins.map((plugin) => plugin.name)).toEqual([
      "mine",
      "chakra-ui-solid:recipe-gate",
      "chakra-ui-solid:preset-contract",
      "chakra-ui-solid:locked-keys",
    ]);
    expect(plugins[0]).toBe(theirs);
  });
});

describe("defineChakraConfig — the plugin that catches what the types cannot", () => {
  /**
   * The likeliest miss is not an exotic one: a consumer who spreads what this function returned and
   * overrides a key afterwards, which no type can forbid. Panda's `config:resolved` hook sees the
   * fully merged config and its return value replaces it, so this is where that is undone.
   */
  const resolveConfig = (config: Config) => {
    const plugin = (defineChakraConfig(MINIMAL).plugins ?? []).at(-1);
    return plugin?.hooks?.["config:resolved"]?.({
      config: config as never,
      path: "panda.config.ts",
      dependencies: [],
      utils: {} as never,
    });
  };

  it("restores every locked key, and says which ones it restored", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const corrected = resolveConfig({
      ...defineChakraConfig(MINIMAL),
      hash: true,
      prefix: "ck",
      separator: "=",
    }) as Config;

    expect(corrected.hash).toBe(false);
    expect(corrected.prefix).toEqual({ cssVar: "chakra" });
    expect(corrected.separator).toBe("_");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("hash, prefix, separator"));

    warn.mockRestore();
  });

  it("keeps everything the consumer is entitled to set", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const corrected = resolveConfig({
      ...defineChakraConfig({ ...MINIMAL, outdir: "styled-system-app", preflight: false }),
      hash: true,
    }) as Config;

    expect(corrected.outdir).toBe("styled-system-app");
    expect(corrected.preflight).toBe(false);

    warn.mockRestore();
  });

  it("returns nothing and warns about nothing on an untouched config", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(resolveConfig(defineChakraConfig(MINIMAL))).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });
});

describe("defineChakraConfig — where a recipe rule is placed", () => {
  it("writes into the recipe's own body, never the config's `staticCss.recipes`", () => {
    // The bug this placement exists for, and the only assertion in the file that would have caught
    // it: Panda's `StaticCss.process()` runs `staticCss.recipes[name] = recipe.staticCss` for every
    // recipe whose body declares one, and `preset.ts` declares one on all 75. A config-level rule
    // for `button` is overwritten before Panda reads it, so the opt-in generated nothing at all.
    const config = defineChakraConfig({ ...MINIMAL, responsive: { button: ["size"] } });

    expect(config.staticCss).not.toHaveProperty("recipes");
    expect(bodyStaticCss(config, "button")).toEqual(["*", { size: ["*"], responsive: true }]);
  });

  it("keeps the star rule at the head, because the body's array is replaced not merged", () => {
    // Without it the opt-in would trade one silent unstyling for a larger one: `button` would lose
    // all 488 base variant values to gain its responsive ones.
    const config = defineChakraConfig({ ...MINIMAL, responsive: { button: ["size"] } });
    expect((bodyStaticCss(config, "button") as unknown[])[0]).toBe("*");
  });

  it("puts a slot recipe in `slotRecipes`, where its body lives", () => {
    const config = defineChakraConfig({ ...MINIMAL, responsive: { dialog: ["size"] } });

    expect(config.theme?.extend?.slotRecipes?.dialog).toBeDefined();
    expect(config.theme?.extend?.recipes?.dialog).toBeUndefined();
  });

  it("keeps a consumer's own extension of the same recipe", () => {
    const config = defineChakraConfig({
      ...MINIMAL,
      responsive: { button: ["size"] },
      theme: { extend: { recipes: { button: { base: { gap: "2" } } } } },
    });

    expect(config.theme?.extend?.recipes?.button).toEqual({
      base: { gap: "2" },
      staticCss: ["*", { size: ["*"], responsive: true }],
    });
  });

  it("leaves an unknown name in `staticCss.recipes` rather than declaring a recipe for it", () => {
    // Writing it into `theme.extend.recipes` would register a recipe with no body. Here it reaches
    // Panda, which skips it for want of a recipe node — the same nothing as before, in the place a
    // consumer debugging their config will look.
    const config = defineChakraConfig({ ...MINIMAL, responsive: { nosuchrecipe: ["size"] } });

    expect(config.staticCss?.recipes).toEqual({
      nosuchrecipe: [{ size: ["*"], responsive: true }],
    });
    expect(config.theme?.extend?.recipes?.nosuchrecipe).toBeUndefined();
  });
});

describe("defineChakraConfig — the responsive opt-in", () => {
  it("touches no recipe body by default", () => {
    // Off by default because the sheet already carries 488 recipe-variant values, and turning it on
    // for everything multiplies that by the six conditions.
    expect(defineChakraConfig(MINIMAL).theme).toBeUndefined();
    expect(defineChakraConfig({ ...MINIMAL, responsive: undefined }).theme).toBeUndefined();
  });

  it("expands the finest grain to the shape Panda already understands", () => {
    // `{ button: ["size"] }` is ours; `{ size: ["*"], responsive: true }` is Panda's. The opt-in
    // asks nothing new of Panda — it only spares the consumer from writing that out.
    expect(
      bodyStaticCss(defineChakraConfig({ ...MINIMAL, responsive: { button: ["size"] } }), "button"),
    ).toEqual(["*", { size: ["*"], responsive: true }]);
  });

  it("expands a recipe list to every variant key on those recipes, and no others", () => {
    const config = defineChakraConfig({ ...MINIMAL, responsive: ["button"] });

    expect(Object.keys(config.theme?.extend?.recipes ?? {})).toEqual(["button"]);
    expect(bodyStaticCss(config, "button")).toEqual([
      "*",
      { size: ["*"], variant: ["*"], responsive: true },
    ]);
  });

  it("expands `true` to all 75 recipes, `swittch` included", () => {
    const config = defineChakraConfig({ ...MINIMAL, responsive: true });
    const extend = config.theme?.extend;
    const bodies = { ...extend?.recipes, ...extend?.slotRecipes };

    expect(Object.keys(bodies)).toHaveLength(75);
    expect(bodies.swittch).toBeDefined();

    const notResponsive = Object.keys(bodies).filter((name) => {
      const [, rule] = bodyStaticCss(config, name) as [string, { responsive?: boolean }];
      return rule?.responsive !== true;
    });
    expect(notResponsive).toEqual([]);
  });

  it("emits a well-formed entry for a recipe that has no variants", () => {
    // Nine of the 75 have none, so `true` produces `[{ responsive: true }]` for them — an entry with
    // nothing to expand rather than a malformed one.
    const withoutVariants = variantKeysFor().find((entry) => entry.keys.length === 0);
    if (withoutVariants === undefined) {
      throw new Error("expected at least one recipe with no variant keys");
    }

    const config = defineChakraConfig({ ...MINIMAL, responsive: true });
    expect(bodyStaticCss(config, withoutVariants.recipe)).toEqual(["*", { responsive: true }]);
  });
});

describe("defineChakraConfig — the conditional opt-in", () => {
  it("touches no recipe body by default", () => {
    expect(defineChakraConfig({ ...MINIMAL, conditional: undefined }).theme).toBeUndefined();
  });

  it("expands the finest grain to the shape Panda already understands", () => {
    // `{ button: { variant: ["selected"] } }` is ours; `conditions` is Panda's. The name is spelled
    // without the underscore the prop uses — `_selected` in JSX, `"selected"` here — and both reach
    // the same rule, since Panda's `formatCondition` re-adds it for a registered condition.
    expect(
      bodyStaticCss(
        defineChakraConfig({ ...MINIMAL, conditional: { button: { variant: ["selected"] } } }),
        "button",
      ),
    ).toEqual(["*", { variant: ["*"], conditions: ["selected"] }]);
  });

  it("expands a condition list to every variant key on that recipe", () => {
    expect(
      bodyStaticCss(
        defineChakraConfig({ ...MINIMAL, conditional: { button: ["selected"] } }),
        "button",
      ),
    ).toEqual([
      "*",
      { size: ["*"], conditions: ["selected"] },
      { variant: ["*"], conditions: ["selected"] },
    ]);
  });

  it("gives each variant key its own rule, so two keys can carry different conditions", () => {
    // The reason this expands per key rather than per recipe, as `responsive` does: a condition set
    // belongs to the key being conditioned, and there is no single-rule spelling for two of them.
    expect(
      bodyStaticCss(
        defineChakraConfig({
          ...MINIMAL,
          conditional: { button: { variant: ["selected", "pressed"], size: ["open"] } },
        }),
        "button",
      ),
    ).toEqual([
      "*",
      { variant: ["*"], conditions: ["selected", "pressed"] },
      { size: ["*"], conditions: ["open"] },
    ]);
  });

  it("emits no rule for a recipe with no variant keys", () => {
    const withoutVariants = variantKeysFor().find((entry) => entry.keys.length === 0);
    if (withoutVariants === undefined) {
      throw new Error("expected at least one recipe with no variant keys");
    }

    const config = defineChakraConfig({
      ...MINIMAL,
      conditional: { [withoutVariants.recipe]: ["selected"] },
    });

    expect(bodyStaticCss(config, withoutVariants.recipe)).toEqual(["*"]);
  });

  it("merges with `responsive` on the same recipe rather than replacing it", () => {
    // The `pagination` case in one config: its page needs `button`'s variants at `_selected`, and
    // `button-with-responsive-size` needs its sizes at every breakpoint. Both writers reach the same
    // recipe, and Panda reads the entries as a list of rules.
    expect(
      bodyStaticCss(
        defineChakraConfig({
          ...MINIMAL,
          responsive: { button: ["size"] },
          conditional: { button: { variant: ["selected"] } },
        }),
        "button",
      ),
    ).toEqual([
      "*",
      { size: ["*"], responsive: true },
      { variant: ["*"], conditions: ["selected"] },
    ]);
  });
});

describe("defineChakraConfig — the keys that stay the consumer's", () => {
  it("leaves `outdir` unset, and takes `include` from them", () => {
    // `include` is required rather than defaulted: Panda's own default misses our `dist/` glob,
    // which is the only channel carrying values our components name and their source never writes.
    const config = defineChakraConfig({ include: ["./src/**/*.tsx"], outdir: "styled-system-app" });

    expect(config.include).toEqual(["./src/**/*.tsx"]);
    expect(config.outdir).toBe("styled-system-app");
    expect(defineChakraConfig(MINIMAL).outdir).toBeUndefined();
  });

  it("is a type error to omit `include`", () => {
    // @ts-expect-error — the one required key
    defineChakraConfig({ outdir: "styled-system-app" });
  });

  it("defaults `preflight` on, and lets them turn it off or scope it", () => {
    expect(defineChakraConfig(MINIMAL).preflight).toBe(true);
    expect(defineChakraConfig({ ...MINIMAL, preflight: false }).preflight).toBe(false);
    expect(
      defineChakraConfig({ ...MINIMAL, preflight: { scope: ".chakra-reset" } }).preflight,
    ).toEqual({ scope: ".chakra-reset" });
  });

  it("passes the rest through untouched", () => {
    const config = defineChakraConfig({
      ...MINIMAL,
      cssVarRoot: ":where(:root, :host)",
      globalCss: { "html, body": { margin: 0 } },
      conditions: { cqSm: "@container(min-width: 320px)" },
    });

    expect(config.cssVarRoot).toBe(":where(:root, :host)");
    expect(config.globalCss).toEqual({ "html, body": { margin: 0 } });
    expect(config.conditions).toEqual({ cqSm: "@container(min-width: 320px)" });
  });
});
