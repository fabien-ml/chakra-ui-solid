import * as css from "@chakra-ui-solid/styled-system/css";
import { isCssProperty } from "@chakra-ui-solid/styled-system/is-valid-prop";
import * as patterns from "@chakra-ui-solid/styled-system/patterns";
import * as recipes from "@chakra-ui-solid/styled-system/recipes";
import { button, dialog } from "@chakra-ui-solid/styled-system/recipes";
import { token } from "@chakra-ui-solid/styled-system/tokens";
import { children, createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { ChakraProvider, createSystem, type SystemContext } from "../../system/system";
import { createRecipeClass, createSlotClasses, useRecipeVariantKeys } from "../recipe";

// Strings are the legitimate subject here: these are pure functions over the recipes a system
// carries, and no element exists in the `unit` project (`testing.md` §2.3).

/** The repo's own system, with one recipe watched, replaced or taken away. */
function systemWithout(overrides: Record<string, unknown>): SystemContext {
  return createSystem({
    ...css,
    isCssProperty,
    token,
    patterns,
    recipes: { ...recipes, ...overrides },
  });
}

const testSystem = systemWithout({});

/**
 * Runs `body` under a `<ChakraProvider>`, since every seam here resolves its recipe off one.
 *
 * `children()` is what makes the tree happen with no DOM: a provider's children compile to a getter
 * and nothing reads it until something renders, so the resolver Solid ships for exactly that job
 * stands in for the renderer. That is what keeps these beside the pure recipe assertions rather than
 * in the browser project — nothing here paints.
 */
function underSystem<Result>(
  system: SystemContext,
  body: () => Result,
): { value: Result; dispose: () => void } {
  let value!: Result;
  let dispose!: () => void;

  createRoot((disposeRoot) => {
    dispose = disposeRoot;
    const Body = () => {
      value = body();
      return null;
    };
    children(() => (
      <ChakraProvider value={system}>
        <Body />
      </ChakraProvider>
    ))();
  });

  return { value, dispose };
}

describe("the generated recipe surface we depend on", () => {
  it("returns one class per slot from a slot recipe", () => {
    const slots = dialog({ size: "lg" });
    expect(Object.keys(slots)).toContain("content");
    expect(slots.content).toMatch(/dialog__content/);
  });

  it("exposes `splitVariantProps` and `variantKeys` on both recipe shapes", () => {
    // Read at step 3 off the generated artifact rather than assumed. The *behavioural* half — that
    // a non-variant prop reaches the element and `size` does not leak as an attribute — is the
    // first Button's, at step 6a.
    expect(button.variantKeys).toEqual(["size", "variant"]);
    expect(typeof button.splitVariantProps).toBe("function");
    expect(typeof dialog.splitVariantProps).toBe("function");

    const [variants, rest] = button.splitVariantProps({ size: "lg", type: "submit" } as never);
    expect(variants).toEqual({ size: "lg" });
    expect(rest).toEqual({ type: "submit" });
  });
});

describe("createRecipeClass", () => {
  it("tracks its variant props", () => {
    // The signal and the write both live *outside* the root. Solid 2.0 throws
    // `[REACTIVE_WRITE_IN_OWNED_SCOPE]` on a write made from inside an owned scope, and a test that
    // hit that would be reporting its own shape rather than the memo's.
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    const { value: className, dispose } = underSystem(testSystem, () =>
      createRecipeClass("button", { variantProps: () => ({ size: size() }) }),
    );

    const small = className();
    // A plain write is invisible until the next flush, so without this the memo still reads `sm`
    // and the assertion would pass for the wrong reason.
    flush(() => setSize("lg"));

    expect(className()).not.toBe(small);
    dispose();
  });

  it("returns undefined when unstyled", () => {
    const { value: className, dispose } = underSystem(testSystem, () =>
      createRecipeClass("button", {
        variantProps: () => ({ size: "lg" as const }),
        unstyled: () => true,
      }),
    );

    expect(className()).toBeUndefined();
    dispose();
  });

  it("names the key when the system carries no such recipe", () => {
    // The win this whole seam exists for: a recipe a consumer deleted or renamed used to be a class
    // with no rule behind it, which renders nothing and reports nothing.
    //
    // The assertion is also what pins *where* it throws. Nothing here ever reads the returned
    // accessor, so this only passes if the lookup happens while the component is being constructed
    // — the memo's own lookup would wait for a read, and by then the failure is inside the element's
    // computation rather than in the component that asked for the recipe.
    expect(() =>
      underSystem(systemWithout({ button: undefined }), () =>
        createRecipeClass("button", { variantProps: () => ({}) }),
      ),
    ).toThrowError(/no "button" recipe/);
  });
});

describe("createSlotClasses", () => {
  it("invokes the recipe once for all slots, not once per slot", () => {
    // N parts each calling the recipe is N times the work for one answer, and it puts N copies of
    // the variant-reading logic in the tree. The memo is what makes "resolved once on the Root" true
    // rather than intended.
    // The three reads happen **inside** the root, where the memo is what answers them. Read from
    // outside a tracking scope a memo recomputes, which would make this count the reads rather than
    // the resolutions.
    const recipe = vi.fn(dialog);
    const { dispose } = underSystem(systemWithout({ dialog: recipe }), () => {
      const slots = createSlotClasses("dialog", { variantProps: () => ({ size: "lg" as const }) });
      slots().content;
      slots().backdrop;
      return slots().title;
    });

    expect(recipe).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("empties every slot when the Root opts out", () => {
    const { value: slots, dispose } = underSystem(testSystem, () =>
      createSlotClasses("dialog", {
        variantProps: () => ({ size: "lg" as const }),
        unstyled: () => true,
      }),
    );

    expect(Object.values(slots()).every((value) => value === "")).toBe(true);
    dispose();
  });

  it("names the key when the system carries no such recipe", () => {
    expect(() =>
      underSystem(systemWithout({ dialog: undefined }), () =>
        createSlotClasses("dialog", { variantProps: () => ({}) }),
      ),
    ).toThrowError(/no "dialog" recipe/);
  });
});

describe("useRecipeVariantKeys", () => {
  it("answers what the system's own recipe accepts, atomic or slot", () => {
    const { value, dispose } = underSystem(testSystem, () => ({
      atomic: useRecipeVariantKeys("button"),
      slot: useRecipeVariantKeys("dialog"),
    }));

    expect(value.atomic).toEqual(button.variantKeys);
    expect(value.slot).toEqual(dialog.variantKeys);
    dispose();
  });

  it("picks up a variant key the system added, which a hand-written tuple could not", () => {
    // The failure this replaced: `<Button tone="brand">` against a consumer who added a `tone`
    // variant reached the element as an attribute, because the tuple in `button.tsx` was compiled
    // before their config existed.
    const withTone = { ...button, variantKeys: [...button.variantKeys, "tone"] };
    const { value, dispose } = underSystem(systemWithout({ button: withTone }), () =>
      useRecipeVariantKeys("button"),
    );

    expect(value).toContain("tone");
    dispose();
  });
});
