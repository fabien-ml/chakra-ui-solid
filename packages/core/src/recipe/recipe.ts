import { type Accessor, createMemo, untrack } from "solid-js";
import { type SystemContext, useChakraContext } from "../system/system";

/**
 * The shape Panda generates for an **atomic** recipe — `button`, `heading`, `badge`. Calling it
 * with variant props returns one class string.
 *
 * Declared structurally rather than imported, because every generated recipe has its own named
 * interface (`ButtonRecipe`, `HeadingRecipe`, …) and there is no shared base to import.
 */
export interface RecipeFn<Variants> {
  (variantProps?: Variants): string;
  variantKeys: Array<keyof Variants & string>;
  splitVariantProps<Props extends Variants>(props: Props): [Variants, Record<string, unknown>];
}

/**
 * The shape Panda generates for a **slot** recipe — `dialog`, `menu`, `accordion`. Calling it
 * returns one class string **per slot**.
 */
export interface SlotRecipeFn<Slot extends string, Variants> {
  (variantProps?: Variants): Record<Slot, string>;
  variantKeys: Array<keyof Variants & string>;
  splitVariantProps<Props extends Variants>(props: Props): [Variants, Record<string, unknown>];
}

export interface RecipeClassOptions<Variants> {
  variantProps: Accessor<Variants>;
  /** Opt out of the theme styles entirely — the class becomes `undefined` and only style props remain. */
  unstyled?: Accessor<boolean | undefined>;
}

/** How a key the system does not carry reads, wherever it is resolved. */
function missingRecipe(key: string): Error {
  return new Error(
    `The <ChakraProvider> above this component supplies no "${key}" recipe. Add it to your Panda ` +
      "config under `theme.extend.recipes` or `theme.extend.slotRecipes` and re-run `panda " +
      "codegen`, or drop the component that needs it.",
  );
}

/**
 * A key that resolved to nothing is a **throw**, where the React version falls back to an empty
 * `cva({})` and renders the element unstyled.
 *
 * That fallback is right for `useRecipe({ key })` in an app, where any key is fair game. It is
 * wrong here: the keys are ours, one per component, and a system missing one is a system the
 * component cannot be styled by. Silently unstyled is the exact failure the provider exists to
 * remove, so it is said out loud instead.
 */
function requireRecipe<Variants>(system: SystemContext, key: string): RecipeFn<Variants> {
  const recipe = system.getRecipeFn<Variants>(key);
  if (recipe === undefined) {
    throw missingRecipe(key);
  }
  return recipe;
}

function requireSlotRecipe<Slot extends string, Variants>(
  system: SystemContext,
  key: string,
): SlotRecipeFn<Slot, Variants> {
  const recipe = system.getSlotRecipeFn<Slot, Variants>(key);
  if (recipe === undefined) {
    throw missingRecipe(key);
  }
  return recipe;
}

/**
 * Resolve an atomic recipe into the class `renderStyled`'s `recipeClass` seam expects.
 *
 * ```ts
 * const recipeClass = createRecipeClass("button", {
 *   variantProps: () => pickVariantProps(merged, variantKeys),
 * });
 * ```
 *
 * The key is looked up on the `<ChakraProvider>` above — Chakra's own `sys.getRecipeFn(key)` — so
 * this must be called from a component body, and so a consumer's own `defaultVariants`, added
 * variants and renamed classes are simply what the recipe *is* rather than something to reconcile
 * against a precompiled copy of it.
 */
export function createRecipeClass<Variants>(
  key: string,
  options: RecipeClassOptions<Variants>,
): Accessor<string | undefined> {
  const system = useChakraContext();

  // Resolved here as well as in the memo, and the duplicate lookup is the point: a key the system
  // does not carry throws while the component is being **constructed**, where the stack names it and
  // an error boundary above it contains one failure. Left to the memo alone the same throw waits for
  // the first read of the class — inside the element's own computation, after the element exists,
  // re-raised on every later read, and answered by SolidJS halting the reactive graph for the whole
  // page (`[REACTIVITY_HALTED]`). That is a loud failure turned into a mute one.
  untrack(() => requireRecipe<Variants>(system(), key));

  return createMemo(() =>
    options.unstyled?.() === true
      ? undefined
      : // Read inside the memo, so a `<ChakraProvider>` handed a signal re-resolves the recipe
        // rather than leaving the element on the system it first rendered under.
        requireRecipe<Variants>(system(), key)(options.variantProps()),
  );
}

