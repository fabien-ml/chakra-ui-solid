import { chakra } from "@chakra-ui-solid/core";
import { expectNoA11yViolations, mount } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "vitest";

/**
 * The factory against a real stylesheet. Everything here reads a **computed style**, never a class
 * name: under Panda `css()` computes a class and never injects a rule, so
 * `classList.contains("px_5")` passes on a completely unstyled element.
 *
 * `chakra` is imported by its **package specifier** rather than by relative path, and that is
 * load-bearing rather than tidy: Panda registers the factory only from an import whose module is in
 * `importMap.jsx`, so `import { chakra } from "../factory"` would leave every rule below
 * ungenerated — and every assertion reading `0px`.
 *
 * Spacing tokens: `5` → 20px, `3` → 12px, `2` → 8px, `1` → 4px, `6` → 24px.
 */

const StyledButton = chakra("button", {
  base: { paddingInline: "5" },
  variants: {
    tone: {
      solid: { marginBlock: "2" },
      subtle: { marginBlock: "6" },
    },
  },
  defaultVariants: { tone: "solid" },
});

const DefaultedButton = chakra("button", {}, { defaultProps: { type: "button" } });

/**
 * A custom component, the second thing the factory accepts. The one requirement is that it accepts
 * `class` — that is the whole contract, because the class is all the factory has to hand it.
 */
function Panel(props: { class?: string; label: string; children?: JSX.Element }): JSX.Element {
  return (
    <section class={props.class} aria-label={props.label}>
      {props.children}
    </section>
  );
}

const StyledPanel = chakra(Panel, { base: { paddingInline: "5" } });

let mounted: { container: HTMLElement; dispose: () => void } | undefined;

function render(ui: () => JSX.Element): HTMLElement {
  mounted = mount(ui);
  const element = mounted.container.firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected the factory to produce one element");
  }
  return element;
}

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("chakra — the JSX namespace", () => {
  it("gives the element the declarations its style props name", () => {
    const element = render(() => (
      <chakra.div paddingInline="5" marginBlock="2">
        styled
      </chakra.div>
    ));

    expect(getComputedStyle(element).paddingInline).toBe("20px");
    expect(getComputedStyle(element).marginBlock).toBe("8px");
  });

  it("renders the element the tag names", () => {
    expect(render(() => <chakra.section paddingInline="5" />).tagName).toBe("SECTION");
  });
});

describe("chakra — the recipe", () => {
  it("applies the base styles", () => {
    const element = render(() => <StyledButton type="button">styled</StyledButton>);
    expect(getComputedStyle(element).paddingInline).toBe("20px");
  });

  it("applies the default variant, and the one a prop selects", () => {
    const withDefault = render(() => <StyledButton type="button">styled</StyledButton>);
    expect(getComputedStyle(withDefault).marginBlock).toBe("8px");
    mounted?.dispose();

    const withVariant = render(() => (
      <StyledButton type="button" tone="subtle">
        styled
      </StyledButton>
    ));
    expect(getComputedStyle(withVariant).marginBlock).toBe("24px");
  });

  it("lets a style prop override the recipe", () => {
    // There is no cascade question here to get right or wrong: an inline `cva` emits atomic classes
    // into the *same* layer as style props, so the factory merges the two style objects and one
    // class comes out. `factory.test.ts` is where that merge is pinned — a computed style cannot
    // show whether one class won or two collapsed into one.
    const element = render(() => (
      <StyledButton type="button" paddingInline="1">
        styled
      </StyledButton>
    ));

    expect(getComputedStyle(element).paddingInline).toBe("4px");
  });

  it("strips the recipe's declarations on `unstyled`, and keeps style props", () => {
    const element = render(() => (
      <StyledButton type="button" unstyled marginBlock="3">
        styled
      </StyledButton>
    ));

    expect(getComputedStyle(element).paddingInline).toBe("0px");
    expect(getComputedStyle(element).marginBlock).toBe("12px");
  });
});

describe("chakra — a custom component", () => {
  it("styles what the component renders, and keeps its own props", () => {
    const element = render(() => (
      <StyledPanel label="a panel" marginBlock="2">
        styled
      </StyledPanel>
    ));

    expect(element.tagName).toBe("SECTION");
    // The component's own prop reached it rather than being consumed as a style prop.
    expect(element.getAttribute("aria-label")).toBe("a panel");
    expect(getComputedStyle(element).paddingInline).toBe("20px");
    expect(getComputedStyle(element).marginBlock).toBe("8px");
  });

  it("types the component's own props alongside the style props", () => {
    // A type test, not a runtime one: `tsc --noEmit` covers this file, so the two lines below fail
    // the build if the factory stops carrying `Panel`'s props through. Without `@ts-expect-error`
    // the second one would be the silent half — a component typed as `any` accepts everything.
    const typed = () => <StyledPanel label="a panel" marginBlock="2" />;
    // @ts-expect-error — `label` is required by `Panel` and the factory must still demand it.
    const missing = () => <StyledPanel marginBlock="2" />;
    // @ts-expect-error — `label` is a string on `Panel`, and a style prop must not loosen it.
    const wrongType = () => <StyledPanel label={7} />;

    expect([typed, missing, wrongType].every((f) => typeof f === "function")).toBe(true);
  });
});

describe("chakra — defaultProps", () => {
  it("supplies the prop the caller omitted", () => {
    expect(render(() => <DefaultedButton>styled</DefaultedButton>).getAttribute("type")).toBe(
      "button",
    );
  });

  it("does not clobber an explicit value", () => {
    expect(
      render(() => <DefaultedButton type="submit">styled</DefaultedButton>).getAttribute("type"),
    ).toBe("submit");
  });

  it("supplies `as`, which was read off the raw props and never saw the defaults", () => {
    const Defaulted = chakra("div", {}, { defaultProps: { as: "span" } });

    expect(render(() => <Defaulted>styled</Defaulted>).tagName).toBe("SPAN");
  });
});

describe("chakra — SVG geometry", () => {
  it("renders a circle with a real radius", () => {
    // `r`, `cx` and `cy` all answer `true` to `isCssProperty`, so without the exception table they
    // become a class and the circle has no geometry — an invisible shape and a green test. The
    // bounding box is what says the browser actually drew one.
    // `render()` cannot be used here: an `<svg>` is an `SVGElement`, not an `HTMLElement`.
    mounted = mount(() => (
      <svg viewBox="0 0 40 40" width="40" height="40">
        <title>a circle</title>
        <chakra.circle cx={20} cy={20} r={8} fill="red.500" />
      </svg>
    ));

    const circle = mounted.container.querySelector("circle");
    if (circle === null) {
      throw new Error("expected a circle element");
    }

    expect(circle.getAttribute("r")).toBe("8");
    expect(circle.getBoundingClientRect().width).toBeCloseTo(16, 0);
    expect(getComputedStyle(circle).fill).toBe("rgb(239, 68, 68)");
  });
});

describe("chakra — plumbing it inherits from renderStyled", () => {
  it("styles the element a `render` prop returns", () => {
    const element = render(() => (
      <StyledButton
        type="button"
        render={(props) => (
          <a href="/docs" {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
        )}
      >
        styled
      </StyledButton>
    ));

    expect(element.tagName).toBe("A");
    expect(getComputedStyle(element).paddingInline).toBe("20px");
  });

  it("is accessible", async () => {
    await expectNoA11yViolations(render(() => <StyledButton type="button">styled</StyledButton>));
  });
});
