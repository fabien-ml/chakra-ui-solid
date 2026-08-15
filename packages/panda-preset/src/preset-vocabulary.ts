import chakraPreset from "@chakra-ui/panda-preset";
import basePreset from "@pandacss/preset-base";
import { chakraSolidPreset } from "./preset";

/**
 * A preset's `utilities` / `conditions` bag. Panda types the first as a union of shapes that varies
 * per property and the second as a string map with an `extend` escape, so both are narrowed once
 * here rather than at each read, the way the recipe registry narrows a preset's `theme`.
 */
type NamedBag = Record<string, { shorthand?: string | string[] } | undefined> & {
  extend?: Record<string, { shorthand?: string | string[] } | undefined>;
};

type VocabularySource = { utilities?: unknown; conditions?: unknown };

/** Ours, Chakra's and Panda's base — the whole chain `chakraSolidPreset` composes. */
const PRESET_CHAIN: VocabularySource[] = [basePreset, chakraPreset, chakraSolidPreset];

/**
 * Every style-prop name our published declarations already carry.
 *
 * It exists for one subtraction: the typegen writes a `CustomStyleProps` row per `utilities` entry a
 * consumer's config adds, and a row for a name Panda already generated into `SystemProperties` is a
 * clash between two interfaces rather than a new prop. Extending `bg` is changing a prop that
 * exists; adding `elevation` is not, and only the second belongs in the augmentation.
 *
 * **Shorthands count.** A utility declares extra names for itself (`background` answers to `bg`),
 * and those reach `SystemProperties` exactly as the property does — so a consumer whose new utility
 * is called `bg` is redeclaring one of ours whether or not `bg` is a key in anyone's table.
 *
 * Computed rather than listed, so a Chakra or Panda release that adds a utility is covered by the
 * version bump alone — the reason the recipe registry reads its keys off the preset too.
 */
export function declaredStyleProps(): Set<string> {
  const names = new Set<string>();
  for (const preset of PRESET_CHAIN) {
    for (const [name, utility] of entriesOf(preset.utilities)) {
      names.add(name);
      for (const shorthand of [utility?.shorthand ?? []].flat()) {
        names.add(shorthand);
      }
    }
  }
  return names;
}

/**
 * Every condition our published declarations already carry, for the same subtraction.
 *
 * Breakpoint conditions (`md`, `mdDown`, `smToLg`) are deliberately absent and need no entry: Panda
 * derives those from `theme.breakpoints` rather than from `conditions`, so nothing a consumer writes
 * under `conditions` can collide with one.
 */
export function declaredConditions(): Set<string> {
  const names = new Set<string>();
  for (const preset of PRESET_CHAIN) {
    for (const [name] of entriesOf(preset.conditions)) {
      names.add(name);
    }
  }
  return names;
}

/**
 * A preset's own entries plus the ones under its `extend`, which is the spelling a preset uses to
 * add to the presets it declares — ours writes all 19 of its utilities that way.
 */
function entriesOf(bag: unknown): Array<[string, { shorthand?: string | string[] } | undefined]> {
  const { extend, ...own } = (bag ?? {}) as NamedBag;
  return [...Object.entries(own), ...Object.entries(extend ?? {})];
}
