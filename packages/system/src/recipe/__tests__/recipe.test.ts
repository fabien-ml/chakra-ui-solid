import { button, dialog } from "@chakra-ui-solid/styled-system/recipes";
import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createRecipeClass, createSlotClasses } from "../recipe";

// Strings are the legitimate subject here: these are pure functions over the generated recipes and
// no element exists in the `unit` project (`testing.md` §2.3).

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
    let className!: ReturnType<typeof createRecipeClass>;
    let dispose!: () => void;

    createRoot((disposeRoot) => {
      dispose = disposeRoot;
      className = createRecipeClass(button, { variantProps: () => ({ size: size() }) });
    });

    const small = className();
    // A plain write is invisible until the next flush, so without this the memo still reads `sm`
    // and the assertion would pass for the wrong reason.
    flush(() => setSize("lg"));

    expect(className()).not.toBe(small);
    dispose();
  });

  it("returns undefined when unstyled", () => {
    createRoot((dispose) => {
      const className = createRecipeClass(button, {
        variantProps: () => ({ size: "lg" as const }),
        unstyled: () => true,
      });
      expect(className()).toBeUndefined();
      dispose();
    });
  });
});

describe("createSlotClasses", () => {
  it("invokes the recipe once for all slots, not once per slot", () => {
    // N parts each calling `sva()` is N times the work for one answer, and it puts N copies of the
    // variant-reading logic in the tree. The memo is what makes "resolved once on the Root" true
    // rather than intended.
    createRoot((dispose) => {
      const recipe = vi.fn(dialog);
      const slots = createSlotClasses(recipe as unknown as typeof dialog, {
        variantProps: () => ({ size: "lg" as const }),
      });

      slots().content;
      slots().backdrop;
      slots().title;

      expect(recipe).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  it("empties every slot when the Root opts out", () => {
    createRoot((dispose) => {
      const slots = createSlotClasses(dialog, {
        variantProps: () => ({ size: "lg" as const }),
        unstyled: () => true,
      });
      expect(Object.values(slots()).every((value) => value === "")).toBe(true);
      dispose();
    });
  });
});
