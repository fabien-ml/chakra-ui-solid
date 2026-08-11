import { readFileSync } from "node:fs";
import type { Config } from "@pandacss/dev";
import { describe, expect, it, vi } from "vitest";
import { type ChakraConfigOverrides, defineChakraConfig } from "../config";
import { chakraSolidPreset } from "../preset";
import { variantKeysFor } from "../recipe-registry";

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

  it("leaves Panda's other name-shaping knob unset on both sides", () => {
    // `prefix` is the one locked key whose agreed value is *absent*. Ours writes the key holding
    // `undefined`, which is what overwrites a value arriving from an untyped config; the other side
    // must not mention it at all.
    expect(defineChakraConfig(MINIMAL).prefix).toBeUndefined();
    expect(ourConfigSource).not.toMatch(/^\s*prefix:/m);
  });

  it("points the extractor at our published package, on both sides", () => {
    // `importMap` says where the styled-system API lives. Both configs set it, and both set the
    // same value: the default is `<outdir>/…`, which our own `css()` imports match only by
    // accident and which the factory does not match at all.
    expect(defineChakraConfig(MINIMAL).importMap).toEqual([
      "@chakra-ui-solid/styled-system",
      { jsx: ["@chakra-ui-solid/system", "chakra-ui-solid"] },
    ]);
    expect(ourConfigSource).toMatch(/^\s*importMap: \[\s*"@chakra-ui-solid\/styled-system",/m);
  });

  it("names every module the `chakra` factory can be imported from", () => {
    // The other half of `jsxFactory`, and the half with no symptom: Panda registers the factory
    // only from an import whose name is `chakra` AND whose module is listed here. Miss a package
    // and a consumer who imported from it gets zero rules and no error — so the list is asserted
    // against the packages that actually export `chakra`, not against itself.
    const [, jsxEntry] = defineChakraConfig(MINIMAL).importMap as [string, { jsx: string[] }];
    expect(jsxEntry.jsx).toEqual(["@chakra-ui-solid/system", "chakra-ui-solid"]);
    expect(ourConfigSource).toMatch(/jsx: \["@chakra-ui-solid\/system", "chakra-ui-solid"\]/);
  });

  it("is a type error to pass one, which is the whole point of the wrapper", () => {
    defineChakraConfig({
      ...MINIMAL,
      // @ts-expect-error — locked: our runtime emits `p_4`, a hashed sheet has no such rule
      hash: true,
    });
    defineChakraConfig({
      ...MINIMAL,
      // @ts-expect-error — locked: `className` renames the rules, `cssVar` renames the variables
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
    expect(config.prefix).toBeUndefined();
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
    expect(config.staticCss?.recipes).toEqual({ input: ["*"] });
    expect(config.staticCss).not.toHaveProperty("extend");
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

    expect(config.staticCss?.recipes).toEqual({
      // Both writers reached `button`, so both rules are there rather than one replacing the other.
      button: [{ size: ["*"], responsive: true }, { variant: ["*"] }],
      input: ["*"],
    });
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

  it("appends its plugin after a consumer's, so it corrects last", () => {
    const theirs = { name: "mine" };
    const plugins = defineChakraConfig({ ...MINIMAL, plugins: [theirs] }).plugins ?? [];

    expect(plugins).toHaveLength(2);
    expect(plugins[0]).toBe(theirs);
    expect(plugins[1]?.name).toBe("chakra-ui-solid:locked-keys");
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
    expect(corrected.prefix).toBeUndefined();
    expect(corrected.separator).toBe("_");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("hash, separator, prefix"));

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

describe("defineChakraConfig — the responsive opt-in", () => {
  it("declares no `staticCss.recipes` at all by default", () => {
    // Off by default because the sheet already carries 488 recipe-variant values, and turning it on
    // for everything multiplies that by the six conditions. The `css` block beside it is the
    // preset's own and is always carried; only `recipes` answers to this opt-in.
    expect(defineChakraConfig(MINIMAL).staticCss).not.toHaveProperty("recipes");
    expect(defineChakraConfig({ ...MINIMAL, responsive: undefined }).staticCss).not.toHaveProperty(
      "recipes",
    );
  });

  it("expands the finest grain to the shape Panda already understands", () => {
    // `{ button: ["size"] }` is ours; `[{ size: ["*"], responsive: true }]` is Panda's. The opt-in
    // asks nothing new of Panda — it only spares the consumer from writing that out.
    expect(
      defineChakraConfig({ ...MINIMAL, responsive: { button: ["size"] } }).staticCss?.recipes,
    ).toEqual({ button: [{ size: ["*"], responsive: true }] });
  });

  it("expands a recipe list to every variant key on those recipes, and no others", () => {
    const staticCss = defineChakraConfig({ ...MINIMAL, responsive: ["button"] }).staticCss as {
      recipes: Record<string, unknown>;
    };

    expect(Object.keys(staticCss.recipes)).toEqual(["button"]);
    expect(staticCss.recipes.button).toEqual([{ size: ["*"], variant: ["*"], responsive: true }]);
  });

  it("expands `true` to all 75 recipes, `swittch` included", () => {
    const staticCss = defineChakraConfig({ ...MINIMAL, responsive: true }).staticCss as {
      recipes: Record<string, Array<Record<string, unknown>>>;
    };

    expect(Object.keys(staticCss.recipes)).toHaveLength(75);
    expect(staticCss.recipes.swittch).toBeDefined();

    const notResponsive = Object.entries(staticCss.recipes).filter(
      ([, rules]) => rules[0]?.responsive !== true,
    );
    expect(notResponsive).toEqual([]);
  });

  it("emits a well-formed entry for a recipe that has no variants", () => {
    // Nine of the 75 have none, so `true` produces `[{ responsive: true }]` for them — an entry with
    // nothing to expand rather than a malformed one. What Panda *emits* for it is
    // `check:responsive-grain`'s question at step 4; this is only that the expansion stays valid.
    const withoutVariants = variantKeysFor().find((entry) => entry.keys.length === 0);
    if (withoutVariants === undefined) {
      throw new Error("expected at least one recipe with no variant keys");
    }

    const staticCss = defineChakraConfig({ ...MINIMAL, responsive: true }).staticCss as {
      recipes: Record<string, unknown>;
    };
    expect(staticCss.recipes[withoutVariants.recipe]).toEqual([{ responsive: true }]);
  });

  it("passes an unknown recipe name through rather than inventing one", () => {
    // The finest grain is a plain record, so a typo reaches Panda as-is and Panda is the one that
    // complains. Silently dropping it here would leave a consumer's opt-in doing nothing.
    expect(
      defineChakraConfig({ ...MINIMAL, responsive: { nosuchrecipe: ["size"] } }).staticCss?.recipes,
    ).toEqual({ nosuchrecipe: [{ size: ["*"], responsive: true }] });
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
