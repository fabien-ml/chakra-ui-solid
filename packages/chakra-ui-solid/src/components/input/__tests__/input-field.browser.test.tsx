import { type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Field } from "../../field";
import { Input, InputPropsProvider } from "../input";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function inputIn(container: ParentNode): HTMLInputElement {
  const element = container.querySelector("input");
  if (!(element instanceof HTMLInputElement)) {
    throw new Error("expected the tree to render an input");
  }
  return element;
}

function labelIn(container: ParentNode): HTMLLabelElement {
  const element = container.querySelector("label");
  if (!(element instanceof HTMLLabelElement)) {
    throw new Error("expected the tree to render a label");
  }
  return element;
}

describe("Input — outside a Field.Root", () => {
  it("renders the plain element, with nothing a field would have added", () => {
    // The whole reason the field is read through the non-strict reader: an `<Input>` on its own
    // page is not a mistake, and it has to be exactly the element it looks like.
    mounted = mount(() => <Input placeholder="Email" />);
    const input = inputIn(mounted.container);

    expect(input.hasAttribute("id")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.hasAttribute("data-part")).toBe(false);
    expect(input.disabled).toBe(false);
    expect(input.required).toBe(false);
    expect(input.readOnly).toBe(false);
  });
});

describe("Input — inside a Field.Root", () => {
  it("takes the field's id, states and part attributes", () => {
    mounted = mount(() => (
      <Field.Root id="email" disabled required readOnly invalid>
        <Field.Label>Email</Field.Label>
        <Input />
      </Field.Root>
    ));
    const input = inputIn(mounted.container);

    expect(input.id).toBe("email");
    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.dataset.scope).toBe("field");
    expect(input.dataset.part).toBe("input");
  });

  it("is described by a HelperText once that text has mounted", async () => {
    mounted = mount(() => (
      <Field.Root id="email">
        <Field.Label>Email</Field.Label>
        <Input />
        <Field.HelperText>We never share it.</Field.HelperText>
      </Field.Root>
    ));
    const input = inputIn(mounted.container);

    // The text registers its id from `onSettled`, so the IDREF is one turn late — an attribute
    // emitted on the first render would point at an element that may never exist.
    await vi.waitFor(() =>
      expect(input.getAttribute("aria-describedby")).toBe("field::email::helper-text"),
    );
    expect(mounted?.container.querySelector("#field\\:\\:email\\:\\:helper-text")).not.toBeNull();
  });

  it("is the element the label points at, so clicking the label focuses it", () => {
    mounted = mount(() => (
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input />
      </Field.Root>
    ));
    const input = inputIn(mounted.container);
    const label = labelIn(mounted.container);

    expect(input.id).not.toBe("");
    expect(label.getAttribute("for")).toBe(input.id);

    label.click();
    expect(document.activeElement).toBe(input);
  });

  it("lets the caller's own id beat the field's", () => {
    mounted = mount(() => (
      <Field.Root id="email">
        <Input id="mine" />
      </Field.Root>
    ));

    expect(inputIn(mounted.container).id).toBe("mine");
  });

  it("stays disabled when a wrapper forwards an unset `disabled`", () => {
    // The merge resolves by *value*, not by presence. Spelled as a plain `merge` it resolves by
    // presence, and a wrapper's `disabled={props.disabled}` with nothing set would beat the field
    // with `undefined` — a disabled field with a live control in it (`CLAUDE.md`, *third hazard*).
    mounted = mount(() => (
      <Field.Root disabled>
        <Input disabled={undefined} />
      </Field.Root>
    ));

    expect(inputIn(mounted.container).disabled).toBe(true);
  });

  it("follows the field's state after mount, having snapshotted none of it", () => {
    // `getInputProps()` is a plain call over live signals returning a fresh object. Called once at
    // construction to enumerate its keys it would freeze the field's state here; called on each
    // read — which is what the lazy merge buys — a flipped `invalid` reaches the element.
    const [invalid, setInvalid] = createSignal(false);
    mounted = mount(() => (
      <Field.Root id="email" invalid={invalid()}>
        <Input />
      </Field.Root>
    ));
    const input = inputIn(mounted.container);

    expect(input.hasAttribute("aria-invalid")).toBe(false);

    flush(() => setInvalid(true));
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.dataset.invalid).toBe("");

    flush(() => setInvalid(false));
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("keeps the recipe, the props provider and a local prop in the same order", () => {
    // The field is the *lowest* of the three sources, so neither the provider nor the recipe
    // changes shape inside a Root: `lg` is still 44px and still comes from the recipe.
    mounted = mount(() => (
      <Field.Root>
        <InputPropsProvider value={{ size: "lg" }}>
          <Input />
        </InputPropsProvider>
      </Field.Root>
    ));
    const input = inputIn(mounted.container);

    expect(getComputedStyle(input).height).toBe("44px");
    expect(input.hasAttribute("size")).toBe(false);
  });

  it("uses the item's control id under a Field.Item", () => {
    mounted = mount(() => (
      <Field.Root id="email">
        <Field.Item value="work">
          <Field.Label>Work</Field.Label>
          <Input />
        </Field.Item>
      </Field.Root>
    ));
    const input = inputIn(mounted.container);

    expect(input.id).toBe("field::email::item::work");
    expect(labelIn(mounted.container).getAttribute("for")).toBe(input.id);
  });
});
