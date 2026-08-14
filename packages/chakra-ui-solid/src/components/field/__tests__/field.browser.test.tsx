import fieldServerHtml from "virtual:hydration-fixture?id=field";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, Show } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Field } from "../index";
import { Tree } from "./field.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function partOf(container: ParentNode, part: string): HTMLElement {
  const element = container.querySelector(`[data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

const partIn = (container: ParentNode, part: string) =>
  container.querySelector(`[data-part="${part}"]`);

function probeIn(container: ParentNode, probe: string): HTMLElement {
  const element = container.querySelector(`[data-probe="${probe}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-probe="${probe}"] element`);
  }
  return element;
}

/**
 * The required indicator is the one part with no `data-part` to find it by — upstream hand-writes it
 * as a plain span — so every fixture below marks it and these two read the mark. A slot class would
 * not do: `classList.contains` passes on a completely unstyled element.
 */
const INDICATOR = "indicator";
const indicatorIn = (container: ParentNode) =>
  container.querySelector(`[data-probe="${INDICATOR}"]`);

/** A component that records how many times it was really constructed — Button's fixture. */
function countingComponent(): { component: () => JSX.Element; builds: () => number } {
  let builds = 0;
  return {
    component: () => {
      builds += 1;
      return <span data-probe="slot" />;
    },
    builds: () => builds,
  };
}

/**
 * A field with a real control in it, because the whole ARIA contract lands on the control rather
 * than on any part: the label's `for`, the two IDREFs, and every `data-*` a recipe selector reads.
 * There is no `Field.Input` part to render — upstream ships none, a consumer puts their own control
 * inside the Root — so this is how a consumer wires one.
 */
function Basic(props: {
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
  helperText?: boolean;
  errorText?: boolean;
}) {
  return (
    <Field.Root
      id={props.id}
      invalid={props.invalid}
      disabled={props.disabled}
      readOnly={props.readOnly}
      required={props.required}
      orientation={props.orientation}
    >
      <Field.Label>
        Email
        <Field.RequiredIndicator />
      </Field.Label>
      <Field.Context>
        {(field) => <input {...field.getControlProps()} data-probe="control" />}
      </Field.Context>
      <Show when={props.helperText ?? true}>
        <Field.HelperText>We never share it.</Field.HelperText>
      </Show>
      <Show when={props.errorText ?? true}>
        <Field.ErrorText>Enter an email address</Field.ErrorText>
      </Show>
    </Field.Root>
  );
}

const controlIn = (container: ParentNode) => probeIn(container, "control");

describe("Field — the root, and what the recipe draws", () => {
  it("renders a `role=group` root carrying the id scheme", () => {
    mounted = mount(() => <Basic id="email" />);
    const root = partOf(mounted.container, "root");

    expect(root.tagName).toBe("DIV");
    expect(root.getAttribute("role")).toBe("group");
    // `field::{id}`, where the *control* keeps the bare id — so `<Input id="email">` inside needs no
    // wiring, and the root is still addressable.
    expect(root.id).toBe("field::email");
    expect(controlIn(mounted.container).id).toBe("email");
  });

  it("stacks the label above the control by default, which is the recipe's own variant", () => {
    mounted = mount(() => <Basic />);
    const style = getComputedStyle(partOf(mounted.container, "root"));

    // `orientation` is never defaulted in our code: it is passed through unset and the recipe's
    // `defaultVariants` answers `vertical`. An unstyled div computes `block`.
    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
    expect(style.alignItems).toBe("flex-start");
  });

  it("puts the label beside the control at `horizontal`, on an 80px basis", () => {
    mounted = mount(() => <Basic orientation="horizontal" />);
    const root = getComputedStyle(partOf(mounted.container, "root"));
    const label = getComputedStyle(partOf(mounted.container, "label"));

    expect(root.flexDirection).toBe("row");
    expect(root.justifyContent).toBe("space-between");
    // `flex: 0 0 var(--field-label-width, 80px)` — the fallback, with nothing declaring the variable.
    expect(label.flexGrow).toBe("0");
    expect(label.flexShrink).toBe("0");
    expect(label.flexBasis).toBe("80px");
  });

  it("takes the label's width from `--field-label-width`", () => {
    // The seam the horizontal variant exists for: the width is a CSS custom property rather than a
    // variant value, so a consumer sets it once on the root and every label under it follows.
    mounted = mount(() => (
      <Field.Root orientation="horizontal" css={{ "--field-label-width": "200px" }}>
        <Field.Label>Email</Field.Label>
      </Field.Root>
    ));

    expect(getComputedStyle(partOf(mounted.container, "label")).flexBasis).toBe("200px");
  });

  it("drops every slot's styles under `unstyled`, and keeps the attributes", () => {
    mounted = mount(() => (
      <Field.Root unstyled>
        <Field.Label>Email</Field.Label>
      </Field.Root>
    ));
    const root = partOf(mounted.container, "root");

    expect(getComputedStyle(root).display).toBe("block");
    expect(root.getAttribute("role")).toBe("group");
    expect(partIn(mounted.container, "label")).not.toBeNull();
  });
});

