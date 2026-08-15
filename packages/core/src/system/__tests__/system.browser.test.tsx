import { mount } from "@chakra-ui-solid/internal-test-utils";
import { testSystem } from "@chakra-ui-solid/internal-test-utils/system";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { chakra } from "../../factory/factory";
import { ChakraProvider, type SystemContext } from "../system";

/**
 * The one thing a context of plain values could not do: **swap the whole look and feel at runtime**.
 *
 * SolidJS contexts are not reactive, so a provider handed a new system would leave every class
 * already on the page untouched — a theme switch that silently does nothing, which is the failure
 * class this seam exists to remove. The context carries an accessor and `renderStyled` reads it
 * inside the `class` getter; these tests are what say so.
 *
 * They assert the **class string**, which every other browser test here is banned from doing
 * (`testing.md` §2.1 — a class name proves nothing about whether an element is styled). Here the
 * identity of the class *is* the subject: the question is whether the second system's `css()`
 * produced it, and no computed style can answer that.
 */

/** A system whose `css()` is the repo's with a marker in front, so its output is recognisable. */
function markedSystem(marker: string): SystemContext {
  return { ...testSystem, css: (...styles) => `${marker} ${testSystem.css(...styles)}` };
}

let mounted: { container: HTMLElement; dispose: () => void } | undefined;

function render(ui: () => JSX.Element): HTMLElement {
  mounted = mount(ui);
  const element = mounted.container.firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected the tree to render one element");
  }
  return element;
}

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("ChakraProvider — a system swapped at runtime", () => {
  it("recomputes an already-rendered element's class, on the same node", () => {
    const [system, setSystem] = createSignal<SystemContext>(markedSystem("first"));

    const element = render(() => (
      <ChakraProvider value={system}>
        <chakra.div p="4" />
      </ChakraProvider>
    ));

    const before = element.className;
    expect(before).toContain("first");

    flush(() => setSystem(markedSystem("second")));

    expect(element.className).not.toBe(before);
    expect(element.className).toContain("second");
    expect(element.className).not.toContain("first");
    // The same node, so this is a recomputation rather than a remount — a tree rebuilt from
    // scratch would pass every assertion above while proving nothing about the read.
    expect(mounted?.container.firstElementChild).toBe(element);
  });

  it("takes a plain object as well as an accessor", () => {
    const element = render(() => (
      <ChakraProvider value={markedSystem("plain")}>
        <chakra.div p="4" />
      </ChakraProvider>
    ));

    expect(element.className).toContain("plain");
  });

  it("lets a nested provider restyle its own subtree", () => {
    const container = render(() => (
      <ChakraProvider value={markedSystem("outer")}>
        <chakra.div p="4" data-probe="outer">
          <ChakraProvider value={markedSystem("inner")}>
            <chakra.span p="4" data-probe="inner" />
          </ChakraProvider>
        </chakra.div>
      </ChakraProvider>
    ));

    const inner = container.querySelector("[data-probe='inner']");
    expect(container.className).toContain("outer");
    expect(inner?.className).toContain("inner");
  });
});
