import { anatomy } from "@zag-js/radio-group";

/** The six names `createAnatomy("radio-group").parts(…)` declares, which the rename does not change. */
type SegmentGroupPart = "root" | "label" | "item" | "itemText" | "itemControl" | "indicator";

/**
 * `@zag-js/anatomy`'s `AnatomyPart`, minus the `selector` nothing here reads.
 *
 * Written out rather than imported: `AnatomyPart` lives in `@zag-js/anatomy`, which is
 * `@zag-js/radio-group`'s dependency and not ours, so naming it would mean adding a package for one
 * type. The annotation is what `isolatedDeclarations` wants — an inferred `parts` cannot be named
 * without that reference.
 */
interface AnatomyPartAttributes {
  attrs: Record<"data-scope" | "data-part", string>;
}

/**
 * The machine's anatomy under this component's name — `data-scope="segment-group"` where the
 * machine writes `data-scope="radio-group"`.
 *
 * A segmented control runs `@zag-js/radio-group`, so every prop getter stamps the machine's own
 * scope. Ark renames the anatomy and merges these attrs back over the getter's output, and Chakra
 * inherits that, so `data-scope="segment-group"` is what chakra-ui.com serves and what a consumer's
 * `[data-scope="segment-group"][data-part="item"]` rule already targets. `RadioCard` is the
 * contrast: it wraps Ark's *RadioGroup*, so its parts announce themselves as `radio-group` and ours
 * do too.
 *
 * **Safe because the machine never queries by scope.** `radio-group.dom.ts` finds every element it
 * touches by `id` — the root, each item, each hidden input, the indicator — so renaming the
 * attribute moves nothing the machine is looking for.
 *
 * `rename` is exported and typed API on `@zag-js/anatomy`'s `Anatomy`, which is the line
 * `CLAUDE.md`'s fourth hazard draws.
 */
export const parts: Record<SegmentGroupPart, AnatomyPartAttributes> = anatomy
  .rename("segment-group")
  .build();
