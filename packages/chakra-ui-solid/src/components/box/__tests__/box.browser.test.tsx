import boxServerHtml from "virtual:hydration-fixture?id=box";
import {
  expectNoA11yViolations,
  hydrateFixture,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Box } from "../box";
import { Tree } from "./box.ssr-entry";

// Every assertion here reads a **computed style**, never a class name. Under Panda `css()` computes
// a class and never injects a rule, so `classList.contains("p_4")` passes on a completely unstyled
// element — the assertion and a total styling failure are indistinguishable (`testing.md` §2.1).
// `check:style-contract` rule 3 is what keeps that true of files added later.

let mounted: { container: HTMLElement; dispose: () => void } | undefined;

function render(ui: () => ReturnType<typeof Box>): HTMLElement {
  mounted = mount(ui);
  const element = mounted.container.firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected Box to render one element");
  }
  return element;
}

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Box — style props resolve to real declarations", () => {
  it("applies a spacing token", () => {
    const element = render(() => <Box p="4" />);
    expect(getComputedStyle(element).padding).toBe("16px");
  });

  it("applies a semantic colour token, and follows the colour-mode class", () => {
    const element = render(() => <Box bg="bg.panel" />);
    const root = document.documentElement;

    // The preset gives semantic colours no base value — they exist only inside `.light { … }` and
    // `.dark { … }` — so this assertion is simultaneously "the token resolved" and "the colour-mode
    // contract is what the docs say it is". With neither class the value is `rgba(0, 0, 0, 0)`,
    // which is what a consumer who ships no class on `<html>` sees.
    expect(getComputedStyle(element).backgroundColor).toBe("rgb(255, 255, 255)");

    root.classList.replace("light", "dark");
    try {
      expect(getComputedStyle(element).backgroundColor).toBe("rgb(17, 17, 17)");
    } finally {
      root.classList.replace("dark", "light");
    }
  });

  it("applies a conditional style prop", () => {
    const element = render(() => <Box _hover={{ padding: "8" }} p="2" />);
    expect(getComputedStyle(element).padding).toBe("8px");
  });

  it("applies one of the 17 aliased shorthands", () => {
    // `gapX` is one of Chakra's 95 that Panda does not ship. Without our preset's alias it is an
    // unknown prop, forwarded to the DOM as an attribute, and the element has no column gap.
    const element = render(() => <Box display="flex" gapX="4" />);
    expect(getComputedStyle(element).columnGap).toBe("16px");
  });

  it("tracks a reactive style-prop value", () => {
    const [padding, setPadding] = createSignal("2");
    const element = render(() => <Box p={padding()} />);

    expect(getComputedStyle(element).padding).toBe("8px");
    // Solid 2.0 defers a write until the next flush; without it this reads the pre-write class and
    // the test would report the framework's batching rather than the factory's reactivity.
    flush(() => setPadding("8"));
    expect(getComputedStyle(element).padding).toBe("32px");
  });
});

describe("Box — precedence", () => {
  it("lets a style prop beat the `css` prop", () => {
    // Chakra's order, read off `useResolvedProps`: `css(cvaStyles, ...cssStyles, propStyles)`, and
    // its `mergeWith` gives the last argument the property. So `css` is a default a caller can
    // still override, not a trump card (`__internal__/decisions.md`, *Style props outrank the `css` prop*).
    const element = render(() => <Box p="8" css={{ padding: "2" }} />);
    expect(getComputedStyle(element).padding).toBe("32px");
  });

  it("applies a `css` entry no style prop contests", () => {
    // The reverse direction of the same merge: `css` loses a tie per property, not wholesale.
    const element = render(() => <Box p="8" css={{ padding: "2", margin: "2" }} />);
    expect(getComputedStyle(element).padding).toBe("32px");
    expect(getComputedStyle(element).margin).toBe("8px");
  });

  it("merges the array form of `css` left to right", () => {
    const element = render(() => <Box css={[{ padding: "2" }, { padding: "8" }]} />);
    expect(getComputedStyle(element).padding).toBe("32px");
  });

  it("lets inline `style` beat every class", () => {
    // The route every genuinely dynamic value takes: a CSS custom property through inline `style`,
    // consumed by a static class. It only works because inline `style` outranks the cascade.
    const element = render(() => <Box p="2" style={{ padding: "3px" }} />);
    expect(getComputedStyle(element).padding).toBe("3px");
  });

  it("resolves a custom property set inline", () => {
    const element = render(() => <Box style={{ "--box-probe": "11px" }} w="var(--box-probe)" />);
    expect(getComputedStyle(element).width).toBe("11px");
  });
});

