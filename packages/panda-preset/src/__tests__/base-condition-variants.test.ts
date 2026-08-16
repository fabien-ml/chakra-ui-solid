import chakraPreset from "@chakra-ui/panda-preset";
import basePreset from "@pandacss/preset-base";
import { describe, expect, it } from "vitest";
import { componentRecipes } from "../component-recipes";
import { chakraSolidPreset } from "../preset";

/**
 * Panda emits a recipe as `@layer recipes { @layer _base { …base… } …variant rules… }`, and
 * unlayered rules inside a layer beat that layer's nested sub-layers whatever their specificity —
 * so a flat declaration in `variants` defeats the same property under a *condition* in `base`. The
 * preset writes the condition into the variant values that defeat it, which puts
 * `.input--variant_outline:is(:invalid, …)` beside `.input--variant_outline` in one layer and hands
 * the decision back to specificity, exactly as the React runtime's merge into one class does.
 *
 * These assertions are over the derived theme data. What the *browser* makes of it is pinned in
 * `input.browser.test.tsx`, which reads computed `border-color` off a rendered element.
 */

type StyleObject = Record<string, unknown>;
type Extension = Record<string, { variants?: Record<string, Record<string, StyleObject>> }>;

const extension = chakraSolidPreset.theme?.extend as
  | { recipes?: Extension; slotRecipes?: Extension }
  | undefined;

const inheritedTheme = chakraPreset.theme as unknown as {
  recipes: Record<string, InheritedBody | undefined>;
  slotRecipes: Record<string, InheritedBody | undefined>;
};

type InheritedBody = { base: StyleObject; variants: StyleObject };

/** The body a correction was copied out of, wherever Chakra declares it. */
function inheritedBody(recipe: string): InheritedBody {
  const body = inheritedTheme.recipes[recipe] ?? inheritedTheme.slotRecipes[recipe];
  if (body === undefined) {
    throw new Error(`the inherited theme declares no recipe named \`${recipe}\``);
  }
  return body;
}

function variantsOf(recipe: string) {
  return (extension?.recipes?.[recipe] ?? extension?.slotRecipes?.[recipe])?.variants;
}

/** Every variant value carrying a correction, as `"<variantKey>.<value>"`. */
function correctedValues(recipe: string): string[] {
  return Object.entries(variantsOf(recipe) ?? {}).flatMap(([key, values]) =>
    Object.keys(values).map((value) => `${key}.${value}`),
  );
}

describe("the corrections written into an atomic recipe's variants", () => {
  it("gives every `input` variant the `_invalid` block that decides its border", () => {
    // The bug this exists for: `base._invalid.borderColor` losing to
    // `variants.variant.outline.borderColor`, so an invalid Input rendered in its resting colour.
    // `flushed` is the one that proves the *whole block* has to travel rather than the colliding
    // property — `base` spells the shorthand `borderColor` and `flushed` the longhand
    // `borderBottomColor`, so nothing about the two names says they meet.
    expect(correctedValues("input")).toEqual([
      "variant.outline",
      "variant.subtle",
      "variant.flushed",
    ]);

    for (const variant of ["outline", "subtle", "flushed"]) {
      expect(variantsOf("input")?.variant?.[variant]).toEqual({
        _invalid: { focusRingColor: "var(--error-color)", borderColor: "var(--error-color)" },
      });
    }
  });

  it("copies the block off the inherited body rather than transcribing it", () => {
    // A preset upgrade that changes `--error-color` has to arrive as a diff in the generated sheet,
    // not as this file quietly disagreeing with the theme it extends.
    expect(variantsOf("input")?.variant?.outline?._invalid).toBe(
      inheritedBody("input").base._invalid,
    );
    expect(variantsOf("textarea")?.variant?.flushed?._invalid).toBe(
      inheritedBody("textarea").base._invalid,
    );
  });

  it("repeats the same three values for `textarea`", () => {
    expect(correctedValues("textarea")).toEqual([
      "variant.outline",
      "variant.subtle",
      "variant.flushed",
    ]);
  });

  it("splits `checkmark` by what each variant key actually shadows", () => {
    // The variants set `borderColor`, so they take `_invalid`; the sizes set `boxSize`, so they take
    // `_icon`. `variant.plain` declares nothing outside its own `_checked` block and takes neither.
    expect(correctedValues("checkmark")).toEqual([
      "size.xs",
      "size.sm",
      "size.md",
      "size.lg",
      "variant.solid",
      "variant.outline",
      "variant.subtle",
      "variant.inverted",
    ]);

    expect(variantsOf("checkmark")?.variant?.solid).toEqual({
      _invalid: { colorPalette: "red", borderColor: "border.error" },
    });
    expect(variantsOf("checkmark")?.size?.md).toEqual({ _icon: { boxSize: "full" } });
  });

  it("leaves `radiomark`'s own dot scale alone", () => {
    // Panda emits variant rules in declaration order and these all land at equal specificity.
    // `variant.outline` respells `& .dot` to scale it to 0.6, and `size` and `filled` are declared
    // after `variant` — a copy of the base dot under either would be emitted later and take the 0.4
    // back. Neither shadows it in the first place: a `background` on the root cannot defeat one on
    // a descendant.
    expect(correctedValues("radiomark")).toEqual([
      "variant.solid",
      "variant.subtle",
      "variant.outline",
      "variant.inverted",
    ]);

    expect(variantsOf("radiomark")?.variant?.outline).toEqual({
      _invalid: { colorPalette: "red", borderColor: "red.500" },
    });
    expect(variantsOf("radiomark")?.variant?.subtle?.["& .dot"]).toBe(
      inheritedBody("radiomark").base["& .dot"],
    );
  });
});

