import { ChakraProvider } from "@chakra-ui-solid/core";
import { mount } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Box, Button } from "chakra-ui-solid";
import { afterEach, describe, expect, it } from "vitest";
import consumerStylesheet from "./__fixtures__/consumer/consumer.css?raw";
import { system as consumerSystem } from "./__fixtures__/consumer/styled-system-app/chakra-system";

/**
 * **The three things only a consumer's `panda.config.ts` can decide**, each of which used to arrive
 * as a DOM attribute on an unstyled element:
 *
 * ```tsx
 * <Box elevation="high" />                  // <div elevation="high">
 * <Box _supportsGrid={{ display: "grid" }} />  // <div _supportsGrid="[object Object]">
 * <Button tone="brand" />                   // <button tone="brand">
 * ```
 *
 * All three are decided by the styled-system the provider carries rather than by anything in this
 * library: the first two by the `isCssProperty` their Panda run generated, which knows the names
 * their config invented, and the third by their `button` recipe, whose `variantKeys` is what the
 * component partitions the props bag by.
 *
 * Every assertion is a **computed style**, and each is preceded by the same measurement against the
 * repo's own stylesheet, which is on the page throughout and has a rule for none of these names.
 * That is what an unstyled element looks like, and a class-name assertion could not tell the two
 * apart.
 *
 * The types are the other half and are checked by `tsc` rather than here: `elevation`,
 * `_supportsGrid` and `tone` are written in the fixture's own `src/app.tsx`, which sits in this
 * package's typechecked tree, and none of them compiles — at the top level or nested — unless
 * `panda codegen` wrote `chakra-system-types.d.ts` into their outdir.
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
function renderUnderConsumerSystem(ui: () => JSX.Element): HTMLElement {
  mounted = mount(() => <ChakraProvider value={consumerSystem}>{ui()}</ChakraProvider>);
  const element = mounted.container.firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected the tree to render one element");
  }
  return element;
}

function applyConsumerStylesheet(): void {
  injected = document.createElement("style");
  injected.textContent = consumerStylesheet;
  document.head.append(injected);
}

describe("what a consumer's own panda.config.ts adds", () => {
  it("styles a utility their config invented, and keeps it off the element", () => {
    const element = renderUnderConsumerSystem(() => <Box elevation="high" />);

    expect(element.hasAttribute("elevation")).toBe(false);
    expect(getComputedStyle(element).boxShadow).toBe("none");

    applyConsumerStylesheet();

    // Their `transform` returns `boxShadow`, and no Chakra shadow is 8px of pure green.
    expect(getComputedStyle(element).boxShadow).toBe("rgb(0, 255, 0) 0px 0px 0px 8px");
  });

  it("applies a condition their config invented", () => {
    const element = renderUnderConsumerSystem(() => (
      <Box _supportsGrid={{ display: "grid", gap: "4" }} />
    ));

    expect(element.hasAttribute("_supportsGrid")).toBe(false);
    expect(getComputedStyle(element).display).toBe("block");

    applyConsumerStylesheet();
    const style = getComputedStyle(element);

    // `@supports (display: grid)` rather than a hover query, because this one is true in headless
    // Chromium by construction. The gap is their `spacing.4`, so one assertion says the condition
    // matched *and* that the value inside it resolved against their tokens.
    expect(style.display).toBe("grid");
    expect(style.gap).toBe("99px");
  });

  it("passes a variant key their recipe gained to that recipe, not to the DOM", () => {
    const element = renderUnderConsumerSystem(() => <Button tone="brand">Brand</Button>);

    expect(element.hasAttribute("tone")).toBe(false);

    applyConsumerStylesheet();

    // `tone: brand` is `background: red.500`, and their `red.500` is `#00ff00`.
    expect(getComputedStyle(element).backgroundColor).toBe("rgb(0, 255, 0)");
  });
});

/**
 * The same two names one level in, which is what says the declarations augment Panda's own
 * `SystemProperties` and `Conditions` rather than a pair of interfaces of ours.
 *
 * A pair of ours can only be mixed into the JSX props, so a custom name is a top-level prop and an
 * unknown key one line deeper. Panda derives *every* style object it types — the `css` prop, the
 * value of a condition, a recipe body — from those two interfaces, so a row in either reaches all of
 * them at once.
 *
 * `data-hover` is what makes the condition assertable without a pointer: Chakra spells `_hover` as
 * `&:is(:hover, [data-hover])`, so the attribute alone matches.
 */
describe("a consumer's own names, nested", () => {
  it("takes their utility inside `css`", () => {
    const element = renderUnderConsumerSystem(() => <Box css={{ elevation: "high" }} />);

    expect(getComputedStyle(element).boxShadow).toBe("none");

    applyConsumerStylesheet();

    expect(getComputedStyle(element).boxShadow).toBe("rgb(0, 255, 0) 0px 0px 0px 8px");
  });

  it("takes their condition inside `css`", () => {
    const element = renderUnderConsumerSystem(() => (
      <Box css={{ _supportsGrid: { display: "grid", gap: "4" } }} />
    ));

    expect(getComputedStyle(element).display).toBe("block");

    applyConsumerStylesheet();
    const style = getComputedStyle(element);

    expect(style.display).toBe("grid");
    expect(style.gap).toBe("99px");
  });

  it("takes their utility inside another condition", () => {
    const element = renderUnderConsumerSystem(() => (
      <Box data-hover _hover={{ elevation: "low" }} />
    ));

    expect(getComputedStyle(element).boxShadow).toBe("none");

    applyConsumerStylesheet();

    // `low` rather than `high`, so the rule that matched can only be the nested one.
    expect(getComputedStyle(element).boxShadow).toBe("rgb(0, 255, 0) 0px 0px 0px 2px");
  });

  it("takes their condition inside another condition", () => {
    const element = renderUnderConsumerSystem(() => (
      <Box data-hover _hover={{ _supportsGrid: { columnGap: "4" } }} />
    ));

    expect(getComputedStyle(element).columnGap).toBe("normal");

    applyConsumerStylesheet();

    // Two nested conditions and a token lookup in one assertion: `@supports` had to match, the
    // `[data-hover]` selector had to match, and `4` had to resolve against their `spacing.4`.
    expect(getComputedStyle(element).columnGap).toBe("99px");
  });
});
