import { type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Field } from "../../field";
import { Fieldset } from "../../fieldset";
import { Textarea } from "../textarea";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function textareaIn(container: ParentNode): HTMLTextAreaElement {
  const element = container.querySelector("textarea");
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error("expected the tree to render a textarea");
  }
  return element;
}

describe("Textarea — outside a Field.Root", () => {
  it("renders the plain element, with nothing a field would have added", () => {
    mounted = mount(() => <Textarea placeholder="Comment..." />);
    const element = textareaIn(mounted.container);

    expect(element.hasAttribute("id")).toBe(false);
    expect(element.hasAttribute("aria-invalid")).toBe(false);
    expect(element.hasAttribute("data-part")).toBe(false);
    expect(element.disabled).toBe(false);
    expect(element.readOnly).toBe(false);
  });
});

describe("Textarea — inside a Field.Root", () => {
  it("takes the field's id, states and part attributes", () => {
    mounted = mount(() => (
      <Field.Root id="comment" disabled required readOnly invalid>
        <Field.Label>Comment</Field.Label>
        <Textarea />
      </Field.Root>
    ));
    const element = textareaIn(mounted.container);

    expect(element.id).toBe("comment");
    expect(element.disabled).toBe(true);
    expect(element.required).toBe(true);
    expect(element.readOnly).toBe(true);
    expect(element.getAttribute("aria-invalid")).toBe("true");
    expect(element.dataset.scope).toBe("field");
    // `textarea`, not `input` — the field has a prop getter per control kind, and the part it wears
    // is what a `[data-part]` selector in the field recipe matches.
    expect(element.dataset.part).toBe("textarea");
  });

  it("is the element the label points at, so clicking the label focuses it", () => {
    mounted = mount(() => (
      <Field.Root>
        <Field.Label>Comment</Field.Label>
        <Textarea />
      </Field.Root>
    ));
    const element = textareaIn(mounted.container);
    const label = mounted.container.querySelector("label");

    expect(label?.getAttribute("for")).toBe(element.id);
    label?.click();
    expect(document.activeElement).toBe(element);
  });

  it("is described by a HelperText once that text has mounted", async () => {
    mounted = mount(() => (
      <Field.Root id="comment">
        <Textarea />
        <Field.HelperText>Max 500 characters.</Field.HelperText>
      </Field.Root>
    ));
    const element = textareaIn(mounted.container);

    await vi.waitFor(() =>
      expect(element.getAttribute("aria-describedby")).toBe("field::comment::helper-text"),
    );
  });

  it("stays disabled when a wrapper forwards an unset `disabled`", () => {
    mounted = mount(() => (
      <Field.Root disabled>
        <Textarea disabled={undefined} />
      </Field.Root>
    ));

    expect(textareaIn(mounted.container).disabled).toBe(true);
  });

  it("follows the field's state after mount, having snapshotted none of it", () => {
    const [invalid, setInvalid] = createSignal(false);
    mounted = mount(() => (
      <Field.Root id="comment" invalid={invalid()}>
        <Textarea />
      </Field.Root>
    ));
    const element = textareaIn(mounted.container);

    expect(element.hasAttribute("aria-invalid")).toBe(false);
    flush(() => setInvalid(true));
    expect(element.getAttribute("aria-invalid")).toBe("true");
    expect(element.dataset.invalid).toBe("");
  });

  it("inherits a disabled Fieldset through the field", () => {
    // Two hops: the fieldset disables the field by absence, and the field disables the control.
    mounted = mount(() => (
      <Fieldset.Root disabled>
        <Fieldset.Legend>Feedback</Fieldset.Legend>
        <Field.Root>
          <Field.Label>Comment</Field.Label>
          <Textarea />
        </Field.Root>
      </Fieldset.Root>
    ));

    expect(textareaIn(mounted.container).disabled).toBe(true);
  });
});
