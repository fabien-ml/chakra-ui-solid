import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { ComponentProps } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Field } from "../../field";
import { Fieldset } from "../../fieldset";
import { LocaleProvider } from "../../locale";
import { Checkbox, CheckboxGroup } from "../index";

/**
 * Every opening tag carrying `data-part="…"` **under the checkbox scope** — a group has one per
 * checkbox.
 *
 * Scope-qualified, and that is not belt-and-braces: `field`, `fieldset` and `checkbox` all name a
 * part `root`, and two of the trees below wrap one in another. Zag writes `data-scope` immediately
 * before `data-part`, so the pair is what identifies an element.
 */
function tagsOfPart(html: string, part: string, scope = "checkbox"): string[] {
  return [
    ...html.matchAll(
      new RegExp(`<[a-z0-9]+[^>]*data-scope="${scope}" data-part="${part}"[^>]*>`, "g"),
    ),
  ].map((match) => match[0]);
}

/** The first of them. */
function tagOfPart(html: string, part: string, scope = "checkbox"): string | undefined {
  return tagsOfPart(html, part, scope)[0];
}

/** The `id` attribute of the element carrying `data-part="…"`. */
function idOfPart(html: string, part: string): string | undefined {
  return tagOfPart(html, part)?.match(/\bid="([^"]*)"/)?.[1];
}

/** The whole opening tag of the element carrying `data-probe="…"`, for the parts with no `data-part`. */
function tagOfProbe(html: string, probe: string): string | undefined {
  return html.match(new RegExp(`<[a-z0-9]+[^>]*data-probe="${probe}"[^>]*>`))?.[0];
}

/** One checkbox with every part written out — what a page serves before any script runs. */
const Served = () => (
  <Checkbox.Root defaultChecked>
    <Checkbox.HiddenInput />
    <Checkbox.Control />
    <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
  </Checkbox.Root>
);

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. A checkbox's whole shape on the server is which state its machine started in —
 * and the machine never *starts* there, since it begins in `onSettled`. So everything below is what
 * `context({ bindable })` plus a `connect()` with no started machine produce, and a server that
 * disagrees with the client about any of it is a page that flashes an empty box before hydration.
 */
