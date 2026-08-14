import buttonServerHtml from "virtual:hydration-fixture?id=button";
import {
  hydrateFixture,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import { button } from "@chakra-ui-solid/styled-system/recipes";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Button, VARIANT_KEYS } from "../button";
import { ButtonGroup } from "../button-group";
import { CloseButton } from "../close-button";
import { IconButton } from "../icon-button";
import { Tree } from "./button.ssr-entry";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const TRANSPARENT = "rgba(0, 0, 0, 0)";

function queryElement(root: ParentNode, selector: string): HTMLElement {
  const found = root.querySelector(selector);
  if (!(found instanceof HTMLElement)) {
    throw new Error(`expected an element matching \`${selector}\``);
  }
  return found;
}

/** The same, for an `<svg>` — which is an `SVGElement` and never an `HTMLElement`. */
function querySvg(root: ParentNode): SVGElement {
  const found = root.querySelector("svg");
  if (!(found instanceof SVGElement)) {
    throw new Error("expected an `svg` element");
  }
  return found;
}

/** A component that records how many times it was really constructed. */
function countingComponent(): { component: () => JSX.Element; builds: () => number } {
  let builds = 0;
  return {
    component: () => {
      builds += 1;
      return <span data-testid="slot" />;
    },
    builds: () => builds,
  };
}

