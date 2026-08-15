import { definePreset } from "@pandacss/dev";
import type { RecipeShape, recipeContract, slotRecipeContract } from "./contract";

/**
 * Panda's own preset type, read off `definePreset` rather than imported: `@pandacss/dev` imports
 * `@pandacss/types` without re-exporting it, so a consumer holding only the peer dependency cannot
 * resolve that specifier. The same reasoning `config.ts` reads all of its types off `Config` for.
 */
type PandaPreset = Parameters<typeof definePreset>[0];

/**
 * A Panda preset for this library, checked against the recipe contract as you write it.
 *
 * A **preset** is the whole look: the token tables, and a body for each of the 75 recipes our
 * components compute their class names through. `chakraPreset` is Chakra v3's — this is how a
 * different one is written, and a consumer loads it through the `presets` array Panda already has:
 *
 * ```ts
 * export const materialPreset = defineChakraPreset({
 *   name: "material",
 *   theme: {
 *     tokens: { colors: { … } },
 *     recipes: { button: { className: "button", base: { … }, variants: { … } }, … },
 *     slotRecipes: { … },
 *   },
 * })
 *
 * // panda.config.ts
 * export default defineChakraConfig({ presets: [materialPreset], include: [ … ] })
 * ```
 *
 * **Why every recipe is required rather than optional.** A later preset's bare `theme.recipes`
 * *replaces* the whole key, so a preset that declares one recipe deletes the other 74 — measured,
 * and silent: our runtime goes on computing `badge--variant_solid` for a stylesheet that declares no
 * such rule, and a page of unstyled components is the only report. Requiring every recipe, slot,
 * variant key and variant value moves that answer into the editor, where it names what is missing.
 *
 * **It checks what it can see.** A body built by Panda's own `defineRecipe` / `defineSlotRecipe`
 * comes back with its slots and variants widened to `string`, and the recipes inside it pass unread
 * — which is exactly how `chakraPreset` satisfies this, and why the check cannot be the only one.
 * `presetContractPlugin` re-reads the *resolved* theme during a build and warns about everything the
 * types could not, including the two this signature deliberately leaves to it: a wrong `className`
 * and a `defaultVariants` that disagrees with the compiled runtime.
 */
export function defineChakraPreset<const Preset extends PandaPreset>(
  preset: Preset & ContractGaps<Preset>,
): Preset {
  return definePreset(preset) as Preset;
}

/**
 * Everything the contract asks for that this preset does not carry, shaped like the preset itself so
 * that TypeScript reports each gap at the property it belongs to.
 *
 * A gap is spelled as a **required property whose type is the sentence explaining it**, so the error
 * reads `Property 'badge' is missing … but required in type '{ badge: "this preset declares no
 * `badge` recipe …" }'`. A preset with no gaps intersects with `unknown` and is left alone.
 */
type ContractGaps<Preset> = TableGaps<Preset, "recipes", typeof recipeContract> &
  TableGaps<Preset, "slotRecipes", typeof slotRecipeContract>;

type TableGaps<Preset, Table extends string, Shapes extends Record<string, RecipeShape>> =
  RecipeGaps<Shapes, PropertyOf<PropertyOf<Preset, "theme">, Table>> extends infer Found
    ? Empty<Found> extends true
      ? unknown
      : { theme: { [Key in Table]: Found } }
    : never;

/**
 * Both mapped types are written out here rather than pulled into aliases of their own, and that is
 * for the error message: TypeScript prints a named generic alias by its name, so `MissingRecipes<…>`
 * would report a page of contract types where an anonymous one reports
 * `{ badge: "this preset declares no \`badge\` recipe …" }`.
 *
 * The first half is the recipes with no body at all, and it swallows the rest — the slots and values
 * they owe are not five more gaps apiece.
 */
type RecipeGaps<Shapes extends Record<string, RecipeShape>, Bodies> = {
  [Key in keyof Shapes as Key extends keyof Bodies
    ? never
    : Key]: `this preset declares no \`${Key &
    string}\` recipe, and our runtime computes its classes either way`;
} & {
  [Key in keyof Shapes as Key extends keyof Bodies
    ? Empty<BodyGaps<Shapes[Key], PropertyOf<Bodies, Key>, Key & string>> extends true
      ? never
      : Key
    : never]: BodyGaps<Shapes[Key], PropertyOf<Bodies, Key>, Key & string>;
};

type BodyGaps<Shape extends RecipeShape, Body, Key extends string> = SlotGaps<Shape, Body, Key> &
  VariantGaps<Shape, Body, Key>;

type SlotGaps<Shape extends RecipeShape, Body, Key extends string> =
  MissingSlots<Shape, Body> extends never
    ? unknown
    : {
        slots: {
          [Slot in MissingSlots<Shape, Body>]: `our runtime renders \`${Key}.${Slot &
            string}\`, and this preset styles nothing for it`;
        };
      };

/**
 * A slot list is an array, so a missing slot cannot be a missing *element* the way a missing variant
 * value is a missing key. It is required as a property **on** the array instead, which is what keeps
 * the error naming `itemBody` rather than printing the whole expected tuple.
 */
type MissingSlots<Shape extends RecipeShape, Body> = Exclude<
  Shape["slots"][number],
  PropertyOf<Body, "slots"> extends readonly (infer Slot)[] ? Slot : never
>;

/** Inlined and read back through `infer`, for the same error-message reason {@link RecipeGaps} is. */
type VariantGaps<Shape extends RecipeShape, Body, Key extends string> = {
  [Name in keyof Shape["variants"] as MissingValues<Shape, Body, Name> extends never
    ? never
    : Name]: {
    [Value in MissingValues<Shape, Body, Name>]: `our runtime emits the class for \`${Key}.${Name &
      string}=${Value & string}\`, and this preset declares no rule for it`;
  };
} extends infer Table
  ? Empty<Table> extends true
    ? unknown
    : { variants: Table }
  : never;

type MissingValues<Shape extends RecipeShape, Body, Name extends keyof Shape["variants"]> = Exclude<
  Shape["variants"][Name][number],
  keyof PropertyOf<PropertyOf<Body, "variants">, Name>
>;

/**
 * One property of a type that may not declare it, and the reason widened bodies pass this whole
 * file unread: a body Panda typed as `Record<string, RecipeConfig>` answers `keyof` with `string`
 * and reports nothing missing, while one written out as a literal reports every name it left out.
 *
 * `object` is the "declares no such property" answer because `keyof object` is `never`, which is
 * what every `Exclude` below reads. `Record<PropertyKey, never>` would invert them all.
 */
type PropertyOf<Source, Key extends PropertyKey> = Key extends keyof Source
  ? NonNullable<Source[Key]>
  : object;

type Empty<Gaps> = keyof Gaps extends never ? true : false;
