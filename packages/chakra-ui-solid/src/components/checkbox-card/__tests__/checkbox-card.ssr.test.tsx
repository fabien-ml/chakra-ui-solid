import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { CheckboxGroup } from "../../checkbox";
import { Field } from "../../field";
import { Fieldset } from "../../fieldset";
import { LocaleProvider } from "../../locale";
import { CheckboxCard } from "../index";

/**
 * Every opening tag carrying `data-part="…"` **under the checkbox-card scope**.
 *
 * Two scopes are live inside one card and that is not a mistake: the machine is
 * `@zag-js/checkbox`, so `getRootProps()`, `getControlProps()` and `getLabelProps()` all write
 * `data-scope="checkbox"`, while the two parts this component writes by hand — the description and
 * the indicator — carry `checkbox-card`. Upstream is identical, and a query that ignores the scope
 * would silently match either.
 */
function tagsOfPart(html: string, part: string, scope = "checkbox"): string[] {
  return [
    ...html.matchAll(
      new RegExp(`<[a-z0-9]+[^>]*data-scope="${scope}" data-part="${part}"[^>]*>`, "g"),
    ),
  ].map((match) => match[0]);
}

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

/** One card with every part written out — what a page serves before any script runs. */
const Served = () => (
  <CheckboxCard.Root defaultChecked>
    <CheckboxCard.HiddenInput />
    <CheckboxCard.Control>
      <CheckboxCard.Content data-probe="content">
        <CheckboxCard.Label>Next.js</CheckboxCard.Label>
        <CheckboxCard.Description>Best for apps</CheckboxCard.Description>
      </CheckboxCard.Content>
      <CheckboxCard.Indicator />
    </CheckboxCard.Control>
    <CheckboxCard.Addon data-probe="addon">New</CheckboxCard.Addon>
  </CheckboxCard.Root>
);

