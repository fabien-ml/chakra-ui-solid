import {
  ChakraProvider,
  type PatternFn,
  type PatternStyles,
  type SystemContext,
} from "@chakra-ui-solid/core";
import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { testSystem } from "@chakra-ui-solid/internal-test-utils/system";
import type { FlexProperties } from "@chakra-ui-solid/styled-system/patterns";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Flex } from "../flex";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Flex", () => {
  it("is a flex container by default", () => {
    mounted = mountElement(() => <Flex>content</Flex>);
    expect(getComputedStyle(mounted.element).display).toBe("flex");
  });

  it("maps every shorthand to its flexbox property", () => {
    mounted = mountElement(() => (
      <Flex direction="column" align="center" justify="space-between" wrap="wrap" basis="auto">
        content
      </Flex>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.flexDirection).toBe("column");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("space-between");
    expect(style.flexWrap).toBe("wrap");
    expect(style.flexBasis).toBe("auto");
  });

  it("flips to `inline-flex` when `inline` is set", () => {
    mounted = mountElement(() => <Flex inline>content</Flex>);
    expect(getComputedStyle(mounted.element).display).toBe("inline-flex");
  });

  it("keeps `direction` off the element, where it is a real CSS property", () => {
    // `direction` is `ltr`/`rtl` in CSS, so a shorthand forwarded verbatim would both set the
    // wrong property and lose the flex direction.
    mounted = mountElement(() => <Flex direction="row-reverse">content</Flex>);

    expect(mounted.element.hasAttribute("direction")).toBe(false);
    expect(getComputedStyle(mounted.element).direction).toBe("ltr");
    expect(getComputedStyle(mounted.element).flexDirection).toBe("row-reverse");
  });

  it("tracks a reactive shorthand", () => {
    const [direction, setDirection] = createSignal<"row" | "column">("column");
    mounted = mountElement(() => <Flex direction={direction()}>content</Flex>);

    expect(getComputedStyle(mounted.element).flexDirection).toBe("column");
    flush(() => setDirection("row"));
    expect(getComputedStyle(mounted.element).flexDirection).toBe("row");
  });

  it("lets the consumer's `css` beat the shorthand", () => {
    mounted = mountElement(() => (
      <Flex direction="row" css={{ flexDirection: "column" }}>
        content
      </Flex>
    ));
    expect(getComputedStyle(mounted.element).flexDirection).toBe("column");
  });

  it("remaps its shorthands through a system swapped at runtime", () => {
    // The assertion that proves the pattern is read *inside* the `css` getter rather than hoisted
    // into the component body. Hoisted, this element keeps the mapping of whichever system it first
    // rendered under, and a theme swapped at runtime silently does nothing — the failure class the
    // whole provider seam exists to remove.
    const [system, setSystem] = createSignal(testSystem);

    mounted = mountElement(() => (
      <ChakraProvider value={system}>
        <Flex direction="row">content</Flex>
      </ChakraProvider>
    ));
    expect(getComputedStyle(mounted.element).flexDirection).toBe("row");

    flush(() => setSystem(systemMappingDirectionTo("column-reverse")));
    expect(getComputedStyle(mounted.element).flexDirection).toBe("column-reverse");
  });
});

/**
 * The repo's own system with one member replaced: a `flex` pattern that answers a fixed axis
 * whatever it is asked for. Both axes have a rule in the sheet, so the swap is readable as a
 * computed style rather than as a class name.
 */
function systemMappingDirectionTo(direction: "row" | "column-reverse"): SystemContext {
  const { flex } = testSystem.patterns;
  const mapped: PatternFn<FlexProperties> = Object.assign(
    (styles?: PatternStyles<FlexProperties>) => flex(styles),
    {
      raw: (styles?: PatternStyles<FlexProperties>) => ({
        ...flex.raw(styles),
        flexDirection: direction,
      }),
    },
  );

  return { ...testSystem, patterns: { ...testSystem.patterns, flex: mapped } };
}
