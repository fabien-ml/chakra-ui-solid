import { type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
// The docs app's **own** generated stylesheet, which is where both sides of the collision live: the
// prose classes, and the atomic classes the examples' style props compile to.
import "../../../../styled-system/styles.css";
import SpinnerWithLabel from "../../../examples/spinner/spinner-with-label";
import SpinnerWithOverlay from "../../../examples/spinner/spinner-with-overlay";
import { proseClass, proseTagClasses } from "../prose";

/**
 * An article's typography must not reach the live examples inside it.
 *
 * `examples/__tests__/examples.browser.test.tsx` mounts each example module on its own, with no
 * prose ancestor — so it stayed green through the whole life of this bug and would stay green
 * through its return. The collision exists only where `<Example>` puts a preview *inside* the
 * wrapper that carries the prose class, so that is the tree this file builds.
 *
 * Both directions are asserted against the same wrapper, and neither can pass vacuously: if the
 * stylesheet were missing, the prose case reads UA defaults and fails; if the prose rules came back
 * as descendant selectors, the example cases fail.
 *
 * Computed styles, never class names — `classList.contains("c_fg.muted")` passes on an element
 * whose CSS was never generated (`CLAUDE.md`, *silent unstyling*).
 */
let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/** The article, the way `routes/docs.$.tsx` assembles it: prose and a preview under one class. */
function mountArticle() {
  mounted = mount(() => (
    <div class={proseClass}>
      <h2 class={proseTagClasses.h2}>Usage</h2>
      <p class={proseTagClasses.p}>A paragraph of prose.</p>
      <div data-testid="preview">
        <SpinnerWithLabel />
        <SpinnerWithOverlay />
      </div>
    </div>
  ));
  return {
    prose: query(mounted.container, ":scope > div"),
    preview: query(mounted.container, "[data-testid='preview']"),
  };
}

function query(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`nothing in the mounted tree matched \`${selector}\``);
  }
  return element;
}

describe("prose and the examples inside it", () => {
  it("leaves an example's own colour prop alone", () => {
    const { preview } = mountArticle();

    // `teal.700`, which is what `spinner-with-label` asks for with `color="colorPalette.fg"`. As
    // `& p` on the wrapper, `fg.muted` won this at (0,1,1) against the style prop's (0,1,0).
    expect(getComputedStyle(query(preview, "p")).color).toBe("rgb(12, 93, 86)");
  });

  it("leaves an example's recipe step alone", () => {
    const { preview } = mountArticle();
    const heading = query(preview, "h2");

    // The `xl` step `spinner-with-overlay`'s `<Heading>` renders at. A recipe cannot defend itself
    // here at all: `@layer utilities` sits above `@layer recipes`, and layer order ignores
    // specificity — as `& h2` on the wrapper this measured 20.8px, the prose scale's `1.3em`.
    expect(heading.className).toContain("heading--size_xl");
    expect(getComputedStyle(heading).fontSize).toBe("20px");
  });

  it("still styles the page's own prose", () => {
    const { prose } = mountArticle();
    const paragraph = getComputedStyle(query(prose, "p"));

    expect(getComputedStyle(query(prose, "h2")).fontSize).toBe("20.8px");
    expect(paragraph.color).toBe("rgb(82, 82, 91)");
    expect(paragraph.lineHeight).toBe("28px");
  });
});