describe("Field — the label, and what the control is told", () => {
  it("points the label at the control", () => {
    mounted = mount(() => <Basic id="email" />);
    const label = partOf(mounted.container, "label");

    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe(controlIn(mounted.container).id);
    expect(label.id).toBe("field::email::label");
  });

  it("marks the control from the four states", () => {
    mounted = mount(() => <Basic id="email" invalid disabled readOnly required />);
    const control = controlIn(mounted.container);
    const root = partOf(mounted.container, "root");

    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect((control as HTMLInputElement).disabled).toBe(true);
    expect((control as HTMLInputElement).readOnly).toBe(true);
    expect((control as HTMLInputElement).required).toBe(true);
    expect(root.dataset.invalid).toBe("");
    expect(root.dataset.disabled).toBe("");
    expect(root.dataset.readonly).toBe("");
  });

  it("keeps `aria-invalid` off a valid field, rather than writing `false`", () => {
    mounted = mount(() => <Basic />);

    expect(controlIn(mounted.container).getAttribute("aria-invalid")).toBeNull();
  });
});

describe("Field — the two texts, and the IDREFs they own", () => {
  it("describes the control once a HelperText has mounted, and stops when it is removed", async () => {
    const [helperText, setHelperText] = createSignal(true);
    mounted = mount(() => <Basic id="email" helperText={helperText()} errorText={false} />);
    const control = controlIn(mounted.container);

    // Registered from `onSettled`, so it is one turn late — and deliberately: an IDREF emitted on
    // the first render would point at an element that may never exist.
    await vi.waitFor(() =>
      expect(control.getAttribute("aria-describedby")).toBe("field::email::helper-text"),
    );
    expect(partOf(mounted.container, "helper-text").tagName).toBe("SPAN");

    flush(() => setHelperText(false));
    await vi.waitFor(() => expect(control.getAttribute("aria-describedby")).toBeNull());
  });

  it("describes the control by the id the HelperText actually rendered with", async () => {
    // A consumer's own `id` still links. Registering the *generated* id instead would leave the
    // control pointing at an element that is not there.
    mounted = mount(() => (
      <Field.Root id="email">
        <Field.Context>
          {(field) => <input {...field.getControlProps()} data-probe="control" />}
        </Field.Context>
        <Field.HelperText id="hint">We never share it.</Field.HelperText>
      </Field.Root>
    ));
    const control = controlIn(mounted.container);

    await vi.waitFor(() => expect(control.getAttribute("aria-describedby")).toBe("hint"));
    expect(partOf(mounted.container, "helper-text").id).toBe("hint");
  });

  it("renders no ErrorText at all while the field is valid", () => {
    mounted = mount(() => <Basic id="email" helperText={false} />);

    expect(partIn(mounted.container, "error-text")).toBeNull();
    expect(controlIn(mounted.container).getAttribute("aria-errormessage")).toBeNull();
  });

  it("names the error message only when the field is invalid *and* the text is rendered", async () => {
    const [invalid, setInvalid] = createSignal(false);
    const [errorText, setErrorText] = createSignal(false);
    mounted = mount(() => (
      <Basic id="email" helperText={false} invalid={invalid()} errorText={errorText()} />
    ));
    const control = controlIn(mounted.container);

    // Invalid, with no error text in the tree: nothing to point at.
    flush(() => setInvalid(true));
    await vi.waitFor(() => expect(control.getAttribute("aria-errormessage")).toBeNull());

    flush(() => setErrorText(true));
    await vi.waitFor(() =>
      expect(control.getAttribute("aria-errormessage")).toBe("field::email::error-text"),
    );
    const errorElement = partOf(mounted.container, "error-text");
    expect(errorElement.getAttribute("aria-live")).toBe("polite");
    // The slot says `inline-flex`; the root is a flex container, so the flex item is blockified and
    // reads back `flex`. Both come from the same declaration — an unstyled span computes `inline`.
    expect(getComputedStyle(errorElement).display).toBe("flex");

    // Valid again: the text unmounts, which unregisters the id — both halves gone.
    flush(() => setInvalid(false));
    await vi.waitFor(() => expect(control.getAttribute("aria-errormessage")).toBeNull());
    expect(partIn(mounted.container, "error-text")).toBeNull();
  });

  it("sizes the ErrorIcon to the text around it", () => {
    mounted = mount(() => (
      <Field.Root invalid>
        <Field.ErrorText>
          <Field.ErrorIcon />
          Too short
        </Field.ErrorText>
      </Field.Root>
    ));
    const icon = partOf(mounted.container, "error-text").querySelector("svg");
    if (!(icon instanceof SVGElement)) {
      throw new Error("expected the error text to render an svg");
    }

    // `boxSize: "1em"` against the `xs` text style the `errorText` slot sets.
    const { fontSize } = getComputedStyle(partOf(mounted.container, "error-text"));
    expect(getComputedStyle(icon).width).toBe(fontSize);
  });

  it("keeps the ErrorIcon's size when a wrapper forwards `boxSize` unset", () => {
    // The measurement behind the `withDefaults` call. Written as `boxSize="1em" {...props}` the
    // default is *gone* here: a JSX spread is a presence merge, so the forwarded `undefined` wins,
    // `css()` receives `undefined`, no rule is emitted, and the glyph falls back to the browser's
    // default `svg` size (`CLAUDE.md`, *The third hazard*).
    const Forwarding = (props: { boxSize?: string }) => (
      <Field.Root invalid>
        <Field.ErrorText>
          <Field.ErrorIcon boxSize={props.boxSize} />
          Too short
        </Field.ErrorText>
      </Field.Root>
    );

    mounted = mount(() => <Forwarding />);
    const icon = partOf(mounted.container, "error-text").querySelector("svg");
    if (!(icon instanceof SVGElement)) {
      throw new Error("expected the error text to render an svg");
    }

    const { fontSize } = getComputedStyle(partOf(mounted.container, "error-text"));
    expect(getComputedStyle(icon).width).toBe(fontSize);
  });
});

