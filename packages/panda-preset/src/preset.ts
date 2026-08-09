import chakraPreset from "@chakra-ui/panda-preset";
import { definePreset } from "@pandacss/dev";
import { aliasUtilities } from "./alias-utilities";
import { componentNameFor, recipeKeys, slotRecipeKeys } from "./recipe-registry";

/**
 * The ten `colorPalette` values, read from `@chakra-ui/panda-preset`'s `semantic-tokens/colors.ts`.
 * `bg`, `fg` and `border` live in the same file but are semantic *groups*, not palettes.
 */
const colorPalettes = [
  "gray",
  "red",
  "orange",
  "green",
  "blue",
  "yellow",
  "teal",
  "purple",
  "pink",
  "cyan",
];

/**
 * One `staticCss: ["*"]` key per recipe, merged into the inherited recipe body by `theme.extend`.
 *
 * This is the answer to the question the whole styling layer turns on: Panda generates CSS by
 * scanning source files, and **no recipe variant this library emits is ever written in a consumer's
 * source.** They write `<Button size="lg">` and never import the generated recipe module, so
 * nothing associates that prop with a recipe; and where a variant comes from a prop
 * (`slots({ size: props.size })`) it is not a literal to find in the first place. A class whose CSS
 * was never generated renders nothing and raises no error, so the failure is an unstyled component
 * and a green test suite. `staticCss: ["*"]` pre-generates every value of every variant key
 * instead — 488 values across the 74 recipes, and linear rather than combinatorial because the
 * preset declares zero `compoundVariants` (`plan.md` §1.2).
 *
 * It rides `theme.extend`'s deep merge, the same path a consumer uses to override a recipe, so it
 * adds one key to each inherited body and re-emits none of them (`legal.md` §1.5).
 */
function staticCssForEvery(keys: string[]): Record<string, { staticCss: ["*"]; jsx: string[] }> {
  return Object.fromEntries(
    keys.map((key) => [
      key,
      {
        staticCss: ["*"] as ["*"],
        // A tracking hint tells Panda that a JSX prop on this component belongs to this recipe.
        // It is an optimization and **nothing depends on it**: a hint is a component *name*, so it
        // breaks under `import { Button as Btn }`, under namespaced part components, and under a
        // consumer's own wrapper — silently, every time. `staticCss` above is what actually
        // guarantees the rules exist (`plan.md` §1.6).
        jsx: [componentNameFor(key)],
      },
    ]),
  );
}

/**
 * The Panda preset every consumer of `chakra-ui-solid` lists — Chakra v3's design system, plus the
 * four deltas this library needs on top of it.
 *
 * `presets` is declared **here rather than in a `panda.config.ts`** so that `presets:
 * [chakraSolidPreset]` is the whole story on both sides of the library/consumer boundary. Panda's
 * `eject: true` (which our config and `chakraConfig()` both set, to keep Panda's own default theme
 * from merging alongside Chakra's and disagreeing about `colors.gray.*`) drops the default presets,
 * and `@chakra-ui/panda-preset` declares no base of its own while reaching for
 * `utilities: { extend }` and `conditions: { extend }`. Left to a config file this fix works and
 * **fails open**: a consumer who omits the line gets a library with no style-prop utilities and no
 * `_open`/`_hover` conditions, and nothing errors (`plan.md` §3.2).
 */
export const chakraSolidPreset = definePreset({
  name: "@chakra-ui-solid/panda-preset",

  presets: ["@pandacss/preset-base", chakraPreset],

  theme: {
    extend: {
      recipes: staticCssForEvery(recipeKeys),
      slotRecipes: staticCssForEvery(slotRecipeKeys),

      tokens: {
        cursor: {
          // The preset registers this token as `swittch` while its own Switch recipe references
          // `cursor: "switch"` — so the reference resolves to nothing and Switch silently loses
          // its `cursor: pointer`, where Chakra's runtime theme (which spells both `switch`) does
          // not. That makes it a preset defect rather than Chakra behavior, and inheriting it
          // would be a divergence from what we are porting. One token key restores it; the
          // slot-recipe key stays misspelled and untouched (`roadmap.md` §1.3c).
          switch: { value: "pointer" },
        },
      },
    },
  },

  utilities: {
    extend: aliasUtilities,
  },

  // The atomic half of the same problem: values a component's own logic picks, which no consumer
  // source ever contains. `display` is the shape hope-ui shipped in production for exactly this
  // reason — a `Flex` with an `inline` prop toggles `display: inline-flex` at runtime — and
  // `colorPalette` is ours: a component that defaults it, or a wrapper that forwards it, emits
  // `.color-palette_blue` and without this row that class has no rule (`plan.md` §1.3).
  staticCss: {
    css: [
      { properties: { display: ["flex", "inline-flex"] } },
      { properties: { colorPalette: colorPalettes } },
    ],
  },
});
