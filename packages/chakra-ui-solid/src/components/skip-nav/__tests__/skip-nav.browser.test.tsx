import {
  expectNoA11yViolations,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { SkipNavContent, SkipNavLink } from "../skip-nav";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("SkipNavLink", () => {
  it("renders an anchor pointing at the fallback id", () => {
    mounted = mountElement(() => <SkipNavLink>Skip to content</SkipNavLink>);

    expect(mounted.element.tagName).toBe("A");
    expect(mounted.element.getAttribute("href")).toBe("#chakra-skip-nav");
  });

  it("is out of the layout until it is focused", () => {
    // The recipe hides it the way VisuallyHidden does — a 1px clipped box in the corner. If the
    // rule were missing the link would sit visibly at the top of every page, which is the failure
    // this pins rather than the focused state below.
    mounted = mountElement(() => <SkipNavLink>Skip to content</SkipNavLink>);
    const style = getComputedStyle(mounted.element);

    expect(style.position).toBe("absolute");
    expect(style.overflow).toBe("hidden");
    // `clip` rather than `width`: the recipe asks for a 1px box, but its own padding is what the
    // browser reports as the used width — the clip rectangle is the declaration that actually
    // removes the link from the page.
    expect(style.clip).toBe("rect(0px, 0px, 0px, 0px)");
  });

  it("takes the whole page's corner when focused", () => {
    mounted = mountElement(() => <SkipNavLink>Skip to content</SkipNavLink>);
    mounted.element.focus();
    const style = getComputedStyle(mounted.element);

    expect(style.position).toBe("fixed");
    expect(style.width).not.toBe("1px");
    expect(style.clip).toBe("auto");
  });

  it("points at a custom id without wearing it", () => {
    // `id` names the *target*. Left on the link as well, the page would carry two elements with the
    // same id and the jump would land on whichever the browser found first.
    mounted = mountElement(() => <SkipNavLink id="main-content">Skip</SkipNavLink>);

    expect(mounted.element.getAttribute("href")).toBe("#main-content");
    expect(mounted.element.hasAttribute("id")).toBe(false);
  });

  it("keeps the fallback when a wrapper forwards an unset `id`", () => {
    // A JSX attribute before the spread loses to a forwarded `undefined`, and the failure is silent:
    // the anchor still renders and still takes focus, pointing at `#undefined`.
    mounted = mountElement(() => <SkipNavLink id={undefined}>Skip</SkipNavLink>);

    expect(mounted.element.getAttribute("href")).toBe("#chakra-skip-nav");
  });

  it("drops the recipe entirely when unstyled, and keeps the href", () => {
    mounted = mountElement(() => <SkipNavLink unstyled>Skip</SkipNavLink>);

    expect(getComputedStyle(mounted.element).position).toBe("static");
    expect(mounted.element.getAttribute("href")).toBe("#chakra-skip-nav");
  });
});

describe("SkipNavContent", () => {
  it("answers the link's href and takes programmatic focus only", () => {
    mounted = mountElement(() => <SkipNavContent />);

    expect(mounted.element.tagName).toBe("DIV");
    expect(mounted.element.getAttribute("id")).toBe("chakra-skip-nav");
    expect(mounted.element.getAttribute("tabindex")).toBe("-1");
    expect(getComputedStyle(mounted.element).outlineStyle).toBe("none");
  });

  it("keeps the fallback when a wrapper forwards an unset `id`", () => {
    mounted = mountElement(() => <SkipNavContent id={undefined} />);

    expect(mounted.element.getAttribute("id")).toBe("chakra-skip-nav");
  });

  it("lets a consumer override the tab index it sets before the spread", () => {
    mounted = mountElement(() => <SkipNavContent tabindex={0} />);

    expect(mounted.element.getAttribute("tabindex")).toBe("0");
  });

  it("wraps the main content when it is given some", () => {
    mounted = mountElement(() => (
      <SkipNavContent>
        <p data-probe="body">Main</p>
      </SkipNavContent>
    ));

    expect(mounted.element.querySelector('[data-probe="body"]')).not.toBeNull();
  });

  it("has no accessibility violations as a pair", async () => {
    mounted = mountElement(() => (
      <div>
        <SkipNavLink>Skip to content</SkipNavLink>
        <SkipNavContent>
          <p>Main</p>
        </SkipNavContent>
      </div>
    ));

    await expectNoA11yViolations(mounted.element);
  });
});
