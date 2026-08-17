import chakraPreset from "@chakra-ui/panda-preset";
import { definePreset } from "@pandacss/dev";
import { aliasUtilities } from "./alias-utilities";
import { currentBgUtilities } from "./current-bg-utilities";
import { componentNameFor, recipeBodyFor, recipeKeys, slotRecipeKeys } from "./recipe-registry";

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
 * The nine declarations `Bleed` and `GridItem` read a per-element custom property back through, and
 * the one group here that is a *fixed literal* rather than a value some prop selects.
 *
 * They used to need no row at all: both components spelled them in a `css.raw({ … })` call, which
 * both extractors read. `css` is the `<ChakraProvider>`'s now, and a system can only be read from a
 * component body — so the literals moved into plain objects, which no extractor reads. The rules
 * still have to exist, because the *amounts* are inline custom properties and these are the
 * declarations that consume them: without them a `<Bleed inline="4">` sets a variable nothing reads
 * and renders flush with its parent, silently.
 *
 * `Grid`'s own eight `var()` declarations need no row — they sit in a `chakra()` style config,
 * which is a channel a consumer's build still extracts.
 */
const bleedInlineStartMargins = ["calc(var(--bleed-inline-start, 0) * -1)"];
const bleedInlineEndMargins = ["calc(var(--bleed-inline-end, 0) * -1)"];
const bleedBlockStartMargins = ["calc(var(--bleed-block-start, 0) * -1)"];
const bleedBlockEndMargins = ["calc(var(--bleed-block-end, 0) * -1)"];
/**
 * The two declarations a control inside an `InputGroup` contributes for itself, and the reason the
 * group's offsets are custom properties rather than interpolated into the value.
 *
 * `--input-height` is published by the *control's own* size variant and `--input-group-*-offset` by
 * the group above it, so the `calc()` evaluates in the control's scope with a length the group
 * chose. Chakra spells the same thing as `` `calc(var(--input-height) - ${startOffset})` `` — a
 * template literal, which is not a value any extractor can find and not a value a row here can
 * enumerate. Written this way it is a fixed literal, and these two rows are what make the class the
 * control emits resolve to a rule; without them a `<InputGroup startElement={…}>` pads nothing,
 * silently.
 *
 * They must stay character-for-character identical to `START_PADDING` / `END_PADDING` in
 * `components/input-group/input-group-context.ts` — a class name *is* its value here.
 */
const inputGroupStartPaddings = [
  "calc(var(--input-height) - var(--input-group-start-offset, 0px))",
];
const inputGroupEndPaddings = ["calc(var(--input-height) - var(--input-group-end-offset, 0px))"];

const gridItemAreas = ["var(--grid-item-area)"];
const gridItemColumnStarts = ["var(--grid-item-column-start)"];
const gridItemColumnEnds = ["var(--grid-item-column-end)"];
const gridItemRowStarts = ["var(--grid-item-row-start)"];
const gridItemRowEnds = ["var(--grid-item-row-end)"];

/**
 * One `jsx` tracking hint per recipe, merged into the inherited recipe body by `theme.extend`.
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
 * adds one key to each inherited body and re-emits none of them (`CLAUDE.md`, *Reference use*).
 */
function jsxHintsForEvery(keys: string[]): Record<string, { jsx: string[] }> {
  return Object.fromEntries(
    keys.map((key) => [
      key,
      {
        // Empty for all but `container`, which no inherited body exists to merge into — a recipe
        // this package declares itself has to arrive through this same `theme.extend` key, or
        // Panda registers a hint for a recipe that does not exist.
        ...recipeBodyFor(key),
        jsx: [componentNameFor(key)],
      },
    ]),
  );
}

/**
 * What `theme.extend` carries for one recipe: the `jsx` hint, the corrected variant values, and —
 * for `container` alone — the body nothing upstream declares.
 *
 * Loose where Panda's `RecipeConfig` is exact, because every style value in it was **read back off
 * the inherited theme** rather than written here. Panda has already accepted those values on the
 * way in; re-describing them in its own `SystemStyleObject` union would only be this file claiming
 * to know a shape it copied. The two `theme.extend` keys cast once, at the boundary.
 */
type ThemeExtend = NonNullable<NonNullable<ReturnType<typeof definePreset>["theme"]>["extend"]>;

