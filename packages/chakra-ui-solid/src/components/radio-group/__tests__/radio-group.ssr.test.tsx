import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { Fieldset } from "../../fieldset";
import { LocaleProvider } from "../../locale";
import { RadioGroup } from "../index";

/**
 * Every opening tag carrying `data-part="…"` **under the radio-group scope**.
 *
 * Scope-qualified, and that is not belt-and-braces: `fieldset` and `radio-group` both name a part
 * `root`, and one of the trees below wraps one in the other. Zag writes `data-scope` immediately
 * before `data-part`, so the pair is what identifies an element.
 */
function tagsOfPart(html: string, part: string, scope = "radio-group"): string[] {
  return [
    ...html.matchAll(
      new RegExp(`<[a-z0-9]+[^>]*data-scope="${scope}" data-part="${part}"[^>]*>`, "g"),
    ),
  ].map((match) => match[0]);
}

/** The first of them. */
function tagOfPart(html: string, part: string, scope = "radio-group"): string | undefined {
  return tagsOfPart(html, part, scope)[0];
}

/** The `id` attribute of the *n*th element carrying `data-part="…"`. */
function idOfPart(html: string, part: string, index = 0): string | undefined {
  return tagsOfPart(html, part)[index]?.match(/\bid="([^"]*)"/)?.[1];
}

const ITEMS = ["solid", "vue", "react"];

/** Three radios with every part written out — what a page serves before any script runs. */
const Served = () => (
  <RadioGroup.Root defaultValue="solid" name="framework">
    <RadioGroup.Label>Framework</RadioGroup.Label>
    {ITEMS.map((value) => (
      <RadioGroup.Item value={value}>
        <RadioGroup.ItemHiddenInput />
        <RadioGroup.ItemIndicator />
        <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
      </RadioGroup.Item>
    ))}
  </RadioGroup.Root>
);

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. A radio group's whole shape on the server is **which of N items the machine
 * says is checked** — and the machine never *starts* there, since it begins in `onSettled`. So
 * everything below is what `context({ bindable })` plus a `connect()` with no started machine
 * produce, and a server that disagrees with the client about any of it is a page that serves the
 * wrong radio ticked.
 */
