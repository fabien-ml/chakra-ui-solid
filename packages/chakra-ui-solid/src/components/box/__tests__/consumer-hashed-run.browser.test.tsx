import { ChakraProvider } from "@chakra-ui-solid/core";
import { mount } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
// The barrel, not the sibling source files, because this file is the consumer's story end to end:
// what they import, the system their own Panda run generated, and the sheet the same run emitted.
import { Bleed, Box, Flex } from "chakra-ui-solid";
import { afterEach, describe, expect, it } from "vitest";
import hashedStylesheet from "./__fixtures__/consumer/consumer-hashed.css?raw";
import { system as hashedSystem } from "./__fixtures__/consumer/styled-system-hashed/chakra-system";

/**
 * **`hash: true`, and the page is still styled.**
 *
 * A hashed Panda run names every class and every CSS variable with a digest of its own config:
 * `p_4` is `AxhTk`, `--chakra-spacing-4` is `--chakra-hIimNX`. Nothing outside that run can guess
 * either, so this test is unpassable unless the class names on the element and the rules behind them
 * came from the *same* run — which is the whole claim: the consumer generates the styled-system and
 * hands it to us, so there are no longer two sides to disagree.
 *
 * Every input here is theirs. `chakra-system.ts` is written into their outdir by `panda codegen`;
 * `consumer-hashed.css` is what `panda cssgen` emitted from that same config; the absurd token
 * values (`spacing.4` → `99px`, `colors.red.500` → `#00ff00`) come from their `theme.extend`, so no
 * assertion below can pass by coincidence against the repo's own stylesheet, which is on the page
 * throughout.
 *
 * **What it cannot cover yet.** Recipes are still resolved from the repo's own generated package
 * with the repo's own unhashed class names, so a component with a recipe behind it — Button, Dialog,
 * every slot recipe — really is unstyled under this fixture. That is the ordering, not the design:
 * when `getRecipeFn`/`getSlotRecipeFn` move onto `SystemContext`, a recipe case belongs here beside
 * the four below, and it is the case that closes this file.
 */

let mounted: { container: HTMLElement; dispose: () => void } | undefined;
let injected: HTMLStyleElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
  injected?.remove();
  injected = undefined;
});

/** Mounted under *their* system, nested inside the harness's own — the inner provider wins. */
function renderUnderHashedSystem(ui: () => JSX.Element): HTMLElement {
  mounted = mount(() => <ChakraProvider value={hashedSystem}>{ui()}</ChakraProvider>);
  const element = mounted.container.firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected the tree to render one element");
  }
  return element;
}

function applyHashedStylesheet(): void {
  injected = document.createElement("style");
  injected.textContent = hashedStylesheet;
  document.head.append(injected);
}

describe("a consumer whose Panda run hashes every name", () => {
  it("styles a style prop, and nothing else on the page can", () => {
    const element = renderUnderHashedSystem(() => <Box p="4" bg="red.500" />);

    // The repo's own stylesheet is loaded, and it has no rule for a hashed name. This is the
    // measurement the plan turns on: it is what an unstyled component looks like.
    expect(getComputedStyle(element).padding).toBe("0px");

    applyHashedStylesheet();

    expect(getComputedStyle(element).padding).toBe("99px");
    expect(getComputedStyle(element).backgroundColor).toBe("rgb(0, 255, 0)");
  });

  it("styles a shorthand only our preset's alias table makes extractable", () => {
    // `gapX` is one of the 17 Chakra shorthands Panda does not ship. Their config pulled the preset
    // in through `defineChakraConfig()`, so their extractor knows the name and their runtime hashes
    // it to the same string.
    const element = renderUnderHashedSystem(() => <Box display="flex" gapX="4" />);
    applyHashedStylesheet();

    expect(getComputedStyle(element).columnGap).toBe("99px");
  });

  it("styles a component that resolves its props through a Panda pattern", () => {
    const element = renderUnderHashedSystem(() => (
      <Flex direction="row-reverse" align="center" grow="1" />
    ));
    applyHashedStylesheet();
    const style = getComputedStyle(element);

    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("row-reverse");
    expect(style.alignItems).toBe("center");
    expect(style.flexGrow).toBe("1");
  });

  it("resolves a token to the variable their own sheet declares", () => {
    // Bleed's margins are a fixed `calc(var(--bleed-…, 0) * -1)` from the preset's `staticCss`, and
    // the amounts are inline custom properties read out of `token.var()` — theirs, so the variable
    // named on the element is the hashed one their sheet declares. Three phase-4 claims in one
    // assertion: their token map, their `staticCss` rows, their class names.
    const element = renderUnderHashedSystem(() => <Bleed inline="4" blockEnd="2" />);
    applyHashedStylesheet();
    const style = getComputedStyle(element);

    expect(style.marginInlineStart).toBe("-99px");
    expect(style.marginInlineEnd).toBe("-99px");
    // `spacing.2` is untouched by their overrides, so this one is Chakra's own `0.5rem`.
    expect(style.marginBlockEnd).toBe("-8px");
  });
});