/** Any style object: style properties, nested conditions, and whatever Panda accepts as a value. */
type StyleObject = Record<string, unknown>;

/** `{ variant: { outline: … } }` — the variant values one recipe's correction reaches. */
type VariantStyles = Record<string, Record<string, StyleObject>>;

/** An inherited recipe body, narrowed to the two keys this file reads back off the theme. */
type InheritedBody<Base> = { base: Base; variants: VariantStyles };

/**
 * The ten inherited bodies the corrections below are read out of — named one by one, because the
 * whole point is that this file copies a known set of blocks rather than deriving a set.
 */
const inherited = chakraPreset.theme as unknown as {
  recipes: Record<"input" | "textarea" | "checkmark" | "radiomark", InheritedBody<StyleObject>>;
  slotRecipes: {
    nativeSelect: InheritedBody<{ field: StyleObject }>;
    table: InheritedBody<{ row: StyleObject }>;
    avatar: InheritedBody<{ root: StyleObject }>;
    checkbox: InheritedBody<{ control: StyleObject }>;
    checkboxCard: InheritedBody<{ indicator: StyleObject }>;
    radioGroup: InheritedBody<{ itemControl: StyleObject }>;
    radioCard: InheritedBody<{ item: StyleObject; itemIndicator: StyleObject }>;
  };
};

/** The named conditional blocks out of an inherited `base`, copied rather than transcribed. */
function conditionsOf(base: StyleObject, ...conditions: string[]): StyleObject {
  return Object.fromEntries(conditions.map((condition) => [condition, base[condition]]));
}

/**
 * A recipe's corrections, padded out to every variant key it declares, in the order it declares
 * them.
 *
 * The merge **moves an overridden key to the end** — it copies the keys the correction does not
 * mention, then the ones it does — and two things read that order: the generated recipe's
 * `variantKeys` tuple, which is public API, and the order Panda emits the rules in. A correction
 * naming `variant` alone would push `radiomark`'s `variant` past `filled`, handing a filled
 * radiomark's background to `variant.subtle`. A key with no correction is listed as `{}`, which
 * merges to exactly the body it already had.
 */
function inRecipeOrder(recipe: InheritedBody<unknown>, corrections: VariantStyles): VariantStyles {
  return Object.fromEntries(
    Object.keys(recipe.variants).map((key) => [key, corrections[key] ?? {}]),
  );
}

const inputRecipe = inherited.recipes.input;
const textareaRecipe = inherited.recipes.textarea;
const checkmarkRecipe = inherited.recipes.checkmark;
const radiomarkRecipe = inherited.recipes.radiomark;
const nativeSelectRecipe = inherited.slotRecipes.nativeSelect;
const tableRecipe = inherited.slotRecipes.table;
const avatarRecipe = inherited.slotRecipes.avatar;
const checkboxRecipe = inherited.slotRecipes.checkbox;
const checkboxCardRecipe = inherited.slotRecipes.checkboxCard;
const radioGroupRecipe = inherited.slotRecipes.radioGroup;
const radioCardRecipe = inherited.slotRecipes.radioCard;

/**
 * The base conditions Panda's layering lets a variant defeat, written back into the variant values
 * that defeat them.
 *
 * Panda emits a recipe as `@layer recipes { @layer _base { …base… } …variant rules… }`, and
 * **unlayered rules inside a layer beat that layer's nested sub-layers whatever their
 * specificity** — so a flat declaration in `variants` defeats the same property under a *condition*
 * in `base`. `input`'s `base._invalid.borderColor` loses to `variants.variant.outline.borderColor`,
 * and an invalid Input renders in its resting colour where chakra-ui.com renders it red. Chakra's
 * React runtime never has the problem: it merges base and the chosen variant into one class, where
 * the condition is a nested block and specificity decides.
 *
 * Spelling the condition inside the variant value lands exactly that merge — Panda emits
 * `.input--variant_outline:is(:invalid, …)` (0,2,0) beside `.input--variant_outline` (0,1,0) in the
 * *same* layer, and specificity decides again. It is a defect in `@chakra-ui/panda-preset` rather
 * than Chakra behavior, and these rows correct it only for the recipes we ship.
 *
 * Three things keep the list honest, and each entry below can be read as one line because of them:
 *
 * - **Every declaration is read off the inherited body**, never transcribed, so a preset upgrade
 *   that changes a value arrives as a diff in the generated sheet rather than as drift here.
 * - **Only the variant values that actually shadow the condition carry it.** Panda emits variant
 *   rules in declaration order and these all land at equal specificity, so a correction written
 *   into a *later* variant key beats an earlier key's deliberate value.
 * - **A newly ported component may need a row.** The 9 recipes nothing has ported yet —
 *   `colorPicker`, `combobox`, `datePicker`, `numberInput`, `pinInput`, `progress`, `select`,
 *   `slider`, `tagsInput` — are known to carry the same defect, and get their rows when they ship.
 */
