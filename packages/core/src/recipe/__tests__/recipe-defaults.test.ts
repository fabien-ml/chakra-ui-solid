import { button, dialog } from "@chakra-ui-solid/styled-system/recipes";
import { createRoot, createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { createRecipeClass, createSlotClasses } from "../recipe";
import { registerRecipeDefaults } from "../recipe-defaults";

// Strings are the legitimate subject here, for the reason `recipe.test.ts` states: these are pure
// functions over the generated recipes and no element exists in the `unit` project. That a
// registered default reaches a real stylesheet is measured in computed pixels instead —
// `button.browser.test.tsx` for the atomic path, `slot-recipe-context.browser.test.tsx` for slots.

/**
 * A recipe out of a **consumer's** generated output, which is what `registerRecipeDefaults` is
 * handed: the same two properties Panda emits, over their `defaultVariants` rather than ours. An
 * atomic recipe carries the `__ignore__` base-class sentinel under its own name; a slot recipe
 * does not.
 */
function generatedRecipe(
  name: string,
  defaultVariants: Record<string, string>,
  kind: "atomic" | "slot" = "atomic",
) {
  return {
    __name__: name,
    getVariantProps: (variants: Record<string, unknown> = {}) =>
      kind === "atomic"
        ? { [name]: "__ignore__", ...defaultVariants, ...variants }
        : { ...defaultVariants, ...variants },
  };
}

// The registry is module-global, so anything registered here outlives the test that did it.
afterEach(() => registerRecipeDefaults({}));

const resolve = <Variants>(
  recipe: Parameters<typeof createRecipeClass<Variants>>[0],
  variantProps: Variants,
): string | undefined => {
  let className: string | undefined;
  createRoot((dispose) => {
    className = createRecipeClass(recipe, { variantProps: () => variantProps })();
    dispose();
  });
  return className;
};

describe("registerRecipeDefaults", () => {
  it("takes the whole recipes namespace and ignores whatever is not a recipe", () => {
    // A consumer passes `import * as recipes`, which also carries helpers, constants and anything
    // else their generated barrel happens to export.
    expect(() =>
      registerRecipeDefaults({
        button: generatedRecipe("button", { size: "sm" }),
        someHelper: () => "not a recipe",
        someConstant: "neither",
        nothing: null,
      }),
    ).not.toThrow();

    expect(resolve(button, { size: undefined, variant: undefined })).toBe(button({ size: "sm" }));
  });

  it("replaces the previous table rather than accumulating onto it", () => {
    registerRecipeDefaults({ button: generatedRecipe("button", { size: "sm" }) });
    registerRecipeDefaults({});

    expect(resolve(button, { size: undefined, variant: undefined })).toBe(button({}));
  });
});

describe("createRecipeClass — a consumer's registered defaults", () => {
  it("fills a variant the caller left unset", () => {
    registerRecipeDefaults({ button: generatedRecipe("button", { size: "sm" }) });

    // `variant` is unregistered, so our compiled `solid` still fills it: registering a table is not
    // opting out of Chakra's defaults, only overriding the keys it names.
    expect(resolve(button, { size: undefined, variant: undefined })).toBe(
      button({ size: "sm", variant: "solid" }),
    );
  });

  it("loses to an explicit prop", () => {
    registerRecipeDefaults({ button: generatedRecipe("button", { size: "sm" }) });

    expect(resolve(button, { size: "lg", variant: undefined })).toBe(button({ size: "lg" }));
  });

  it("survives a present `undefined`, which a spread would delete", () => {
    // The shape every component hands the seam is `() => ({ size: merged.size })`, so an unset
    // `size` arrives as a key that *exists* with `undefined`. `{ ...defaults, ...variantProps }`
    // resolves by presence and would drop `sm` on the floor (`CLAUDE.md`, *The third hazard*).
    registerRecipeDefaults({ button: generatedRecipe("button", { size: "sm" }) });

    expect(resolve(button, { size: undefined } as never)).toBe(button({ size: "sm" }));
  });

  it("changes nothing for a recipe with no registration", () => {
    registerRecipeDefaults({ heading: generatedRecipe("heading", { size: "xs" }) });

    expect(resolve(button, { size: undefined, variant: undefined })).toBe(
      button({ size: undefined, variant: undefined }),
    );
  });

  it("changes nothing for a nameless stub standing in for a recipe", () => {
    // Panda names every recipe it generates, so this is only about a hand-written one in a test —
    // `recipe.__name__` is optional on `RecipeFn` because the generated `.d.ts` omits it.
    registerRecipeDefaults({ button: generatedRecipe("button", { size: "sm" }) });
    const nameless = Object.assign((variants: { size?: string } = {}) => `stub-${variants.size}`, {
      variantKeys: ["size"] as "size"[],
      splitVariantProps: () => [{}, {}] as [{ size?: string }, Record<string, unknown>],
    });

    expect(resolve(nameless, { size: undefined })).toBe("stub-undefined");
  });

  it("is read inside the memo, so a re-resolve sees the current table", () => {
    // Hoisting the lookup out of the memo would freeze whatever was registered when the component
    // body ran — and registration is an app-root call that can follow a module's import.
    const [variant, setVariant] = createSignal<"solid" | "outline">("solid");
    let className!: () => string | undefined;
    let dispose!: () => void;

    registerRecipeDefaults({ button: generatedRecipe("button", { size: "sm" }) });
    createRoot((disposeRoot) => {
      dispose = disposeRoot;
      className = createRecipeClass(button, {
        variantProps: () => ({ size: undefined, variant: variant() }),
      });
    });

    expect(className()).toBe(button({ size: "sm", variant: "solid" }));

    registerRecipeDefaults({ button: generatedRecipe("button", { size: "lg" }) });
    flush(() => setVariant("outline"));

    expect(className()).toBe(button({ size: "lg", variant: "outline" }));
    dispose();
  });
});

describe("createSlotClasses — a consumer's registered defaults", () => {
  it("fills a variant the caller left unset, in every slot", () => {
    registerRecipeDefaults({ dialog: generatedRecipe("dialog", { size: "lg" }, "slot") });

    createRoot((dispose) => {
      const slots = createSlotClasses(dialog, {
        variantProps: () => ({ size: undefined, placement: undefined }),
      });

      expect(slots()).toEqual(dialog({ size: "lg" }));
      dispose();
    });
  });

  it("loses to an explicit prop", () => {
    registerRecipeDefaults({ dialog: generatedRecipe("dialog", { size: "lg" }, "slot") });

    createRoot((dispose) => {
      const slots = createSlotClasses(dialog, { variantProps: () => ({ size: "xs" as const }) });

      expect(slots()).toEqual(dialog({ size: "xs" }));
      dispose();
    });
  });
});
