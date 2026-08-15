import { definePreset } from "@pandacss/dev";
import { aliasUtilities } from "./alias-utilities";
import { recipes } from "./chakra/recipes";
import { slotRecipes } from "./chakra/slot-recipes";
import { utilities } from "./chakra/utilities";
import { currentBgUtilities } from "./current-bg-utilities";
import { componentNameFor, recipeKeys, slotRecipeKeys } from "./recipe-registry";
import { chakraSkin, type Skin } from "./skin";

/**
 * Chakra's design system minus its design: the 75 recipe bodies, the style-prop utilities and the
 * one condition the preset adds. Fixed — a skin never replaces any of it.
 *
 * The line falls here because a recipe body is *assembly* rather than looks. Measured across the
 * 4,231 declarations in those bodies, 56% are structural and 37% are token references, so swapping
 * a look is swapping the token table in `skin.ts` and leaving all three of these keys alone.
 *
 * None of it is swappable, and the reason is the same for all three: every name here is compiled
 * into the published `styled-system/`. A utility's name lands in `jsx/is-valid-prop.mjs`, a
 * condition's in `css/conditions.mjs`, and a recipe's variant keys in its own generated module — so
 * `focusRing`, `_icon` and `size` are sealed by exactly one mechanism.
 */
const anatomy = definePreset({
  name: "@chakra-ui-solid/anatomy",

  theme: { recipes, slotRecipes },

  utilities: { extend: utilities },

  // Chakra's own preset adds exactly one condition, and it is one line — `_icon` is how a recipe
  // reaches the svg inside a control it does not own the markup of.
  conditions: { extend: { icon: "& :where(svg)" } },
});

/**
 * The layout tier's keyword shorthands, whose values arrive as a **prop** and are therefore not in
 * anyone's source as a style value.
 *
 * Most of them do not need this row, and knowing which is the whole point. Panda's own patterns
 * claim the JSX names `Flex`, `Stack`, `Wrap` and `Grid`, so `<Flex direction="row">` in a
 * consumer's file is mapped to `flexDirection` by *their* extractor — that is why those components
 * reuse `pattern.raw()` rather than re-implementing the mapping. What is left over is every
 * shorthand the matching pattern does **not** carry: `Wrap`'s `direction`, `Stack`'s `wrap`, and
 * all three of `Group`'s, since no pattern claims that name at all. Those reach the element as a
 * class with no rule, and the prop silently does nothing.
 *
 * Enumerated rather than `["*"]`: `*` expands a property's *token* values, and none of these four
 * has a token scale — it produces nothing at all, silently.
 */
const flexDirections = ["row", "column", "row-reverse", "column-reverse"];

/**
 * The two borders a StackSeparator chooses between, and the one row here that carries
 * `responsive: true`.
 *
 * The separator draws a horizontal line in a column stack and a vertical one in a row stack, so its
 * border widths are a *mapping* of the Stack's `direction` — computed from a prop, spelled as a
 * style value in no file on either side of the boundary. `direction` is also the one layout
 * shorthand a consumer routinely writes responsively (`{ base: "column", md: "row" }`), and the
 * mapped value inherits those conditions, so the rules have to exist at every breakpoint too.
 */
const separatorBorderWidths = ["1px", "0"];

const flexWraps = ["wrap", "nowrap", "wrap-reverse"];
const alignItems = ["flex-start", "flex-end", "center", "baseline", "stretch", "start", "end"];
const justifyContent = [
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly",
  "start",
  "end",
];

const displays = ["flex", "inline-flex", "grid", "inline-grid"];

/**
 * `Table.Caption`'s side, and the narrowest row in this list: one property, one value.
 *
 * HTML puts a caption above its table and Chakra puts it below, so the component supplies
 * `captionSide: "bottom"` when the consumer names none. The obvious spelling — a literal JSX
 * attribute before the props spread — is extractable and **wrong**: a JSX spread is a presence
 * merge, so a wrapper forwarding an unset `captionSide` beats the literal with `undefined` and the
 * caption silently moves back to the top, where the React version's `mergeProps` resolves the same
 * default by value and keeps it. `withDefaults` is the fix, and it puts the value in an object
 * literal no extractor reads — which is what this row is for.
 */
const captionSides = ["bottom"];

