import { type Accessor, createMemo } from "solid-js";
import { applyRegisteredDefaults } from "./recipe-defaults";

/**
 * The shape Panda generates for an **atomic** recipe — `button`, `heading`, `badge`. Calling it
 * with variant props returns one class string.
 *
 * Declared structurally rather than imported, because every generated recipe has its own named
 * interface (`ButtonRecipe`, `HeadingRecipe`, …) and there is no shared base to import.
 */
export interface RecipeFn<Variants> {
  (variantProps?: Variants): string;
  /**
   * The recipe's key in the consumer's config, and what `registerRecipeDefaults` records against.
   * Optional only because Panda's generated `.d.ts` omits it — every recipe its generator emits
   * carries the property at runtime, so requiring it here would leave `ButtonRecipe` and every
   * sibling failing to satisfy this interface.
   */
  __name__?: string;
  variantKeys: Array<keyof Variants & string>;
  splitVariantProps<Props extends Variants>(props: Props): [Variants, Record<string, unknown>];
}

/**
 * The shape Panda generates for a **slot** recipe — `dialog`, `menu`, `accordion`. Calling it
 * returns one class string **per slot**.
 */
export interface SlotRecipeFn<Slot extends string, Variants> {
  (variantProps?: Variants): Record<Slot, string>;
  /**
   * The recipe's key in the consumer's config, and what `registerRecipeDefaults` records against.
   * Optional only because Panda's generated `.d.ts` omits it — every recipe its generator emits
   * carries the property at runtime, so requiring it here would leave `ButtonRecipe` and every
   * sibling failing to satisfy this interface.
   */
  __name__?: string;
  variantKeys: Array<keyof Variants & string>;
  splitVariantProps<Props extends Variants>(props: Props): [Variants, Record<string, unknown>];
}

export interface RecipeClassOptions<Variants> {
  variantProps: Accessor<Variants>;
  /** Opt out of the theme styles entirely — the class becomes `undefined` and only style props remain. */
  unstyled?: Accessor<boolean | undefined>;
}

/**
 * Resolve an atomic recipe into the class `renderStyled`'s `recipeClass` seam expects.
 *
 * There is no runtime system object here. Chakra resolves a recipe through `useRecipe()` →
 * `useChakraContext()` → `sys.cva(...)`; we import the generated function directly, so the variant
 * **API** is Chakra's — same variant names, same defaults, same `unstyled` opt-out — and only the
 * resolution differs (`plan.md` §3.6).
 *
 * The one thing the imported function cannot know is the consumer's own `defaultVariants`, since it
 * was compiled against ours. `applyRegisteredDefaults` supplies them, and it is read **inside** the
 * memo so a re-resolve picks up a registration that happened after this component's module loaded.
 */
export function createRecipeClass<Variants>(
  recipe: RecipeFn<Variants>,
  options: RecipeClassOptions<Variants>,
): Accessor<string | undefined> {
  return createMemo(() =>
    options.unstyled?.() === true
      ? undefined
      : recipe(applyRegisteredDefaults(recipe.__name__, options.variantProps())),
  );
}

/**
 * Resolve a slot recipe **once**, on the Root, into the per-slot class map every part component
 * then reads from context.
 *
 * Once rather than per part, for two reasons that are not the same: N parts each calling `sva()` is
 * N times the work for one answer, and it puts N copies of the variant-reading logic in the tree,
 * where they can disagree. It stays a memo because a variant prop can change — `size` is a prop
 * like any other.
 *
 * `unstyled` here is the Root-level opt-out and empties every slot. A part can also opt out for
 * itself by passing `unstyled` to `renderStyled`, which suppresses its own `recipeClass`
 * (`component-blueprint.md` §4.4).
 *
 * `applyRegisteredDefaults` supplies the consumer's own `defaultVariants`, which the precompiled
 * recipe cannot see, and one registered value reaches every slot because the recipe resolves once.
 */
export function createSlotClasses<Slot extends string, Variants>(
  recipe: SlotRecipeFn<Slot, Variants>,
  options: RecipeClassOptions<Variants>,
): Accessor<Record<Slot, string>> {
  return createMemo(() => {
    const slots = recipe(applyRegisteredDefaults(recipe.__name__, options.variantProps()));
    if (options.unstyled?.() !== true) {
      return slots;
    }
    return Object.fromEntries(Object.keys(slots).map((slot) => [slot, ""])) as Record<Slot, string>;
  });
}
