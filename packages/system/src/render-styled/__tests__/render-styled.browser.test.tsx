import { expectNoA11yViolations, mount } from "@chakra-ui-solid/internal-test-utils";
import { button } from "@chakra-ui-solid/styled-system/recipes";
import type { JsxStyleProps } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, omit } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { renderStyled } from "../render-styled";

/**
 * The `recipeClass` seam against a real stylesheet. Everything here reads a **computed style**,
 * never a class name: under Panda `css()` computes a class and never injects a rule, so
 * `classList.contains("button--size_lg")` passes on a completely unstyled element
 * (`testing.md` §2.1).
 *
 * What this file deliberately does **not** assert is the *order* of the composed class tokens.
 * Class order inside a `class` attribute has no effect on the cascade at all, so it is
 * unobservable here by construction — `render-styled.test.ts` is where that claim lives, as a
 * string, in the one project with no element (`testing.md` §2.3).
 *
 * `button` is a real generated recipe rather than a hand-written class, so these tests break if the
 * seam stops carrying what a recipe actually emits, not merely if it stops carrying a string.
 * `.button--size_lg` sets `padding-inline: var(--spacing-5)` — 20px.
 */

/** Everything here renders a `<button>`, so `type` is part of the element's own prop shape. */
type StyledProps = JsxStyleProps & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

interface StyleProbeProps extends StyledProps {
  /** Which `button` variant the seam supplies. Omit it and the seam supplies nothing. */
  recipeSize?: "sm" | "lg";
  /** `renderStyled` reads it off the props bag; a real component declares it on its own type. */
  unstyled?: boolean;
}

/**
 * A styled element whose style props Panda can actually see.
 *
 * Panda generates CSS by scanning **JSX**, so a style prop written inside a
 * `renderStyled({ props: { px: "1" } })` object literal produces a class whose rule was never
 * generated: the element renders unstyled, nothing errors, and an assertion on the class name
 * would pass. Routing them through a capitalized component is both what a consumer writes and the
 * only form the extractor reads — so the tests below that need a style prop go through here, and
 * the rest call `renderStyled` directly.
 */
function StyleProbe(props: StyleProbeProps): JSX.Element {
  return renderStyled<StyledProps>({
    as: "button",
    props: omit(props, "recipeSize") as StyledProps,
    recipeClass: () => (props.recipeSize ? button({ size: props.recipeSize }) : undefined),
  });
}

let mounted: { container: HTMLElement; dispose: () => void } | undefined;

function render(ui: () => JSX.Element): HTMLElement {
  mounted = mount(ui);
  const element = mounted.container.firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected renderStyled to produce one element");
  }
  return element;
}

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("renderStyled — the recipe seam", () => {
  it("gives the element the recipe's own declarations", () => {
    const element = render(() =>
      renderStyled<StyledProps>({
        as: "button",
        props: { type: "button", children: "styled" } as StyledProps,
        recipeClass: () => button({ size: "lg" }),
      }),
    );

    expect(getComputedStyle(element).paddingInline).toBe("20px");
  });

  it("lets a style prop override the recipe", () => {
    // Not a `cx` ordering effect — Panda emits recipes into `@layer recipes` and style props into
    // `@layer utilities`, and the layer order in the generated sheet is what decides this. That is
    // the mechanism every consumer override depends on, so it is worth pinning rather than
    // assuming.
    const element = render(() => (
      <StyleProbe type="button" recipeSize="lg" px="1">
        styled
      </StyleProbe>
    ));

    expect(getComputedStyle(element).paddingInline).toBe("4px");
  });

  it("re-styles the element when the recipe accessor changes", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("lg");
    const element = render(() =>
      renderStyled<StyledProps>({
        as: "button",
        props: { type: "button", children: "styled" } as StyledProps,
        recipeClass: () => button({ size: size() }),
      }),
    );

    expect(getComputedStyle(element).paddingInline).toBe("20px");
    // Solid 2.0 defers a plain write until the next flush.
    flush(() => setSize("sm"));
    // `.button--size_sm` is `var(--spacing-3.5)` — 14px.
    expect(getComputedStyle(element).paddingInline).toBe("14px");
  });
});

describe("renderStyled — `unstyled`", () => {
  it("strips the recipe's declarations from the element", () => {
    const element = render(() =>
      renderStyled<StyledProps>({
        as: "button",
        props: { type: "button", unstyled: true, children: "styled" } as StyledProps,
        recipeClass: () => button({ size: "lg" }),
      }),
    );

    expect(getComputedStyle(element).paddingInline).toBe("0px");
  });

  it("keeps style props and the `css` prop working", () => {
    // The opt-out is of the theme, not of styling. A version that suppressed the whole class would
    // pass a "the recipe is gone" test and quietly break every `unstyled` component that also
    // passes style props.
    const element = render(() => (
      <StyleProbe type="button" recipeSize="lg" unstyled px="1" css={{ marginBlock: "2" }}>
        styled
      </StyleProbe>
    ));

    expect(getComputedStyle(element).paddingInline).toBe("4px");
    expect(getComputedStyle(element).marginBlock).toBe("8px");
  });

  it("never reaches the DOM as an attribute", () => {
    // `unstyled` is a styling opt-out, not an attribute. Solid forwards an unknown prop to the
    // element verbatim, so a factory that failed to consume it would render `<button unstyled>`.
    const element = render(() =>
      renderStyled<StyledProps>({
        as: "button",
        props: { type: "button", unstyled: true, children: "styled" } as StyledProps,
      }),
    );

    expect(element.hasAttribute("unstyled")).toBe(false);
  });
});

describe("renderStyled — plumbing it inherits from renderElement", () => {
  it("merges an internal ref with the consumer's on a styled element", () => {
    let internal: Element | undefined;
    let consumer: Element | undefined;

    const element = render(() =>
      renderStyled<StyledProps>({
        as: "button",
        props: {
          type: "button",
          children: "styled",
          ref: (el: HTMLElement) => {
            consumer = el;
          },
        } as StyledProps,
        ref: (el) => {
          internal = el;
        },
      }),
    );

    expect(internal).toBe(element);
    expect(consumer).toBe(element);
  });

  it("styles the element a `render` prop returns", () => {
    const element = render(() =>
      renderStyled<StyledProps>({
        as: "button",
        props: { type: "button", children: "styled" } as StyledProps,
        recipeClass: () => button({ size: "lg" }),
        // `as` fixes the prop *type* while the render prop picks the element, so the two disagree
        // about `ref`'s element and the spread needs a cast. That is the deliberate trade in
        // `renderStyled`'s JSDoc: a generic that re-typed `Props` from `as` would buy this back at
        // the cost of the deep-conditional inference that wrecks IntelliSense.
        render: (props) => (
          <a href="/docs" {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
        ),
      }),
    );

    expect(element.tagName).toBe("A");
    expect(getComputedStyle(element).paddingInline).toBe("20px");
  });

  it("is accessible", async () => {
    const element = render(() =>
      renderStyled<StyledProps>({
        as: "button",
        props: { type: "button", children: "styled" } as StyledProps,
        recipeClass: () => button({ size: "lg" }),
      }),
    );

    await expectNoA11yViolations(element);
  });
});