describe("Box — the props that must not become styles", () => {
  it("forwards the five `html*` renames as attributes", () => {
    const element = render(() => (
      <Box as="img" htmlWidth={40} htmlHeight={20} htmlTranslate="no" />
    ));
    expect(element.getAttribute("width")).toBe("40");
    expect(element.getAttribute("height")).toBe("20");
    expect(element.getAttribute("translate")).toBe("no");
  });

  it("keeps a style prop off the element as an attribute", () => {
    const element = render(() => <Box p="4" />);
    expect(element.hasAttribute("p")).toBe(false);
  });

  it("appends the consumer's class last, so it wins ties", () => {
    const element = render(() => <Box p="2" class="probe-padding" />);
    // The rule is injected here rather than in the sheet, because the point is the *order* of the
    // class tokens the factory composes, and a computed style is the only way to observe it.
    const style = document.createElement("style");
    style.textContent = ".probe-padding { padding: 5px }";
    document.head.append(style);
    try {
      expect(getComputedStyle(element).padding).toBe("5px");
    } finally {
      style.remove();
    }
  });
});

describe("Box — polymorphism", () => {
  it("renders `as`", () => {
    const element = render(() => <Box as="section" p="4" />);
    expect(element.tagName).toBe("SECTION");
    expect(getComputedStyle(element).padding).toBe("16px");
  });

  it("hands the computed props to a `render` prop", () => {
    const element = render(() => (
      <Box
        p="4"
        // Box's props are a `div`'s, so a `render` target that is any other element needs this
        // cast — `HTMLDivElement` is not assignable to `<article>`'s `Ref<HTMLElement>`. Every
        // other component here has always been in the same position (`composition.mdx`).
        render={(props) => (
          <article {...(props as JSX.HTMLAttributes<HTMLElement>)}>rendered</article>
        )}
      />
    ));
    expect(element.tagName).toBe("ARTICLE");
    expect(getComputedStyle(element).padding).toBe("16px");
  });

  it("is accessible", async () => {
    const element = render(() => <Box p="4">content</Box>);
    await expectNoA11yViolations(element);
  });
});

describe("Box — server render, then hydrate", () => {
  it("reuses every server node and keeps the computed styles", () => {
    // The half neither other project can see: the `ssr` project has no engine to compute a style
    // and the `unit` project has no element. Here the markup is genuine server output — real `_hk`
    // hydration keys, rendered in-process by the bridge — and the assertion is that the styles
    // survive the round trip on the *server's own nodes*, not on nodes a silent client-render
    // fallback rebuilt.
    const { container, dispose } = hydrateFixture(boxServerHtml, () => <Tree />);

    const root = container.querySelector('[data-probe="root"]');
    const nested = container.querySelector("img");
    if (!(root instanceof HTMLElement) || !(nested instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its probe elements");
    }

    expect(getComputedStyle(root).padding).toBe("16px");
    expect(getComputedStyle(root).columnGap).toBe("16px");
    expect(getComputedStyle(root).backgroundColor).toBe("rgb(255, 255, 255)");
    expect(getComputedStyle(nested).margin).toBe("24px");
    expect(nested.getAttribute("width")).toBe("40");

    dispose();
  });
});
