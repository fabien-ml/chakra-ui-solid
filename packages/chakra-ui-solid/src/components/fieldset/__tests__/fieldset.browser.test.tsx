import fieldsetServerHtml from "virtual:hydration-fixture?id=fieldset";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Field } from "../../field";
import { Input } from "../../input";
import { Fieldset } from "../index";
import { Tree } from "./fieldset.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function partOf(container: ParentNode, part: string): HTMLElement {
  const element = container.querySelector(`[data-scope="fieldset"][data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a fieldset [data-part="${part}"] element`);
  }
  return element;
}

function rootOf(container: ParentNode): HTMLFieldSetElement {
  const element = container.querySelector("fieldset");
  if (!(element instanceof HTMLFieldSetElement)) {
    throw new Error("expected the tree to render a fieldset");
  }
  return element;
}

function fieldPartIn(container: ParentNode, part: string): HTMLElement {
  const element = container.querySelector(`[data-scope="field"][data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a field [data-part="${part}"] element`);
  }
  return element;
}

function inputIn(container: ParentNode): HTMLInputElement {
  const element = container.querySelector("input");
  if (!(element instanceof HTMLInputElement)) {
    throw new Error("expected the tree to render an input");
  }
  return element;
}

function probeIn(container: ParentNode, probe: string): HTMLElement {
  const element = container.querySelector(`[data-probe="${probe}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-probe="${probe}"] element`);
  }
  return element;
}

function contentIn(container: ParentNode): HTMLElement {
  const element = container.querySelector("fieldset > div");
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected the tree to render a content box");
  }
  return element;
}

function Sized(props: { size: "sm" | "lg" }) {
  return (
    <Fieldset.Root size={props.size}>
      <Fieldset.Legend>Shipping details</Fieldset.Legend>
      <Fieldset.Content>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <Input />
        </Field.Root>
      </Fieldset.Content>
    </Fieldset.Root>
  );
}

function Basic(props: { id?: string; disabled?: boolean; invalid?: boolean }) {
  return (
    <Fieldset.Root id={props.id} disabled={props.disabled} invalid={props.invalid}>
      <Fieldset.Legend>Shipping details</Fieldset.Legend>
      <Fieldset.HelperText>Where the parcel goes.</Fieldset.HelperText>
      <Fieldset.ErrorText>Some fields are invalid.</Fieldset.ErrorText>
      <Fieldset.Content>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <Input />
        </Field.Root>
      </Fieldset.Content>
    </Fieldset.Root>
  );
}

