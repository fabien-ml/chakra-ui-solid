import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, For, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { CheckIcon } from "../../icons";
import { Timeline, type TimelineItemProps, type TimelineRootProps } from "../index";

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

const events = [
  { title: "Product Shipped", date: "13th May 2021" },
  { title: "Order Confirmed", date: "18th May 2021" },
  { title: "Order Delivered", date: "20th May 2021" },
];

function Event(props: { title: string; date: string }) {
  return (
    <Timeline.Item data-probe="item">
      <Timeline.Connector data-probe="connector">
        <Timeline.Separator data-probe="separator" />
        <Timeline.Indicator data-probe="indicator" />
      </Timeline.Connector>
      <Timeline.Content data-probe="content">
        <Timeline.Title data-probe="title">{props.title}</Timeline.Title>
        <Timeline.Description data-probe="description">{props.date}</Timeline.Description>
      </Timeline.Content>
    </Timeline.Item>
  );
}

describe("Timeline — anatomy", () => {
  it("renders a column of items, each part in its own slot", () => {
    mounted = mount(() => (
      <Timeline.Root data-probe="root">
        <Event title="Product Shipped" date="13th May 2021" />
      </Timeline.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "root").tagName).toBe("DIV");
    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "item")).position).toBe("relative");
    expect(getComputedStyle(probe(container, "item")).columnGap).toBe("16px");
    expect(getComputedStyle(probe(container, "connector")).alignSelf).toBe("stretch");
    expect(getComputedStyle(probe(container, "separator")).position).toBe("absolute");
    expect(getComputedStyle(probe(container, "indicator")).borderRadius).toBe("9999px");
    expect(getComputedStyle(probe(container, "content")).flexDirection).toBe("column");
    expect(getComputedStyle(probe(container, "title")).fontWeight).toBe("500");
    expect(getComputedStyle(probe(container, "description")).fontSize).toBe("12px");
  });

  it("names itself a list and each item a listitem, over markup that is only flex boxes", () => {
    mounted = mount(() => (
      <Timeline.Root data-probe="root">
        <Timeline.Item data-probe="item" />
      </Timeline.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "root").getAttribute("role")).toBe("list");
    expect(probe(container, "item").getAttribute("role")).toBe("listitem");
  });

  it("keeps both roles when a wrapper forwards `role` unset", () => {
    // `merge` resolves by presence, so a forwarded `undefined` would delete either half of the pair
    // silently (`CLAUDE.md`, *The third hazard*). Spelled through real wrappers rather than as
    // `role={undefined}`, which the a11y lint reads as an invalid role.
    const ForwardingRoot = (props: Pick<TimelineRootProps, "role">) => (
      <Timeline.Root data-probe="root" role={props.role} />
    );
    const ForwardingItem = (props: Pick<TimelineItemProps, "role">) => (
      <Timeline.Item data-probe="item" role={props.role} />
    );

    mounted = mount(() => (
      <>
        <ForwardingRoot />
        <Timeline.Root>
          <ForwardingItem />
        </Timeline.Root>
        <Timeline.Root data-probe="local-root" role="presentation">
          <Timeline.Item data-probe="local-item" role="presentation" />
        </Timeline.Root>
      </>
    ));
    const container = mounted.container;

    expect(probe(container, "root").getAttribute("role")).toBe("list");
    expect(probe(container, "item").getAttribute("role")).toBe("listitem");
    expect(probe(container, "local-root").getAttribute("role")).toBe("presentation");
    expect(probe(container, "local-item").getAttribute("role")).toBe("presentation");
  });

  it("styles every repeat of the item from one class map", () => {
    // The parts are minted once and rendered per event — there is nothing per-instance about them,
    // and this is the assertion that says so rather than assuming it.
    mounted = mount(() => (
      <Timeline.Root size="lg">
        <For each={events}>{(event) => <Event title={event.title} date={event.date} />}</For>
      </Timeline.Root>
    ));
    const container = mounted.container;

    expect(probeAll(container, "item")).toHaveLength(3);
    for (const item of probeAll(container, "item")) {
      expect(item.getAttribute("role")).toBe("listitem");
      expect(getComputedStyle(item).position).toBe("relative");
    }
    for (const indicator of probeAll(container, "indicator")) {
      // `size="lg"` sets `--timeline-indicator-size` on the Root, and every indicator reads it.
      expect(getComputedStyle(indicator).width).toBe("24px");
    }
  });
});

