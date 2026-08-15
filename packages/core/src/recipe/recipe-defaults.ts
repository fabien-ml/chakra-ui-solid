/**
 * Panda's marker for "emit the recipe's base class here", which sits alongside the real variants in
 * an atomic recipe's `getVariantProps()` under the recipe's own name. Slot recipes have no such key.
 */
const BASE_CLASS_SENTINEL = "__ignore__";

/**
 * The two properties every recipe Panda generates carries — atomic (`button`) and slot (`dialog`)
 * alike. Declared structurally rather than imported: each generated recipe has its own named
 * interface and there is no shared base to import.
 */
interface GeneratedRecipe {
  __name__: string;
  getVariantProps(variants?: Record<string, unknown>): Record<string, unknown>;
}

/**
 * Recipe name → the variant values that recipe defaults to in the **consumer's** config.
 *
 * Module-global, and replaced wholesale by each {@link registerRecipeDefaults} call rather than
 * merged into. One app per process is the assumption, and SSR does not weaken it: registration
 * takes a static namespace at the app root, so every request records the same table and there is no
 * per-request state here to leak across them. Two apps with different Panda configs in one process
 * would need this scoped to a context, and nothing in Chakra's API asks for that.
 */
let registeredDefaults: Record<string, Record<string, unknown>> = {};

function isGeneratedRecipe(value: unknown): value is GeneratedRecipe {
  if (value === null || (typeof value !== "function" && typeof value !== "object")) {
    return false;
  }
  const candidate = value as Partial<GeneratedRecipe>;
  return typeof candidate.__name__ === "string" && typeof candidate.getVariantProps === "function";
}

/**
 * Teach the library the `defaultVariants` in **your** Panda config.
 *
 * ```ts
 * // app root, once, before anything renders
 * import { registerRecipeDefaults } from "@chakra-ui-solid/core";
 * import * as recipes from "./styled-system/recipes";
 *
 * registerRecipeDefaults(recipes);
 * ```
 *
 * It exists because our recipe runtime is **precompiled**: the `button` function these components
 * call has Chakra's `{ size: "md", variant: "solid" }` baked into it at *our* build time, and it
 * cannot see your config. Without this call a `defaultVariants: { size: "sm" }` of yours — in
 * `theme.extend.recipes.button` or in a preset of your own — is silently inert. Every `<Button>`
 * still resolves `button--size_md`, which is a class your stylesheet may not even contain.
 *
 * Pass the whole namespace; anything in it that is not a generated recipe is ignored. A prop passed
 * to a component still wins over what you register, and any variant your config leaves alone keeps
 * Chakra's own default.
 *
 * Call it **once**, at the app root: the last call replaces everything the previous one recorded.
 */
export function registerRecipeDefaults(recipes: Record<string, unknown>): void {
  const collected: Record<string, Record<string, unknown>> = {};

  for (const candidate of Object.values(recipes)) {
    if (!isGeneratedRecipe(candidate)) {
      continue;
    }

    const variants: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(candidate.getVariantProps({}))) {
      // The sentinel is not a variant, and leaving it in would make the recorded table read as
      // though `button` were one.
      if (key === candidate.__name__ && value === BASE_CLASS_SENTINEL) {
        continue;
      }
      variants[key] = value;
    }

    collected[candidate.__name__] = variants;
  }

  registeredDefaults = collected;
}

/**
 * `variantProps`, with a registered default filling every key the caller left unset.
 *
 * Resolved **by value**, never `{ ...defaults, ...variantProps }`: a component builds its variant
 * bag by reading each key off its props — `() => ({ size: merged.size, variant: merged.variant })`
 * — so an unset `size` arrives as a *present* `undefined`, and a spread is a presence merge that
 * would let it delete the registered default (`CLAUDE.md`, *The third hazard*).
 *
 * Keys the caller does not mention survive from the registered table, which is how a variant our
 * components never pass still reaches the recipe. Anything still `undefined` afterwards is dropped
 * by Panda's own `compact`, leaving our compiled default to fill it.
 *
 * An undefined `name` passes the props straight through. Panda's generator names every recipe, so
 * that only tolerates a hand-written stub standing in for one in a test.
 */
export function applyRegisteredDefaults<Variants>(
  name: string | undefined,
  variantProps: Variants,
): Variants {
  const defaults = name === undefined ? undefined : registeredDefaults[name];
  if (defaults === undefined) {
    return variantProps;
  }

  const resolved: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries((variantProps ?? {}) as Record<string, unknown>)) {
    resolved[key] = value ?? defaults[key];
  }
  return resolved as Variants;
}