describe("Fieldset — anatomy and ARIA", () => {
  it("renders a native fieldset with each part under the fieldset scope", () => {
    mounted = mount(() => <Basic id="shipping" invalid />);
    const container = mounted.container;

    expect(rootOf(container).tagName).toBe("FIELDSET");
    expect(partOf(container, "root")).toBe(rootOf(container));
    expect(partOf(container, "legend").tagName).toBe("LEGEND");
    expect(partOf(container, "helper-text").tagName).toBe("SPAN");
    expect(partOf(container, "error-text").tagName).toBe("SPAN");
  });

  it("names the group by its legend", () => {
    mounted = mount(() => <Basic id="shipping" />);

    expect(rootOf(mounted.container).getAttribute("aria-labelledby")).toBe(
      "fieldset::shipping::legend",
    );
    expect(partOf(mounted.container, "legend").id).toBe("fieldset::shipping::legend");
  });

  it("describes the group by the texts that actually mounted, error first", async () => {
    mounted = mount(() => <Basic id="shipping" invalid />);
    const root = rootOf(mounted.container);

    // The two texts register their ids from `onSettled`, so the IDREFs are one turn late — an
    // attribute emitted on the first render would point at elements that may never exist.
    await vi.waitFor(() =>
      expect(root.getAttribute("aria-describedby")).toBe(
        "fieldset::shipping::error-text fieldset::shipping::helper-text",
      ),
    );
  });

  it("names only the helper text when the group is valid", async () => {
    mounted = mount(() => <Basic id="shipping" />);
    const root = rootOf(mounted.container);

    await vi.waitFor(() =>
      expect(root.getAttribute("aria-describedby")).toBe("fieldset::shipping::helper-text"),
    );
  });

  it("renders no error text at all when the group is valid", () => {
    mounted = mount(() => <Basic id="shipping" />);

    expect(
      mounted.container.querySelector('[data-scope="fieldset"][data-part="error-text"]'),
    ).toBeNull();
  });

  it("links a consumer's own id on the helper text, not the generated one", async () => {
    mounted = mount(() => (
      <Fieldset.Root id="shipping">
        <Fieldset.Legend>Shipping</Fieldset.Legend>
        <Fieldset.HelperText id="hint">Where the parcel goes.</Fieldset.HelperText>
      </Fieldset.Root>
    ));
    const root = rootOf(mounted.container);

    await vi.waitFor(() => expect(root.getAttribute("aria-describedby")).toBe("hint"));
  });

  it("drops the description again when the text unmounts", async () => {
    const [showHelper, setShowHelper] = createSignal(true);
    mounted = mount(() => (
      <Fieldset.Root id="shipping">
        <Fieldset.Legend>Shipping</Fieldset.Legend>
        {showHelper() ? <Fieldset.HelperText>Where the parcel goes.</Fieldset.HelperText> : null}
      </Fieldset.Root>
    ));
    const root = rootOf(mounted.container);

    await vi.waitFor(() => expect(root.hasAttribute("aria-describedby")).toBe(true));
    flush(() => setShowHelper(false));
    await vi.waitFor(() => expect(root.hasAttribute("aria-describedby")).toBe(false));
  });

  it("carries the two states as data attributes and as the native attribute", () => {
    mounted = mount(() => <Basic disabled invalid />);
    const root = rootOf(mounted.container);

    expect(root.disabled).toBe(true);
    expect(root.dataset.disabled).toBe("");
    expect(root.dataset.invalid).toBe("");
    expect(partOf(mounted.container, "legend").dataset.disabled).toBe("");
  });

  it("keeps `invalid` off the element, where it is not an attribute at all", () => {
    mounted = mount(() => <Basic invalid />);

    expect(rootOf(mounted.container).hasAttribute("invalid")).toBe(false);
  });

  it("follows a state that changes after mount", () => {
    const [invalid, setInvalid] = createSignal(false);
    mounted = mount(() => <Basic id="shipping" invalid={invalid()} />);
    const container = mounted.container;

    expect(container.querySelector('[data-part="error-text"]')).toBeNull();
    flush(() => setInvalid(true));
    expect(partOf(container, "error-text").textContent).toBe("Some fields are invalid.");
    expect(rootOf(container).dataset.invalid).toBe("");
  });

  it("has no a11y violations when the group is valid", async () => {
    mounted = mount(() => <Basic id="shipping" />);

    await expectNoA11yViolations(mounted.container);
  });

  it("carries one inherited contrast violation invalid, and nothing else", async () => {
    // **Inherited, and measured rather than predicted.** The `errorText` slot is `fg.error`
    // (`red.500`) on the page background, which is under AA — and the React version renders the
    // identical declaration from the identical preset token, so both are wrong the same way and
    // this ships. `field`'s row carries the same finding for the same slot.
    mounted = mount(() => <Basic id="shipping" invalid />);

    await expect(expectNoA11yViolations(mounted.container)).rejects.toThrow(
      /^axe-core found 1 violation\(s\):\n- \[serious\] color-contrast/,
    );
  });
});

describe("Fieldset — styling", () => {
  it("stacks the group, which a bare fieldset does not", () => {
    mounted = mount(() => <Basic />);
    const style = getComputedStyle(rootOf(mounted.container));

    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
  });

  it("takes the content gap and the legend's type scale from the size variant", () => {
    // The root's own spacing is `spaceY` — a margin between siblings rather than a `gap` — so the
    // variant is measured where it lands: the content box's gap, and the legend's font size.
    mounted = mount(() => <Sized size="sm" />);
    const small = {
      gap: getComputedStyle(contentIn(mounted.container)).gap,
      legend: getComputedStyle(partOf(mounted.container, "legend")).fontSize,
    };
    mounted.dispose();

    mounted = mount(() => <Sized size="lg" />);

    expect(getComputedStyle(contentIn(mounted.container)).gap).not.toBe(small.gap);
    expect(getComputedStyle(partOf(mounted.container, "legend")).fontSize).not.toBe(small.legend);
  });

  it("keeps the recipe's variant prop off the element", () => {
    mounted = mount(() => <Basic />);

    expect(rootOf(mounted.container).hasAttribute("size")).toBe(false);
  });

  it("styles the content box, which is the one slot with no part attributes", () => {
    mounted = mount(() => <Basic />);
    const content = contentIn(mounted.container);

    expect(content.hasAttribute("data-part")).toBe(false);
    expect(getComputedStyle(content).display).toBe("flex");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    // The recipe lands in `@layer recipes`, below the `@layer utilities` a style prop emits into,
    // so `width` wins against the base's `width: full` rather than racing it on source order.
    mounted = mount(() => (
      <Fieldset.Root width="200px">
        <Fieldset.Legend>Shipping</Fieldset.Legend>
      </Fieldset.Root>
    ));

    expect(getComputedStyle(rootOf(mounted.container)).width).toBe("200px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mount(() => (
      <Fieldset.Root unstyled width="200px">
        <Fieldset.Legend>Shipping</Fieldset.Legend>
      </Fieldset.Root>
    ));
    const style = getComputedStyle(rootOf(mounted.container));

    expect(style.display).not.toBe("flex");
    expect(style.width).toBe("200px");
  });

  it("resolves its own defaults when a wrapper forwards an unset `disabled` and `invalid`", () => {
    // The Root's `withDefaults` resolves each key with `??`. Spelled `merge({ disabled: false }, …)`
    // it would resolve by presence instead, and a wrapper's `disabled={props.disabled}` with nothing
    // set would delete the default with `undefined`.
    mounted = mount(() => (
      <Fieldset.Root disabled={undefined} invalid={undefined}>
        <Fieldset.Legend>Shipping</Fieldset.Legend>
      </Fieldset.Root>
    ));
    const root = rootOf(mounted.container);

    expect(root.disabled).toBe(false);
    expect(root.dataset.disabled).toBeUndefined();
    expect(root.dataset.invalid).toBeUndefined();
  });
});

