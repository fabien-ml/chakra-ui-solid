import skeletonServerHtml from "virtual:hydration-fixture?id=skeleton";
import {
  hydrateFixture,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import { skeleton } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Skeleton, SkeletonCircle, SkeletonPropsProvider, SkeletonText } from "../skeleton";
import { Tree } from "./skeleton.ssr-entry";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("Skeleton", () => {
  it("renders a loading block at the recipe's defaults", () => {
    mounted = mountElement(() => <Skeleton height="5" />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("DIV");
    // `loading: true` is the recipe's default, and these three are what it does: the text it stands
    // in for is invisible, and the block takes no pointer.
    expect(style.color).toBe(TRANSPARENT);
    expect(style.pointerEvents).toBe("none");
    expect(style.cursor).toBe("default");
    // `pulse` paints a solid block; a working skeleton has a background and a broken one does not.
    expect(style.backgroundColor).toBe("rgb(228, 228, 231)");
  });

  it("gives the real content back when loading turns off", () => {
    const [loading, setLoading] = createSignal(true);
    mounted = mountElement(() => (
      <Skeleton height="6" loading={loading()}>
        <span>Chakra UI is cool</span>
      </Skeleton>
    ));

    expect(getComputedStyle(mounted.element).color).toBe(TRANSPARENT);
    flush(() => setLoading(false));
    const style = getComputedStyle(mounted.element);

    expect(style.color).not.toBe(TRANSPARENT);
    expect(style.backgroundColor).toBe(TRANSPARENT);
  });

  it("hides the children in place while loading, rather than removing them", () => {
    // `visibility`, not `display` — the placeholder is exactly the shape the real content will be,
    // which is the whole reason the children stay in the tree.
    mounted = mountElement(() => (
      <Skeleton>
        <span data-probe="child">Chakra UI is cool</span>
      </Skeleton>
    ));

    const child = mounted.element.querySelector('[data-probe="child"]');
    if (!(child instanceof HTMLElement)) {
      throw new Error("the skeleton dropped its child");
    }

    expect(getComputedStyle(child).visibility).toBe("hidden");
  });

  it("sweeps a gradient on `shine`, coloured through two custom properties", () => {
    mounted = mountElement(() => (
      <Skeleton
        variant="shine"
        height="5"
        css={{ "--start-color": "colors.pink.500", "--end-color": "colors.orange.500" }}
      />
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.backgroundImage).toContain("linear-gradient");
    expect(style.getPropertyValue("--start-color").trim()).toBe("#ec4899");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement(() => <Skeleton variant="none" loading={false} />);

    expect(mounted.element.hasAttribute("variant")).toBe(false);
    expect(mounted.element.hasAttribute("loading")).toBe(false);
    expect(skeleton.variantKeys).toEqual(["loading", "variant"]);
  });

  it("takes props from a provider above it, and keeps them past a forwarded `undefined`", () => {
    mounted = mountElement(() => (
      <SkeletonPropsProvider value={{ variant: "shine" }}>
        <Skeleton height="5" variant={undefined} />
      </SkeletonPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).backgroundImage).toContain("linear-gradient");
  });
});

describe("SkeletonCircle", () => {
  it("is one element, the Skeleton wearing the Circle's own size and radius", () => {
    // Chakra composes the two with `asChild`; `render` is the Solid-native form of the same merge.
    // Nested instead, the animation would be a square inside a round box — the recipe's radius is
    // on the inner element.
    mounted = mountElement(() => <SkeletonCircle size="10" />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.children).toHaveLength(0);
    expect(style.width).toBe("40px");
    expect(style.height).toBe("40px");
    expect(style.borderRadius).toBe("9999px");
    expect(style.backgroundColor).toBe("rgb(228, 228, 231)");
  });

  it("still takes the Skeleton's own variants", () => {
    mounted = mountElement(() => <SkeletonCircle size="10" variant="shine" />);

    expect(getComputedStyle(mounted.element).backgroundImage).toContain("linear-gradient");
  });
});

describe("SkeletonText", () => {
  // The Stack's own children — never a class selector, which would pass on a completely
  // unstyled element (`CLAUDE.md`, *silent unstyling*).
  const linesOf = (root: Element) => root.children;

  it("draws one line per `noOfLines`, with the last one short", () => {
    mounted = mountElement(() => <SkeletonText noOfLines={3} />);
    const lines = linesOf(mounted.element);

    expect(lines).toHaveLength(3);
    expect(getComputedStyle(lines[0] as Element).height).toBe("16px");
    // A paragraph's last line does not reach the margin, and neither does this one. A percentage
    // `max-width` is not resolved against the containing block by `getComputedStyle`, so these read
    // as the declarations they are.
    expect(getComputedStyle(lines[0] as Element).maxWidth).toBe("100%");
    expect(getComputedStyle(lines[2] as Element).maxWidth).toBe("80%");
  });

  it("draws a single full-width line when there is only one", () => {
    mounted = mountElement(() => <SkeletonText noOfLines={1} />);
    const lines = linesOf(mounted.element);

    expect(lines).toHaveLength(1);
    expect(getComputedStyle(lines[0] as Element).maxWidth).toBe("100%");
  });

  it("tracks a count that changes", () => {
    const [count, setCount] = createSignal(2);
    mounted = mountElement(() => <SkeletonText noOfLines={count()} />);

    expect(linesOf(mounted.element)).toHaveLength(2);
    flush(() => setCount(5));
    expect(linesOf(mounted.element)).toHaveLength(5);
  });

  it("collapses to one line when not loading, and gives the children back", () => {
    mounted = mountElement(() => (
      <SkeletonText loading={false} noOfLines={3}>
        <span>Chakra UI is cool</span>
      </SkeletonText>
    ));

    expect(linesOf(mounted.element)).toHaveLength(1);
    expect(getComputedStyle(linesOf(mounted.element)[0] as Element).height).not.toBe("16px");
  });

  it("gives `gap` to the stack rather than to the lines", () => {
    // Passed through to each Skeleton it would set a flex gap on an empty block and the lines
    // would sit flush against each other, which is a layout bug with no error.
    mounted = mountElement(() => <SkeletonText noOfLines={2} gap="4" />);

    expect(getComputedStyle(mounted.element).rowGap).toBe("16px");
    expect(getComputedStyle(linesOf(mounted.element)[0] as Element).rowGap).not.toBe("16px");
  });

  it("gives `rootProps` to the stack", () => {
    // An `id` rather than a style prop, and the reason is worth stating: a style value nested inside
    // an object prop is not statically extractable — `SkeletonText` is not a name Panda tracks, so
    // `rootProps={{ maxW: "xs" }}` would compute a class no sheet has a rule for. Asserting a
    // computed style here would pin the routing to a value that only works by accident.
    mounted = mountElement(() => <SkeletonText noOfLines={2} rootProps={{ id: "lines" }} />);

    expect(mounted.element.id).toBe("lines");
    expect(mounted.element.children).toHaveLength(2);
  });

  it("keeps the stack full-width when `rootProps` carries an unset `width`", () => {
    // The measurement behind the `withDefaults` call around `rootProps`. Written as `width="full"
    // {...rootProps}` the default is *gone* here: `rootProps` is a bag whose key set is the union
    // of its sources' own keys, so a `width` present with `undefined` wins the presence merge,
    // `css()` receives `undefined`, no rule is emitted, and the stack shrinks to its content
    // (`CLAUDE.md`, *The third hazard*). The `width: ["full"]` preset row is what keeps the rule
    // reachable now that no extractor sees the value.
    // A flex row 400px wide, so the stack's own width is observable: a flex item sizes to its
    // content, and these lines have no intrinsic width at all.
    const Forwarding = (props: { width?: string }) => (
      <div style={{ display: "flex", width: "400px" }}>
        <SkeletonText noOfLines={2} rootProps={{ width: props.width }} />
      </div>
    );

    mounted = mountElement(() => <Forwarding />);
    const stack = mounted.element.firstElementChild as Element;

    expect(getComputedStyle(stack).width).toBe("400px");
  });
});

describe("Skeleton — server render, then hydrate", () => {
  it("reuses every server node across all three line counts", () => {
    // The half neither other project can see. `SkeletonText` renders a `<For>` whose length is the
    // subject, so two lines, three lines and a `loading={false}` collapse each consume a different
    // number of hydration keys (`_hk`) and a disagreement shifts every sibling after it. If the two
    // sides diverge, `hydrate()` either claims a server node under a different client tree or gives
    // up and client-renders, and **both are silent**: the placeholders still look right.
    const { container, dispose } = hydrateFixture(skeletonServerHtml, () => <Tree />);

    const probe = (name: string) => {
      const element = container.querySelector(`[data-probe="${name}"]`);
      if (!(element instanceof HTMLElement)) {
        throw new Error(`the hydrated tree is missing its \`${name}\` probe`);
      }
      return element;
    };

    expect(probe("two-lines").firstElementChild?.children).toHaveLength(2);
    expect(probe("three-lines").firstElementChild?.children).toHaveLength(3);
    expect(probe("loaded").firstElementChild?.children).toHaveLength(1);

    // The class each side computed has to be the same one, on the server's own nodes rather than on
    // nodes a client fallback rebuilt — `SkeletonCircle` is where that is worth pinning, since its
    // class is two components' output merged into one element.
    expect(getComputedStyle(probe("circle")).width).toBe("40px");
    expect(getComputedStyle(probe("circle")).borderRadius).toBe("9999px");
    expect(getComputedStyle(probe("from-context")).backgroundImage).toContain("linear-gradient");

    dispose();
  });
});