describe("the corrections written into a slot recipe's variants", () => {
  it("reaches the slot the variant value declares and no other", () => {
    // `nativeSelect`'s variants style `field` alone, so `indicator`'s own `_invalid` — a different
    // slot, shadowed by nothing — is left where it is.
    expect(correctedValues("nativeSelect")).toEqual([
      "variant.outline",
      "variant.subtle",
      "variant.plain",
      "variant.ghost",
    ]);
    expect(Object.keys(variantsOf("nativeSelect")?.variant?.outline ?? {})).toEqual(["field"]);
  });

  it("gives a value only the conditions it shadows", () => {
    const field = inheritedBody("nativeSelect").base.field as StyleObject;

    // `outline` sets `borderColor` and `bg`, so it takes both blocks; `plain` and `ghost` set `bg`
    // alone and take the option background only.
    expect(variantsOf("nativeSelect")?.variant?.outline?.field).toEqual({
      _invalid: field._invalid,
      "& > option, & > optgroup": field["& > option, & > optgroup"],
    });
    expect(variantsOf("nativeSelect")?.variant?.plain?.field).toEqual({
      "& > option, & > optgroup": field["& > option, & > optgroup"],
    });
  });

  it("corrects the one `table` variant that gives a row a resting background", () => {
    expect(correctedValues("table")).toEqual(["variant.line"]);
    expect(variantsOf("table")?.variant?.line).toEqual({
      row: { _selected: { bg: "colorPalette.subtle" } },
    });
  });

  it("keeps a grouped outline Avatar's ring at the width `base` asks for", () => {
    // `variant.outline` sets a resting 1px border, which defeated `base.root`'s
    // `&[data-group-item]` 2px. `borderless` respells the same condition for itself and is declared
    // after `variant`, so its `0px` still wins and takes no correction.
    expect(correctedValues("avatar")).toEqual(["variant.outline"]);
    expect(variantsOf("avatar")?.variant?.outline).toEqual({
      root: { "&[data-group-item]": { borderWidth: "2px", borderColor: "bg" } },
    });
  });
});

describe("what the list leaves alone", () => {
  it("keeps each corrected recipe's variant keys in the order it declares them", () => {
    // The merge moves an overridden key to the end of the object, and two things read that order:
    // the generated recipe's `variantKeys` tuple, which is public API, and the order Panda emits
    // the rules in. A correction naming `variant` alone would push `radiomark`'s past `filled` and
    // hand a filled radiomark's background to `variant.subtle`.
    const corrected = [
      "input",
      "textarea",
      "checkmark",
      "radiomark",
      "nativeSelect",
      "table",
      "avatar",
    ];

    for (const recipe of corrected) {
      expect(Object.keys(variantsOf(recipe) ?? {})).toEqual(
        Object.keys(inheritedBody(recipe).variants),
      );
    }

    // A key carrying no correction is listed as `{}`, which merges to the body it already had.
    expect(variantsOf("radiomark")?.filled).toEqual({});
    expect(variantsOf("avatar")?.borderless).toEqual({});
  });

  it("declares `variants` for those seven recipes and nothing else", () => {
    const declared = { ...extension?.recipes, ...extension?.slotRecipes };
    const withVariants = Object.keys(declared).filter(
      (key) => declared[key]?.variants !== undefined,
    );

    // `container` is the eighth for an unrelated reason: it is the one recipe this package declares
    // a whole body for, because nothing upstream declares it, and those are its own variants.
    expect(withVariants).toEqual([
      "input",
      "textarea",
      "checkmark",
      "radiomark",
      "container",
      "avatar",
      "nativeSelect",
      "table",
    ]);
  });

  it("adds nothing to a recipe whose conditions no variant shadows", () => {
    // The generic version of this used to copy `base.content._open` into all 19 `dialog` size and
    // placement values, which emitted 57 copies of one `animation-duration` that could shadow
    // nothing. A size sets `maxWidth`; the condition sets a duration.
    expect(variantsOf("dialog")).toBeUndefined();
    expect(variantsOf("drawer")).toBeUndefined();
    expect(variantsOf("heading")).toBeUndefined();
    expect(extension?.recipes?.heading).toEqual({ jsx: ["Heading"] });
  });
});

