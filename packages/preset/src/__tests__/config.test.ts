import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chakraConfig } from "../config";
import { variantKeysFor } from "../recipe-registry";

/**
 * `chakraConfig()` exists for one failure mode with no other guard. In Panda's external-package
 * model the consumer does **not** regenerate the runtime — `css()` comes from our published
 * `@chakra-ui-solid/styled-system` and their Panda run produces only a stylesheet — so the knobs
 * that decide class *names* have to agree across that boundary. Ours emits `p_4`; a consumer whose
 * config hashes gets a sheet full of hashed rules, and every class we compute is absent from it.
 * Nothing errors and every component renders naked.
 *
 * So each knob is asserted **twice**: once against what `chakraConfig()` returns, and once against
 * what `packages/styled-system/panda.config.ts` sets. The second half reads that file as *text*
 * rather than importing it, because it imports `@chakra-ui-solid/preset` through the package's
 * `exports` map — pulling it into this package's own program would be a cycle through our `dist/`
 * (D-120). A reformat of that file is a loud failure here; a changed value is the one this catches.
 */

/** Every knob that shapes a class name, and the value both sides must carry. */
const SHARED_KNOBS = {
  hash: false,
  eject: true,
  jsxFramework: "solid",
  preflight: true,
} as const;

const ourConfigSource = readFileSync(
  new URL("../../../styled-system/panda.config.ts", import.meta.url),
  "utf8",
);

describe("chakraConfig — the knobs that must match ours", () => {
  it("returns the agreed value for each one", () => {
    expect(chakraConfig()).toMatchObject(SHARED_KNOBS);
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
    // `prefix` is the only other thing that changes an emitted class name. Neither config sets it,
    // and this is what says so rather than leaving it to be noticed after a consumer's page renders
    // naked.
    expect(chakraConfig().prefix).toBeUndefined();
    expect(ourConfigSource).not.toMatch(/^\s*prefix:/m);
  });

  it("points the consumer's extractor at our published package", () => {
    // `importMap` is the consumer's knob and ours deliberately leaves it unset: theirs must say the
    // styled-system API lives in our package rather than in a directory they generated.
    expect(chakraConfig().importMap).toBe("@chakra-ui-solid/styled-system");
    expect(ourConfigSource).not.toMatch(/^\s*importMap:/m);
  });

  it("lists exactly one preset, so the same one-liner is correct on both sides", () => {
    const presets = chakraConfig().presets ?? [];
    expect(presets).toHaveLength(1);
    expect((presets[0] as { name?: string }).name).toBe("@chakra-ui-solid/preset");
  });

  it("leaves `include` and `outdir` to the consumer", () => {
    // Spreading a config is shallow, so these two are the keys a consumer is *meant* to re-declare.
    // Shipping a value for them would make the override look optional.
    const consumer = chakraConfig();
    expect(consumer.include).toBeUndefined();
    expect(consumer.outdir).toBeUndefined();
  });
});

describe("chakraConfig — the responsive opt-in", () => {
  it("declares no `staticCss` at all by default", () => {
    // Off by default because the sheet already carries 488 recipe-variant values, and turning it on
    // for everything multiplies that by the six conditions.
    expect(chakraConfig()).not.toHaveProperty("staticCss");
    expect(chakraConfig({ responsive: undefined })).not.toHaveProperty("staticCss");
  });

  it("expands the finest grain to the shape Panda already understands", () => {
    // `{ button: ["size"] }` is ours; `[{ size: ["*"], responsive: true }]` is Panda's. The opt-in
    // asks nothing new of Panda — it only spares the consumer from writing that out.
    expect(chakraConfig({ responsive: { button: ["size"] } }).staticCss).toEqual({
      recipes: { button: [{ size: ["*"], responsive: true }] },
    });
  });

  it("expands a recipe list to every variant key on those recipes, and no others", () => {
    const staticCss = chakraConfig({ responsive: ["button"] }).staticCss as {
      recipes: Record<string, unknown>;
    };

    expect(Object.keys(staticCss.recipes)).toEqual(["button"]);
    expect(staticCss.recipes.button).toEqual([{ size: ["*"], variant: ["*"], responsive: true }]);
  });

  it("expands `true` to all 74 recipes, `swittch` included", () => {
    const staticCss = chakraConfig({ responsive: true }).staticCss as {
      recipes: Record<string, Array<Record<string, unknown>>>;
    };

    expect(Object.keys(staticCss.recipes)).toHaveLength(74);
    expect(staticCss.recipes.swittch).toBeDefined();

    const notResponsive = Object.entries(staticCss.recipes).filter(
      ([, rules]) => rules[0]?.responsive !== true,
    );
    expect(notResponsive).toEqual([]);
  });

  it("emits a well-formed entry for a recipe that has no variants", () => {
    // Nine of the 74 have none, so `true` produces `[{ responsive: true }]` for them — an entry with
    // nothing to expand rather than a malformed one. What Panda *emits* for it is
    // `check:responsive-grain`'s question at step 4; this is only that the expansion stays valid.
    const withoutVariants = variantKeysFor().find((entry) => entry.keys.length === 0);
    if (withoutVariants === undefined) {
      throw new Error("expected at least one recipe with no variant keys");
    }

    const staticCss = chakraConfig({ responsive: true }).staticCss as {
      recipes: Record<string, unknown>;
    };
    expect(staticCss.recipes[withoutVariants.recipe]).toEqual([{ responsive: true }]);
  });

  it("passes an unknown recipe name through rather than inventing one", () => {
    // The finest grain is a plain record, so a typo reaches Panda as-is and Panda is the one that
    // complains. Silently dropping it here would leave a consumer's opt-in doing nothing.
    expect(chakraConfig({ responsive: { nosuchrecipe: ["size"] } }).staticCss).toEqual({
      recipes: { nosuchrecipe: [{ size: ["*"], responsive: true }] },
    });
  });
});