describe("Field — the required indicator", () => {
  it("renders `*` when the field is required, and nothing when it is not", () => {
    const [required, setRequired] = createSignal(true);
    mounted = mount(() => (
      <Field.Root required={required()}>
        <Field.Label>
          Email
          <Field.RequiredIndicator data-probe={INDICATOR} />
        </Field.Label>
      </Field.Root>
    ));
    const indicator = probeIn(mounted.container, INDICATOR);

    expect(indicator.textContent).toBe("*");
    // Decoration: `required` on the control is what a screen reader announces.
    expect(indicator.getAttribute("aria-hidden")).toBe("true");
    // No `data-scope` / `data-part`: the React version hand-writes this part rather than taking it
    // from Ark, so the pair never reaches the DOM there either.
    expect(indicator.dataset.scope).toBeUndefined();
    expect(indicator.dataset.part).toBeUndefined();
    // The recipe's own colour, which is the only reason this element is styled at all.
    expect(getComputedStyle(indicator).color).not.toBe(
      getComputedStyle(partOf(mounted.container, "label")).color,
    );

    flush(() => setRequired(false));
    expect(indicatorIn(mounted.container)).toBeNull();
  });

  it("renders `fallback` instead while the field is optional", () => {
    mounted = mount(() => (
      <Field.Root>
        <Field.Label>
          Email
          <Field.RequiredIndicator
            data-probe={INDICATOR}
            fallback={<span data-probe="optional">Optional</span>}
          />
        </Field.Label>
      </Field.Root>
    ));

    expect(probeIn(mounted.container, "optional").textContent).toBe("Optional");
    expect(indicatorIn(mounted.container)).toBeNull();
  });

  it("builds the `children` slot once, and not at all while the field is optional", () => {
    // The hazard nothing else can see, and a counter inside the child is the only thing that can see
    // it: a JSX-element prop is a **getter** that runs `createComponent` on every read, so a slot
    // read by a gate and again by the body it feeds builds two spans and inserts one. One build per
    // shown branch is what says the gate reads it exactly once — which is also why neither slot here
    // goes through `children()`, whose only remaining effect would be to move a hydration key.
    const { component: Counted, builds } = countingComponent();
    const [required, setRequired] = createSignal(false);
    mounted = mount(() => (
      <Field.Root required={required()}>
        <Field.RequiredIndicator>
          <Counted />
        </Field.RequiredIndicator>
      </Field.Root>
    ));

    // An optional field pays for no indicator at all.
    expect(builds()).toBe(0);

    flush(() => setRequired(true));

    expect(probeIn(mounted.container, "slot")).toBeDefined();
    expect(builds()).toBe(1);
  });

  it("builds the `fallback` slot once, and not at all while the field is required", () => {
    const { component: Counted, builds } = countingComponent();
    const [required, setRequired] = createSignal(true);
    mounted = mount(() => (
      <Field.Root required={required()}>
        <Field.RequiredIndicator fallback={<Counted />} />
      </Field.Root>
    ));

    expect(builds()).toBe(0);

    flush(() => setRequired(false));

    expect(probeIn(mounted.container, "slot")).toBeDefined();
    expect(builds()).toBe(1);
  });
});

