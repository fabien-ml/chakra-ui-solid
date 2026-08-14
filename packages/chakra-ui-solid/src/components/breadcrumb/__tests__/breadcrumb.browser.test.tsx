import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, For, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import {
  Breadcrumb,
  type BreadcrumbCurrentLinkProps,
  type BreadcrumbRootProps,
  type BreadcrumbSeparatorProps,
} from "../index";

/**
 * Computed styles throughout, never class names: `sva()` computes a class whether or not Panda
 * generated a rule for it, so a class-name assertion passes on a completely unstyled element.
 */

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function probe(container: ParentNode, name: string): HTMLElement {
  const element = container.querySelector(`[data-probe="${name}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-probe="${name}"] element`);
  }
  return element;
}

function probeAll(container: ParentNode, name: string): HTMLElement[] {
  return [...container.querySelectorAll(`[data-probe="${name}"]`)].filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
}

const crumbs = [
  { title: "Docs", url: "#docs" },
  { title: "Components", url: "#components" },
  { title: "Breadcrumb", url: "#breadcrumb" },
];

describe("Breadcrumb — anatomy", () => {
  it("renders a nav over an ol of li, each part in its own slot", () => {
    mounted = mount(() => (
      <Breadcrumb.Root data-probe="root">
        <Breadcrumb.List data-probe="list">
          <Breadcrumb.Item data-probe="item">
            <Breadcrumb.Link data-probe="link" href="#docs">
              Docs
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator data-probe="separator" />
          <Breadcrumb.Item>
            <Breadcrumb.CurrentLink data-probe="current">Props</Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("NAV");
    expect(probe(container, "list").tagName).toBe("OL");
    expect(probe(container, "item").tagName).toBe("LI");
    expect(probe(container, "link").tagName).toBe("A");
    expect(probe(container, "separator").tagName).toBe("LI");
    expect(probe(container, "current").tagName).toBe("SPAN");

    // The list is the flex row; `display` is asserted only here, because every part below it is a
    // flex item and CSS blockifies an `inline-flex` one to `flex`.
    expect(getComputedStyle(probe(container, "list")).display).toBe("flex");
    expect(getComputedStyle(probe(container, "list")).listStyleType).toBe("none");
    expect(getComputedStyle(probe(container, "list")).wordBreak).toBe("break-word");
    expect(getComputedStyle(probe(container, "item")).alignItems).toBe("center");
    expect(getComputedStyle(probe(container, "link")).columnGap).toBe("8px");
    expect(getComputedStyle(probe(container, "link")).textDecorationLine).toBe("none");
    expect(getComputedStyle(probe(container, "separator")).opacity).toBe("0.8");
  });

  it("names the landmark, and keeps doing so when a wrapper forwards `aria-label` unset", () => {
    // A page may carry more than one `nav`, and an unnamed second one is announced as another
    // anonymous region. `merge` resolves by presence, so a forwarded `undefined` would delete the
    // default silently (`CLAUDE.md`, *The third hazard*).
    const Forwarding = (props: Pick<BreadcrumbRootProps, "aria-label">) => (
      <Breadcrumb.Root data-probe="forwarded" aria-label={props["aria-label"]} />
    );

    mounted = mount(() => (
      <>
        <Breadcrumb.Root data-probe="default" />
        <Forwarding />
        <Breadcrumb.Root data-probe="local" aria-label="You are here" />
      </>
    ));
    const container = mounted.container;

    expect(probe(container, "default").getAttribute("aria-label")).toBe("breadcrumb");
    expect(probe(container, "forwarded").getAttribute("aria-label")).toBe("breadcrumb");
    expect(probe(container, "local").getAttribute("aria-label")).toBe("You are here");
  });

  it("styles every repeat of the item and separator from one class map", () => {
    // The parts are minted once and rendered per crumb — there is nothing per-instance about them,
    // and this is the assertion that says so rather than assuming it.
    mounted = mount(() => (
      <Breadcrumb.Root size="lg">
        <Breadcrumb.List>
          <For each={crumbs}>
            {(crumb) => (
              <>
                <Breadcrumb.Item data-probe="item">
                  <Breadcrumb.Link data-probe="link" href={crumb.url}>
                    {crumb.title}
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator data-probe="separator" />
              </>
            )}
          </For>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const container = mounted.container;

    expect(probeAll(container, "item")).toHaveLength(3);
    for (const item of probeAll(container, "item")) {
      expect(getComputedStyle(item).alignItems).toBe("center");
    }
    for (const separator of probeAll(container, "separator")) {
      expect(getComputedStyle(separator).opacity).toBe("0.8");
      // Each one draws its own chevron rather than sharing a single hoisted element.
      expect(separator.querySelector("svg")).toBeInstanceOf(SVGElement);
    }
  });
});

describe("Breadcrumb — the defaults each part carries", () => {
  it("marks the current crumb as a link on the page it names", () => {
    mounted = mount(() => (
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.CurrentLink data-probe="default">Props</Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.CurrentLink data-probe="local" role="presentation" aria-current="step">
              Props
            </Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "default").getAttribute("role")).toBe("link");
    expect(probe(container, "default").getAttribute("aria-current")).toBe("page");
    expect(probe(container, "local").getAttribute("role")).toBe("presentation");
    expect(probe(container, "local").getAttribute("aria-current")).toBe("step");
  });

  it("draws a chevron unless a child replaces it, and hides either from a screen reader", () => {
    mounted = mount(() => (
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Separator data-probe="default" />
          <Breadcrumb.Separator data-probe="custom">/</Breadcrumb.Separator>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "default").querySelector("svg")).toBeInstanceOf(SVGElement);
    expect(probe(container, "default").getAttribute("aria-hidden")).toBe("true");
    expect(probe(container, "custom").querySelector("svg")).toBeNull();
    expect(probe(container, "custom").textContent).toBe("/");
  });

  it("draws an ellipsis on an li the type calls a span, presentational and hidden", () => {
    // `withContext("li", "ellipsis")` is what upstream renders, over a
    // `HTMLChakraProps<"span">` its own type declares. Parity is what a consumer observes, and an
    // `ol` may only contain `li`.
    mounted = mount(() => (
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Ellipsis data-probe="ellipsis" />
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const ellipsis = probe(mounted.container, "ellipsis");

    expect(ellipsis.tagName).toBe("LI");
    expect(ellipsis.getAttribute("role")).toBe("presentation");
    expect(ellipsis.getAttribute("aria-hidden")).toBe("true");
    expect(ellipsis.querySelector("svg")).toBeInstanceOf(SVGElement);
    expect(getComputedStyle(ellipsis).justifyContent).toBe("center");
  });

  it("keeps each part's default when a wrapper forwards it unset", () => {
    // Spelled through real wrappers rather than as `role={undefined}`, which the a11y lint reads as
    // an invalid role.
    const ForwardingCurrent = (props: Pick<BreadcrumbCurrentLinkProps, "role">) => (
      <Breadcrumb.CurrentLink data-probe="current" role={props.role} />
    );
    const ForwardingSeparator = (props: Pick<BreadcrumbSeparatorProps, "aria-hidden">) => (
      <Breadcrumb.Separator data-probe="separator" aria-hidden={props["aria-hidden"]} />
    );

    mounted = mount(() => (
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <ForwardingCurrent />
          <ForwardingSeparator />
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "current").getAttribute("role")).toBe("link");
    expect(probe(container, "separator").getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Breadcrumb — the recipe", () => {
  it("underlines a link on `underline` and only recolours it on `plain`", () => {
    const [variant, setVariant] = createSignal<"plain" | "underline">("plain");
    mounted = mount(() => (
      <Breadcrumb.Root variant={variant()}>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link data-probe="link" href="#docs">
              Docs
            </Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "link")).textDecorationLine).toBe("none");

    flush(() => setVariant("underline"));

    expect(getComputedStyle(probe(container, "link")).textDecorationLine).toBe("underline");
  });

  it("moves the list's scale and gap with `size`", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => (
      <Breadcrumb.Root size={size()}>
        <Breadcrumb.List data-probe="list">
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#docs">Docs</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "list")).fontSize).toBe("12px");
    expect(getComputedStyle(probe(container, "list")).columnGap).toBe("4px");

    flush(() => setSize("lg"));

    expect(getComputedStyle(probe(container, "list")).fontSize).toBe("16px");
    expect(getComputedStyle(probe(container, "list")).columnGap).toBe("8px");
  });

  it("keeps the two variant props off the element", () => {
    mounted = mount(() => <Breadcrumb.Root data-probe="root" variant="underline" size="lg" />);
    const root = probe(mounted.container, "root");

    expect(root.hasAttribute("variant")).toBe(false);
    expect(root.hasAttribute("size")).toBe(false);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Breadcrumb.Root unstyled>
        <Breadcrumb.List data-probe="list">
          <Breadcrumb.Item data-probe="item">
            <Breadcrumb.Link href="#docs">Docs</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "list")).display).toBe("block");
    expect(getComputedStyle(probe(container, "item")).alignItems).toBe("normal");
  });
});

describe("Breadcrumb — props context and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <Breadcrumb.PropsProvider value={{ size: "lg" }}>
        <Breadcrumb.Root>
          <Breadcrumb.List data-probe="inherited" />
        </Breadcrumb.Root>
        {/* `merge` resolves by presence, so an unset forward would beat the provider with
            `undefined` (`CLAUDE.md`, *The third hazard*). */}
        <Breadcrumb.Root size={undefined}>
          <Breadcrumb.List data-probe="forwarded" />
        </Breadcrumb.Root>
        <Breadcrumb.Root size="sm">
          <Breadcrumb.List data-probe="local" />
        </Breadcrumb.Root>
      </Breadcrumb.PropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).fontSize).toBe("16px");
    expect(getComputedStyle(probe(container, "forwarded")).fontSize).toBe("16px");
    expect(getComputedStyle(probe(container, "local")).fontSize).toBe("12px");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Breadcrumb.List />);
      dispose();
    }).toThrow(/Breadcrumb sub-components must be rendered inside a Breadcrumb root component/);
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => (
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#docs">Docs</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Ellipsis />
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.CurrentLink>Props</Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});
