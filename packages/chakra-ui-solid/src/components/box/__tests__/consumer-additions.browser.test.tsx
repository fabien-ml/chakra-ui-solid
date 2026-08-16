import { ChakraProvider } from "@chakra-ui-solid/core";
import { mount } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Box, Button, Dialog, Field, Tabs } from "chakra-ui-solid";
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

/**
 * Mounted under *their* system, nested inside the harness's own — the inner provider wins — and the
 * container is what comes back, for a tree whose observable is somewhere inside it.
 */
function mountUnderConsumerSystem(ui: () => JSX.Element): HTMLElement {
  mounted = mount(() => <ChakraProvider value={consumerSystem}>{ui()}</ChakraProvider>);
  return mounted.container;
}

/** The same mount, narrowed to the one element the tree rendered. */
function renderUnderConsumerSystem(ui: () => JSX.Element): HTMLElement {
  const element = mountUnderConsumerSystem(ui).firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected the tree to render one element");
  }
  return element;
}

function partOf(container: ParentNode, part: string): HTMLElement {
  const element = container.querySelector(`[data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
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
 * The same variant key on a **slot recipe** — one style object per anatomy part instead of one for
 * the whole component — which is where nine of this library's Roots live.
 *
 * Three of them rather than nine, because a Root comes in three shapes and the other six are one of
 * these:
 *
 * - **Tabs** renders an element of its own, so both halves are visible on it: `tone` has to reach
 *   the recipe *and* stay off the `div`.
 * - **Dialog** renders no element at all — it publishes one class per slot to its parts — so a part
 *   is the only place the key is observable.
 * - **Field** is hand-written over the slot-recipe seam, and asks it for the key list rather than
 *   calling the recipe hook itself.
 *
 * Each recipe styles a different CSS property, so no assertion here can pass against another's rule.
 */
describe("a variant key a consumer's own slot recipe gained", () => {
  it("reaches the recipe on a Root that renders its own element, and not the element", () => {
    const element = renderUnderConsumerSystem(() => (
      <Tabs.Root tone="brand" defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">First</Tabs.Content>
      </Tabs.Root>
    ));

    expect(element.hasAttribute("tone")).toBe(false);
    expect(getComputedStyle(element).letterSpacing).toBe("normal");

    applyConsumerStylesheet();

    expect(getComputedStyle(element).letterSpacing).toBe("13px");
  });

  it("reaches a part of a Root that renders no element", () => {
    const container = mountUnderConsumerSystem(() => (
      <Dialog.Root tone="brand" defaultOpen>
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Delete file</Dialog.Title>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    ));
    const content = partOf(container, "content");

    // The Root has no element for the key to leak onto, so the assertion is over the whole tree —
    // nothing below it was handed the prop either.
    expect(container.querySelector("[tone]")).toBeNull();
    expect(getComputedStyle(content).wordSpacing).toBe("0px");

    applyConsumerStylesheet();

    expect(getComputedStyle(content).wordSpacing).toBe("17px");
  });

  it("reaches the recipe through the slot-recipe seam a hand-written Root uses", () => {
    const element = renderUnderConsumerSystem(() => (
      <Field.Root tone="brand">
        <Field.Label>Email</Field.Label>
      </Field.Root>
    ));

    expect(element.hasAttribute("tone")).toBe(false);
    expect(getComputedStyle(element).textIndent).toBe("0px");

    applyConsumerStylesheet();

    expect(getComputedStyle(element).textIndent).toBe("23px");
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
