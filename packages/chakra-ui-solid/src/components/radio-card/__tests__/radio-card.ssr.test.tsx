import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { Fieldset } from "../../fieldset";
import { LocaleProvider } from "../../locale";
import { RadioCard } from "../index";

/**
 * Every opening tag carrying `data-part="…"` **under the radio-group scope** — which is a card's
 * scope too: the anatomy belongs to the machine, and a RadioCard runs `@zag-js/radio-group`.
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

/**
 * Every opening tag carrying a `data-testid` — the only way to find the parts this recipe leaves
 * anonymous. `ItemControl`, `ItemContent`, `ItemDescription`, `ItemAddon` and `ItemIndicator` are
 * none of them machine parts, so not one of them has a `data-scope`/`data-part` pair to select on.
 */
function tagsOfTestId(html: string, id: string): string[] {
  return [...html.matchAll(new RegExp(`<[a-z0-9]+[^>]*data-testid="${id}"[^>]*>`, "g"))].map(
    (match) => match[0],
  );
}

function tagOfTestId(html: string, id: string): string | undefined {
  return tagsOfTestId(html, id)[0];
}

const classOf = (tag: string | undefined) => tag?.match(/\bclass="([^"]*)"/)?.[1];

const ITEMS = ["next", "vite", "astro"];

/** Three cards with every part written out — what a page serves before any script runs. */
const Served = () => (
  <RadioCard.Root defaultValue="next" name="framework">
    <RadioCard.Label>Select framework</RadioCard.Label>
    {ITEMS.map((value) => (
      <RadioCard.Item value={value}>
        <RadioCard.ItemHiddenInput />
        <RadioCard.ItemControl data-testid="control">
          <RadioCard.ItemContent data-testid="content">
            <RadioCard.ItemText>{value}</RadioCard.ItemText>
            <RadioCard.ItemDescription data-testid="description">
              Best for {value}
            </RadioCard.ItemDescription>
          </RadioCard.ItemContent>
          <RadioCard.ItemIndicator data-testid="indicator" />
        </RadioCard.ItemControl>
        <RadioCard.ItemAddon data-testid="addon">Free</RadioCard.ItemAddon>
      </RadioCard.Item>
    ))}
  </RadioCard.Root>
);

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. A radio card's whole shape on the server is **which of N cards the machine says
 * is picked** — and the machine never *starts* there, since it begins in `onSettled`. So everything
 * below is what `context({ bindable })` plus a `connect()` with no started machine produce.
 */