describe("Fieldset — the Field inside it", () => {
  it("disables the field it contains", () => {
    mounted = mount(() => <Basic disabled />);

    // The native `fieldset[disabled]` is what stops the control taking input; `data-disabled` on
    // the field's own root is what a recipe selector reads, and only the inherited state produces
    // it — the browser's cascade does not write attributes.
    expect(inputIn(mounted.container).disabled).toBe(true);
    expect(fieldPartIn(mounted.container, "root").dataset.disabled).toBe("");
  });

  it("leaves the field alone when the group is not disabled", () => {
    mounted = mount(() => <Basic />);

    expect(inputIn(mounted.container).disabled).toBe(false);
  });

  it("lets the field's own `disabled` win, in both directions", () => {
    mounted = mount(() => (
      <Fieldset.Root>
        <Fieldset.Legend>Shipping</Fieldset.Legend>
        <Field.Root disabled>
          <Field.Label>Street address</Field.Label>
          <Input />
        </Field.Root>
      </Fieldset.Root>
    ));

    expect(inputIn(mounted.container).disabled).toBe(true);
  });

  it("keeps a field outside any fieldset unaffected", () => {
    mounted = mount(() => (
      <Field.Root>
        <Field.Label>Street address</Field.Label>
        <Input />
      </Field.Root>
    ));

    expect(inputIn(mounted.container).disabled).toBe(false);
  });

  it("stays disabled when a wrapper forwards an unset `disabled` to the Field", () => {
    // The inheritance is resolved by *absence*: a `disabled: false` default anywhere between the
    // group and `createField` would delete it, silently.
    mounted = mount(() => (
      <Fieldset.Root disabled>
        <Fieldset.Legend>Shipping</Fieldset.Legend>
        <Field.Root disabled={undefined}>
          <Field.Label>Street address</Field.Label>
          <Input />
        </Field.Root>
      </Fieldset.Root>
    ));
    expect(fieldPartIn(mounted.container, "root").dataset.disabled).toBe("");
  });

  it("follows a group that is disabled after mount", () => {
    const [disabled, setDisabled] = createSignal(false);
    mounted = mount(() => (
      <Fieldset.Root disabled={disabled()}>
        <Fieldset.Legend>Shipping</Fieldset.Legend>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <Input />
        </Field.Root>
      </Fieldset.Root>
    ));
    const label = fieldPartIn(mounted.container, "label");

    expect(label.dataset.disabled).toBeUndefined();
    flush(() => setDisabled(true));
    expect(label.dataset.disabled).toBe("");
  });
});

describe("Fieldset — server render, then hydrate", () => {
  it("reuses every server node across both roots", () => {
    // The half neither other project can see. One root renders its error text and the other renders
    // nothing in its place, so the branch the *server* took decides the hydration key of everything
    // after it — including the two Fields' own `createUniqueId()` calls, which come off the same
    // counter.
    const { container, dispose } = hydrateFixture(fieldsetServerHtml, () => <Tree />);

    expect(container.querySelector('[data-probe="contact-error"]')).toBeNull();
    expect(probeIn(container, "shipping-error").textContent).toContain("Some fields are invalid.");
    expect(probeIn(container, "contact-legend").id).toBe("fieldset::contact::legend");
    expect(probeIn(container, "name-input").id).toBe("name");
    // The inherited `disabled` survived the round trip: it is a context read the server made too.
    expect((probeIn(container, "address-input") as HTMLInputElement).disabled).toBe(true);
    expect((probeIn(container, "name-input") as HTMLInputElement).disabled).toBe(false);

    dispose();
  });
});