describe("RadioGroup on the server", () => {
  it("renders one of every repeated part per item, and the group's parts once", async () => {
    const html = await renderServer(Served);

    expect(tagsOfPart(html, "root")).toHaveLength(1);
    expect(tagsOfPart(html, "label")).toHaveLength(1);
    expect(tagsOfPart(html, "item")).toHaveLength(3);
    expect(tagsOfPart(html, "item-text")).toHaveLength(3);
    expect(tagsOfPart(html, "item-control")).toHaveLength(3);
    expect(html).toContain('data-scope="radio-group"');
  });

  it("never emits the two slot names Chakra added, because neither has a part", async () => {
    // `itemAddon` and `itemIndicator` are names on the class map and nothing else in this recipe —
    // the `radioCard` one is what gives them declarations. `indicator` is a real anatomy part with
    // no component here, which is upstream's shape rather than an omission.
    const html = await renderServer(Served);

    expect(html).not.toContain('data-part="item-addon"');
    expect(html).not.toContain('data-part="item-indicator"');
    expect(html).not.toContain('data-part="indicator"');
  });

  it("gives every item its own id scheme, keyed by value rather than by position", async () => {
    // The half a repeated part can get wrong that a single-element part cannot: N of each id, each
    // resolved from the item's own `value`. A getter handed the wrong bag would give two items the
    // same id and hydrate one input against the other.
    const html = await renderServer(Served);

    expect(idOfPart(html, "root")).toMatch(/^radio-group:/);
    const scope = idOfPart(html, "root");

    ITEMS.forEach((value, index) => {
      expect(idOfPart(html, "item", index), value).toBe(`${scope}:radio:${value}`);
      expect(idOfPart(html, "item-text", index), value).toBe(`${scope}:radio:label:${value}`);
      expect(idOfPart(html, "item-control", index), value).toBe(`${scope}:radio:control:${value}`);
      expect(html, value).toContain(`id="${scope}:radio:input:${value}"`);
    });
  });

  it("renders each item as a `label` pointing at its own input", async () => {
    // Zag returns `normalize.label(…)` with `htmlFor` here while the React version types the part a
    // `div`; the element has always been a label, and that `for` is what makes the whole row
    // clickable without a handler.
    const html = await renderServer(Served);

    for (const [index, value] of ITEMS.entries()) {
      const item = tagsOfPart(html, "item")[index];
      expect(item?.startsWith("<label"), value).toBe(true);
      expect(item, value).toContain(`for="${idOfPart(html, "root")}:radio:input:${value}"`);
    }
  });

  it("serves the group as a `radiogroup` labelled by its own label", async () => {
    const html = await renderServer(Served);
    const root = tagOfPart(html, "root");

    expect(root).toContain('role="radiogroup"');
    expect(root).toContain(`aria-labelledby="${idOfPart(html, "label")}"`);
    // The machine's own inline style, forwarded untouched — it is what an absolutely-positioned
    // indicator measures against.
    expect(root).toMatch(/style="[^"]*position:relative/);
  });

  it("checks exactly the served item the machine's default names", async () => {
    // `getItemHiddenInputProps` hands back `defaultChecked`, which the server build maps onto the
    // real `checked` attribute — so the right radio is ticked before a byte of script runs.
    const html = await renderServer(Served);
    const inputs = [...html.matchAll(/<input[^>]*>/g)].map((match) => match[0]);

    expect(inputs).toHaveLength(3);
    expect(inputs.filter((input) => input.includes(" checked"))).toHaveLength(1);
    expect(inputs[0]).toContain("checked");
    expect(inputs[0]).toContain('type="radio"');
    expect(inputs[0]).toContain('value="solid"');
    expect(inputs[0]).toContain('name="framework"');
  });

  it("reports `data-state` per item, so only the checked one reads `checked`", async () => {
    const html = await renderServer(Served);

    for (const part of ["item", "item-text", "item-control"]) {
      const states = tagsOfPart(html, part).map((tag) =>
        tag.includes('data-state="checked"') ? "checked" : "unchecked",
      );
      expect(states, part).toEqual(["checked", "unchecked", "unchecked"]);
    }
  });

  it("names every input under the group's `id` when no `name` was given", async () => {
    const html = await renderServer(() => (
      <RadioGroup.Root id="framework">
        <RadioGroup.Item value="solid">
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      </RadioGroup.Root>
    ));

    expect(idOfPart(html, "root")).toBe("radio-group:framework");
    expect(html.match(/<input[^>]*>/)?.[0]).toContain('name="framework"');
  });

  it("carries `data-ssr` on the three item parts, and on nothing else", async () => {
    // The machine writes it and **no `radioGroup` rule reads it** — `segmentGroup` and `tabs` are
    // the only recipes that do. It is asserted here rather than styled, because the attribute is
    // this machine's contract with a *different* component's recipe and a Zag change that dropped
    // it would land silently.
    const html = await renderServer(Served);

    for (const part of ["item", "item-text", "item-control"]) {
      for (const tag of tagsOfPart(html, part)) {
        expect(tag, part).toContain("data-ssr");
      }
    }
    expect(tagOfPart(html, "root")).not.toContain("data-ssr");
    expect(tagOfPart(html, "label")).not.toContain("data-ssr");
  });

  it("hides every input under the machine's own inline style rather than a class", async () => {
    // `visuallyHiddenStyle` is Zag's, forwarded untouched — an inline `style` is legal here and is
    // the one thing that cannot be lost to a Panda class that was never generated.
    const html = await renderServer(Served);

    for (const input of html.matchAll(/<input[^>]*>/g)) {
      expect(input[0]).toMatch(/style="[^"]*position:absolute/);
      expect(input[0]).toMatch(/style="[^"]*clip:rect\(0 0 0 0\)/);
    }
  });

  it("takes an item's own `disabled` and `invalid` without the group carrying either", async () => {
    const html = await renderServer(() => (
      <RadioGroup.Root>
        <RadioGroup.Item value="solid" disabled invalid>
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemText>Solid</RadioGroup.ItemText>
        </RadioGroup.Item>
        <RadioGroup.Item value="vue">
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemText>Vue</RadioGroup.ItemText>
        </RadioGroup.Item>
      </RadioGroup.Root>
    ));

    // Bare, with no `=""`: `dataAttr(true)` is the empty string and Solid's server serializer writes
    // an empty attribute as a name alone.
    expect(tagsOfPart(html, "item")[0]).toContain("data-disabled");
    expect(tagsOfPart(html, "item")[0]).toContain("data-invalid");
    expect(tagsOfPart(html, "item")[1]).not.toContain("data-disabled");
    expect(tagsOfPart(html, "item")[1]).not.toContain("data-invalid");

    // Reached the *text* too, which only happens if the item's props bag round-tripped through the
    // group's getter rather than being read off the Root's state.
    expect(tagsOfPart(html, "item-text")[0]).toContain("data-disabled");
    expect(tagsOfPart(html, "item-text")[1]).not.toContain("data-disabled");

    const inputs = [...html.matchAll(/<input[^>]*>/g)].map((match) => match[0]);
    expect(inputs[0]).toContain("disabled");
    expect(inputs[0]).toContain('aria-invalid="true"');
    expect(inputs[1]).not.toContain("disabled");
  });

  it("puts the group's own states on every item", async () => {
    const html = await renderServer(() => (
      <RadioGroup.Root disabled invalid required readOnly>
        <RadioGroup.Label>Framework</RadioGroup.Label>
        <RadioGroup.Item value="solid">
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemText>Solid</RadioGroup.ItemText>
        </RadioGroup.Item>
      </RadioGroup.Root>
    ));

    for (const part of ["item", "item-text"]) {
      const tag = tagOfPart(html, part);
      expect(tag, part).toContain("data-disabled");
      expect(tag, part).toContain("data-invalid");
      expect(tag, part).toContain("data-readonly");
    }

    const root = tagOfPart(html, "root");
    expect(root).toContain('aria-disabled="true"');
    expect(root).toContain('aria-readonly="true"');
    expect(root).toContain('aria-required="true"');
    // A read-only group serves its inputs disabled, so the browser refuses the change as well.
    expect(html.match(/<input[^>]*>/)?.[0]).toContain("disabled");
  });

  it("writes the orientation onto the group and every item, defaulting to vertical", async () => {
    // **The machine's default is `vertical`**, which is not the `horizontal` a row of radios looks
    // like — the recipe lays nothing out, so this is the arrow-key model and an attribute to write
    // rules against, and every docs example puts the row in an `HStack` of its own.
    const served = await renderServer(Served);
    expect(tagOfPart(served, "root")).toContain('data-orientation="vertical"');

    const html = await renderServer(() => (
      <RadioGroup.Root orientation="horizontal">
        <RadioGroup.Item value="solid">
          <RadioGroup.ItemText>Solid</RadioGroup.ItemText>
        </RadioGroup.Item>
      </RadioGroup.Root>
    ));

    expect(tagOfPart(html, "root")).toContain('aria-orientation="horizontal"');
    for (const part of ["root", "item", "item-text"]) {
      expect(tagOfPart(html, part), part).toContain('data-orientation="horizontal"');
    }
    // The machine took it, so the raw prop must not have reached the `div` as well. The leading
    // space is what keeps this from matching the `aria-orientation` the machine *does* write.
    expect(tagOfPart(html, "root")).not.toContain(' orientation="horizontal"');
  });

  it("hides the machine's own `orientation` prop from the served attributes", async () => {
    const html = await renderServer(() => (
      <RadioGroup.Root orientation="vertical" defaultValue="solid" name="fw" form="f" />
    ));
    const root = tagOfPart(html, "root");

    for (const key of ["defaultValue", "name", "form"]) {
      expect(root, key).not.toContain(`${key}=`);
    }
  });

  it("lets a surrounding `Fieldset.Root` name the group and hand it both states", async () => {
    // The one composition where this machine's element ids come from a component that owns neither
    // element and starts no machine. Ark reads a *fieldset* here where Checkbox and Switch read a
    // Field, because a set of radios is a legend and a group rather than one labelled control.
    const html = await renderServer(() => (
      <Fieldset.Root id="framework" disabled invalid>
        <Fieldset.Legend>Framework</Fieldset.Legend>
        <RadioGroup.Root>
          <RadioGroup.Item value="solid">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemText>Solid</RadioGroup.ItemText>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </Fieldset.Root>
    ));

    expect(tagOfPart(html, "root")).toContain('aria-labelledby="fieldset::framework::legend"');
    expect(tagOfPart(html, "item")).toContain("data-disabled");
    expect(tagOfPart(html, "item")).toContain("data-invalid");
  });

  it("resolves one class map on the Root and gives every item the same strings", async () => {
    // Proof 5 on the server: the recipe is called once, so the three items carry identical `item`
    // and `item-control` classes. A per-item `sva()` call would be correct and wasteful, and the
    // only thing that can see the difference is a comparison like this one.
    const html = await renderServer(Served);
    const classOf = (tag: string | undefined) => tag?.match(/\bclass="([^"]*)"/)?.[1];

    const itemClasses = tagsOfPart(html, "item").map(classOf);
    expect(new Set(itemClasses).size).toBe(1);
    expect(itemClasses[0]).toContain("radio-group__item");

    const controlClasses = tagsOfPart(html, "item-control").map(classOf);
    expect(new Set(controlClasses).size).toBe(1);

    expect(html).toContain("radio-group__root");
    expect(html).toContain("radio-group__label");
    expect(html).toContain("radio-group__itemText");
    expect(html).toContain("radio-group__item--size_md");
    expect(html).toContain("radio-group__itemControl--variant_solid");
  });

  it("drops the radiomark's own recipe class while keeping the slot's", async () => {
    // The `itemControl` slot already carries the whole `radiomark` body, so the mark renders
    // `unstyled` and the only class on it is the slot's. A `radiomark` class here would mean a
    // second circle drawn inside the first.
    const html = await renderServer(Served);
    const control = tagOfPart(html, "item-control");

    expect(control).toContain("radio-group__itemControl");
    expect(control).not.toContain("radiomark");
    // The dot is the mark's own child, and the slot's `& .dot` rule is what paints it.
    expect(html).toContain('class="dot"');
  });

  it("drops every class under `unstyled` while keeping the anatomy", async () => {
    const html = await renderServer(() => (
      <RadioGroup.Root unstyled defaultValue="solid">
        <RadioGroup.Item value="solid">
          <RadioGroup.ItemIndicator />
          <RadioGroup.ItemText>Solid</RadioGroup.ItemText>
        </RadioGroup.Item>
      </RadioGroup.Root>
    ));

    expect(html).not.toContain("radio-group__");
    expect(html).toContain('data-part="item-control"');
  });

  it("carries `dir` from a `LocaleProvider` onto every part", async () => {
    const html = await renderServer(() => (
      <LocaleProvider locale="ar-AE">
        <Served />
      </LocaleProvider>
    ));

    for (const part of ["root", "label", "item", "item-text", "item-control"]) {
      expect(tagOfPart(html, part), part).toContain('dir="rtl"');
    }
  });
});