describe("RadioCard on the server", () => {
  it("renders one of every repeated part per card, and the group's parts once", async () => {
    const html = await renderServer(Served);

    expect(tagsOfPart(html, "root")).toHaveLength(1);
    expect(tagsOfPart(html, "label")).toHaveLength(1);
    expect(tagsOfPart(html, "item")).toHaveLength(3);
    expect(tagsOfPart(html, "item-text")).toHaveLength(3);
    expect(tagsOfTestId(html, "control")).toHaveLength(3);
    expect(tagsOfTestId(html, "content")).toHaveLength(3);
    expect(tagsOfTestId(html, "description")).toHaveLength(3);
    expect(tagsOfTestId(html, "addon")).toHaveLength(3);
    expect(tagsOfTestId(html, "indicator")).toHaveLength(3);
  });

  it("scopes its anatomy to the machine, not to the recipe", async () => {
    // A card is a radio group wearing a second slot recipe, so the parts a machine getter describes
    // announce themselves as `radio-group` — which is what a stylesheet or a test written against
    // chakra-ui.com's markup would expect too.
    const html = await renderServer(Served);

    expect(html).toContain('data-scope="radio-group"');
    expect(html).not.toContain('data-scope="radio-card"');
  });

  it("leaves five of its ten slots with no anatomy pair at all", async () => {
    // The half of this recipe that has no machine counterpart. `itemControl` is the surprising one:
    // the machine *does* have that part, and this component deliberately does not use it.
    const html = await renderServer(Served);

    for (const part of ["item-control", "item-addon", "item-indicator", "indicator"]) {
      expect(html, part).not.toContain(`data-part="${part}"`);
    }
  });

  it("writes six state attributes on a control the machine never described", async () => {
    // `RadioCardItemControl` is hand-written: six `data-*` off the card's own state, and **none** of
    // the seven the machine's `getItemControlProps()` would have added. The absent `id` is the
    // load-bearing one — without it this element is not the machine's `itemControl` node, which is
    // why a card renders a control *and* an indicator where a radio renders one or the other.
    const html = await renderServer(Served);
    const [checked, unchecked] = tagsOfTestId(html, "control");

    expect(checked).toContain('data-state="checked"');
    expect(unchecked).toContain('data-state="unchecked"');

    for (const attribute of [
      "aria-hidden",
      " dir=",
      // Leading space, or the `data-testid` this test finds the element by would match it.
      " id=",
      "data-focus-visible",
      "data-readonly",
      "data-orientation",
      "data-ssr",
      "data-scope",
      "data-part",
    ]) {
      expect(checked, attribute).not.toContain(attribute);
    }
  });

  it("gives every card its own id scheme, keyed by value rather than by position", async () => {
    const html = await renderServer(Served);

    expect(idOfPart(html, "root")).toMatch(/^radio-group:/);
    const scope = idOfPart(html, "root");

    ITEMS.forEach((value, index) => {
      expect(idOfPart(html, "item", index), value).toBe(`${scope}:radio:${value}`);
      expect(idOfPart(html, "item-text", index), value).toBe(`${scope}:radio:label:${value}`);
      expect(html, value).toContain(`id="${scope}:radio:input:${value}"`);
    });
  });

  it("renders each card as a `label` pointing at its own input", async () => {
    const html = await renderServer(Served);

    for (const [index, value] of ITEMS.entries()) {
      const item = tagsOfPart(html, "item")[index];
      expect(item?.startsWith("<label"), value).toBe(true);
      expect(item, value).toContain(`for="${idOfPart(html, "root")}:radio:input:${value}"`);
    }
  });

  it("checks exactly the served card the machine's default names", async () => {
    const html = await renderServer(Served);
    const inputs = [...html.matchAll(/<input[^>]*>/g)].map((match) => match[0]);

    expect(inputs).toHaveLength(3);
    expect(inputs.filter((input) => input.includes(" checked"))).toHaveLength(1);
    expect(inputs[0]).toContain('type="radio"');
    expect(inputs[0]).toContain('value="next"');
    expect(inputs[0]).toContain('name="framework"');
  });

  it("hides the circle from assistive tech at the call site, on both branches", async () => {
    // `RadioGroup.ItemIndicator` inherits `aria-hidden` from `getItemControlProps()`; this one is
    // not a machine part and inherits nothing, so the component writes it — on the default mark and
    // on a consumer's own glyph alike. The hidden input is what a screen reader reads.
    const html = await renderServer(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator data-testid="default" />
          <RadioCard.ItemIndicator
            data-testid="glyph"
            checked={(props) => <span {...props}>✓</span>}
          />
        </RadioCard.Item>
      </RadioCard.Root>
    ));

    expect(tagOfTestId(html, "default")).toContain('aria-hidden="true"');
    expect(tagOfTestId(html, "glyph")).toContain('aria-hidden="true"');
  });

  it("hands the `checked` glyph the slot class the default mark wears", async () => {
    // The one thing this escape hatch can silently get wrong: `itemIndicator` carries the whole
    // `radiomark` body, so a glyph that arrives without the composed class loses the entire mark —
    // the border, the radius, the size and the cursor — with nothing to say so.
    const html = await renderServer(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator
            data-testid="glyph"
            checked={(props) => <span {...props}>✓</span>}
          />
        </RadioCard.Item>
        <RadioCard.Item value="vite">
          <RadioCard.ItemIndicator
            data-testid="fallback"
            checked={(props) => <span {...props}>✓</span>}
          />
        </RadioCard.Item>
      </RadioCard.Root>
    ));

    expect(classOf(tagOfTestId(html, "glyph"))).toContain("radio-card__itemIndicator");
    // The unpicked card took the other arm, and it wears the same class.
    expect(classOf(tagOfTestId(html, "fallback"))).toContain("radio-card__itemIndicator");
    // …and the glyph's own text, so the branch really is the consumer's.
    expect(html).toContain("✓");
  });

  it("drops the radiomark's own recipe class while keeping the slot's", async () => {
    // `itemIndicator` already carries the whole `radiomark` body — one slot over from
    // `radioGroup`'s `itemControl` — so the mark renders `unstyled` and a `radiomark` class here
    // would mean a second circle drawn inside the first.
    const html = await renderServer(Served);
    const indicator = tagOfTestId(html, "indicator");

    expect(classOf(indicator)).toContain("radio-card__itemIndicator");
    expect(classOf(indicator)).not.toContain("radiomark");
    // The dot is the mark's own child, and the slot's `& .dot` rule is what paints it.
    expect(html).toContain('class="dot"');
  });

  it("keeps the machine on its own orientation whatever the recipe lays out", async () => {
    // `orientation` is one of this recipe's five variants, so it is consumed by the recipe and never
    // reaches the machine — which is upstream's behaviour, `splitVariantProps` doing the splitting.
    // The group's arrow keys and its `aria-orientation` stay on the machine's `vertical` while the
    // card's contents turn.
    const html = await renderServer(() => (
      <RadioCard.Root orientation="horizontal" defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemControl data-testid="control" />
        </RadioCard.Item>
      </RadioCard.Root>
    ));
    const root = tagOfPart(html, "root");

    expect(root).toContain('aria-orientation="vertical"');
    expect(root).toContain('data-orientation="vertical"');
    expect(root).not.toContain(' orientation="horizontal"');
    expect(classOf(tagOfTestId(html, "control"))).toContain(
      "radio-card__itemControl--orientation_horizontal",
    );
  });

  it("keeps every machine argument and every variant off the served markup", async () => {
    const html = await renderServer(() => (
      <RadioCard.Root
        defaultValue="next"
        name="fw"
        form="f"
        size="lg"
        variant="subtle"
        justify="center"
        align="end"
      />
    ));
    const root = tagOfPart(html, "root");

    for (const key of [
      "defaultValue",
      "name=",
      "form=",
      "size=",
      "variant=",
      "justify=",
      "align=",
    ]) {
      expect(root, key).not.toContain(key);
    }
  });

  it("takes a card's own `disabled` and `invalid` without the group carrying either", async () => {
    const html = await renderServer(() => (
      <RadioCard.Root>
        <RadioCard.Item value="next" disabled invalid>
          <RadioCard.ItemHiddenInput />
          <RadioCard.ItemControl data-testid="control" />
          <RadioCard.ItemText>Next.js</RadioCard.ItemText>
        </RadioCard.Item>
        <RadioCard.Item value="vite">
          <RadioCard.ItemHiddenInput />
          <RadioCard.ItemControl data-testid="control" />
          <RadioCard.ItemText>Vite</RadioCard.ItemText>
        </RadioCard.Item>
      </RadioCard.Root>
    ));

    // Bare, with no `=""`: `dataAttr(true)` is the empty string and Solid's server serializer writes
    // an empty attribute as a name alone.
    expect(tagsOfPart(html, "item")[0]).toContain("data-disabled");
    expect(tagsOfPart(html, "item")[1]).not.toContain("data-disabled");

    // The hand-written control derives both from the same item context, so a card that is invalid on
    // its own rings on its own.
    expect(tagsOfTestId(html, "control")[0]).toContain("data-disabled");
    expect(tagsOfTestId(html, "control")[0]).toContain("data-invalid");
    expect(tagsOfTestId(html, "control")[1]).not.toContain("data-disabled");
  });

  it("lets a surrounding `Fieldset.Root` name the group and hand it both states", async () => {
    const html = await renderServer(() => (
      <Fieldset.Root id="framework" disabled invalid>
        <Fieldset.Legend>Framework</Fieldset.Legend>
        <RadioCard.Root>
          <RadioCard.Item value="next">
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl data-testid="control" />
          </RadioCard.Item>
        </RadioCard.Root>
      </Fieldset.Root>
    ));

    expect(tagOfPart(html, "root")).toContain('aria-labelledby="fieldset::framework::legend"');
    expect(tagOfPart(html, "item")).toContain("data-disabled");
    expect(tagOfTestId(html, "control")).toContain("data-invalid");
  });

  it("resolves one class map on the Root and gives every card the same strings", async () => {
    const html = await renderServer(Served);

    const itemClasses = tagsOfPart(html, "item").map(classOf);
    expect(new Set(itemClasses).size).toBe(1);
    expect(itemClasses[0]).toContain("radio-card__item");

    expect(new Set(tagsOfTestId(html, "control").map(classOf)).size).toBe(1);

    expect(html).toContain("radio-card__root");
    expect(html).toContain("radio-card__label");
    expect(html).toContain("radio-card__itemText");
    expect(html).toContain("radio-card__itemDescription");
    expect(html).toContain("radio-card__itemContent");
    expect(html).toContain("radio-card__itemAddon");
    expect(html).toContain("radio-card__itemControl--size_md");
    expect(html).toContain("radio-card__item--variant_outline");
  });

  it("drops every class under `unstyled` while keeping the anatomy", async () => {
    const html = await renderServer(() => (
      <RadioCard.Root unstyled defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator />
          <RadioCard.ItemText>Next.js</RadioCard.ItemText>
        </RadioCard.Item>
      </RadioCard.Root>
    ));

    expect(html).not.toContain("radio-card__");
    expect(html).toContain('data-part="item-text"');
  });

  it("carries `dir` from a `LocaleProvider` onto every machine part", async () => {
    const html = await renderServer(() => (
      <LocaleProvider locale="ar-AE">
        <Served />
      </LocaleProvider>
    ));

    for (const part of ["root", "label", "item", "item-text"]) {
      expect(tagOfPart(html, part), part).toContain('dir="rtl"');
    }
    // And on none of the five slots that are not machine parts — `dir` is one of the seven the
    // hand-written control leaves behind.
    expect(tagOfTestId(html, "control")).not.toContain("dir=");
  });
});