const shadowedBaseConditions: Record<string, VariantStyles> = {
  // Each variant picks its own resting `borderColor`; `flushed` spells the longhand
  // `borderBottomColor`, which collides just the same. The sizes set no colour and need nothing.
  input: inRecipeOrder(inputRecipe, {
    variant: {
      outline: conditionsOf(inputRecipe.base, "_invalid"),
      subtle: conditionsOf(inputRecipe.base, "_invalid"),
      flushed: conditionsOf(inputRecipe.base, "_invalid"),
    },
  }),

  textarea: inRecipeOrder(textareaRecipe, {
    variant: {
      outline: conditionsOf(textareaRecipe.base, "_invalid"),
      subtle: conditionsOf(textareaRecipe.base, "_invalid"),
      flushed: conditionsOf(textareaRecipe.base, "_invalid"),
    },
  }),

  // `variant.plain` declares nothing outside its own `_checked` block, so it shadows nothing. The
  // sizes reach `_icon` rather than `_invalid`: what they set is `boxSize`.
  checkmark: inRecipeOrder(checkmarkRecipe, {
    variant: {
      solid: conditionsOf(checkmarkRecipe.base, "_invalid"),
      outline: conditionsOf(checkmarkRecipe.base, "_invalid"),
      subtle: conditionsOf(checkmarkRecipe.base, "_invalid"),
      inverted: conditionsOf(checkmarkRecipe.base, "_invalid"),
    },
    size: {
      xs: conditionsOf(checkmarkRecipe.base, "_icon"),
      sm: conditionsOf(checkmarkRecipe.base, "_icon"),
      md: conditionsOf(checkmarkRecipe.base, "_icon"),
      lg: conditionsOf(checkmarkRecipe.base, "_icon"),
    },
  }),

  // The one recipe where the ordering rule bites: `variant.outline` respells `& .dot` to scale it
  // to 0.6, and `size` and `filled` are declared after `variant` — so a copy of the base dot under
  // either would be emitted later at equal specificity and take the 0.4 back. Neither shadows it
  // anyway (a `background` on the root cannot defeat one on a descendant), so neither gets it.
  radiomark: inRecipeOrder(radiomarkRecipe, {
    variant: {
      solid: conditionsOf(radiomarkRecipe.base, "_invalid"),
      subtle: conditionsOf(radiomarkRecipe.base, "_invalid", "& .dot"),
      outline: conditionsOf(radiomarkRecipe.base, "_invalid"),
      inverted: conditionsOf(radiomarkRecipe.base, "_invalid", "& .dot"),
    },
  }),
};

/**
 * The same correction, slot by slot: a variant value shadows only the slot whose declarations it
 * writes, so the block travels into that slot and no other.
 */
