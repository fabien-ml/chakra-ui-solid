import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { Field } from "../../field";
import { Fieldset } from "../../fieldset";
import { LocaleProvider } from "../../locale";
import { Switch } from "../index";

/**
 * Every opening tag carrying `data-part="…"` **under the switch scope**.
 *
 * Scope-qualified, and that is not belt-and-braces: `field`, `fieldset` and `switch` all name a part
 * `root`, and two of the trees below wrap one in another. Zag writes `data-scope` immediately before
 * `data-part`, so the pair is what identifies an element.
 */
function tagsOfPart(html: string, part: string, scope = "switch"): string[] {
  return [
    ...html.matchAll(
      new RegExp(`<[a-z0-9]+[^>]*data-scope="${scope}" data-part="${part}"[^>]*>`, "g"),
    ),
  ].map((match) => match[0]);
}

/** The first of them. */
function tagOfPart(html: string, part: string, scope = "switch"): string | undefined {
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

/** One switch with every part written out — what a page serves before any script runs. */
const Served = () => (
  <Switch.Root defaultChecked>
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>Activate Chakra</Switch.Label>
  </Switch.Root>
);

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. A switch's whole shape on the server is which state its machine started in —
 * and the machine never *starts* there, since it begins in `onSettled`. So everything below is what
 * `context({ bindable })` plus a `connect()` with no started machine produce, and a server that
 * disagrees with the client about any of it is a page that flashes an off switch before hydration.
 */
describe("Switch on the server", () => {
  it("renders all four anatomy parts, and never Chakra's fifth slot name", async () => {
    // `swittch`'s recipe declares five slots and the machine's anatomy has four: `indicator` is
    // Chakra's own, its component calls no prop getter, and the part attribute never reaches the
    // DOM. Asserting its absence is what keeps that a decision rather than a bug.
    const html = await renderServer(Served);

    for (const part of ["root", "control", "label", "thumb"]) {
      expect(html, part).toContain(`data-part="${part}"`);
    }
    expect(html).toContain('data-scope="switch"');
    expect(html).not.toContain('data-part="indicator"');
  });

  it("labels the hidden input with the root, so a click anywhere in the row toggles it", async () => {
    // The Root *is* the `<label>`, and its `for` is the machine's rather than a prop of ours — which
    // is the whole reason `Switch.HiddenInput` is required rather than optional.
    const html = await renderServer(Served);
    const root = tagOfPart(html, "root");

    expect(root?.startsWith("<label")).toBe(true);
    expect(root).toContain(`for="${idOfPart(html, "root")}:input"`);
  });

  it("serves a checkbox input rather than a `role=switch`", async () => {
    // Zag's decision on every framework it ships: the native checkbox is what a form serialises and
    // what assistive technology already understands, and `aria-labelledby` is what names it. A
    // `role="switch"` here would be accessibility behavior beyond what Zag ships.
    const html = await renderServer(Served);
    const input = html.match(/<input[^>]*>/)?.[0];

    expect(input).toContain('type="checkbox"');
    expect(html).not.toContain('role="switch"');
    expect(input).toContain(`aria-labelledby="${idOfPart(html, "label")}"`);
  });

  it("fills an empty control with the thumb, and drops it for `null`", async () => {
    // The JSX-valued slot default, resolved inside `children()` and tested by presence rather than
    // with `??`: React's `defaultProps` fills only an *absent* child.
    const filled = await renderServer(() => (
      <Switch.Root>
        <Switch.Control />
      </Switch.Root>
    ));
    const emptied = await renderServer(() => (
      <Switch.Root>
        <Switch.Control>{null}</Switch.Control>
      </Switch.Root>
    ));

    expect(filled).toContain('data-part="thumb"');
    expect(emptied).not.toContain('data-part="thumb"');
  });

  it("reports the state on every part's `data-state`, including the resting one", async () => {
    const html = await renderServer(Served);

    for (const part of ["root", "control", "label", "thumb"]) {
      expect(tagOfPart(html, part), part).toContain('data-state="checked"');
    }

    const resting = await renderServer(() => (
      <Switch.Root>
        <Switch.HiddenInput />
        <Switch.Control />
      </Switch.Root>
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
    // onto the real `checked` attribute — so a served switch is on before a byte of script runs,
    // rather than off until the machine starts. From then on the attribute is inert: the machine's
    // `syncInputElement` effect writes the `.checked` **property** onto the node, which is the only
    // thing a form or a screen reader reads afterwards.
    const html = await renderServer(Served);

    expect(html.match(/<input[^>]*>/)?.[0]).toContain("checked");

    const resting = await renderServer(() => (
      <Switch.Root>
        <Switch.HiddenInput />
        <Switch.Control />
      </Switch.Root>
    ));
    expect(resting.match(/<input[^>]*>/)?.[0]).not.toContain("checked");
  });

  it("puts the machine's states on the parts and the required flag on the input", async () => {
    const html = await renderServer(() => (
      <Switch.Root disabled invalid required readOnly>
        <Switch.HiddenInput />
        <Switch.Control />
        <Switch.Label>Terms</Switch.Label>
      </Switch.Root>
    ));

    for (const part of ["root", "control", "label", "thumb"]) {
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
      <Switch.Root id="notify" defaultChecked>
        <Switch.HiddenInput />
        <Switch.Control />
        <Switch.Label>Notify me</Switch.Label>
      </Switch.Root>
    ));

    expect(idOfPart(html, "root")).toBe("switch:notify");
    expect(idOfPart(html, "control")).toBe("switch:notify:control");
    expect(idOfPart(html, "label")).toBe("switch:notify:label");
    expect(idOfPart(html, "thumb")).toBe("switch:notify:thumb");
    expect(html).toContain('id="switch:notify:input"');
  });

  it("gives two switches in one render two different ids", async () => {
    const html = await renderServer(() => (
      <div>
        <Served />
        <Served />
      </div>
    ));

    const ids = [...html.matchAll(/id="(switch:[^"]*):input"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("submits its `value` under its `name`, and takes a numeric one", async () => {
    // Zag types this `string | number`, unlike the checkbox's — the machine passes it straight to
    // the input's `value`, so a number is served as its decimal form rather than dropped.
    const html = await renderServer(() => (
      <Switch.Root name="plan" value={42} defaultChecked>
        <Switch.HiddenInput />
      </Switch.Root>
    ));
    const input = html.match(/<input[^>]*>/)?.[0];

    expect(input).toContain('name="plan"');
    expect(input).toContain('value="42"');
  });

  it("lets a surrounding `Field.Root` name the label and the input", async () => {
    // The one composition where a machine's element ids come from a component that owns neither
    // element and starts no machine. The `for` on the `<label>` follows the input's id, so the two
    // agree before a byte of JavaScript runs.
    const html = await renderServer(() => (
      <Field.Root id="notify">
        <Switch.Root>
          <Switch.HiddenInput />
          <Switch.Control />
          <Switch.Label>Notify me</Switch.Label>
        </Switch.Root>
      </Field.Root>
    ));

    expect(idOfPart(html, "label")).toBe("field::notify::label");
    expect(html).toContain('id="notify"');
    expect(tagOfPart(html, "root")).toContain('for="notify"');
  });

  it("inherits the field's states without being passed one", async () => {
    const html = await renderServer(() => (
      <Field.Root disabled invalid required>
        <Switch.Root>
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.Root>
      </Field.Root>
    ));

    const control = tagOfPart(html, "control");
    expect(control).toContain("data-disabled");
    expect(control).toContain("data-invalid");
    expect(control).toContain("data-required");
  });

  it("inherits a Fieldset's `disabled` through the Field, and its `invalid` not at all", async () => {
    // Two hops, and only one of them carries the state: `Field` reads `disabled` off a surrounding
    // `Fieldset` and nothing else, so a fieldset's `invalid` reaches no switch inside it. That is
    // upstream's own shape — `Checkbox` looks like the counter-example and is not, because there it
    // is `CheckboxGroup` that reads both, and Switch has no group.
    const html = await renderServer(() => (
      <Fieldset.Root disabled invalid>
        <Field.Root>
          <Switch.Root>
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
        </Field.Root>
      </Fieldset.Root>
    ));

    const control = tagOfPart(html, "control");
    expect(control).toContain("data-disabled");
    expect(control).not.toContain("data-invalid");
  });

  it("resolves the slot recipe under the `switch` class name, not the misspelled key", async () => {
    // **The half of the misspelling that a consumer can see.** `@chakra-ui/panda-preset` registers
    // this slot recipe as `swittch` and gives it `className: "switch"`, so the key our Root hands
    // `createSlotClasses` is the typo and every class it hands back is spelled correctly. A
    // `swittch__control` here would mean we had aliased the key and were emitting the body twice.
    const html = await renderServer(Served);

    for (const slot of ["switch__root", "switch__label", "switch__control", "switch__thumb"]) {
      expect(html, slot).toContain(slot);
    }
    expect(html).not.toContain("swittch");
    expect(html).toContain("switch__root--size_md");
    expect(html).toContain("switch__control--variant_solid");
  });

  it("drops every class under `unstyled` while keeping the anatomy", async () => {
    const html = await renderServer(() => (
      <Switch.Root unstyled>
        <Switch.HiddenInput />
        <Switch.Control />
        <Switch.Label>Terms</Switch.Label>
      </Switch.Root>
    ));

    expect(html).not.toContain("switch__");
    expect(html).toContain('data-part="control"');
  });

  it("gives the track indicator the checked arm and its own class, and no anatomy", async () => {
    // Chakra's fifth slot. It calls no prop getter, so the only state on it is the `data-checked`
    // this component writes out of context — and that is what the `indicator` slot's `_checked`
    // block selects on to slide the glyph across the track.
    const html = await renderServer(() => (
      <Switch.Root defaultChecked>
        <Switch.Control>
          <Switch.Thumb />
          <Switch.Indicator data-probe="indicator" fallback={<span>moon</span>}>
            <span>sun</span>
          </Switch.Indicator>
        </Switch.Control>
      </Switch.Root>
    ));
    const indicator = tagOfProbe(html, "indicator");

    expect(indicator).toContain("switch__indicator");
    expect(indicator).toContain("data-checked");
    expect(indicator).not.toContain("data-scope");
    expect(indicator).not.toContain("data-part");
    expect(indicator).not.toContain("data-state");
    expect(html).toContain("sun");
    expect(html).not.toContain("moon");
  });

  it("takes the fallback arm while the switch is off, and writes no `data-checked`", async () => {
    const html = await renderServer(() => (
      <Switch.Root>
        <Switch.Control>
          <Switch.Thumb />
          <Switch.Indicator data-probe="indicator" fallback={<span>moon</span>}>
            <span>sun</span>
          </Switch.Indicator>
        </Switch.Control>
      </Switch.Root>
    ));

    expect(tagOfProbe(html, "indicator")).not.toContain("data-checked");
    expect(html).toContain("moon");
    expect(html).not.toContain("sun");
  });

  it("gives the thumb indicator no recipe class at all, which is its whole shape", async () => {
    // The sixth component that is not a slot: `swittch` declares five and none of them is this, so
    // nothing here carries a class and a consumer's own styles are the only thing on it.
    const html = await renderServer(() => (
      <Switch.Root defaultChecked>
        <Switch.Control>
          <Switch.Thumb>
            <Switch.ThumbIndicator data-probe="thumb-indicator" fallback="off">
              on
            </Switch.ThumbIndicator>
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Root>
    ));
    const thumbIndicator = tagOfProbe(html, "thumb-indicator");

    expect(thumbIndicator).not.toContain("switch__");
    expect(thumbIndicator).toContain("data-checked");
    expect(html).toContain("on");
  });

  it("carries `dir` from a `LocaleProvider` onto every part", async () => {
    const html = await renderServer(() => (
      <LocaleProvider locale="ar-AE">
        <Served />
      </LocaleProvider>
    ));

    for (const part of ["root", "control", "label", "thumb"]) {
      expect(tagOfPart(html, part), part).toContain('dir="rtl"');
    }
  });
});