/**
 * The style-prop defaults seven components supply when the consumer names none — one entry each,
 * and every one of them arrived here for the same reason `captionSides` did.
 *
 * The obvious spelling is a literal JSX attribute before the props spread, which is extractable and
 * **wrong**: a Solid JSX spread is a presence merge, so a wrapper forwarding the prop unset beats
 * the literal with `undefined` and the default is gone, where the React version's `mergeProps`
 * resolves the same key by value and keeps it. `withDefaults` fixes the deletion and puts the value
 * in an object literal no extractor reads — which is what these rows are for (`CLAUDE.md`, *The
 * third hazard*).
 *
 * `Stat.Group`'s four — `display`, `flexWrap`, `justifyContent`, `alignItems` — moved the same way
 * and are already covered by the lists above, which is why nothing here names them. `SkipNavContent`
 * moved `tabindex` and an inline `outline` and owes nothing either: neither is a style prop.
 */
const circleBorderRadii = ["9999px"];
const colorSwatchMixOverflows = ["hidden"];
const iconButtonPaddings = ["0"];
const iconButtonIconFontSizes = ["1.2em"];
const fieldErrorIconSizes = ["1em"];
const linkBoxPositions = ["relative"];
const skeletonTextWidths = ["full"];

/**
 * One `jsx` tracking hint per recipe, merged into the vendored recipe body by `theme.extend`.
 *
 * A hint tells Panda that a JSX prop on this component belongs to this recipe. It is an
 * optimization and **nothing depends on it**: a hint is a component *name*, so it breaks under
 * `import { Button as Btn }`, under namespaced part components, and under a consumer's own wrapper
 * — silently, every time (`plan.md` §1.6).
 *
 * **What used to be here is the question the whole styling layer turns on**, and it is now answered
 * one file over. Panda generates CSS by scanning source files, and no recipe variant this library
 * emits is ever written in a consumer's source: they write `<Button size="lg">` and never import
 * the generated recipe module, and where a variant comes from a prop (`slots({ size: props.size })`)
 * it is not a literal to find at all. A class whose CSS was never generated renders nothing and
 * raises no error, so the failure is an unstyled component and a green test suite. This declared
 * `staticCss: ["*"]` on all 75 bodies to pre-empt that — correct, and 354 kB of CSS for an app that
 * imports Button, including 43 `.dialog__*` rules it can never use. `recipe-gate-plugin.ts` emits
 * the same rules for the recipes the consumer's **imports** reach, which is the one signal that
 * survives aliasing, namespaced parts and wrappers.
 *
 * It rides `theme.extend`'s deep merge, the same path a consumer uses to override a recipe, so it
 * adds one key to each body and re-emits none of them.
 */
function jsxHintsForEvery(keys: string[]): Record<string, { jsx: string[] }> {
  return Object.fromEntries(keys.map((key) => [key, { jsx: [componentNameFor(key)] }]));
}

/**
 * A skin as the preset Panda merges — the second of the two halves the vendored preset is split
 * into, {@link anatomy} being the first.
 *
 * The seven token keys stay in `theme`, and the two recipe **deltas** move to `theme.extend` — the
 * one difference that matters here, and the reason the destructure separates them.
 *
 * A preset's bare `theme` sits in a **replacing** position: Panda resolves each theme key from the
 * last preset that declares it and takes that value whole. For the token tables that is exactly
 * right, since a skin *is* the whole token table. For a delta it is ruinous — `theme.recipes` here
 * would replace all 75 anatomy bodies with the one the delta named, leaving 74 recipes with no body,
 * no rules and no error. `theme.extend` is the deep-merging position, so a delta placed there adds
 * to the anatomy's body instead: set one `base` property and the other 21 and every variant survive.
 *
 * Putting them here rather than in `defineChakraConfig()` is what keeps them from being lost, and
 * it hands the ordering to Panda instead of to a merge of our own. This preset sits **before** the
 * consumer's `panda.config.ts` in the chain, and later `extend` writers win a contested key — so a
 * consumer's own `theme.extend.recipes.button` beats a skin's delta, and both survive beside the
 * `jsx` hint `createChakraSolidPreset` writes to that same recipe name one layer up.
 */
function skinAsPreset(skin: Skin) {
  const { globalCss, recipes, slotRecipes, ...theme } = skin;
  return {
    name: "@chakra-ui-solid/skin",
    theme: { ...theme, extend: { recipes, slotRecipes } },
    globalCss,
  };
}