describe("Timeline — the recipe", () => {
  it("fills the indicator on `solid` and rings it on `outline`", () => {
    const [variant, setVariant] = createSignal<"solid" | "outline">("solid");
    mounted = mount(() => (
      <Timeline.Root variant={variant()}>
        <Timeline.Item>
          <Timeline.Connector>
            <Timeline.Indicator data-probe="indicator" />
          </Timeline.Connector>
        </Timeline.Item>
      </Timeline.Root>
    ));
    const container = mounted.container;

    const solidFill = getComputedStyle(probe(container, "indicator")).backgroundColor;
    expect(getComputedStyle(probe(container, "indicator")).borderTopWidth).toBe("0px");

    flush(() => setVariant("outline"));

    expect(getComputedStyle(probe(container, "indicator")).backgroundColor).not.toBe(solidFill);
    expect(getComputedStyle(probe(container, "indicator")).borderTopWidth).toBe("1px");
  });

  it("hides the last item's separator unless `showLastSeparator`", () => {
    const [showLastSeparator, setShowLastSeparator] = createSignal(false);
    mounted = mount(() => (
      <Timeline.Root showLastSeparator={showLastSeparator()}>
        <Timeline.Item>
          <Timeline.Connector>
            <Timeline.Separator data-probe="first" />
          </Timeline.Connector>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Connector>
            <Timeline.Separator data-probe="last" />
          </Timeline.Connector>
        </Timeline.Item>
      </Timeline.Root>
    ));
    const container = mounted.container;

    // The whole variant is one custom property, read by the separator's own `display`.
    expect(getComputedStyle(probe(container, "first")).display).toBe("block");
    expect(getComputedStyle(probe(container, "last")).display).toBe("none");

    flush(() => setShowLastSeparator(true));

    expect(getComputedStyle(probe(container, "last")).display).toBe("block");
  });

  it("moves the indicator and the title with `size`", () => {
    const [size, setSize] = createSignal<"sm" | "xl">("sm");
    mounted = mount(() => (
      <Timeline.Root size={size()}>
        <Timeline.Item>
          <Timeline.Connector>
            <Timeline.Indicator data-probe="indicator" />
          </Timeline.Connector>
          <Timeline.Content>
            <Timeline.Title data-probe="title">Product Shipped</Timeline.Title>
          </Timeline.Content>
        </Timeline.Item>
      </Timeline.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "indicator")).width).toBe("16px");
    expect(getComputedStyle(probe(container, "title")).fontSize).toBe("12px");

    flush(() => setSize("xl"));

    expect(getComputedStyle(probe(container, "indicator")).width).toBe("32px");
    expect(getComputedStyle(probe(container, "title")).fontSize).toBe("14px");
  });

  it("keeps the three variant props off the element", () => {
    mounted = mount(() => (
      <Timeline.Root data-probe="root" variant="subtle" size="lg" showLastSeparator />
    ));
    const root = probe(mounted.container, "root");

    expect(root.hasAttribute("variant")).toBe(false);
    expect(root.hasAttribute("size")).toBe(false);
    expect(root.hasAttribute("showLastSeparator")).toBe(false);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Timeline.Root data-probe="root" unstyled>
        <Timeline.Item data-probe="item">
          <Timeline.Connector data-probe="connector">
            <Timeline.Indicator data-probe="indicator" />
          </Timeline.Connector>
        </Timeline.Item>
      </Timeline.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).flexDirection).toBe("row");
    expect(getComputedStyle(probe(container, "connector")).alignSelf).toBe("auto");
    expect(getComputedStyle(probe(container, "indicator")).borderRadius).toBe("0px");
  });
});

describe("Timeline — props context and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <Timeline.RootPropsProvider value={{ size: "xl" }}>
        <Timeline.Root>
          <Timeline.Item>
            <Timeline.Connector>
              <Timeline.Indicator data-probe="inherited" />
            </Timeline.Connector>
          </Timeline.Item>
        </Timeline.Root>
        {/* `merge` resolves by presence, so an unset forward would beat the provider with
            `undefined` (`CLAUDE.md`, *The third hazard*). */}
        <Timeline.Root size={undefined}>
          <Timeline.Item>
            <Timeline.Connector>
              <Timeline.Indicator data-probe="forwarded" />
            </Timeline.Connector>
          </Timeline.Item>
        </Timeline.Root>
        <Timeline.Root size="sm">
          <Timeline.Item>
            <Timeline.Connector>
              <Timeline.Indicator data-probe="local" />
            </Timeline.Connector>
          </Timeline.Item>
        </Timeline.Root>
      </Timeline.RootPropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).width).toBe("32px");
    expect(getComputedStyle(probe(container, "forwarded")).width).toBe("32px");
    expect(getComputedStyle(probe(container, "local")).width).toBe("16px");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Timeline.Content />);
      dispose();
    }).toThrow(/Timeline sub-components must be rendered inside a Timeline root component/);
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => (
      <Timeline.Root>
        <For each={events}>
          {(event) => (
            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator>
                  {/* A real glyph, not a bare `✓`: a non-BMP character is an undecidable contrast
                      check to axe rather than text. */}
                  <CheckIcon boxSize="1em" />
                </Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title>{event.title}</Timeline.Title>
                <Timeline.Description>{event.date}</Timeline.Description>
              </Timeline.Content>
            </Timeline.Item>
          )}
        </For>
      </Timeline.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});