describe("Button", () => {
  it("renders a `type=button` at the recipe's default size and variant", () => {
    mounted = mountElement(() => <Button>Save</Button>);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("BUTTON");
    // Chakra's default, and it is load-bearing: the platform's is `submit`, so a button inside a
    // form would post it.
    expect(mounted.element.getAttribute("type")).toBe("button");
    // `md` and `solid` come from the recipe's own `defaultVariants`, so both of these are the
    // recipe answering rather than the browser — an unstyled button computes `auto` and no fill.
    expect(style.height).toBe("40px");
    expect(style.backgroundColor).not.toBe(TRANSPARENT);
  });

  it("keeps `type=button` when a wrapper forwards an unset `type`", () => {
    // Spelled `merge({ type: "button" }, props)`, the default is resolved by *presence*: the key is
    // there with `undefined`, so it wins, the attribute is dropped, and the platform's `submit`
    // takes over — a button that posts the form around it. Nothing errors, and forwarding an
    // optional prop is the most ordinary thing a wrapper does.
    mounted = mountElement(() => <Button type={undefined}>Save</Button>);

    expect(mounted.element.getAttribute("type")).toBe("button");
  });

  it("resolves `size` and `variant` to real computed styles", () => {
    mounted = mountElement(() => (
      <Button size="lg" variant="ghost">
        Save
      </Button>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.height).toBe("44px");
    expect(style.backgroundColor).toBe(TRANSPARENT);
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The recipe lands in `@layer recipes`, below the `@layer utilities` a style prop emits into,
    // so `height` wins against the `md` step rather than racing it on source order.
    mounted = mountElement(() => <Button height="20">Save</Button>);

    expect(getComputedStyle(mounted.element).height).toBe("80px");
  });

  it("keeps its own props off the element, and the tuple is the recipe's", () => {
    mounted = mountElement(() => (
      <Button size="lg" variant="ghost" spinnerPlacement="end">
        Save
      </Button>
    ));

    for (const attribute of ["size", "variant", "loading", "spinnerPlacement"]) {
      expect(mounted.element.hasAttribute(attribute)).toBe(false);
    }
    // `omit` narrows by the literal keys it is handed, so a variant added to the recipe upstream
    // and not to the tuple would reach the DOM as an attribute — with nothing else to say so.
    expect(button.variantKeys).toEqual([...VARIANT_KEYS]);
  });

  it("marks, disables and covers itself while loading, without changing width", () => {
    const [loading, setLoading] = createSignal(false);
    mounted = mountElement(() => <Button loading={loading()}>Save changes</Button>);

    const idleWidth = mounted.element.getBoundingClientRect().width;
    expect(mounted.element.hasAttribute("data-loading")).toBe(false);

    flush(() => setLoading(true));

    expect(mounted.element.getAttribute("data-loading")).toBe("");
    expect((mounted.element as HTMLButtonElement).disabled).toBe(true);
    // The Loader's spinner-only branch: an AbsoluteCenter (the only `div` in here) over a
    // `visibility: hidden` wrapper that still holds the label's space.
    const overlay = queryElement(mounted.element, "div");
    expect(overlay.firstElementChild).not.toBeNull();

    // The whole point of that hidden wrapper. A Loader that removed the children instead would
    // collapse the button to the spinner's width the moment it started working, and nothing about
    // the markup or the classes would say so.
    expect(mounted.element.getBoundingClientRect().width).toBeCloseTo(idleWidth, 1);
  });

  it("replaces the label with `loadingText`, spinner first", () => {
    mounted = mountElement(() => (
      <Button loading loadingText="Saving…">
        Save
      </Button>
    ));

    expect(mounted.element.textContent).toBe("Saving…");
  });

  /**
   * The hazard these three exist for: a JSX-valued **prop** compiles to a lazy getter that runs
   * `createComponent` on every read, and `props.children` is read by *both* arms of the loading
   * branch. Read raw, toggling `loading` rebuilds the child subtree and throws the previous one
   * away — with identical markup, identical computed styles and a green suite. Only a count and a
   * node identity say otherwise.
   */
  it("hands the same children to both arms of the loading branch", () => {
    const { component: Counted, builds } = countingComponent();
    const [loading, setLoading] = createSignal(false);
    mounted = mountElement(() => (
      <Button loading={loading()}>
        <Counted />
      </Button>
    ));

    const slot = queryElement(mounted.element, "[data-testid='slot']");
    expect(builds()).toBe(1);

    flush(() => setLoading(true));
    expect(builds()).toBe(1);
    expect(queryElement(mounted.element, "[data-testid='slot']")).toBe(slot);

    flush(() => setLoading(false));
    expect(builds()).toBe(1);
    expect(queryElement(mounted.element, "[data-testid='slot']")).toBe(slot);
  });

  it("builds the `spinner` slot once, and not at all while idle", () => {
    const { component: Counted, builds } = countingComponent();
    const [loading, setLoading] = createSignal(false);
    mounted = mountElement(() => (
      <Button loading={loading()} spinner={<Counted />}>
        Save
      </Button>
    ));

    // The Loader is only constructed by the loading arm, so an idle Button pays for no spinner.
    expect(builds()).toBe(0);

    flush(() => setLoading(true));
    expect(queryElement(mounted.element, "[data-testid='slot']")).toBeDefined();
    expect(builds()).toBe(1);
  });

  it("builds the `loadingText` slot once", () => {
    const { component: Counted, builds } = countingComponent();
    mounted = mountElement(() => (
      <Button loading loadingText={<Counted />}>
        Save
      </Button>
    ));

    expect(queryElement(mounted.element, "[data-testid='slot']")).toBeDefined();
    expect(builds()).toBe(1);
  });
});

describe("ButtonGroup", () => {
  it("supplies `size` and `variant` to every Button below it", () => {
    mounted = mountElement(() => (
      <ButtonGroup size="sm" variant="ghost">
        <Button>One</Button>
      </ButtonGroup>
    ));
    const style = getComputedStyle(queryElement(mounted.element, "button"));

    expect(style.height).toBe("36px");
    expect(style.backgroundColor).toBe(TRANSPARENT);
  });

  it("lets a Button's own prop beat the group", () => {
    mounted = mountElement(() => (
      <ButtonGroup size="sm">
        <Button size="lg">One</Button>
      </ButtonGroup>
    ));

    expect(getComputedStyle(queryElement(mounted.element, "button")).height).toBe("44px");
  });

  it("still reaches a Button that forwards an unset `size`", () => {
    // The same presence trap one layer up: the context is a default, so `merge(context, props)`
    // lets a wrapper's `size={props.size}` with nothing set erase the group's `sm`.
    mounted = mountElement(() => (
      <ButtonGroup size="sm">
        <Button size={undefined}>One</Button>
      </ButtonGroup>
    ));

    expect(getComputedStyle(queryElement(mounted.element, "button")).height).toBe("36px");
  });

  it("re-resolves the Buttons below it when its own `size` is a signal", () => {
    // The assertion `recipe.splitVariantProps(props)` would have failed. It destructures the props
    // object eagerly, so the value read at that moment is the value the subtree keeps — the group
    // would go on supplying `sm` after the signal said `lg`, silently.
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mountElement(() => (
      <ButtonGroup size={size()}>
        <Button>One</Button>
      </ButtonGroup>
    ));
    const nested = queryElement(mounted.element, "button");

    expect(getComputedStyle(nested).height).toBe("36px");
    flush(() => setSize("lg"));
    expect(getComputedStyle(nested).height).toBe("44px");
  });

  it("keeps the variant keys off the Group's element", () => {
    mounted = mountElement(() => (
      <ButtonGroup size="sm" variant="ghost">
        <Button>One</Button>
      </ButtonGroup>
    ));

    expect(mounted.element.hasAttribute("size")).toBe(false);
    expect(mounted.element.hasAttribute("variant")).toBe(false);
  });
});

describe("IconButton", () => {
  it("drops the horizontal padding and sizes its icon off the label", () => {
    mounted = mountElement(() => (
      <IconButton aria-label="Search">
        <svg data-testid="icon" viewBox="0 0 24 24" />
      </IconButton>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.paddingLeft).toBe("0px");
    expect(style.paddingRight).toBe("0px");
    // Square: no padding to widen it, so the recipe's `min-width` decides the shape.
    expect(style.height).toBe("40px");
    expect(style.minWidth).toBe("40px");

    // `_icon` is `& :where(svg)`, and `1.2em` is 1.2× the `md` step's 14px. A style prop landing on
    // a condition our generated types do not carry would emit nothing at all.
    expect(getComputedStyle(querySvg(mounted.element)).fontSize).toBe("16.8px");
  });

  it("keeps all three defaults when a wrapper forwards them unset", () => {
    // The measurement behind the `withDefaults` bag. Written as `px="0" py="0" _icon={…}
    // {...props}` the defaults are *gone* here: a JSX spread is a presence merge, so each forwarded
    // `undefined` wins, `css()` receives `undefined`, no rule is emitted, and the button comes back
    // with a text button's padding (`CLAUDE.md`, *The third hazard*).
    const Forwarding = (props: { px?: string; py?: string; _icon?: { fontSize: string } }) => (
      <IconButton aria-label="Search" px={props.px} py={props.py} _icon={props._icon}>
        <svg viewBox="0 0 24 24" />
      </IconButton>
    );

    mounted = mountElement(() => <Forwarding />);
    const style = getComputedStyle(mounted.element);

    expect(style.paddingLeft).toBe("0px");
    expect(style.paddingRight).toBe("0px");
    expect(style.paddingTop).toBe("0px");
    expect(style.paddingBottom).toBe("0px");
    expect(getComputedStyle(querySvg(mounted.element)).fontSize).toBe("16.8px");
  });
});

describe("CloseButton", () => {
  it("is a labelled ghost IconButton carrying the ✕", () => {
    mounted = mountElement(() => <CloseButton />);

    expect(mounted.element.getAttribute("aria-label")).toBe("Close");
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
    expect(mounted.element.querySelector("svg")).not.toBeNull();
  });

  it("takes a custom icon, and its own label", () => {
    mounted = mountElement(() => (
      <CloseButton aria-label="Dismiss notification">
        <span data-testid="custom">×</span>
      </CloseButton>
    ));

    expect(mounted.element.getAttribute("aria-label")).toBe("Dismiss notification");
    expect(mounted.element.querySelector("svg")).toBeNull();
    expect(queryElement(mounted.element, "[data-testid='custom']")).toBeDefined();
  });

  it("keeps both defaults when a wrapper forwards them unset", () => {
    // As JSX attributes before the spread these resolved by presence, so a dismiss control built on
    // CloseButton and passing its own optional props through lost the ghost variant *and* the
    // accessible name — an unlabelled solid button, with nothing to say so.
    mounted = mountElement(() => <CloseButton variant={undefined} aria-label={undefined} />);

    expect(mounted.element.getAttribute("aria-label")).toBe("Close");
    expect(getComputedStyle(mounted.element).backgroundColor).toBe(TRANSPARENT);
  });
});

describe("Button — server render, then hydrate", () => {
  it("reuses every server node across all three loading shapes", () => {
    // The half neither other project can see. Each of Button's shapes consumes a different number
    // of hydration keys, and the two that resolve a slot through `children()` allocate it in the
    // ambient owner rather than at the position it is read. If server and client disagree,
    // `hydrate()` either claims a server node under a different client tree or gives up and
    // client-renders — and **both are silent**. `hydrateFixture` asserts hydration logged nothing,
    // added and dropped no element, and reused every server node as the same object.
    const { container, dispose } = hydrateFixture(buttonServerHtml, () => <Tree />);

    const loadingText = container.querySelector('[data-probe="loading-text"]');
    const hidden = container.querySelector('[data-probe="hidden-label"]');
    if (!(loadingText instanceof HTMLElement) || !(hidden instanceof HTMLElement)) {
      throw new Error("the hydrated tree is missing its probe elements");
    }

    // The branch each button picked has to be the branch it picked on the server, and the styles
    // have to survive on the server's own nodes rather than on nodes a fallback rebuilt: the
    // `loadingText` branch really did replace its children (so `replaced-label` is nowhere), and
    // the spinner-only branch is still holding its label's space invisibly.
    expect(container.querySelector('[data-probe="replaced-label"]')).toBeNull();
    expect(getComputedStyle(loadingText).visibility).toBe("visible");
    expect(getComputedStyle(hidden).visibility).toBe("hidden");

    dispose();
  });
});