/**
 * The Panda preset every consumer of `chakra-ui-solid` lists — Chakra v3's design system, plus the
 * four deltas this library needs on top of it.
 *
 * `presets` is declared **here rather than in a `panda.config.ts`** so that `presets:
 * [chakraSolidPreset]` is the whole story on both sides of the library/consumer boundary. Panda's
 * `eject: true` (which our config and `defineChakraConfig()` both set, to keep Panda's own default theme
 * from merging alongside Chakra's and disagreeing about `colors.gray.*`) drops the default presets,
 * and Chakra's own preset declares no base of its own while reaching for
 * `utilities: { extend }` and `conditions: { extend }`. Left to a config file this fix works and
 * **fails open**: a consumer who omits the line gets a library with no style-prop utilities and no
 * `_open`/`_hover` conditions, and nothing errors (`plan.md` §3.2).
 *
 * Chakra's preset arrives as **two** entries in that chain rather than one, in the order it held
 * before it was split: `anatomy` carries the recipe bodies, the utilities and the condition, and
 * the skin carries the tokens, the compositions and its recipe deltas. Everything below the chain
 * is the library layer and is the same whichever skin is loaded.
 *
 * A skin is routed **whole** here, deltas included, so this function alone is enough to build a
 * correct preset from one. `defineChakraConfig({ skin })` is still the supported way in — that is
 * where the locked keys, the import gate and the `staticCss` union live, and a raw `panda.config.ts`
 * naming this preset gets none of them.
 */
export function createChakraSolidPreset(skin: Skin) {
  return definePreset({
    name: "@chakra-ui-solid/panda-preset",

    presets: ["@pandacss/preset-base", anatomy, skinAsPreset(skin)],

    theme: {
      extend: {
        recipes: jsxHintsForEvery(recipeKeys),
        slotRecipes: jsxHintsForEvery(slotRecipeKeys),

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
      // Two disjoint sets: `aliasUtilities` adds a *name* to a utility Panda already has,
      // `currentBgUtilities` adds a *transform* to the two background utilities so that Chakra's
      // `currentBg` keyword — which two of the preset's own recipes write and no shipped utility
      // resolves — compiles to something a browser accepts.
      extend: { ...aliasUtilities, ...currentBgUtilities },
    },

    // The atomic half of the same problem: values **a component's own logic picks**, which no
    // consumer source ever contains. `display` is the shape hope-ui shipped in production for exactly
    // this reason — a `Flex` with an `inline` prop toggles `display: inline-flex` at runtime, `Grid`
    // does the same to `inline-grid`, and `Center` carries it as a variant body (`plan.md` §1.3).
    //
    // That is the whole bar, and it is narrower than "a value someone might pass at runtime."
    // Passing one is not supported: a style value must be statically extractable, declared here, or
    // routed through a custom property (`CLAUDE.md`, *The hazard*), so a row that exists only to
    // rescue a runtime-valued prop is buying back a form the library forbids — at every consumer's
    // expense, for a rule most of them never use. Measured, on `colorPalette`, which used to sit in
    // this list: 8 kB raw / 737 B gzip, seven of its ten palettes used by nothing, and every literal
    // form — plain, responsive object, forwarded through a wrapper — emitting fine without it. Add a
    // row when a *component* starts picking the value, not when an example does.
    //
    // One property per entry, which is not a style choice: several properties in a single entry
    // emits nothing.
    staticCss: {
      css: [
        { properties: { display: displays } },
        { properties: { flexDirection: flexDirections } },
        { properties: { flexWrap: flexWraps } },
        { properties: { alignItems: alignItems } },
        { properties: { justifyContent: justifyContent } },
        { properties: { captionSide: captionSides } },
        { properties: { borderRadius: circleBorderRadii } },
        { properties: { overflow: colorSwatchMixOverflows } },
        { properties: { paddingInline: iconButtonPaddings } },
        { properties: { paddingBlock: iconButtonPaddings } },
        { properties: { fontSize: iconButtonIconFontSizes }, conditions: ["icon"] },
        { properties: { boxSize: fieldErrorIconSizes } },
        { properties: { position: linkBoxPositions } },
        { properties: { width: skeletonTextWidths } },
        { properties: { borderTopWidth: separatorBorderWidths }, responsive: true },
        { properties: { borderInlineStartWidth: separatorBorderWidths }, responsive: true },
      ],
    },
  });
}

/**
 * The default preset, and the one `packages/styled-system/panda.config.ts` and
 * `defineChakraConfig()` both name: Chakra's own skin over Chakra's own anatomy, which is what
 * every consumer gets until one of them passes something else.
 */
export const chakraSolidPreset = createChakraSolidPreset(chakraSkin);
