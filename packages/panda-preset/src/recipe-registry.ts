import chakraPreset from "@chakra-ui/panda-preset";

/**
 * Everything in this package that needs to know *which* recipes exist reads them off the imported
 * preset object rather than from a list of names typed out here. A Chakra release that adds a
 * recipe is then covered by the version bump alone, which is the whole point of *depend, do not
 * vendor* (`CLAUDE.md`, *Reference use*).
 *
 * Panda's own types describe a preset's `theme` as fully optional, so these two reads are narrowed
 * once here instead of at every call site.
 */
type RecipeRegistry = Record<string, { className?: string; variants?: Record<string, unknown> }>;

const theme = chakraPreset.theme as
  | { recipes?: RecipeRegistry; slotRecipes?: RecipeRegistry }
  | undefined;

/** The 18 atomic recipes — `button`, `input`, `heading`, … */
export const recipeKeys: string[] = Object.keys(theme?.recipes ?? {});

/**
 * The 56 slot recipes.
 *
 * **`swittch` is in here, misspelled, and we consume it verbatim.** Aliasing it to `switch` would
 * register the same `className: "switch"` recipe body under two keys and emit its CSS twice;
 * renaming it would fork the package we depend on. The consequence a component author actually
 * trips over is that the *generated function* is named `swittch` too (`roadmap.md` §1.3c).
 */
export const slotRecipeKeys: string[] = Object.keys(theme?.slotRecipes ?? {});

/**
 * The component name a recipe styles, derived from the recipe's own `className` rather than its
 * registry key — `action-bar` → `ActionBar`. Going through `className` is what keeps the misspelled
 * `swittch` key from producing a `Swittch` hint for a component that is called `Switch`.
 */
export function componentNameFor(recipeKey: string): string {
  const className = registryEntry(recipeKey)?.className;
  return (className ?? recipeKey)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Every recipe with its variant key names — `{ recipe: "button", keys: ["size", "variant"] }`.
 *
 * `chakraConfig({ responsive })` needs these to expand its two coarser grains: `["button"]` means
 * *every* variant key on Button, and nothing else knows which those are.
 */
export function variantKeysFor(): Array<{ recipe: string; keys: string[] }> {
  return [...recipeKeys, ...slotRecipeKeys].map((recipe) => ({
    recipe,
    keys: Object.keys(registryEntry(recipe)?.variants ?? {}),
  }));
}

function registryEntry(recipeKey: string): RecipeRegistry[string] | undefined {
  return theme?.recipes?.[recipeKey] ?? theme?.slotRecipes?.[recipeKey];
}