describe("Field — a forwarded `undefined` deletes no default", () => {
  it("keeps the four states off when a wrapper forwards them unset", () => {
    // `merge` resolves a key by *presence*, so `{ invalid: false }` spread over these props would be
    // beaten by the `undefined` and leave `invalid` undefined — which reads as "no answer" to every
    // `data-invalid` and `aria-invalid` below rather than as `false`.
    mounted = mount(() => (
      <Field.Root
        id="email"
        invalid={undefined}
        disabled={undefined}
        readOnly={undefined}
        required={undefined}
      >
        <Field.Label>
          Email
          <Field.RequiredIndicator data-probe={INDICATOR} />
        </Field.Label>
        <Field.Context>
          {(field) => <input {...field.getControlProps()} data-probe="control" />}
        </Field.Context>
      </Field.Root>
    ));
    const control = controlIn(mounted.container) as HTMLInputElement;
    const root = partOf(mounted.container, "root");

    expect(control.getAttribute("aria-invalid")).toBeNull();
    expect(control.disabled).toBe(false);
    expect(control.readOnly).toBe(false);
    expect(control.required).toBe(false);
    expect(root.dataset.invalid).toBeUndefined();
    expect(root.dataset.disabled).toBeUndefined();
    expect(indicatorIn(mounted.container)).toBeNull();
  });

  it("keeps a PropsProvider's value when a Root forwards the same prop unset", () => {
    // The other half of the same rule, and the one a wrapper component hits: resolved by presence,
    // the Root's `undefined` would beat the provider above it and the subtree would lose its state.
    mounted = mount(() => (
      <Field.PropsProvider value={{ required: true, orientation: "horizontal" }}>
        <Field.Root required={undefined} orientation={undefined}>
          <Field.Label>
            Email
            <Field.RequiredIndicator data-probe={INDICATOR} />
          </Field.Label>
        </Field.Root>
      </Field.PropsProvider>
    ));

    expect(probeIn(mounted.container, INDICATOR).textContent).toBe("*");
    expect(getComputedStyle(partOf(mounted.container, "root")).flexDirection).toBe("row");
  });
});

describe("Field — items under one label", () => {
  it("gives each item its own control and label ids", () => {
    mounted = mount(() => (
      <Field.Root id="colour" target="red">
        <Field.Label data-probe="group-label">Colour</Field.Label>
        <Field.Item value="red">
          <Field.Label data-probe="red-label">Red</Field.Label>
          <Field.Context>
            {(field) => <input type="radio" {...field.getControlProps()} data-probe="red" />}
          </Field.Context>
        </Field.Item>
        <Field.Item value="blue">
          <Field.Label data-probe="blue-label">Blue</Field.Label>
          <Field.Context>
            {(field) => <input type="radio" {...field.getControlProps()} data-probe="blue" />}
          </Field.Context>
        </Field.Item>
      </Field.Root>
    ));

    expect(probeIn(mounted.container, "red").id).toBe("field::colour::item::red");
    expect(probeIn(mounted.container, "blue").id).toBe("field::colour::item::blue");
    expect(probeIn(mounted.container, "red-label").getAttribute("for")).toBe(
      "field::colour::item::red",
    );
    expect(probeIn(mounted.container, "red-label").id).toBe("field::colour::item::red::label");
    // The group's own label points at the `target` item, because a `for` can only name one element.
    expect(probeIn(mounted.container, "group-label").getAttribute("for")).toBe(
      "field::colour::item::red",
    );
  });

  it("inherits the parent's state, live", () => {
    const [invalid, setInvalid] = createSignal(false);
    mounted = mount(() => (
      <Field.Root id="colour" invalid={invalid()}>
        <Field.Item value="red">
          <Field.Context>
            {(field) => <input type="radio" {...field.getControlProps()} data-probe="red" />}
          </Field.Context>
        </Field.Item>
      </Field.Root>
    ));
    const control = probeIn(mounted.container, "red");

    expect(control.getAttribute("aria-invalid")).toBeNull();

    // The reason `Field.Item` layers with `merge` rather than a spread: a spread would read every
    // getter once and freeze this item's context at the state it mounted with.
    flush(() => setInvalid(true));
    expect(control.getAttribute("aria-invalid")).toBe("true");
  });

  it("throws outside a `Field.Root`, naming the component family", () => {
    expect(() => {
      const { dispose } = mount(() => <Field.Item value="red">Red</Field.Item>);
      dispose();
    }).toThrow(/Field sub-components must be rendered inside a Field root component/);
  });
});

