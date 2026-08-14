import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { nativeSelect } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Field } from "../../field";
import { Fieldset } from "../../fieldset";
import { NativeSelect } from "../index";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function selectIn(container: ParentNode): HTMLSelectElement {
  const element = container.querySelector("select");
  if (!(element instanceof HTMLSelectElement)) {
    throw new Error("expected the tree to render a select");
  }
  return element;
}

function indicatorIn(container: ParentNode): HTMLElement {
  // `select ~ div`, never `div > div`: the mount container is a div itself, so the looser selector
  // matches the Root and every assertion about the indicator silently reads the wrong element.
  const element = container.querySelector("select ~ div");
  if (!(element instanceof HTMLElement)) {
    throw new Error("expected the tree to render an indicator");
  }
  return element;
}

function Basic(props: {
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  size?: "xs" | "xl";
  variant?: "outline" | "plain";
}) {
  return (
    <NativeSelect.Root
      disabled={props.disabled}
      invalid={props.invalid}
      size={props.size}
      variant={props.variant}
    >
      <NativeSelect.Field placeholder={props.placeholder}>
        <option value="react">React</option>
        <option value="vue">Vue</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

describe("NativeSelect", () => {
  it("renders the platform control with the chevron over it", () => {
    mounted = mount(() => <Basic />);
    const select = selectIn(mounted.container);
    const indicator = indicatorIn(mounted.container);

    expect(select.tagName).toBe("SELECT");
    expect(select.options.length).toBe(2);
    expect(indicator.querySelector("svg")).not.toBeNull();
    // The chevron sits over the control's trailing edge and must not swallow the click that opens
    // the native picker.
    expect(getComputedStyle(indicator).pointerEvents).toBe("none");
  });

  it("carries no part attributes at all, which is upstream exactly", () => {
    // The prediction on this row was that `createAnatomy("select")` would put a `data-scope="select"`
    // on every part and collide with the `select` row's. It does not: Chakra asks the anatomy for
    // its slot *keys* only, and no part applies `parts.*.attrs` — the recipe's own selectors are
    // classes and the `_disabled` / `_invalid` conditions.
    mounted = mount(() => <Basic />);

    expect(mounted.container.querySelectorAll("[data-scope]").length).toBe(0);
  });

  it("renders a placeholder as a leading empty option", () => {
    mounted = mount(() => <Basic placeholder="Select option" />);
    const select = selectIn(mounted.container);

    expect(select.options.length).toBe(3);
    expect(select.options[0]?.value).toBe("");
    expect(select.options[0]?.textContent).toBe("Select option");
    expect(select.value).toBe("");
  });

  it("renders no placeholder option when it was not asked for", () => {
    mounted = mount(() => <Basic />);

    expect(selectIn(mounted.container).options[0]?.value).toBe("react");
  });

  it("takes a chevron of the caller's own", () => {
    mounted = mount(() => (
      <NativeSelect.Root>
        <NativeSelect.Field>
          <option value="react">React</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator>
          <span data-probe="own-icon">v</span>
        </NativeSelect.Indicator>
      </NativeSelect.Root>
    ));

    expect(mounted.container.querySelector('[data-probe="own-icon"]')).not.toBeNull();
    expect(indicatorIn(mounted.container).querySelector("svg")).toBeNull();
  });

  it("disables the control from the Root, and says so on the indicator", () => {
    mounted = mount(() => <Basic disabled />);

    expect(selectIn(mounted.container).disabled).toBe(true);
    expect(indicatorIn(mounted.container).dataset.disabled).toBe("");
  });

  it("marks the control invalid from the Root", () => {
    mounted = mount(() => <Basic invalid />);

    expect(selectIn(mounted.container).dataset.invalid).toBe("");
    expect(indicatorIn(mounted.container).dataset.invalid).toBe("");
  });

  it("keeps the Root's own props off the div, where two of them are not attributes", () => {
    mounted = mount(() => <Basic disabled invalid size="xl" variant="plain" />);
    const root = mounted.container.querySelector("div");

    expect(root?.hasAttribute("disabled")).toBe(false);
    expect(root?.hasAttribute("invalid")).toBe(false);
    expect(root?.hasAttribute("size")).toBe(false);
    expect(root?.hasAttribute("variant")).toBe(false);
    // The seam omits the variant keys by literal name, so the tuple and the recipe stay one list.
    expect(nativeSelect.variantKeys).toEqual(["variant", "size"]);
  });

  it("follows a state that changes after mount", () => {
    const [disabled, setDisabled] = createSignal(false);
    mounted = mount(() => <Basic disabled={disabled()} />);
    const select = selectIn(mounted.container);

    expect(select.disabled).toBe(false);
    flush(() => setDisabled(true));
    expect(select.disabled).toBe(true);
    expect(indicatorIn(mounted.container).dataset.disabled).toBe("");
  });

  it("takes the field's height from the size variant", () => {
    mounted = mount(() => <Basic size="xs" />);
    const small = getComputedStyle(selectIn(mounted.container)).height;
    mounted.dispose();

    mounted = mount(() => <Basic size="xl" />);

    expect(getComputedStyle(selectIn(mounted.container)).height).not.toBe(small);
  });

  it("drops the box when the variant is plain", () => {
    mounted = mount(() => <Basic variant="outline" />);
    const outlined = getComputedStyle(selectIn(mounted.container)).borderBottomWidth;
    mounted.dispose();

    mounted = mount(() => <Basic variant="plain" />);

    expect(outlined).toBe("1px");
    expect(getComputedStyle(selectIn(mounted.container)).borderBottomWidth).toBe("0px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mount(() => (
      <NativeSelect.Root unstyled width="200px">
        <NativeSelect.Field>
          <option value="react">React</option>
        </NativeSelect.Field>
      </NativeSelect.Root>
    ));
    const root = mounted.container.querySelector("div") as HTMLElement;

    expect(getComputedStyle(root).display).not.toBe("flex");
    expect(getComputedStyle(root).width).toBe("200px");
  });

  it("takes props from a provider above it, and lets a local prop win", () => {
    mounted = mount(() => (
      <NativeSelect.PropsProvider value={{ size: "xl" }}>
        <Basic />
      </NativeSelect.PropsProvider>
    ));
    const fromProvider = getComputedStyle(selectIn(mounted.container)).height;
    mounted.dispose();

    mounted = mount(() => (
      <NativeSelect.PropsProvider value={{ size: "xl" }}>
        <Basic size="xs" />
      </NativeSelect.PropsProvider>
    ));

    expect(getComputedStyle(selectIn(mounted.container)).height).not.toBe(fromProvider);
  });

  it("keeps the provider's value when a wrapper forwards an unset `disabled`", () => {
    mounted = mount(() => (
      <NativeSelect.PropsProvider value={{ disabled: true }}>
        <NativeSelect.Root disabled={undefined}>
          <NativeSelect.Field>
            <option value="react">React</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
      </NativeSelect.PropsProvider>
    ));

    expect(selectIn(mounted.container).disabled).toBe(true);
  });

  it("has no a11y violations under a labelled field", async () => {
    mounted = mount(() => (
      <Field.Root>
        <Field.Label>Framework</Field.Label>
        <Basic placeholder="Select option" />
      </Field.Root>
    ));

    await expectNoA11yViolations(mounted.container);
  });
});

describe("NativeSelect — inside a Field.Root", () => {
  it("takes the field's id, states and part attributes", () => {
    mounted = mount(() => (
      <Field.Root id="framework" invalid required>
        <Field.Label>Framework</Field.Label>
        <Basic />
      </Field.Root>
    ));
    const select = selectIn(mounted.container);

    expect(select.id).toBe("framework");
    expect(select.required).toBe(true);
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.dataset.scope).toBe("field");
    expect(select.dataset.part).toBe("select");
  });

  it("is the element the label points at", () => {
    mounted = mount(() => (
      <Field.Root>
        <Field.Label>Framework</Field.Label>
        <Basic />
      </Field.Root>
    ));

    expect(mounted.container.querySelector("label")?.getAttribute("for")).toBe(
      selectIn(mounted.container).id,
    );
  });

  it("paints the indicator invalid from the field, not only from the Root", () => {
    mounted = mount(() => (
      <Field.Root invalid>
        <Basic />
      </Field.Root>
    ));

    expect(indicatorIn(mounted.container).dataset.invalid).toBe("");
  });

  it("lets the field win over the Root's own prop, which is upstream's resolution", () => {
    // `field?.disabled ?? props.disabled`: the field's value is always a boolean when there is a
    // field, so a Root inside one can never turn itself off on its own. Chakra resolves it the same
    // way, and someone arriving from the React version is owed what they know.
    mounted = mount(() => (
      <Field.Root>
        <Basic disabled />
      </Field.Root>
    ));

    expect(selectIn(mounted.container).disabled).toBe(false);
  });

  it("inherits a disabled Fieldset through the field", () => {
    mounted = mount(() => (
      <Fieldset.Root disabled>
        <Fieldset.Legend>Stack</Fieldset.Legend>
        <Field.Root>
          <Field.Label>Framework</Field.Label>
          <Basic />
        </Field.Root>
      </Fieldset.Root>
    ));

    expect(selectIn(mounted.container).disabled).toBe(true);
  });
});