/**
 * The scope: every recipe the root barrel's source reaches, generated from that source and verified
 * by `pnpm check:component-recipes`. Porting Checkbox adds `checkbox` to it, which is what makes the
 * assertion below start asking about a recipe nobody remembered to ask about.
 */
const shippedRecipes = componentRecipes["."] ?? [];

/** A base condition, and the variant value whose flat declarations reach into it. */
type ShadowedCondition = {
  recipe: string;
  slot: string | undefined;
  condition: string;
  variantKey: string;
  value: string;
  properties: string[];
};

type ReviewedCondition = Omit<ShadowedCondition, "properties" | "slot"> & {
  slot?: string;
  reason: string;
};

/**
 * The collisions the detector reports that are not real, each one verified against the recipe body
 * rather than waved off — a row here is a claim that the state still renders, so "not needed" is
 * never a reason.
 */
const reviewedShadowedConditions: ReviewedCondition[] = [
  {
    recipe: "radiomark",
    condition: "& .dot",
    variantKey: "variant",
    value: "solid",
    reason:
      "`solid` sets `borderWidth`/`borderColor` on the radiomark, and the block styles its `.dot` " +
      "child — a declaration on the root cannot defeat one on a descendant. Only the coarse border " +
      "family relates them at all: the dot's own border declaration is `borderRadius`.",
  },
  {
    recipe: "radiomark",
    condition: "& .dot",
    variantKey: "variant",
    value: "outline",
    reason:
      "Root against descendant, as with `solid`. `outline` also respells `& .dot` for itself to " +
      "scale the dot to 0.6, so copying the base block in would merge `scale: 0.4` over that and " +
      "shrink an outline radiomark's dot.",
  },
  {
    recipe: "radiomark",
    condition: "& .dot",
    variantKey: "filled",
    value: "true",
    reason:
      "`filled` sets `bg` on the root while the block sets it on the `.dot` descendant, so the root " +
      "declaration shadows nothing. `filled` is declared after `variant` too, so a copy here would " +
      "emit `scale: 0.4` after `variant.outline`'s `0.6` at equal specificity and take the smaller " +
      "dot back.",
  },
  {
    recipe: "nativeSelect",
    slot: "field",
    condition: "_invalid",
    variantKey: "variant",
    value: "plain",
    reason:
      "`focusRingWidth` writes `--focus-ring-width` and the block's `focusRingColor` writes " +
      "`--focus-ring-color`; only the shared `focusRing` family — which exists so that " +
      "`focusVisibleRing`, which does write that colour, is caught — conflates them. `plain` " +
      "declares no border colour either, so `_invalid`'s survives.",
  },
];

const OPAQUE = "*";

const isCondition = (key: string) =>
  key.startsWith("_") || key.includes("&") || key.startsWith("@");

function isStyleObject(value: unknown): value is StyleObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * `layerStyle: "disabled"` names a block rather than declaring one, and the blocks it names are
 * theme data — so they are expanded rather than treated as unknowable.
 *
 * Guessing instead is not free in the safe direction: `_disabled: { layerStyle: "disabled" }` sits
 * in most recipe bases, and a composition that collides with everything reported all 7 sizes and
 * all 3 variants of `input` against a block that sets `opacity` and `cursor`. Seventy-odd reviewed
 * rows is where a real one goes unnoticed. A name that resolves to nothing does stay opaque.
 */
const compositionScales = chakraPreset.theme as unknown as Record<
  "layerStyles" | "textStyles" | "animationStyles",
  Record<string, { value?: StyleObject } | undefined>
>;

const compositionScaleFor = {
  layerStyle: "layerStyles",
  textStyle: "textStyles",
  animationStyle: "animationStyles",
} as const;

