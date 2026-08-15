import { ChakraProvider, type SystemContext, type TokenFn } from "@chakra-ui-solid/core";
import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { testSystem } from "@chakra-ui-solid/internal-test-utils/system";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Bleed } from "../bleed";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Bleed", () => {
  it("has no margin at all until it is asked for one", () => {
    // Each margin is `calc(var(--bleed-…, 0) * -1)`, so the fallback is what an unset edge gets.
    mounted = mountElement(() => <Bleed>content</Bleed>);
    const style = getComputedStyle(mounted.element);

    expect(style.marginInlineStart).toBe("0px");
    expect(style.marginBlockEnd).toBe("0px");
  });

  it("turns a spacing token into a negative margin on both inline edges", () => {
    mounted = mountElement(() => <Bleed inline="4">content</Bleed>);
    const style = getComputedStyle(mounted.element);

    expect(style.marginInlineStart).toBe("-16px");
    expect(style.marginInlineEnd).toBe("-16px");
    expect(style.marginBlockStart).toBe("0px");
  });

  it("takes a raw length, which is not a token at all", () => {
    // Chakra decides this with an `isCssUnit` regex; asking the generated token map answers the
    // same question against the build's own output, and a miss means it was already a length.
    mounted = mountElement(() => <Bleed inlineStart="7px">content</Bleed>);
    expect(getComputedStyle(mounted.element).marginInlineStart).toBe("-7px");
  });

  it("lets an axis prop win over the edge it covers, as Chakra does", () => {
    mounted = mountElement(() => (
      <Bleed inline="4" inlineStart="8">
        content
      </Bleed>
    ));
    expect(getComputedStyle(mounted.element).marginInlineStart).toBe("-16px");
  });

  it("bleeds one edge at a time", () => {
    mounted = mountElement(() => (
      <Bleed blockStart="2" inlineEnd="2">
        content
      </Bleed>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.marginBlockStart).toBe("-8px");
    expect(style.marginInlineEnd).toBe("-8px");
    expect(style.marginBlockEnd).toBe("0px");
    expect(style.marginInlineStart).toBe("0px");
  });

  it("re-resolves the spacing against a system swapped at runtime", () => {
    // The assertion that proves `token` is read *inside* the `style` getter rather than hoisted
    // into the component body. Hoisted, the element keeps the token map of whichever system it
    // first rendered under, and a swapped theme silently keeps the old spacing scale.
    const [system, setSystem] = createSignal(testSystem);

    mounted = mountElement(() => (
      <ChakraProvider value={system}>
        <Bleed inline="4">content</Bleed>
      </ChakraProvider>
    ));
    expect(getComputedStyle(mounted.element).marginInlineStart).toBe("-16px");

    flush(() => setSystem(systemResolvingSpacingTo("12px")));
    expect(getComputedStyle(mounted.element).marginInlineStart).toBe("-12px");
  });
});

/** The repo's own system with one member replaced: a token map that answers a fixed length. */
function systemResolvingSpacingTo(value: string): SystemContext {
  const token: TokenFn = Object.assign(
    (path: string, fallback?: string) => testSystem.token(path, fallback),
    { var: () => value },
  );

  return { ...testSystem, token };
}
