/**
 * What a Panda preset for this library has to contain: which recipes exist, what each one is called
 * in a class name, its slots, its variant keys and the values under them, and the defaults it
 * resolves. Not a single style value — a preset supplies all of those.
 *
 * **Authored data, deliberately, rather than read off whichever preset is loaded.** The names here
 * are consumed at *config* time and compiled into the published `styled-system/`, so they are fixed
 * before any theme exists and stay fixed after one is swapped: `defineChakraConfig({ responsive })`
 * expands its grains from them, `staticCss` declares its rows from them, and the docs site's props
 * tables print their Default column from them. Reading them off the loaded bodies — which is what
 * this directory replaced — meant a consumer's preset silently changed all three, and the
 * components went on emitting the classes they were compiled with.
 *
 * The cost of authoring is drift, and `__tests__/contract.test.ts` is what pays it: it asserts
 * these rows against the vendored Chakra bodies under `chakra/`, so a body whose shape moves turns
 * the unit suite red and forces a deliberate edit here. That edit is also the diff telling a
 * reviewer that every third-party preset just broke.
 *
 * **The layout mirrors `chakra/`, one recipe per file.** `recipes/` and `slot-recipes/` are the two
 * seams the rest of the system already has — two vendored directories, and two separate Panda keys,
 * `theme.recipes` and `theme.slotRecipes` — and inside each, a row lives in the file named after
 * the vendored body it pins. `recipes/badge.ts` pins `chakra/recipes/badge.ts`, so a Chakra bump
 * maps a changed body straight to the row that has to move with it, which a 900-line table did not.
 * This file is the seam's other side: it holds the shape they satisfy, the merged table, and the
 * lookups, so `./contract` stays the one import path.
 */

import { recipeContract } from "./recipes";
import { slotRecipeContract } from "./slot-recipes";

export { recipeContract, slotRecipeContract };

/**
 * One recipe's shape — everything about it that is *not* a style value.
 *
 * A preset supplies the bodies; this is the outline they have to fill. Nothing here says what a
 * `solid` Button looks like, only that `button` exists, wears the class `button`, has a `size` and
 * a `variant`, and resolves `md` / `solid` when a consumer names neither.
 */
export interface RecipeShape {
  /**
   * The string Panda puts in front of every class it emits for this recipe — `button--size_md`,
   * `.action-bar__content`. It is the kebab-cased key for all but three: `skipNavLink` →
   * `skip-nav` and `colorPicker`, which is simply not kebabbed, are both upstream's; `switchRecipe`
   * → `switch` is ours, because Panda emits the key as a JS identifier and `switch` is reserved.
   *
   * **Getting it wrong is the quietest failure in the package.** Our runtime computes the class
   * from this string, so a preset that spells it differently emits CSS nobody wears — every rule
   * present in the stylesheet, every element unstyled, no error on either side.
   */
  readonly className: string;

  /** The parts a slot recipe styles, in upstream's order. Empty for an atomic recipe. */
  readonly slots: readonly string[];

  /** Variant key → the values declared under it. `{ size: ["sm", "md"], variant: ["solid"] }`. */
  readonly variants: Readonly<Record<string, readonly string[]>>;

  /**
   * What the recipe resolves for itself when a consumer passes nothing.
   *
   * A boolean variant defaults to a real `false`, not the string — `alert.inline`,
   * `skeleton.loading` and `timeline.showLastSeparator` are the three, and the values under
   * {@link RecipeShape.variants} for those keys are still the strings `"true"` / `"false"`, because
   * that is how Panda names a boolean variant's classes.
   */
  readonly defaultVariants: Readonly<Record<string, string | boolean>>;
}

/** All 75, atomic and slot alike, for the readers that do not care which table a key came from. */
export const contract = { ...recipeContract, ...slotRecipeContract };

/**
 * Panda's own recipe type is far wider than the four keys above, and the lookups below want one
 * shape rather than a union of 75 literal ones.
 */
const shapeByKey: Record<string, RecipeShape> = contract;

/** @see recipeContract */
export const recipeKeys: string[] = Object.keys(recipeContract);

/** @see slotRecipeContract */
export const slotRecipeKeys: string[] = Object.keys(slotRecipeContract);

/**
 * The component name a recipe styles, derived from the recipe's own `className` rather than its
 * contract key — `action-bar` → `ActionBar`. Going through `className` is what keeps the
 * `switchRecipe` key — spelled that way because Panda emits it as a JS identifier — from producing
 * a `SwitchRecipe` hint for a component that is called `Switch`.
 */
export function componentNameFor(recipeKey: string): string {
  const className = shapeByKey[recipeKey]?.className;
  return (className ?? recipeKey)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Every recipe with its variant key names — `{ recipe: "button", keys: ["size", "variant"] }`.
 *
 * `defineChakraConfig({ responsive })` needs these to expand its two coarser grains: `["button"]`
 * means *every* variant key on Button, and nothing else knows which those are.
 */
export function variantKeysFor(): Array<{ recipe: string; keys: string[] }> {
  return [...recipeKeys, ...slotRecipeKeys].map((recipe) => ({
    recipe,
    keys: Object.keys(shapeByKey[recipe]?.variants ?? {}),
  }));
}

/**
 * The values a recipe resolves for itself when nothing is passed — `{ size: "md", placement: "top",
 * … }`, empty for a recipe that declares none.
 *
 * **The docs site's props tables are the caller.** A recipe variant's default belongs to the
 * recipe's `defaultVariants`, so a component's own interface must not restate one: a `@default` tag
 * beside a variant is a second source of truth that drifts silently, and Dialog's four variants
 * deliberately carry none. Reading it here is what lets the generated table print `md` for `size`
 * anyway, out of the one place that decides it.
 *
 * A **component-level** default is a different thing and still belongs on the interface —
 * `CloseButton` sets `variant: "ghost"` in its own `withDefaults`, where the `button` recipe says
 * `solid`. The generator resolves that by letting a declared `@default` win.
 */
export function defaultVariantsFor(recipeKey: string): RecipeShape["defaultVariants"] {
  return shapeByKey[recipeKey]?.defaultVariants ?? {};
}