const shadowedSlotBaseConditions: Record<string, VariantStyles> = {
  nativeSelect: inRecipeOrder(nativeSelectRecipe, {
    variant: {
      outline: {
        field: conditionsOf(nativeSelectRecipe.base.field, "_invalid", "& > option, & > optgroup"),
      },
      subtle: {
        field: conditionsOf(nativeSelectRecipe.base.field, "_invalid", "& > option, & > optgroup"),
      },
      plain: { field: conditionsOf(nativeSelectRecipe.base.field, "& > option, & > optgroup") },
      ghost: { field: conditionsOf(nativeSelectRecipe.base.field, "& > option, & > optgroup") },
    },
  }),

  // `variant.line` is the only one that gives `row` a resting `bg`; `outline` styles it through a
  // `:not(:last-of-type)` border and shadows nothing.
  table: inRecipeOrder(tableRecipe, {
    variant: { line: { row: conditionsOf(tableRecipe.base.row, "_selected") } },
  }),

  // The grouped ring: `base.root` gives a `[data-group-item]` avatar a 2px border, and only
  // `variant.outline` sets a resting `borderWidth` to defeat it. `borderless` respells the same
  // condition for itself and is declared after `variant`, so its `0px` still wins.
  avatar: inRecipeOrder(avatarRecipe, {
    variant: { outline: { root: conditionsOf(avatarRecipe.base.root, "&[data-group-item]") } },
  }),

  // `control` is the `checkmark` recipe's whole body on a slot, so this row is that recipe's row
  // slot-scoped: the three variants each pick a resting `borderColor` and defeat `_invalid`'s
  // `border.error`, and the four sizes reach `_icon` with the `boxSize` they set. `root` and `label`
  // take nothing — a size gives them `gap` and `textStyle`, and neither slot's base has a condition
  // declaring either.
  checkbox: inRecipeOrder(checkboxRecipe, {
    variant: {
      outline: { control: conditionsOf(checkboxRecipe.base.control, "_invalid") },
      solid: { control: conditionsOf(checkboxRecipe.base.control, "_invalid") },
      subtle: { control: conditionsOf(checkboxRecipe.base.control, "_invalid") },
    },
    size: {
      xs: { control: conditionsOf(checkboxRecipe.base.control, "_icon") },
      sm: { control: conditionsOf(checkboxRecipe.base.control, "_icon") },
      md: { control: conditionsOf(checkboxRecipe.base.control, "_icon") },
      lg: { control: conditionsOf(checkboxRecipe.base.control, "_icon") },
    },
  }),

  // The same row one slot over, because this recipe is `checkbox` inverted: the `checkmark` body is
  // on `indicator` here and `control` styles the card around it. Three of the four variants give the
  // indicator a resting `borderColor` and defeat `_invalid`'s `border.error`; `subtle` declares
  // nothing outside its own `&:is([data-state=checked], …)` block and shadows nothing. The three
  // sizes set `boxSize` and reach `_icon`. `root` takes nothing — its `_invalid` is an `outline`,
  // and no variant declares one.
  checkboxCard: inRecipeOrder(checkboxCardRecipe, {
    variant: {
      surface: { indicator: conditionsOf(checkboxCardRecipe.base.indicator, "_invalid") },
      outline: { indicator: conditionsOf(checkboxCardRecipe.base.indicator, "_invalid") },
      solid: { indicator: conditionsOf(checkboxCardRecipe.base.indicator, "_invalid") },
    },
    size: {
      sm: { indicator: conditionsOf(checkboxCardRecipe.base.indicator, "_icon") },
      md: { indicator: conditionsOf(checkboxCardRecipe.base.indicator, "_icon") },
      lg: { indicator: conditionsOf(checkboxCardRecipe.base.indicator, "_icon") },
    },
  }),

  // `itemControl` is the `radiomark` recipe's whole body on a slot, so this is that recipe's row
  // slot-scoped — and it is `radiomark`'s ordering trap as well. All three variants give the circle
  // a resting `borderColor` and defeat `_invalid`'s `red.500`, so all three carry it. **The four
  // sizes carry nothing**: what they set is `boxSize`, `base.itemControl` declares no `_icon`, and
  // the only other block a size could shadow is `& .dot` — which `variant.outline` respells to
  // `scale: 0.6`. `size` is declared after `variant`, so a copy of the base dot under a size would
  // be emitted later at equal specificity and take the 0.4 back on an outline radio.
  radioGroup: inRecipeOrder(radioGroupRecipe, {
    variant: {
      outline: { itemControl: conditionsOf(radioGroupRecipe.base.itemControl, "_invalid") },
      subtle: { itemControl: conditionsOf(radioGroupRecipe.base.itemControl, "_invalid") },
      solid: { itemControl: conditionsOf(radioGroupRecipe.base.itemControl, "_invalid") },
    },
  }),

  // The `radioGroup` row one slot over — `itemIndicator` is where this recipe puts the `radiomark`
  // body — plus a second slot no other recipe here needs. All four variants give the circle a
  // resting `borderColor` and defeat `_invalid`'s `red.500`, and `subtle` alone gives the **card**
  // a resting `bg`, which defeats `base.item._focus`'s `colorPalette.muted/20` and leaves a focused
  // subtle card in its resting fill.
  //
  // The `_invalid` half is the narrower of the two, and knowing why is worth a line: `_invalid` is
  // `&:is(:invalid, [data-invalid], …)` — **self only** — and a `RadioCard.ItemIndicator` is not a
  // machine part, so nothing puts `data-invalid` on that element. A `RadioGroup.ItemIndicator`
  // renders the machine's own `itemControl` and inherits one, which is why the same block is live
  // there and reachable here only through an attribute a consumer writes. The correction still
  // belongs: it is what makes that attribute win over the variant's flat `borderColor` when someone
  // does.
  //
  // **The three sizes carry nothing**, for `radioGroup`'s reason: what they set on the indicator is
  // `boxSize`, `base.itemIndicator` declares no `_icon`, and the only other block a size could
  // shadow is `& .dot` — which `variant.subtle` respells to `scale: 0.6`. `size` is declared
  // *before* `variant` here, so a copy under a size would be emitted first and lose anyway; it
  // would still be a rule that corrects nothing. `justify`, `align` and `orientation` write custom
  // properties, `textAlign` and `flexDirection`, and shadow no condition at all.
  radioCard: inRecipeOrder(radioCardRecipe, {
    variant: {
      surface: { itemIndicator: conditionsOf(radioCardRecipe.base.itemIndicator, "_invalid") },
      subtle: {
        item: conditionsOf(radioCardRecipe.base.item, "_focus"),
        itemIndicator: conditionsOf(radioCardRecipe.base.itemIndicator, "_invalid"),
      },
      outline: { itemIndicator: conditionsOf(radioCardRecipe.base.itemIndicator, "_invalid") },
      solid: { itemIndicator: conditionsOf(radioCardRecipe.base.itemIndicator, "_invalid") },
    },
  }),
};

