import alertServerHtml from "virtual:hydration-fixture?id=alert";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Spinner } from "../../spinner";
import { Alert } from "../index";
import { Tree } from "./alert.ssr-entry";

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

function Basic(props: {
  status?: "info" | "warning" | "success" | "error" | "neutral";
  variant?: "subtle" | "surface" | "outline" | "solid";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Alert.Root data-probe="root" status={props.status} variant={props.variant} size={props.size}>
      <Alert.Indicator data-probe="indicator" />
      <Alert.Content data-probe="content">
        <Alert.Title data-probe="title">Invalid fields</Alert.Title>
        <Alert.Description data-probe="description">Please fix them.</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}

describe("Alert — anatomy", () => {
  it("dresses the Root and every part in its own slot", () => {
    mounted = mount(() => <Basic />);
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).display).toBe("flex");
    // Not `display`: the indicator is a flex item, and CSS blockifies a flex item's `inline-flex`
    // to `flex`, so the value that survives to `getComputedStyle` says nothing about the slot.
    expect(getComputedStyle(probe(container, "indicator")).justifyContent).toBe("center");
    expect(getComputedStyle(probe(container, "indicator")).flexShrink).toBe("0");
    expect(getComputedStyle(probe(container, "content")).flexGrow).toBe("1");
    expect(getComputedStyle(probe(container, "title")).fontWeight).toBe("500");
    // The `description` slot declares `display: inline` and nothing else, and every place it can
    // sit is a flex container — so what separates it from the title is the weight the title adds.
    expect(getComputedStyle(probe(container, "description")).fontWeight).toBe("400");
  });

  it("keeps every variant prop off the element", () => {
    mounted = mount(() => <Basic status="error" variant="solid" size="lg" />);
    const root = probe(mounted.container, "root");

    // All four are recipe inputs, and `status` is also the value the indicator reads — it travels
    // through a context rather than through the DOM.
    for (const key of ["status", "variant", "size", "inline"]) {
      expect(root.hasAttribute(key)).toBe(false);
    }
  });

  it("sizes the alert from `size`", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    mounted = mount(() => <Basic size={size()} />);
    const root = probe(mounted.container, "root");

    const small = getComputedStyle(root).padding;
    flush(() => setSize("lg"));

    expect(getComputedStyle(root).padding).not.toBe(small);
  });
});

describe("Alert — the indicator's glyph", () => {
  it("draws the status's glyph by default, and redraws it when the status changes", () => {
    const [status, setStatus] = createSignal<"success" | "error">("success");
    mounted = mount(() => <Basic status={status()} />);
    const indicator = probe(mounted.container, "indicator");

    const success = indicator.querySelector("svg")?.innerHTML;
    expect(success).toBeDefined();

    flush(() => setStatus("error"));

    // `success` is the circled check and `error` the triangle, so the path data has to differ —
    // the glyph is chosen from the Root's status through a context, not from a class.
    expect(indicator.querySelector("svg")?.innerHTML).not.toBe(success);
  });

  it("draws `error` and `warning` with the same glyph, which is upstream's map", () => {
    mounted = mount(() => (
      <>
        <Alert.Root status="error">
          <Alert.Indicator data-probe="error" />
        </Alert.Root>
        <Alert.Root status="warning">
          <Alert.Indicator data-probe="warning" />
        </Alert.Root>
      </>
    ));
    const container = mounted.container;

    expect(probe(container, "error").querySelector("svg")?.innerHTML).toBe(
      probe(container, "warning").querySelector("svg")?.innerHTML,
    );
  });

  it("draws nothing when the status is responsive and names no single glyph", () => {
    // Upstream renders a `Fragment` here, which is the same absence one indirection later.
    mounted = mount(() => (
      <Alert.Root status={{ base: "info", md: "warning" }}>
        <Alert.Indicator data-probe="indicator" />
      </Alert.Root>
    ));

    expect(probe(mounted.container, "indicator").querySelector("svg")).toBeNull();
  });

  it("lets a consumer replace the glyph entirely", () => {
    mounted = mount(() => (
      <Alert.Root>
        <Alert.Indicator data-probe="indicator">
          <Spinner size="sm" />
        </Alert.Indicator>
      </Alert.Root>
    ));
    const indicator = probe(mounted.container, "indicator");

    expect(indicator.querySelector("[data-part='root']")).toBeNull();
    expect(indicator.children).toHaveLength(1);
  });

  it("falls back to `info` when the Root supplies no status, and when one forwards it unset", () => {
    mounted = mount(() => (
      <>
        <Alert.Root>
          <Alert.Indicator data-probe="default" />
        </Alert.Root>
        {/* `??`, never a `merge` default: `merge` resolves by presence and an unset forward would
            win with `undefined` (`CLAUDE.md`, *The third hazard*). */}
        <Alert.Root status={undefined}>
          <Alert.Indicator data-probe="forwarded" />
        </Alert.Root>
        <Alert.Root status="info">
          <Alert.Indicator data-probe="explicit" />
        </Alert.Root>
      </>
    ));
    const container = mounted.container;
    const explicit = probe(container, "explicit").querySelector("svg")?.innerHTML;

    expect(probe(container, "default").querySelector("svg")?.innerHTML).toBe(explicit);
    expect(probe(container, "forwarded").querySelector("svg")?.innerHTML).toBe(explicit);
  });
});

