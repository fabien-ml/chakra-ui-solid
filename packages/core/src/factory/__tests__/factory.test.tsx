import { testSystem } from "@chakra-ui-solid/internal-test-utils/system";
import { css, cva } from "@chakra-ui-solid/styled-system/css";
import { isCssProperty } from "@chakra-ui-solid/styled-system/is-valid-prop";
import type { JSX } from "@solidjs/web";
import { children, createRoot } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { ChakraProvider } from "../../system/system";
import { chakra } from "../factory";

/**
 * The factory's string-level claims: which keys reach the element, and in what order the classes
 * compose. `factory.browser.test.tsx` asks the same questions of a real engine; neither replaces
 * the other, because a computed style cannot show *which* key produced it and this project has no
 * element to compute one on (`render-styled.test.ts` carries the same note).
 *
 * Asserting a class string is legitimate here and only here. Every expected value is computed by
 * calling `css()` / `cva()` rather than typed out, so the assertions say "the factory composed what
 * Panda emits" rather than pinning today's class-name format.
 */

const disposers: Array<() => void> = [];

afterEach(() => {
  for (const dispose of disposers.splice(0)) {
    dispose();
  }
});

type LooseComponent = (props: Record<string, unknown>) => unknown;

/**
 * The props the factory hands to the element, captured without rendering one.
 *
 * A `render` prop short-circuits before `<Dynamic>`, so this exercises the whole factory — variant
 * split, forwarding rule, class composition — with no DOM in sight. The returned bag is live, so a
 * later read of `.class` recomputes.
 *
 * The `<ChakraProvider>` is where `cva`, `css` and `isValidProperty` come from, and a provider hands
 * its children back unevaluated — `children()` is what makes the component below it actually run.
 */
function computedProps(
  component: unknown,
  props: Record<string, unknown>,
): Record<string, unknown> {
  let captured: Record<string, unknown> | undefined;

  const Probe = () =>
    (component as LooseComponent)({
      ...props,
      render: (elementProps: Record<string, unknown>) => {
        captured = elementProps;
        return undefined;
      },
    }) as JSX.Element;

  createRoot((dispose) => {
    disposers.push(dispose);
    children(() => (
      <ChakraProvider value={testSystem}>
        <Probe />
      </ChakraProvider>
    ))();
  });

  if (captured === undefined) {
    throw new Error("the factory did not invoke the render prop");
  }
  return captured;
}

function computedClass(component: unknown, props: Record<string, unknown>): string {
  return computedProps(component, props).class as string;
}

describe("chakra — the namespace", () => {
  it("returns the same component for a tag every time it is read", () => {
    // Not a micro-optimization: a fresh component identity on every read makes Solid tear down and
    // rebuild the subtree whenever the parent re-runs.
    expect(chakra.div).toBe(chakra.div);
    expect(chakra.div).not.toBe(chakra.span);
  });

  it("answers a symbol probe and its own function properties rather than minting a component", () => {
    // Without the guard, `$$typeof` or `Symbol.toPrimitive` mints a component named after the
    // probe, and `String(chakra)` calls one with no props at all.
    expect((chakra as unknown as Record<symbol, unknown>)[Symbol.toPrimitive]).toBeUndefined();
    expect(typeof chakra.toString()).toBe("string");
    expect(typeof (chakra as unknown as { name: unknown }).name).toBe("string");
  });
});

describe("chakra — what reaches the element", () => {
  it("keeps style props off it and composes them into the class", () => {
    const props = computedProps(chakra.div, { id: "target", p: "4", _hover: { padding: "8" } });

    expect(props.id).toBe("target");
    for (const consumed of ["p", "_hover"]) {
      expect(Object.keys(props), `${consumed} must not reach the element`).not.toContain(consumed);
    }
    expect(props.class).toBe(css({ p: "4", _hover: { padding: "8" } }));
  });

  it("keeps a recipe's variant keys off it", () => {
    // `tone` is the recipe's input, not an attribute. Forwarded, it renders `<button tone="subtle">`
    // — invalid HTML the browser keeps and nothing warns about.
    const Button = chakra("button", {
      base: { fontWeight: "bold" },
      variants: { tone: { solid: { background: "blue.600" }, subtle: { background: "blue.100" } } },
    });

    const props = computedProps(Button, { tone: "subtle", type: "button" });

    expect(Object.keys(props)).not.toContain("tone");
    expect(props.type).toBe("button");
  });

  it("merges the recipe's styles underneath the style props into one class", () => {
    // Not `cx(recipeClass, stylePropClass)`. An inline `cva` emits atomic classes into the same
    // cascade layer as style props, so `px_5 px_1` on one element is decided by which rule Panda
    // wrote first — the order the two appear in the *source*, which no author controls. One merged
    // class is one answer, and it is the answer Chakra gives.
    const config = { base: { paddingInline: "5", color: "red.500" } };
    const Div = chakra("div", config);

    expect(computedClass(Div, { paddingInline: "1" })).toBe(
      css(cva(config).raw(), { paddingInline: "1" }),
    );
    expect(computedClass(Div, { paddingInline: "1" })).not.toContain(css({ paddingInline: "5" }));
  });

  it("keeps the recipe's other declarations while one is overridden", () => {
    // A set, because the order of the tokens inside a `class` attribute has no effect on the
    // cascade at all — the merge is what this asserts, not the spelling.
    const Div = chakra("div", { base: { paddingInline: "5", color: "red.500" } });

    expect(computedClass(Div, { paddingInline: "1" }).split(" ").sort()).toEqual(
      css({ color: "red.500", paddingInline: "1" }).split(" ").sort(),
    );
  });

  it("suppresses the recipe class on `unstyled`, and only the recipe class", () => {
    const Div = chakra("div", { base: { padding: "2" } });
    const className = computedClass(Div, { unstyled: true, p: "4" });

    expect(className).toBe(css({ p: "4" }));
    expect(Object.keys(computedProps(Div, { unstyled: true }))).not.toContain("unstyled");
  });
});