describe("Field — accessibility", () => {
  it("has no violations required", async () => {
    mounted = mount(() => <Basic id="email" required errorText={false} />);
    await vi.waitFor(() =>
      expect(controlIn(mounted?.container as HTMLElement).getAttribute("aria-describedby")).toBe(
        "field::email::helper-text",
      ),
    );

    await expectNoA11yViolations(mounted.container);
  });

  it("carries one inherited contrast violation invalid, and nothing else", async () => {
    mounted = mount(() => <Basic id="email" invalid helperText={false} />);
    const container = mounted.container;
    await vi.waitFor(() =>
      expect(controlIn(container).getAttribute("aria-errormessage")).toBe(
        "field::email::error-text",
      ),
    );

    // **Inherited, and measured rather than predicted.** The `errorText` slot is `fg.error` at
    // `textStyle: xs`, and `fg.error` is `red.500` (#ef4444) in `@chakra-ui/panda-preset` itself —
    // 3.76:1 on the default white surface, against the 4.5:1 AA asks for at that size. The React
    // version renders the identical declaration from the identical token, so this is the case the
    // port rule settles with "ship it": changing the colour here would be a fix Chakra does not
    // have. Pinned to *exactly* this one, so a second violation is still a failure.
    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      /^axe-core found 1 violation\(s\):\n- \[serious\] color-contrast/,
    );
  });

  it("has no violations disabled", async () => {
    mounted = mount(() => <Basic id="email" disabled errorText={false} />);

    await expectNoA11yViolations(mounted.container);
  });
});

describe("Field — server render, then hydrate", () => {
  it("reuses every server node across all three roots", () => {
    // The half neither other project can see. Each root takes a different branch through the two
    // gates — indicator vs fallback, error text vs nothing — so the branch the *server* took decides
    // the hydration key of everything after it. If the two sides disagree, `hydrate()` either claims
    // a server node under a different client tree or gives up and client-renders, and both are
    // silent.
    const { container, dispose } = hydrateFixture(fieldServerHtml, () => <Tree />);

    expect(probeIn(container, "signup-indicator").textContent).toBe("*");
    expect(container.querySelector('[data-probe="signup-error"]')).toBeNull();
    expect(probeIn(container, "password-optional").textContent).toBe("Optional");
    expect(probeIn(container, "password-error").textContent).toContain("Too short");
    expect(probeIn(container, "red-control").id).toBe("field::colour::item::red");
    expect(probeIn(container, "red-label").getAttribute("for")).toBe("field::colour::item::red");

    dispose();
  });

  it("registers the helper text after hydration, on the server's own node", async () => {
    // `onSettled` does not run on the server, so the served control carries no `aria-describedby`
    // and the client grows one — against the node the server sent rather than a replacement.
    const { container, dispose } = hydrateFixture(fieldServerHtml, () => <Tree />);
    const control = probeIn(container, "signup-control");
    const helper = probeIn(container, "signup-helper");

    await vi.waitFor(() =>
      expect(control.getAttribute("aria-describedby")).toBe("field::signup::helper-text"),
    );
    expect(helper.id).toBe("field::signup::helper-text");
    expect(probeIn(container, "signup-control")).toBe(control);
    expect(document.getElementById(control.id)).toBe(control);

    dispose();
  });
});
