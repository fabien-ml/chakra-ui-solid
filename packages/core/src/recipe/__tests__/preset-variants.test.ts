import type { ConditionalValue, SystemStyleObject } from "@chakra-ui-solid/styled-system/types";
import { describe, expectTypeOf, it } from "vitest";
import type { HTMLChakraProps } from "../../factory/factory";
import type { PresetVariant, PresetVariantProps, RecipeVariantOverrides } from "../preset-variants";

// Everything here is checked by `tsc --noEmit` (`pnpm typecheck`), not by running the file —
// `expectTypeOf` and `@ts-expect-error` both erase at runtime. The suite exists so the assertions
// live where a reader looks for them; the assertion that fails is a red typecheck, not a red run.

/**
 * The shape `panda codegen` actually writes into a `RecipeVariantOverrides` row, reproduced here
 * because it is the shape the assertions below turn on and none of it is obvious: a generated
 * `*VariantProps` maps each key to `ConditionalValue<…> | undefined`, whose object arm has nothing
 * but optional members — and a bare string satisfies a type like that.
 */
interface GeneratedVariant {
  size: "jumbo";
  tone: "brand";
}
type GeneratedVariantProps = {
  [Key in keyof GeneratedVariant]?: ConditionalValue<GeneratedVariant[Key]> | undefined;
};

// The specifier under test. It has to be the package barrel rather than `"../preset-variants"`,
// because the barrel only *re-exports* the interface — augmenting through a re-export is the thing
// that could quietly declare a second, unrelated interface instead of merging. The names below are
// imported from their declaring modules, so they read the interface this block did not name: if the
// two failed to merge, every augmented assertion would resolve to `never` or to `{}`.
declare module "@chakra-ui-solid/core" {
  interface RecipeVariantOverrides {
    /** Hand-written, the form the JSDoc documents for anyone not generating their types. */
    button: { variant: "dashed" };
    /** Generated, the form the hook writes. */
    input: GeneratedVariantProps;
  }
}

// The other two seams are Panda's own interfaces, augmented here at the module that declares them.
// `chakra-ui-solid` is the specifier a consumer names and it re-exports both; that hop is proved by
// the consumer fixture, which type-checks a real `panda codegen` output against the real barrel.
declare module "@chakra-ui-solid/styled-system/types" {
  interface SystemProperties {
    elevation?: ConditionalValue<"low" | "high">;
  }
  interface Conditions {
    _supportsGrid: string;
  }
}

// Module augmentation is program-wide — there is no file-scoped form of it — so a single `tsc`
// program cannot hold both an augmented registry and an empty one. `"box"` stands in for the
// shipped state: a recipe the registry does not mention takes the same conditional branch that
// every recipe takes while the registry is empty.
type BoxVariant = ConditionalValue<"solid" | PresetVariant<"box", "variant">>;
type ButtonVariant = ConditionalValue<"solid" | PresetVariant<"button", "variant">>;
type InputSize = ConditionalValue<"sm" | PresetVariant<"input", "size">>;

const acceptsBoxVariant = (value: BoxVariant) => value;
const acceptsButtonVariant = (value: ButtonVariant) => value;
const acceptsInputSize = (value: InputSize) => value;
const acceptsDivProps = (props: HTMLChakraProps<"div">) => props;

describe("PresetVariant", () => {
  it("degrades to never for a recipe the augmentation does not declare", () => {
    // The library ships an empty registry: the only keys in it are the two this file added.
    expectTypeOf<keyof RecipeVariantOverrides>().toEqualTypeOf<"button" | "input">();
    expectTypeOf<PresetVariant<"box", "variant">>().toEqualTypeOf<never>();

    acceptsBoxVariant("solid");
    // @ts-expect-error unioning `never` widens nothing, so the closed union stays closed
    acceptsBoxVariant("nope");
  });

  it("degrades to never for a variant key the augmentation does not mention", () => {
    expectTypeOf<PresetVariant<"button", "size">>().toEqualTypeOf<never>();
  });

  it("widens by exactly the values the augmentation declares", () => {
    expectTypeOf<PresetVariant<"button", "variant">>().toEqualTypeOf<"dashed">();

    acceptsButtonVariant("solid");
    acceptsButtonVariant("dashed");
    // @ts-expect-error an undeclared value is still a type error
    acceptsButtonVariant("nope");
  });

  it("keeps the union closed against a generated row, whose value type is conditional", () => {
    // The whole reason this resolves with `Extract` and not `&`. `ConditionalValue<"jumbo">` has an
    // all-optional object arm, and `"nope" & { _hover?: … }` is a type `"nope"` satisfies — so
    // intersecting would have opened `size` to every string the moment a generated row landed, and
    // the assertion below is what says it did not.
    expectTypeOf<PresetVariant<"input", "size">>().toEqualTypeOf<"jumbo">();

    acceptsInputSize("sm");
    acceptsInputSize("jumbo");
    // @ts-expect-error the generated row widened by one value, not by `string`
    acceptsInputSize("nope");
  });
});

describe("PresetVariantProps", () => {
  it("is empty for a recipe the augmentation does not declare", () => {
    expectTypeOf<PresetVariantProps<"box">>().toEqualTypeOf<Record<never, never>>();
  });

  it("carries every key the augmented row has, including one no component declares", () => {
    const accepts = (props: PresetVariantProps<"input">) => props;

    accepts({ tone: "brand" });
    accepts({ tone: { _hover: "brand" } });
    // @ts-expect-error the key exists, and its values are still the recipe's
    accepts({ tone: "nope" });
    // @ts-expect-error a key the recipe does not have is not a prop
    accepts({ nope: "brand" });
  });
});

describe("the styling surface", () => {
  it("takes a custom utility as a style prop", () => {
    acceptsDivProps({ elevation: "high" });
    // @ts-expect-error the values are the ones their utility declares
    acceptsDivProps({ elevation: 4 });
  });

  it("takes a custom condition as a style-object prop", () => {
    acceptsDivProps({ _supportsGrid: { display: "grid" } });
    // @ts-expect-error a condition carries styles, not a value
    acceptsDivProps({ _supportsGrid: "grid" });
  });

  // Everything below is what augmenting Panda's own interfaces buys over a pair of ours mixed into
  // the JSX props: a style key is legal wherever a style object is, and there is no depth at which
  // the vocabulary reverts to the one frozen at our build.
  it("takes both inside the `css` prop", () => {
    acceptsDivProps({ css: { elevation: "high", _supportsGrid: { display: "grid" } } });
    // @ts-expect-error still a closed vocabulary — `css` did not open it
    acceptsDivProps({ css: { elevatian: "high" } });
  });

  it("takes both inside another condition, at any depth", () => {
    acceptsDivProps({ _hover: { elevation: "high" } });
    acceptsDivProps({ _hover: { _supportsGrid: { elevation: "low" } } });
    acceptsDivProps({ css: { _supportsGrid: { _hover: { elevation: "high" } } } });
    // @ts-expect-error the values are the ones their utility declares, however deep
    acceptsDivProps({ _hover: { _supportsGrid: { elevation: 4 } } });
  });

  it("takes both inside a recipe body", () => {
    const acceptsStyleObject = (styles: SystemStyleObject) => styles;

    acceptsStyleObject({ elevation: "high", _supportsGrid: { elevation: "low" } });
    // @ts-expect-error a condition carries styles, not a value
    acceptsStyleObject({ _supportsGrid: "grid" });
  });
});
