import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import type { ComponentProps } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Tag } from "../index";

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

function Closable(props: { size?: "sm" | "md" | "lg" | "xl"; onClose?: () => void }) {
  return (
    <Tag.Root data-probe="root" size={props.size}>
      <Tag.StartElement data-probe="start">@</Tag.StartElement>
      <Tag.Label data-probe="label">Fish</Tag.Label>
      <Tag.EndElement data-probe="end">
        <Tag.CloseTrigger data-probe="close" onClick={props.onClose} />
      </Tag.EndElement>
    </Tag.Root>
  );
}

describe("Tag — anatomy", () => {
  it("renders a div root with each part in its own slot", () => {
    mounted = mount(() => <Closable />);
    const container = mounted.container;

    // A `div`, where Chakra's own type says `span` — `withProvider("div", "root")` is what upstream
    // actually renders, and parity is what a consumer observes.
    expect(probe(container, "root").tagName).toBe("DIV");
    expect(probe(container, "label").tagName).toBe("SPAN");
    expect(probe(container, "close").tagName).toBe("BUTTON");

    expect(getComputedStyle(probe(container, "root")).display).toBe("inline-flex");
    expect(getComputedStyle(probe(container, "label")).webkitLineClamp).toBe("1");
    expect(getComputedStyle(probe(container, "start")).flexShrink).toBe("0");
  });

  it("gives the close trigger a `type` and the ✕, both as defaults", () => {
    mounted = mount(() => <Closable />);
    const close = probe(mounted.container, "close");

    expect(close.getAttribute("type")).toBe("button");
    expect(close.querySelector("svg")).not.toBeNull();
    expect(getComputedStyle(close).justifyContent).toBe("center");
  });

  it("keeps the `type` default when a wrapper forwards it unset", () => {
    // `merge` resolves a key by presence, so a forwarded `undefined` would delete the default and
    // the control would submit its form (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => (
      <Tag.Root>
        <Tag.CloseTrigger data-probe="close" type={undefined} />
      </Tag.Root>
    ));

    expect(probe(mounted.container, "close").getAttribute("type")).toBe("button");
  });

  it("lets a consumer replace the ✕ entirely", () => {
    mounted = mount(() => (
      <Tag.Root>
        <Tag.CloseTrigger data-probe="close">×</Tag.CloseTrigger>
      </Tag.Root>
    ));
    const close = probe(mounted.container, "close");

    expect(close.querySelector("svg")).toBeNull();
    expect(close.textContent).toBe("×");
  });

  it("draws no ✕ for a `null` child, and still draws one for an omitted child", () => {
    // `{cond() ? <Icon/> : null}` is ordinary Solid, and Chakra's `mergeProps` yields a default
    // only to `undefined` — so a `null` child renders an empty button upstream. `??` would put the
    // ✕ back and quietly overrule what the consumer wrote.
    mounted = mount(() => (
      <Tag.Root>
        <Tag.CloseTrigger data-probe="null">{null}</Tag.CloseTrigger>
        <Tag.CloseTrigger data-probe="omitted" />
      </Tag.Root>
    ));
    const container = mounted.container;

    expect(probe(container, "null").querySelector("svg")).toBeNull();
    expect(probe(container, "omitted").querySelector("svg")).not.toBeNull();
  });

  it("dismisses through the consumer's own handler", async () => {
    let closed = 0;
    mounted = mount(() => <Closable onClose={() => (closed += 1)} />);

    probe(mounted.container, "close").click();

    expect(closed).toBe(1);
  });
});

describe("Tag — the recipe", () => {
  it("sizes every slot from the Root, and re-resolves them when the size changes", () => {
    const [size, setSize] = createSignal<"sm" | "xl">("sm");
    mounted = mount(() => <Closable size={size()} />);
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).minHeight).toBe("18px");
    expect(getComputedStyle(probe(container, "label")).fontSize).toBe("12px");

    flush(() => setSize("xl"));

    expect(getComputedStyle(probe(container, "root")).minHeight).toBe("32px");
    expect(getComputedStyle(probe(container, "label")).fontSize).toBe("14px");
  });

  it("fills the tag on `solid` and leaves the surface on `outline`", () => {
    mounted = mount(() => (
      <>
        <Tag.Root data-probe="solid" variant="solid" colorPalette="blue" />
        <Tag.Root data-probe="outline" variant="outline" colorPalette="blue" />
      </>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "solid")).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(getComputedStyle(probe(container, "outline")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(probe(container, "outline")).boxShadow).not.toBe("none");
  });

  it("keeps the two variant props off the element", () => {
    mounted = mount(() => <Closable size="lg" />);
    const root = probe(mounted.container, "root");

    expect(root.hasAttribute("size")).toBe(false);
    expect(root.hasAttribute("variant")).toBe(false);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Tag.Root data-probe="root" unstyled>
        <Tag.Label data-probe="label">Fish</Tag.Label>
      </Tag.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).display).toBe("block");
    expect(getComputedStyle(probe(container, "label")).webkitLineClamp).toBe("none");
  });
});

describe("Tag — props context, polymorphism and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <Tag.RootPropsProvider value={{ size: "xl" }}>
        <Tag.Root data-probe="inherited" />
        <Tag.Root data-probe="forwarded" size={undefined} />
        <Tag.Root data-probe="local" size="sm" />
      </Tag.RootPropsProvider>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "inherited")).minHeight).toBe("32px");
    expect(getComputedStyle(probe(container, "forwarded")).minHeight).toBe("32px");
    expect(getComputedStyle(probe(container, "local")).minHeight).toBe("18px");
  });

  it("renders as a button through `render`, keeping the root's slot", () => {
    mounted = mount(() => (
      <Tag.Root
        variant="solid"
        render={(props) => (
          <button type="submit" data-probe="root" {...(props as ComponentProps<"button">)} />
        )}
      >
        <Tag.Label data-probe="label">Fish</Tag.Label>
      </Tag.Root>
    ));
    const root = probe(mounted.container, "root");

    expect(root.tagName).toBe("BUTTON");
    expect(root.getAttribute("type")).toBe("submit");
    expect(getComputedStyle(root).display).toBe("inline-flex");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Tag.Label />);
      dispose();
    }).toThrow(/Tag sub-components must be rendered inside a Tag root component/);
  });

  it("has no a11y violations without a close trigger", async () => {
    mounted = mount(() => (
      <Tag.Root>
        <Tag.StartElement>@</Tag.StartElement>
        <Tag.Label>Fish</Tag.Label>
      </Tag.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });

  it("carries one inherited naming violation with a close trigger, and nothing else", async () => {
    // **Inherited, and measured rather than predicted.** Upstream's `TagCloseTrigger` defaults its
    // children to a bare `<CloseIcon />` with no title and no label, so the React version's button
    // has no discernible text either — both wrong the same way, so it ships and this pins exactly
    // that one. A consumer names it themselves: `<Tag.CloseTrigger aria-label="Remove Fish" />`.
    mounted = mount(() => <Closable />);

    await expect(expectNoA11yViolations(mounted.container)).rejects.toThrow(
      /^axe-core found 1 violation\(s\):\n- \[critical\] button-name/,
    );
  });

  it("takes a label from the consumer, which clears the violation", async () => {
    mounted = mount(() => (
      <Tag.Root>
        <Tag.Label>Fish</Tag.Label>
        <Tag.EndElement>
          <Tag.CloseTrigger aria-label="Remove Fish" />
        </Tag.EndElement>
      </Tag.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});
