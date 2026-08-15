import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import { describe, expectTypeOf, it } from "vitest";
import type { PresetVariant, RecipeVariantOverrides } from "../preset-variants";

// Everything here is checked by `tsc --noEmit` (`pnpm typecheck`), not by running the file —
// `expectTypeOf` and `@ts-expect-error` both erase at runtime. The suite exists so the assertions
// live where a reader looks for them; the assertion that fails is a red typecheck, not a red run.

// The specifier under test. It has to be the package barrel rather than `"../preset-variants"`,
// because the barrel only *re-exports* the interface — augmenting through a re-export is the thing
// that could quietly declare a second, unrelated interface instead of merging. `PresetVariant` below
// is imported from the declaring module, so it reads the interface this block did not name: if the
// two failed to merge, every augmented assertion would resolve to `never`.
declare module "@chakra-ui-solid/core" {
  interface RecipeVariantOverrides {
    button: { variant: "dashed" };
  }
}

// Module augmentation is program-wide — there is no file-scoped form of it — so a single `tsc`
// program cannot hold both an augmented registry and an empty one. `"box"` stands in for the
// shipped state: a recipe the registry does not mention takes the same conditional branch that
// every recipe takes while the registry is empty.
type BoxVariant = ConditionalValue<"solid" | PresetVariant<"box", "variant">>;
type ButtonVariant = ConditionalValue<"solid" | PresetVariant<"button", "variant">>;

const acceptsBoxVariant = (value: BoxVariant) => value;
const acceptsButtonVariant = (value: ButtonVariant) => value;

describe("PresetVariant", () => {
  it("degrades to never for a recipe no preset declares", () => {
    // The library ships an empty registry: the only key in it is the one this file added.
    expectTypeOf<keyof RecipeVariantOverrides>().toEqualTypeOf<"button">();
    expectTypeOf<PresetVariant<"box", "variant">>().toEqualTypeOf<never>();

    acceptsBoxVariant("solid");
    // @ts-expect-error unioning `never` widens nothing, so the closed union stays closed
    acceptsBoxVariant("nope");
  });

  it("degrades to never for a variant key the preset does not mention", () => {
    expectTypeOf<PresetVariant<"button", "size">>().toEqualTypeOf<never>();
  });

  it("widens by exactly the values the preset declares", () => {
    expectTypeOf<PresetVariant<"button", "variant">>().toEqualTypeOf<"dashed">();

    acceptsButtonVariant("solid");
    acceptsButtonVariant("dashed");
    // @ts-expect-error a value no preset declared is still a type error
    acceptsButtonVariant("nope");
  });
});
