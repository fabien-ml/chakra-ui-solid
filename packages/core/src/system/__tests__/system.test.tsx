import { testSystem } from "@chakra-ui-solid/internal-test-utils/system";
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
    const system = createSystem({ ...testSystem, isCssProperty: (property) => property === "wat" });

    expect(system.isValidProperty("wat")).toBe(true);
    expect(system.isValidProperty("padding")).toBe(false);
  });
});