/**
 * Resolve a slot recipe **once**, on the Root, into the per-slot class map every part component
 * then reads from context.
 *
 * Once rather than per part, for two reasons that are not the same: N parts each calling the recipe
 * is N times the work for one answer, and it puts N copies of the variant-reading logic in the tree,
 * where they can disagree. It stays a memo because a variant prop can change — `size` is a prop
 * like any other.
 *
 * `unstyled` here is the Root-level opt-out and empties every slot. A part can also opt out for
 * itself by passing `unstyled` to `renderStyled`, which suppresses its own `recipeClass`
 * (`component-blueprint.md` §4.4).
 */
export function createSlotClasses<Slot extends string, Variants>(
  key: string,
  options: RecipeClassOptions<Variants>,
): Accessor<Record<Slot, string>> {
  const system = useChakraContext();

  // Construction time, for {@link createRecipeClass}'s reason.
  untrack(() => requireSlotRecipe<Slot, Variants>(system(), key));

  return createMemo(() => {
    const slots = requireSlotRecipe<Slot, Variants>(system(), key)(options.variantProps());
    if (options.unstyled?.() !== true) {
      return slots;
    }
    return Object.fromEntries(Object.keys(slots).map((slot) => [slot, ""])) as Record<Slot, string>;
  });
}

/**
 * The variant names the system's own recipe accepts — what a component partitions its props by.
 *
 * ```ts
 * const variantKeys = useRecipeVariantKeys<ButtonProps>("button");
 * const elementProps = omit(merged, ...variantKeys);
 * ```
 *
 * These used to be hand-written tuples typed against the generated variants, which is why
 * `<Button tone="brand">` reached the DOM as an attribute for a consumer who had added a `tone`
 * variant: the recipe accepted it and the tuple did not know about it. Asking the recipe is what
 * makes an added variant a variant.
 *
 * `Props` is the bag these keys will be taken *out of*, and naming it is what lets the result go
 * straight into `omit`, whose keys are constrained to that bag's own. It narrows nothing — `Omit<T,
 * K>` with a key **array** subtracts no member, so the literal tuples this replaces did not narrow
 * either.
 *
 * A context read, so it belongs in a component body — the same place the recipe it names is
 * resolved, and the same place a missing key throws.
 */
export function useRecipeVariantKeys<Props extends object = Record<string, unknown>>(
  key: string,
): (keyof Props & string)[] {
  const system = useChakraContext();

  // Untracked, and the same trade `renderStyled` makes with its own key partition: `omit` takes a
  // fixed list of names, so this decides the element's attribute set once and for the life of the
  // node. A system swapped at runtime restyles the element rather than re-partitioning its props.
  // Tracking the read would only turn that into a `[STRICT_READ_UNTRACKED]` warning with the same
  // outcome.
  return untrack(() => {
    // Either lookup answers a generated system, which emits both kinds into one namespace. Both are
    // asked because a system assembled by hand may keep them apart, the way the React version's
    // `theme.recipes` and `theme.slotRecipes` are two objects.
    const recipe =
      system().getRecipeFn<Record<string, unknown>>(key) ??
      system().getSlotRecipeFn<string, Record<string, unknown>>(key);
    if (recipe === undefined) {
      throw missingRecipe(key);
    }
    return recipe.variantKeys as (keyof Props & string)[];
  });
}

/**
 * The variant half of a props bag, as the object a recipe takes.
 *
 * Called **inside** a `variantProps` accessor, never beside it: each key is read where the memo can
 * track it, so a changed `size` re-resolves. Never Panda's generated `splitVariantProps`, which
 * destructures the whole bag eagerly and so snapshots every style prop passed alongside a variant.
 *
 * A key the caller never set arrives as a *present* `undefined`, which Panda's own `compact` drops
 * before the recipe's `defaultVariants` fill it — so this reads the same as omitting the key.
 */
export function pickVariantProps<Variants>(
  props: object,
  variantKeys: readonly string[],
): Variants {
  const bag = props as Record<string, unknown>;
  return Object.fromEntries(variantKeys.map((key) => [key, bag[key]])) as Variants;
}
