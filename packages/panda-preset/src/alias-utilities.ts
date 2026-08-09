import type { PropertyConfig } from "@pandacss/dev";
import basePreset from "@pandacss/preset-base";

/**
 * Chakra style-prop shorthands that Panda's own utilities do not already provide, each as an extra
 * name on the utility that already owns the property.
 *
 * The style-prop vocabulary is not a design choice made in our factory — it is whatever the
 * generated `isCssProperty` says, and that is generated from this config. Panda's base preset and
 * `@chakra-ui/panda-preset` share an author and most of a vocabulary, so the gap is small: **17 of
 * Chakra's 95 shorthands**, and every one of them is an alias on a property Panda already handles.
 * The alternative was reproducing Chakra's 241-entry utility table out of its Emotion runtime,
 * which would fork the seven utilities the Chakra preset does define and would owe an attribution
 * header on a file we then maintain against every Chakra release (`plan.md` §2.4).
 *
 * **A name is added here only if all three hold** (`plan.md` §2.2):
 *
 * 1. it is one of Chakra's 95 shorthands, and
 * 2. it is absent from the generated `isCssProperty` after `@pandacss/preset-base` + the Chakra
 *    preset, and
 * 3. it is expressible as a Panda utility — `property`, optional `values`, optional pure
 *    `transform` — without colliding with an existing Panda utility of different semantics.
 *
 * Anything that fails (3) would be a parity delta (`plan.md` §0.4) rather than an alias. Nothing
 * failed it: all 17 are extra names on an existing utility, so none changes how a value resolves.
 *
 * **The list is produced by `check:alias-coverage`, not guessed.** That check diffs Chakra's 95
 * shorthands against the generated `isCssProperty`, and its failing set *is* this table.
 *
 * One name is deliberately absent and always will be: `dir`. It is not among the 95, so condition 1
 * already excludes it — but 320 sites across the Zag machine set emit `dir` as a DOM attribute, and
 * the moment `dir` became a style prop the factory would fold it into a class on every part of
 * every component instead of setting it. `check:style-prop-collisions` asserts its absence rather
 * than trusting this paragraph (`testing.md` §6.4).
 */
const aliasesByProperty: Record<string, string[]> = {
  backgroundImage: ["bgImg"],
  backgroundPosition: ["bgPos"],
  mixBlendMode: ["blendMode"],
  borderEndEndRadius: ["borderBottomEndRadius"],
  borderEndStartRadius: ["borderBottomStartRadius"],
  borderStartStartRadius: ["borderTopStartRadius"],
  borderStartEndRadius: ["borderTopEndRadius"],
  borderInlineEndStyle: ["borderEndStyle"],
  borderInlineStartStyle: ["borderStartStyle"],
  columnGap: ["gapX"],
  rowGap: ["gapY"],
  listStyleImage: ["listStyleImg"],
  listStylePosition: ["listStylePos"],
  overscrollBehavior: ["overscroll"],
  overscrollBehaviorX: ["overscrollX"],
  overscrollBehaviorY: ["overscrollY"],
  textDecoration: ["textDecor"],
};

/**
 * Panda's own shorthand for a property, normalized to an array — `backgroundImage` already answers
 * to `bgImage`, `borderEndEndRadius` to `roundedEndEnd`.
 *
 * It is read off the imported preset rather than typed out beside our own names because
 * `utilities.extend` merges a property's config **shallowly**: writing `shorthand: ["bgImg"]` would
 * replace `"bgImage"` rather than join it, deleting a name Panda ships. Reading it means a Panda
 * release that renames its own shorthand carries that rename through instead of being clobbered.
 */
function pandaShorthandsFor(property: string): string[] {
  const utilities = basePreset.utilities as
    | Record<string, { shorthand?: string | string[] } | undefined>
    | undefined;
  const shorthand = utilities?.[property]?.shorthand;
  if (shorthand === undefined) {
    return [];
  }
  return Array.isArray(shorthand) ? shorthand : [shorthand];
}

export const aliasUtilities: Record<string, PropertyConfig> = Object.fromEntries(
  Object.entries(aliasesByProperty).map(([property, aliases]) => [
    property,
    { shorthand: [...pandaShorthandsFor(property), ...aliases] },
  ]),
);
