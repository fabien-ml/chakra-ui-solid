import { recipes } from "./chakra/recipes";
import { slotRecipes } from "./chakra/slot-recipes";

/**
 * Everything in this package that needs to know *which* recipes exist reads them off the vendored
 * bodies under `chakra/` rather than from a list of names typed out here. A Chakra release that
 * adds a recipe is then covered by the `diff -r` that brings its file in, and nothing else has to
 * be told.
 *
 * The vendored barrels rather than the resolved config, because these names are read at *config*
 * time — `defineChakraConfig({ responsive })` expands its grains and `staticCss` declares its rows
 * before Panda has a theme to ask.
 *
 * Panda's own types describe a recipe body as far wider than the three keys read here, so the two
 * tables are narrowed once at the top instead of at every call site.
 */
type RecipeRegistry = Record<
  string,
  {
    className?: string;
    variants?: Record<string, unknown>;
    defaultVariants?: Record<string, string>;
  }
>;

const atomicRecipes = recipes as RecipeRegistry;
const compoundRecipes = slotRecipes as RecipeRegistry;

/**
 * The 19 atomic recipes — `button`, `input`, `heading`, … — `container` among them.
 *
 * `container` is the one key upstream's generator strips, since Panda ships a `container` pattern
 * of its own; `chakra/recipes/index.ts` registers our reproduction of Chakra's body in the same
 * table as the other 18. That is what makes every downstream reader cover it without being told:
 * the `staticCss` declaration, the jsx hint, and `defineChakraConfig({ responsive })`'s expansion
 * each walk this list.
 */
export const recipeKeys: string[] = Object.keys(atomicRecipes);

/**
 * The 56 slot recipes.
 *
 * **`swittch` is in here, misspelled, and we keep it that way.** Panda names the generated function
 * after the key, and `export const switch` is a syntax error — which is why upstream's own generator
 * renames it. The consequence a component author trips over is that the function is `swittch()`
 * (`roadmap.md` §1.3c).
 */
export const slotRecipeKeys: string[] = Object.keys(compoundRecipes);

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
 * `defineChakraConfig({ responsive })` needs these to expand its two coarser grains: `["button"]` means
 * *every* variant key on Button, and nothing else knows which those are.
 */
export function variantKeysFor(): Array<{ recipe: string; keys: string[] }> {
  return [...recipeKeys, ...slotRecipeKeys].map((recipe) => ({
    recipe,
    keys: Object.keys(registryEntry(recipe)?.variants ?? {}),
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
export function defaultVariantsFor(recipeKey: string): Record<string, string> {
  return registryEntry(recipeKey)?.defaultVariants ?? {};
}

function registryEntry(recipeKey: string): RecipeRegistry[string] | undefined {
  return atomicRecipes[recipeKey] ?? compoundRecipes[recipeKey];
}