function addDeclaration(into: Set<string>, property: string, value: unknown): void {
  const scale = compositionScaleFor[property as keyof typeof compositionScaleFor];
  if (scale === undefined) {
    into.add(property);
    return;
  }
  const composed = typeof value === "string" ? compositionScales[scale][value]?.value : undefined;
  if (composed === undefined) {
    into.add(OPAQUE);
    return;
  }
  declaredProperties(composed, into);
}

/** Everything a block sets, however deeply its own conditions nest it. */
function declaredProperties(styles: StyleObject, into = new Set<string>()): Set<string> {
  for (const [key, value] of Object.entries(styles)) {
    if (isCondition(key) && isStyleObject(value)) {
      declaredProperties(value, into);
      continue;
    }
    addDeclaration(into, key, value);
  }
  return into;
}

/** The unconditional half of a variant value — the declarations that beat a `_base` block. */
function flatDeclarations(styles: StyleObject): Set<string> {
  const properties = new Set<string>();
  for (const [key, value] of Object.entries(styles)) {
    if (isCondition(key) && isStyleObject(value)) {
      continue;
    }
    addDeclaration(properties, key, value);
  }
  return properties;
}

type ShorthandBag = Record<string, { shorthand?: string | string[] } | undefined>;

function shorthandBagsOf(preset: { utilities?: unknown }): ShorthandBag[] {
  const utilities = preset.utilities as (ShorthandBag & { extend?: ShorthandBag }) | undefined;
  return [utilities ?? {}, utilities?.extend ?? {}];
}

/** `bg` → `background`, `px` → `paddingInline`: read off the utilities rather than listed here. */
const canonicalProperty = new Map<string, string>(
  [...shorthandBagsOf(basePreset), ...shorthandBagsOf(chakraPreset)]
    .flatMap((bag) => Object.entries(bag))
    .flatMap(([property, config]) =>
      [config?.shorthand ?? []].flat().map((name) => [name, property] as const),
    ),
);

const EDGE_WORDS = new Set([
  "top",
  "bottom",
  "left",
  "right",
  "start",
  "end",
  "inline",
  "block",
  "x",
  "y",
  "visible",
]);

/**
 * The family two declarations must share to be treated as colliding: the canonical property's first
 * word, with the edge and axis words dropped, so `borderBottomColor` meets `borderColor` and `px`
 * meets `padding`.
 *
 * Deliberately coarse — `borderWidth` lands with `borderColor`, and `focusVisibleRing` with
 * `focusRingColor`, which it really does overwrite. A collision that is not one costs a row in
 * `reviewedShadowedConditions`; one that is missed is a state that renders silently unstyled.
 */
function familyOf(property: string): string {
  const words = (canonicalProperty.get(property) ?? property)
    .replace(/^-+/, "")
    .split(/(?=[A-Z])|-/)
    .map((word) => word.toLowerCase())
    .filter(Boolean);
  return words.find((word) => !EDGE_WORDS.has(word)) ?? property;
}

function collides(declaration: string, blockProperty: string): boolean {
  if (declaration === OPAQUE || blockProperty === OPAQUE) {
    return true;
  }
  return declaration === blockProperty || familyOf(declaration) === familyOf(blockProperty);
}

function shadowedConditionsIn(recipe: string): ShadowedCondition[] {
  const atomic = inheritedTheme.recipes[recipe];
  const body = atomic ?? inheritedTheme.slotRecipes[recipe];
  if (body === undefined) {
    // `container` is the one shipped recipe with no inherited body: this package writes it, and a
    // body written here is not something a preset defect can shadow.
    return [];
  }

  // `collapsible` and `skipNavLink` declare no variants at all, so there is nothing to defeat their
  // base with.
  const variants = (body.variants ?? {}) as Record<string, Record<string, StyleObject> | undefined>;
  const slots = atomic === undefined ? Object.keys(body.base ?? {}) : [undefined];
  const shadowed: ShadowedCondition[] = [];

  for (const slot of slots) {
    const slotBase = slot === undefined ? body.base : body.base[slot];
    if (!isStyleObject(slotBase)) {
      continue;
    }

    for (const [condition, block] of Object.entries(slotBase)) {
      if (!isCondition(condition) || !isStyleObject(block)) {
        continue;
      }
      const blockProperties = [...declaredProperties(block)];

      for (const [variantKey, values] of Object.entries(variants)) {
        for (const [value, styles] of Object.entries(values ?? {})) {
          const declared = slot === undefined ? styles : styles[slot];
          if (!isStyleObject(declared)) {
            continue;
          }
          const properties = [...flatDeclarations(declared)].filter((declaration) =>
            blockProperties.some((blockProperty) => collides(declaration, blockProperty)),
          );
          if (properties.length > 0) {
            shadowed.push({ recipe, slot, condition, variantKey, value, properties });
          }
        }
      }
    }
  }

  return shadowed;
}

