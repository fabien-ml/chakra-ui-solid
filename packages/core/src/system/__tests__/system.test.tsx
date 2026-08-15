import { testSystem } from "@chakra-ui-solid/internal-test-utils/system";
import { isCssProperty } from "@chakra-ui-solid/styled-system/is-valid-prop";
import * as recipes from "@chakra-ui-solid/styled-system/recipes";
import { button, dialog } from "@chakra-ui-solid/styled-system/recipes";
import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { chakra } from "../../factory/factory";
import { createSystem, useChakraContext } from "../system";

/**
 * What a missing provider costs, and what `createSystem` hands over.
 *
 * The throw is asserted from a **direct call** rather than a mounted tree: a component invoked
 * inside `createRoot` raises on the stack, where a mounted one would raise inside the provider's
 * children memo and take SolidJS's whole reactive graph down with it (`[REACTIVITY_HALTED]`,
 * handled in `mount`). Same code path, no collateral.
 */

type LooseComponent = (props: Record<string, unknown>) => unknown;

describe("useChakraContext — with no provider above it", () => {
  it("throws an error naming <ChakraProvider>", () => {
    createRoot((dispose) => {
      expect(() => useChakraContext()).toThrowError(/<ChakraProvider>/);
      dispose();
    });
  });

  it("throws the same error when a styled element renders", () => {
    // The failure a consumer actually meets: nothing about the element says it needs a provider,
    // so the message has to.
    createRoot((dispose) => {
      expect(() => (chakra.div as unknown as LooseComponent)({ p: "4" })).toThrowError(
        /must be rendered inside a <ChakraProvider>/,
      );
      dispose();
    });
  });
});

describe("createSystem", () => {
  it("renames Panda's `isCssProperty` to the member `renderStyled` reads", () => {
    const system = createSystem({
      ...testSystem,
      recipes,
      isCssProperty: (property) => property === "wat",
    });

    expect(system.isValidProperty("wat")).toBe(true);
    expect(system.isValidProperty("padding")).toBe(false);
  });

  it("turns the recipes namespace into the two key lookups", () => {
    // Both kinds arrive in one namespace, so both lookups read the same map and differ only in what
    // they promise the caller. A key it does not carry answers `undefined` here; the throw that
    // names it belongs to the seams, which know it was asked for on purpose.
    const system = createSystem({ ...testSystem, recipes, isCssProperty });

    expect(system.getRecipeFn("button")).toBe(button);
    expect(system.getSlotRecipeFn("dialog")).toBe(dialog);
    expect(system.getRecipeFn("nothing-of-the-sort")).toBeUndefined();
  });
});