/**
 * The corrections merged onto the hints. Both ride `theme.extend`'s deep merge, the same path a
 * consumer uses to override a recipe, so a corrected variant value gains a key and the rest of the
 * inherited body is neither touched nor re-emitted (`CLAUDE.md`, *Reference use*).
 */
function withBaseConditions(
  hints: Record<string, { jsx: string[] }>,
  corrections: Record<string, VariantStyles>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(hints).map(([key, hint]) => {
      const correction = corrections[key];
      return [key, correction === undefined ? hint : { ...hint, variants: correction }];
    }),
  );
}

/**
 * The Panda preset every consumer of `chakra-ui-solid` lists — Chakra v3's design system, plus the
 * four deltas this library needs on top of it.
 *
 * `presets` is declared **here rather than in a `panda.config.ts`** so that `presets:
 * [chakraSolidPreset]` is the whole story on both sides of the library/consumer boundary. Panda's
 * `eject: true` (which our config and `defineChakraConfig()` both set, to keep Panda's own default theme
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
      recipes: withBaseConditions(
        jsxHintsForEvery(recipeKeys),
        shadowedBaseConditions,
      ) as ThemeExtend["recipes"],
      slotRecipes: withBaseConditions(
        jsxHintsForEvery(slotRecipeKeys),
        shadowedSlotBaseConditions,
      ) as ThemeExtend["slotRecipes"],

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
      { properties: { marginInlineStart: bleedInlineStartMargins } },
      { properties: { marginInlineEnd: bleedInlineEndMargins } },
      { properties: { marginBlockStart: bleedBlockStartMargins } },
      { properties: { marginBlockEnd: bleedBlockEndMargins } },
      // The longhands, not `ps` / `pe`: `staticCss` keys a row by *property*, and a shorthand there
      // matches no utility and emits nothing at all.
      { properties: { paddingInlineStart: inputGroupStartPaddings } },
      { properties: { paddingInlineEnd: inputGroupEndPaddings } },
      { properties: { gridArea: gridItemAreas } },
      { properties: { gridColumnStart: gridItemColumnStarts } },
      { properties: { gridColumnEnd: gridItemColumnEnds } },
      { properties: { gridRowStart: gridItemRowStarts } },
      { properties: { gridRowEnd: gridItemRowEnds } },
    ],
  },
});