/** The conditions the preset's correction already writes into that variant value's slot. */
function correctedConditionsFor(row: ShadowedCondition): string[] {
  const value = variantsOf(row.recipe)?.[row.variantKey]?.[row.value];
  const styles = row.slot === undefined ? value : (value?.[row.slot] as StyleObject | undefined);
  return Object.keys(styles ?? {}).filter(isCondition);
}

function isReviewOf(review: ReviewedCondition, row: ShadowedCondition): boolean {
  return (
    review.recipe === row.recipe &&
    review.slot === row.slot &&
    review.condition === row.condition &&
    review.variantKey === row.variantKey &&
    review.value === row.value
  );
}

function describeShadow(row: ShadowedCondition): string {
  const target = row.slot === undefined ? row.recipe : `${row.recipe}.${row.slot}`;
  const declarations = row.properties.join(", ");
  return `${target} base["${row.condition}"] loses to ${row.variantKey}.${row.value}, which sets ${declarations}`;
}

const FIX_GUIDANCE = `A shipped recipe declares a base condition that one of its own variant values defeats.

Panda emits a recipe as \`@layer recipes { @layer _base { …base… } …variant rules… }\`, and an
unlayered variant rule beats that nested \`_base\` layer whatever the specificity — so the state
renders in its resting style and nothing reports it, the way an invalid Input rendered in its
resting border colour. Each line below needs one of two things:

  • The correction, in \`packages/panda-preset/src/preset.ts\`: add the condition to that variant
    value in \`shadowedBaseConditions\` (atomic recipes) or \`shadowedSlotBaseConditions\` (slot
    recipes), spelled \`conditionsOf(<recipe>.base, "<condition>")\` — or
    \`conditionsOf(<recipe>.base.<slot>, …)\` — so the declarations stay read off the inherited
    body. Mind the ordering note above those tables: variant keys are emitted in declaration
    order at equal specificity, so a correction on a later key beats an earlier key's deliberate
    value.

  • Or a review, in this file: a \`{ recipe, slot, condition, variantKey, value, reason }\` row in
    \`reviewedShadowedConditions\` saying why the collision is not real. The test over-reports on
    purpose — \`borderWidth\` is compared against \`borderColor\`, and a declaration on the root
    against one on a descendant — so some of what it names is not a shadow.

Neither corrected nor reviewed`;

describe("the base conditions a shipped recipe loses to its own variants", () => {
  it("corrects or reviews every one of them", () => {
    const uncovered = shippedRecipes
      .flatMap((recipe) => shadowedConditionsIn(recipe))
      .filter((row) => !correctedConditionsFor(row).includes(row.condition))
      .filter((row) => !reviewedShadowedConditions.some((review) => isReviewOf(review, row)));

    expect(uncovered.map(describeShadow), FIX_GUIDANCE).toEqual([]);
  });

  it("keeps no review of a collision the recipes no longer have", () => {
    const reported = shippedRecipes.flatMap((recipe) => shadowedConditionsIn(recipe));
    const stale = reviewedShadowedConditions.filter(
      (review) => !reported.some((row) => isReviewOf(review, row)),
    );

    const guidance =
      "A reviewed row names a collision nothing reports any more — the recipe changed underneath " +
      "it, or the row's keys are misspelled and it is reviewing nothing. Delete it, or fix the keys.";
    expect(
      stale.map(
        (review) => `${review.recipe} ${review.condition} ${review.variantKey}.${review.value}`,
      ),
      guidance,
    ).toEqual([]);
  });

  it("widens with the barrel rather than with anyone's memory", () => {
    // The 13 recipes known to carry the same defect that nothing has ported yet. They are out of
    // scope because `componentRecipes["."]` does not name them — not because this file does — and
    // `checkbox` proves it: it reports collisions today and is simply not asked about.
    const unported = [
      "checkbox",
      "checkboxCard",
      "colorPicker",
      "combobox",
      "datePicker",
      "numberInput",
      "pinInput",
      "progress",
      "radioCard",
      "radioGroup",
      "select",
      "slider",
      "tagsInput",
    ];

    expect(unported.filter((recipe) => shippedRecipes.includes(recipe))).toEqual([]);
    expect(shadowedConditionsIn("checkbox").length).toBeGreaterThan(0);
  });
});