describe("Alert — props context, `unstyled` and a11y", () => {
  it("supplies the Root's props from above, and keeps them when a Root forwards one unset", () => {
    mounted = mount(() => (
      <Alert.RootPropsProvider value={{ status: "success" }}>
        <Alert.Root>
          <Alert.Indicator data-probe="inherited" />
        </Alert.Root>
        <Alert.Root status={undefined}>
          <Alert.Indicator data-probe="forwarded" />
        </Alert.Root>
        <Alert.Root status="error">
          <Alert.Indicator data-probe="local" />
        </Alert.Root>
      </Alert.RootPropsProvider>
    ));
    const container = mounted.container;
    const inherited = probe(container, "inherited").querySelector("svg")?.innerHTML;

    expect(inherited).toBeDefined();
    expect(probe(container, "forwarded").querySelector("svg")?.innerHTML).toBe(inherited);
    expect(probe(container, "local").querySelector("svg")?.innerHTML).not.toBe(inherited);
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    mounted = mount(() => (
      <Alert.Root unstyled data-probe="root">
        <Alert.Indicator data-probe="indicator" />
      </Alert.Root>
    ));
    const container = mounted.container;

    expect(getComputedStyle(probe(container, "root")).display).toBe("block");
    expect(getComputedStyle(probe(container, "indicator")).display).toBe("inline");
  });

  it("has no a11y violations", async () => {
    mounted = mount(() => <Basic status="info" />);

    await expectNoA11yViolations(mounted.container);
  });
});

describe("Alert — hydration", () => {
  it("hydrates the server's own nodes across all three indicator shapes", () => {
    const { container, dispose } = hydrateFixture(alertServerHtml, () => <Tree />);

    const hydrated = (name: string) => probe(container, name);

    // The glyph, its absence, and a consumer's own child — the three branches whose hydration keys
    // differ, each landing on the node the server sent.
    expect(hydrated("success-indicator").querySelector("svg")).not.toBeNull();
    expect(hydrated("responsive-indicator").querySelector("svg")).toBeNull();
    expect(hydrated("spinner-indicator").children).toHaveLength(1);

    // The class each side computed has to be the same one, on the server's own nodes.
    expect(getComputedStyle(hydrated("success-root")).display).toBe("flex");
    expect(getComputedStyle(hydrated("spinner-title")).fontWeight).toBe("500");

    dispose();
  });
});