describe("Checkbox on the server", () => {
  it("renders three of the four anatomy parts, and never the fourth", async () => {
    // `indicator` is in `checkbox.anatomy` and no component calls `getIndicatorProps()` — Chakra's
    // own `Checkbox.Indicator` is a bare `Checkmark` reading context. So the part attribute never
    // reaches the DOM, and asserting its absence is what keeps that a decision rather than a bug.
    const html = await renderServer(Served);

    for (const part of ["root", "control", "label"]) {
      expect(html, part).toContain(`data-part="${part}"`);
    }
    expect(html).toContain('data-scope="checkbox"');
    expect(html).not.toContain('data-part="indicator"');
  });

  it("labels the hidden input with the root, so a click anywhere in the row toggles it", async () => {
    // The Root *is* the `<label>`, and its `for` is the machine's rather than a prop of ours — which
    // is the whole reason `Checkbox.HiddenInput` is required rather than optional.
    const html = await renderServer(Served);
    const root = tagOfPart(html, "root");

    expect(root?.startsWith("<label")).toBe(true);
    expect(root).toContain(`for="${idOfPart(html, "root")}:input"`);
    expect(html).toContain('type="checkbox"');
  });

  it("draws the glyph the started state calls for, on the server's first byte", async () => {
    // Three arms, three node counts. `Checkmark` renders a `polyline` when checked, a `path` when
    // indeterminate and nothing at rest — so the state the machine was seeded with is what every
    // hydration key after the control is counted against.
    const checked = await renderServer(Served);
    const indeterminate = await renderServer(() => (
      <Checkbox.Root defaultChecked="indeterminate">
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ));
    const resting = await renderServer(() => (
      <Checkbox.Root>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ));

    expect(checked).toContain("<polyline");
    expect(checked).not.toContain("<path");
    expect(indeterminate).toContain("<path");
    expect(indeterminate).not.toContain("<polyline");
    expect(resting).not.toContain("<polyline");
    expect(resting).not.toContain("<path");
  });

  it("reports the state on every part's `data-state`, including the resting one", async () => {
    const html = await renderServer(Served);

    for (const part of ["root", "control", "label"]) {
      expect(tagOfPart(html, part), part).toContain('data-state="checked"');
    }

    const resting = await renderServer(() => (
      <Checkbox.Root>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ));
    expect(tagOfPart(resting, "control")).toContain('data-state="unchecked"');
  });

  it("hides the input under the machine's own inline style rather than a class", async () => {
    // `visuallyHiddenStyle` is Zag's, forwarded untouched — an inline `style` is legal here and is
    // the one thing that cannot be lost to a Panda class that was never generated.
    const html = await renderServer(Served);

    expect(html).toMatch(/<input[^>]*style="[^"]*position:absolute/);
    expect(html).toMatch(/<input[^>]*style="[^"]*clip:rect\(0 0 0 0\)/);
  });

  it("serves `checked` as an attribute, which SolidJS resolves out of the machine's `defaultChecked`", async () => {
    // Zag's `getHiddenInputProps()` returns `defaultChecked`, and the server build maps that alias
    // onto the real `checked` attribute — so a served box is ticked before a byte of script runs,
    // rather than blank until the machine starts. From then on the attribute is inert: the machine's
    // `syncInputElement` effect writes the `.checked` and `.indeterminate` **properties** onto the
    // node, which is the only thing a form or a screen reader reads afterwards.
    const html = await renderServer(Served);
    const input = html.match(/<input[^>]*>/)?.[0];

    expect(input).toContain("checked");

    const resting = await renderServer(() => (
      <Checkbox.Root>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ));
    expect(resting.match(/<input[^>]*>/)?.[0]).not.toContain("checked");
  });

  it("puts the machine's states on the parts and the required flag on the input", async () => {
    const html = await renderServer(() => (
      <Checkbox.Root disabled invalid required readOnly>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Terms</Checkbox.Label>
      </Checkbox.Root>
    ));

    for (const part of ["root", "control", "label"]) {
      const tag = tagOfPart(html, part);
      // Bare, with no `=""`: `dataAttr(true)` is the empty string and Solid's server serializer
      // writes an empty attribute as a name alone.
      expect(tag, part).toContain("data-disabled");
      expect(tag, part).toContain("data-invalid");
      expect(tag, part).toContain("data-readonly");
      expect(tag, part).toContain("data-required");
    }

    const input = html.match(/<input[^>]*>/)?.[0];
    expect(input).toContain("required");
    expect(input).toContain("disabled");
    expect(input).toContain('aria-invalid="true"');
  });

  it("seeds the machine from `id` rather than naming the root element with it", async () => {
    const html = await renderServer(() => (
      <Checkbox.Root id="terms" defaultChecked>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Terms</Checkbox.Label>
      </Checkbox.Root>
    ));

    expect(idOfPart(html, "root")).toBe("checkbox:terms");
    expect(idOfPart(html, "control")).toBe("checkbox:terms:control");
    expect(idOfPart(html, "label")).toBe("checkbox:terms:label");
    expect(html).toContain('id="checkbox:terms:input"');
  });

  it("gives two checkboxes in one render two different ids", async () => {
    const html = await renderServer(() => (
      <div>
        <Served />
        <Served />
      </div>
    ));

    const ids = [...html.matchAll(/id="(checkbox:[^"]*):input"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("lets a surrounding `Field.Root` name the label and the input", async () => {
    // The one composition where a machine's element ids come from a component that owns neither
    // element and starts no machine. The `for` on the `<label>` follows the input's id, so the two
    // agree before a byte of JavaScript runs.
    const html = await renderServer(() => (
      <Field.Root id="terms">
        <Checkbox.Root>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Terms</Checkbox.Label>
        </Checkbox.Root>
      </Field.Root>
    ));

    expect(idOfPart(html, "label")).toBe("field::terms::label");
    expect(html).toContain('id="terms"');
    expect(tagOfPart(html, "root")).toContain('for="terms"');
  });

  it("inherits the field's states without being passed one", async () => {
    const html = await renderServer(() => (
      <Field.Root disabled invalid required>
        <Checkbox.Root>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </Field.Root>
    ));

    const control = tagOfPart(html, "control");
    expect(control).toContain("data-disabled");
    expect(control).toContain("data-invalid");
    expect(control).toContain("data-required");
  });

  it("drives every box in a group from one array, and names them all the same", async () => {
    const html = await renderServer(() => (
      <CheckboxGroup defaultValue={["react"]} name="framework">
        <Checkbox.Root value="react">
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
        <Checkbox.Root value="solid">
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </CheckboxGroup>
    ));

    const [first, second] = tagsOfPart(html, "control");
    expect(first).toContain('data-state="checked"');
    expect(second).toContain('data-state="unchecked"');

    // One `polyline` between the two, which is the node-count fact the hydration fixture is built
    // on: the group's array decides how many glyph nodes the server writes.
    expect(html.match(/<polyline/g)).toHaveLength(1);

    for (const input of html.match(/<input[^>]*>/g) ?? []) {
      expect(input).toContain('name="framework"');
    }
  });

  it("renders the group as a `role=group` div carrying the anatomy's fifth name", async () => {
    // `group` is Ark's extension of the machine's anatomy: it has a slot in the recipe, no body in
    // it, and no prop getter behind it — so the attributes are written here rather than merged.
    const html = await renderServer(() => (
      <CheckboxGroup data-probe="group">
        <Checkbox.Root value="react">
          <Checkbox.HiddenInput />
        </Checkbox.Root>
      </CheckboxGroup>
    ));

    const group = tagOfPart(html, "group");
    expect(group?.startsWith("<div")).toBe(true);
    expect(group).toContain('role="group"');
    expect(group).toContain('data-scope="checkbox"');
    // The `group` slot has no declarations in the recipe, so the class it would carry is not what
    // stacks the column — the `chakra()` base config on the element is.
    expect(group).not.toContain("checkbox__group");
  });

  it("disables every unticked box once the group is at `maxSelectedValues`", async () => {
    const html = await renderServer(() => (
      <CheckboxGroup defaultValue={["react"]} maxSelectedValues={1}>
        <Checkbox.Root value="react">
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
        <Checkbox.Root value="solid">
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </CheckboxGroup>
    ));

    const [ticked, unticked] = tagsOfPart(html, "control");
    expect(ticked).not.toContain("data-disabled");
    expect(unticked).toContain("data-disabled");
  });

  it("inherits `disabled` and `invalid` from a surrounding Fieldset", async () => {
    const html = await renderServer(() => (
      <Fieldset.Root disabled invalid>
        <CheckboxGroup>
          <Checkbox.Root value="react">
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>
        </CheckboxGroup>
      </Fieldset.Root>
    ));

    const control = tagOfPart(html, "control");
    expect(control).toContain("data-disabled");
    expect(control).toContain("data-invalid");
  });

  it("resolves the slot recipe on the server, and drops every class under `unstyled`", async () => {
    const styled = await renderServer(Served);
    const unstyled = await renderServer(() => (
      <Checkbox.Root unstyled>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Terms</Checkbox.Label>
      </Checkbox.Root>
    ));

    for (const slot of ["checkbox__root", "checkbox__label", "checkbox__control"]) {
      expect(styled, slot).toContain(slot);
    }
    expect(styled).toContain("checkbox__root--size_md");
    expect(styled).toContain("checkbox__control--variant_solid");

    expect(unstyled).not.toContain("checkbox__");
    expect(unstyled).toContain('data-part="control"');
  });

  it("gives the mark the `indicator` slot's class, which the sheet declares no rules for", async () => {
    // **The vacuous case, and it is upstream's own.** `checkbox__indicator` is one of the recipe's
    // five slot names and its body is empty — the whole checkmark body sits on `control` instead. So
    // the class lands on the `svg` and carries nothing, and this element must never be used as the
    // silent-unstyling probe.
    const html = await renderServer(Served);

    expect(html).toContain("checkbox__indicator");
    expect(html).not.toContain("checkmark--");
  });

  it("renders a consumer's own element in place of the mark, with the part's own class on it", async () => {
    const html = await renderServer(() => (
      <Checkbox.Root defaultChecked>
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator
            checked={(indicatorProps) => (
              <span {...(indicatorProps as ComponentProps<"span">)} data-probe="own">
                yes
              </span>
            )}
          />
        </Checkbox.Control>
      </Checkbox.Root>
    ));

    expect(tagOfProbe(html, "own")).toContain("checkbox__indicator");
    expect(html).not.toContain("<polyline");
  });

  it("carries `dir` from a `LocaleProvider` onto every part", async () => {
    const html = await renderServer(() => (
      <LocaleProvider locale="ar-AE">
        <Served />
      </LocaleProvider>
    ));

    for (const part of ["root", "control", "label"]) {
      expect(tagOfPart(html, part), part).toContain('dir="rtl"');
    }
  });
});