describe("chakra — defaultProps", () => {
  const Button = chakra("button", {}, { defaultProps: { type: "button" } });

  it("supplies a value for a prop the caller omitted", () => {
    expect(computedProps(Button, {}).type).toBe("button");
  });

  it("does not let an explicit `undefined` clobber the default", () => {
    // Chakra runs `compact()` over the incoming props before assigning the defaults. SolidJS 2.0's
    // `merge` resolves a key by *presence*, so the naive spelling loses here — and it loses on the
    // most ordinary call there is, a wrapper forwarding an unset optional prop.
    expect(computedProps(Button, { type: undefined }).type).toBe("button");
  });

  it("lets a present value win, including a falsy one", () => {
    const Input = chakra("input", {}, { defaultProps: { disabled: true } });

    expect(computedProps(Button, { type: "submit" }).type).toBe("submit");
    expect(computedProps(Input, { disabled: false }).disabled).toBe(false);
  });
});

describe("chakra — forwardProps", () => {
  it("sends a named style prop to the element instead of into the class", () => {
    const Div = chakra("div", {}, { forwardProps: ["transform"] });
    const props = computedProps(Div, { transform: "translateX(4px)", p: "4" });

    expect(props.transform).toBe("translateX(4px)");
    expect(props.class).toBe(css({ p: "4" }));
  });

  it("forwards every SVG geometry attribute of the seven exception tags", () => {
    // `cx`, `cy` and `r` all answer `true` to `isCssProperty`, so the default rule folds them into
    // a class and the circle renders with no geometry — invisible, and green.
    expect(isCssProperty("r")).toBe(true);

    const props = computedProps(chakra.circle, { cx: 20, cy: 20, r: 8, fill: "red.500" });

    expect(props).toMatchObject({ cx: 20, cy: 20, r: 8 });
    expect(props.class).toBe(css({ fill: "red.500" }));
  });

  it("leaves a tag with no exceptions alone", () => {
    // The negative control for the table: `<chakra.div r="8">` has no SVG geometry to protect, so
    // `r` stays a style prop there.
    expect(Object.keys(computedProps(chakra.div, { r: 8 }))).not.toContain("r");
  });
});

describe("chakra — shouldForwardProp", () => {
  it("keeps a prop off the element entirely", () => {
    const Div = chakra(
      "div",
      {},
      { shouldForwardProp: (prop) => prop !== "level" && !isCssProperty(prop) },
    );
    const props = computedProps(Div, { level: 2, id: "target", p: "4" });

    expect(Object.keys(props)).not.toContain("level");
    expect(props.id).toBe("target");
    expect(props.class).toBe(css({ p: "4" }));
  });

  it("receives the recipe's variant keys as its second argument", () => {
    let seen: string[] | undefined;
    const Div = chakra(
      "div",
      { variants: { tone: { solid: { background: "blue.600" } } } },
      {
        shouldForwardProp: (prop, variantKeys) => {
          seen = variantKeys;
          return !isCssProperty(prop);
        },
      },
    );

    computedProps(Div, { id: "target" });
    expect(seen).toEqual(["tone"]);
  });

  it("replaces the SVG exceptions rather than composing with them", () => {
    // Chakra's own precedence: `shouldForwardProp` is the whole rule when it is given, and
    // `forwardProps` — the table included — applies only in its absence.
    const Circle = chakra("circle", {}, { shouldForwardProp: (prop) => !isCssProperty(prop) });

    expect(Object.keys(computedProps(Circle, { r: 8 }))).not.toContain("r");
  });

  it("never withholds `children` or `ref`", () => {
    // A predicate written to filter one prop would otherwise take the element's content and the
    // caller's handle on it too.
    const noop = () => undefined;
    const Div = chakra("div", {}, { shouldForwardProp: (prop) => prop === "id" });
    const props = computedProps(Div, { children: "text", ref: noop, id: "target" });

    expect(props.children).toBe("text");
    expect(props.ref).toBe(noop);
  });
});