describe("CheckboxCard on the server", () => {
  it("renders the machine's three parts under its own scope, and the card's four under the card's", async () => {
    // The split the whole file turns on. `root`, `control` and `label` come from prop getters, so
    // they carry the machine's scope; `description` and `indicator` are written by the component
    // and carry `checkbox-card`; `content` and `addon` are slots with no anatomy name at all and
    // carry no `data-part`, which is what makes their class the only handle on them.
    const html = await renderServer(Served);

    for (const part of ["root", "control", "label"]) {
      expect(tagOfPart(html, part), part).toBeDefined();
    }
    expect(tagOfPart(html, "description", "checkbox-card")).toBeDefined();
    expect(tagOfPart(html, "indicator", "checkbox-card")).toBeDefined();

    expect(tagOfProbe(html, "content")).not.toContain("data-part");
    expect(tagOfProbe(html, "addon")).not.toContain("data-part");
  });

  it("labels the hidden input with the root, so a click anywhere on the card toggles it", async () => {
    const html = await renderServer(Served);
    const root = tagOfPart(html, "root");

    expect(root?.startsWith("<label")).toBe(true);
    expect(root).toContain(`for="${idOfPart(html, "root")}:input"`);
    expect(html).toContain('type="checkbox"');
  });

  it("seeds the machine from `id` rather than naming the root element with it", async () => {
    // The machine is `@zag-js/checkbox`, so the ids it hands out are the checkbox's — `checkbox:…`,
    // not `checkbox-card:…`. Upstream is the same, for the same reason.
    const html = await renderServer(() => (
      <CheckboxCard.Root id="framework">
        <CheckboxCard.HiddenInput />
        <CheckboxCard.Control>
          <CheckboxCard.Label>Next.js</CheckboxCard.Label>
        </CheckboxCard.Control>
      </CheckboxCard.Root>
    ));

    expect(idOfPart(html, "root")).toBe("checkbox:framework");
    expect(idOfPart(html, "control")).toBe("checkbox:framework:control");
    expect(html).toContain('id="checkbox:framework:input"');
  });

  it("draws the glyph the started state calls for, on the server's first byte", async () => {
    // Three arms, three node counts — `Checkmark` renders a `polyline` when checked, a `path` when
    // indeterminate and nothing at rest.
    const checked = await renderServer(Served);
    const indeterminate = await renderServer(() => (
      <CheckboxCard.Root defaultChecked="indeterminate">
        <CheckboxCard.Control>
          <CheckboxCard.Indicator />
        </CheckboxCard.Control>
      </CheckboxCard.Root>
    ));
    const resting = await renderServer(() => (
      <CheckboxCard.Root>
        <CheckboxCard.Control>
          <CheckboxCard.Indicator />
        </CheckboxCard.Control>
      </CheckboxCard.Root>
    ));

    expect(checked).toContain("<polyline");
    expect(indeterminate).toContain("<path");
    expect(resting).not.toContain("<polyline");
    expect(resting).not.toContain("<path");
  });

  it("derives the description's own state attributes from context", async () => {
    // Not a machine part: the anatomy has no `description`, so there is no prop getter and these
    // four attributes are written by the component. A server that resolved them differently from
    // the client is a card whose second line reads as unchecked until hydration.
    const checked = await renderServer(Served);
    expect(tagOfPart(checked, "description", "checkbox-card")).toContain('data-state="checked"');

    const disabled = await renderServer(() => (
      <CheckboxCard.Root disabled>
        <CheckboxCard.Description>Best for apps</CheckboxCard.Description>
      </CheckboxCard.Root>
    ));
    const tag = tagOfPart(disabled, "description", "checkbox-card");

    // Bare, with no `=""`: Solid's server serializer writes an empty attribute as a name alone.
    expect(tag).toContain("data-disabled");
    expect(tag).toContain('data-state="unchecked"');
  });

  it("reports the state on every machine part, including the resting one", async () => {
    const html = await renderServer(Served);

    for (const part of ["root", "control", "label"]) {
      expect(tagOfPart(html, part), part).toContain('data-state="checked"');
    }

    const resting = await renderServer(() => (
      <CheckboxCard.Root>
        <CheckboxCard.Control />
      </CheckboxCard.Root>
    ));
    expect(tagOfPart(resting, "control")).toContain('data-state="unchecked"');
  });

  it("puts the machine's states on the parts and the required flag on the input", async () => {
    const html = await renderServer(() => (
      <CheckboxCard.Root disabled invalid required readOnly>
        <CheckboxCard.HiddenInput />
        <CheckboxCard.Control>
          <CheckboxCard.Label>Next.js</CheckboxCard.Label>
        </CheckboxCard.Control>
      </CheckboxCard.Root>
    ));

    for (const part of ["root", "control", "label"]) {
      const tag = tagOfPart(html, part);
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

  it("hides the input under the machine's own inline style rather than a class", async () => {
    const html = await renderServer(Served);

    expect(html).toMatch(/<input[^>]*style="[^"]*position:absolute/);
    expect(html).toMatch(/<input[^>]*style="[^"]*clip:rect\(0 0 0 0\)/);
  });

  it("resolves all seven slots on the server, and drops every class under `unstyled`", async () => {
    const styled = await renderServer(Served);
    const unstyled = await renderServer(() => (
      <CheckboxCard.Root unstyled defaultChecked>
        <CheckboxCard.HiddenInput />
        <CheckboxCard.Control>
          <CheckboxCard.Content>
            <CheckboxCard.Label>Next.js</CheckboxCard.Label>
            <CheckboxCard.Description>Best for apps</CheckboxCard.Description>
          </CheckboxCard.Content>
          <CheckboxCard.Indicator />
        </CheckboxCard.Control>
        <CheckboxCard.Addon>New</CheckboxCard.Addon>
      </CheckboxCard.Root>
    ));

    for (const slot of [
      "checkbox-card__root",
      "checkbox-card__control",
      "checkbox-card__label",
      "checkbox-card__description",
      "checkbox-card__addon",
      "checkbox-card__indicator",
      "checkbox-card__content",
    ]) {
      expect(styled, slot).toContain(slot);
    }
    expect(styled).toContain("checkbox-card__root--size_md");
    expect(styled).toContain("checkbox-card__indicator--variant_outline");

    expect(unstyled).not.toContain("checkbox-card__");
    expect(unstyled).toContain('data-part="control"');
  });

  it("gives the mark the `indicator` slot's class and never the `checkmark` recipe's", async () => {
    // **The inverse of `checkbox`, and the one assertion that says so.** There the whole checkmark
    // body sits on `control` and `checkbox__indicator` is a class with no rules; here `indicator`
    // carries it and `control` styles the card. Either way the mark renders `<Checkmark unstyled>`,
    // so no `checkmark--*` variant class may appear.
    const html = await renderServer(Served);

    expect(html).toContain("checkbox-card__indicator");
    expect(html).not.toContain("checkmark--");
  });

  it("leaves `--checkbox-card-justify` unwritten when no `justify` is passed", async () => {
    // `justify` is the one variant key with no entry in `defaultVariants`, so an unset one resolves
    // to no class at all — reproduced rather than defaulted.
    const unset = await renderServer(Served);
    const set = await renderServer(() => (
      <CheckboxCard.Root justify="center">
        <CheckboxCard.Control />
      </CheckboxCard.Root>
    ));

    expect(unset).not.toContain("justify_");
    expect(set).toContain("checkbox-card__root--justify_center");
    // The four with a default do resolve, unset.
    expect(unset).toContain("--align_start");
    expect(unset).toContain("--orientation_horizontal");
  });

  it("keeps every variant off the served `label` element", async () => {
    // Five variant keys where `checkbox` has two, and three of them — `justify`, `align`,
    // `orientation` — read as plain DOM words. Left in the props bag they land on the markup.
    const html = await renderServer(() => (
      <CheckboxCard.Root
        size="lg"
        variant="subtle"
        justify="center"
        align="end"
        orientation="vertical"
      >
        <CheckboxCard.Control />
      </CheckboxCard.Root>
    ));
    const root = tagOfPart(html, "root");

    for (const variant of ["size=", "variant=", "justify=", "align=", "orientation="]) {
      expect(root, variant).not.toContain(variant);
    }
  });

  it("drives a set of cards from one `CheckboxGroup`, unchanged", async () => {
    // The group is the checkbox row's, and it needs nothing added: `createCheckboxCard` *is*
    // `createCheckbox`, so a card reads its own `checked` out of the group's array the same way.
    const html = await renderServer(() => (
      <CheckboxGroup defaultValue={["next"]} name="framework">
        <CheckboxCard.Root value="next">
          <CheckboxCard.HiddenInput />
          <CheckboxCard.Control />
        </CheckboxCard.Root>
        <CheckboxCard.Root value="vite">
          <CheckboxCard.HiddenInput />
          <CheckboxCard.Control />
        </CheckboxCard.Root>
      </CheckboxGroup>
    ));

    const [first, second] = tagsOfPart(html, "control");
    expect(first).toContain('data-state="checked"');
    expect(second).toContain('data-state="unchecked"');

    for (const input of html.match(/<input[^>]*>/g) ?? []) {
      expect(input).toContain('name="framework"');
    }
  });

  it("lets a surrounding `Field.Root` name the label and the input", async () => {
    const html = await renderServer(() => (
      <Field.Root id="framework">
        <CheckboxCard.Root>
          <CheckboxCard.HiddenInput />
          <CheckboxCard.Control>
            <CheckboxCard.Label>Next.js</CheckboxCard.Label>
          </CheckboxCard.Control>
        </CheckboxCard.Root>
      </Field.Root>
    ));

    expect(idOfPart(html, "label")).toBe("field::framework::label");
    expect(tagOfPart(html, "root")).toContain('for="framework"');
  });

  it("inherits `disabled` and `invalid` from a surrounding Fieldset", async () => {
    const html = await renderServer(() => (
      <Fieldset.Root disabled invalid>
        <CheckboxGroup>
          <CheckboxCard.Root value="next">
            <CheckboxCard.HiddenInput />
            <CheckboxCard.Control />
          </CheckboxCard.Root>
        </CheckboxGroup>
      </Fieldset.Root>
    ));

    const control = tagOfPart(html, "control");
    expect(control).toContain("data-disabled");
    expect(control).toContain("data-invalid");
  });

  it("carries `dir` from a `LocaleProvider` onto every machine part", async () => {
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
