import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { Fieldset } from "../../fieldset";
import { LocaleProvider } from "../../locale";
import { SegmentGroup } from "../index";

/**
 * Every opening tag carrying `data-part="…"` **under the segment-group scope**.
 *
 * Scope-qualified, and that is the assertion this file is built around: the machine is
 * `@zag-js/radio-group` and every prop getter stamps `data-scope="radio-group"`, so a
 * `segment-group` here is proof the renamed anatomy landed over it. `fieldset` also names a part
 * `root`, and one of the trees below wraps one in the other.
 */
function tagsOfPart(html: string, part: string, scope = "segment-group"): string[] {
  return [
    ...html.matchAll(
      new RegExp(`<[a-z0-9]+[^>]*data-scope="${scope}" data-part="${part}"[^>]*>`, "g"),
    ),
  ].map((match) => match[0]);
}

/** The first of them. */
function tagOfPart(html: string, part: string, scope = "segment-group"): string | undefined {
  return tagsOfPart(html, part, scope)[0];
}

/** The `id` attribute of the *n*th element carrying `data-part="…"`. */
function idOfPart(html: string, part: string, index = 0): string | undefined {
  return tagsOfPart(html, part)[index]?.match(/\bid="([^"]*)"/)?.[1];
}

const ITEMS = ["React", "Vue", "Solid"];

/** Three segments with every part written out — what a page serves before any script runs. */
const Served = () => (
  <SegmentGroup.Root defaultValue="React" name="framework">
    <SegmentGroup.Indicator />
    <SegmentGroup.Items items={ITEMS} />
  </SegmentGroup.Root>
);

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. A segmented control's whole shape on the server is **which of N segments the
 * machine says is checked, and what stands in for the highlight until it can be measured** — and the
 * machine never *starts* here, since it begins in `onSettled`. So everything below is what
 * `context({ bindable })` plus a `connect()` with no started machine produce.
 */
describe("SegmentGroup on the server", () => {
  it("renames the machine's anatomy to its own, on every part that has one", async () => {
    // Ark builds `anatomy.rename('segment-group')` and merges the attrs back over the getter's
    // output; Chakra inherits that, so this is the scope chakra-ui.com serves. `RadioCard` is the
    // contrast — it wraps Ark's RadioGroup, so its parts announce `radio-group` and ours do too.
    const html = await renderServer(Served);

    expect(tagsOfPart(html, "root")).toHaveLength(1);
    expect(tagsOfPart(html, "indicator")).toHaveLength(1);
    expect(tagsOfPart(html, "item")).toHaveLength(3);
    expect(tagsOfPart(html, "item-text")).toHaveLength(3);
    expect(html).not.toContain('data-scope="radio-group"');
  });

  it("renders no element for the two slots with no component", async () => {
    // `label` and `itemControl` are real anatomy parts with no recipe body and no component here —
    // upstream's shape rather than an omission. `itemAddon` and `itemIndicator` do not exist at all
    // in this recipe: they are `radioGroup`'s two extensions.
    const html = await renderServer(Served);

    expect(html).not.toContain('data-part="label"');
    expect(html).not.toContain('data-part="item-control"');
    expect(html).not.toContain('data-part="item-addon"');
    expect(html).not.toContain('data-part="item-indicator"');
  });

  it("keeps the machine's own ids, because the machine is still the radio group's", async () => {
    // The scope moved and the id scheme did not: `radio-group.dom.ts` finds every element by id, so
    // a rename that reached these would leave the machine querying for nodes that no longer exist.
    const html = await renderServer(Served);

    expect(idOfPart(html, "root")).toMatch(/^radio-group:/);
    const scope = idOfPart(html, "root");

    expect(idOfPart(html, "indicator")).toBe(`${scope}:indicator`);
    ITEMS.forEach((value, index) => {
      expect(idOfPart(html, "item", index), value).toBe(`${scope}:radio:${value}`);
      expect(idOfPart(html, "item-text", index), value).toBe(`${scope}:radio:label:${value}`);
      expect(html, value).toContain(`id="${scope}:radio:input:${value}"`);
    });
  });

  it("renders each segment as a `label` pointing at its own input", async () => {
    const html = await renderServer(Served);

    for (const [index, value] of ITEMS.entries()) {
      const item = tagsOfPart(html, "item")[index];
      expect(item?.startsWith("<label"), value).toBe(true);
      expect(item, value).toContain(`for="${idOfPart(html, "root")}:radio:input:${value}"`);
    }
  });

  it("carries `data-ssr` on the checked segment, which is what stands in for the indicator", async () => {
    // **The reason this row exists.** The `segmentGroup` recipe is one of two in the whole preset
    // that select on `data-ssr` — `&[data-state=checked][data-ssr]` gives the served segment the
    // shadow, background and radius the indicator will draw once it has measured something. The
    // machine writes the flag (`context.ssr` starts `true`) and `entry` clears it, and `entry` runs
    // when a machine *starts*, which never happens on a server.
    const html = await renderServer(Served);
    const checked = tagsOfPart(html, "item")[0];

    expect(checked).toContain('data-state="checked"');
    expect(checked).toContain("data-ssr");
    for (const tag of tagsOfPart(html, "item-text")) {
      expect(tag).toContain("data-ssr");
    }
    expect(tagOfPart(html, "root")).not.toContain("data-ssr");
    expect(tagOfPart(html, "indicator")).not.toContain("data-ssr");
  });

  it("serves the indicator hidden, with none of the four properties it has not measured", async () => {
    // `getIndicatorProps` writes `--left` / `--top` / `--width` / `--height` from
    // `dom.getOffsetRect`, and there is no DOM to measure here — so `toPx(undefined)` is `undefined`
    // and the adapter's `cssify` drops each one rather than writing `--left:undefined`. `hidden` is
    // the machine's, and it is why the served page shows the `data-ssr` stand-in instead.
    const html = await renderServer(Served);
    const indicator = tagOfPart(html, "indicator");

    expect(indicator).toContain("hidden");
    // The *declaration* of each, not the `var(--left)` the orientation branch always writes.
    expect(indicator).not.toContain("--left:");
    expect(indicator).not.toContain("--top:");
    expect(indicator).not.toContain("--width:");
    expect(indicator).not.toContain("--height:");

    // The half that does not depend on a rect still ships, so the element is positioned, aimed
    // along the group's axis, and inert from the first byte: `animateIndicator` starts `false`, so
    // the first paint after hydration lands rather than slides.
    expect(indicator).toMatch(/style="[^"]*position:absolute/);
    expect(indicator).toMatch(/style="[^"]*left:var\(--left\)/);
    expect(indicator).toMatch(/style="[^"]*transition-property:none/);
    expect(indicator).toMatch(/style="[^"]*transition-duration:0ms/);
  });

  it("expands the `Items` shortcut into three parts per entry, in both spellings", async () => {
    const html = await renderServer(() => (
      <SegmentGroup.Root defaultValue="react">
        <SegmentGroup.Items items={["plain", { value: "react", label: "React", disabled: true }]} />
      </SegmentGroup.Root>
    ));

    expect(tagsOfPart(html, "item")).toHaveLength(2);
    expect(tagsOfPart(html, "item-text")).toHaveLength(2);
    expect(html.match(/<input[^>]*>/g)).toHaveLength(2);

    // A bare string is its own label; the descriptor's `label` is what the segment reads.
    expect(tagsOfPart(html, "item-text")[0]).toBeDefined();
    expect(html).toContain(">plain<");
    expect(html).toContain(">React<");

    // …and the entry's own `disabled` reached the machine rather than the element.
    expect(tagsOfPart(html, "item")[1]).toContain("data-disabled");
    expect(tagsOfPart(html, "item")[0]).not.toContain("data-disabled");
  });

  it("checks exactly the served segment the machine's default names", async () => {
    // `getItemHiddenInputProps` hands back `defaultChecked`, which the server build maps onto the
    // real `checked` attribute — so the right segment is picked before a byte of script runs.
    const html = await renderServer(Served);
    const inputs = [...html.matchAll(/<input[^>]*>/g)].map((match) => match[0]);

    expect(inputs).toHaveLength(3);
    expect(inputs.filter((input) => input.includes(" checked"))).toHaveLength(1);
    expect(inputs[0]).toContain('type="radio"');
    expect(inputs[0]).toContain('value="React"');
    expect(inputs[0]).toContain('name="framework"');
  });

  it("defaults the orientation to horizontal, where the machine's own default is vertical", async () => {
    // Chakra's one `defaultProps` on this Root, and the one line that separates the three public
    // components on this machine: `radioGroup` lets the machine's `vertical` stand, `radioCard`
    // never lets the prop through at all, and here it is forwarded *and* defaulted.
    const served = await renderServer(Served);

    for (const part of ["root", "item", "item-text", "indicator"]) {
      expect(tagOfPart(served, part), part).toContain('data-orientation="horizontal"');
    }
    expect(tagOfPart(served, "root")).toContain('aria-orientation="horizontal"');
  });

  it("keeps that default when a wrapper forwards `orientation={undefined}`", async () => {
    // `merge` resolves by presence, so `merge({ orientation: "horizontal" }, props)` would hand the
    // machine `undefined` and it would fall back to its own `vertical` (`CLAUDE.md`, *The third
    // hazard*). `withDefaults` resolves by value.
    const html = await renderServer(() => (
      <SegmentGroup.Root orientation={undefined} defaultValue="React">
        <SegmentGroup.Items items={ITEMS} />
      </SegmentGroup.Root>
    ));

    expect(tagOfPart(html, "root")).toContain('data-orientation="horizontal"');
  });

  it("takes a `vertical` orientation through to the machine rather than swallowing it", async () => {
    const html = await renderServer(() => (
      <SegmentGroup.Root orientation="vertical" defaultValue="React">
        <SegmentGroup.Items items={ITEMS} />
      </SegmentGroup.Root>
    ));

    expect(tagOfPart(html, "root")).toContain('aria-orientation="vertical"');
    for (const part of ["root", "item", "item-text"]) {
      expect(tagOfPart(html, part), part).toContain('data-orientation="vertical"');
    }
    // The machine took it, so the raw prop must not have reached the `div` as well. The leading
    // space is what keeps this from matching the `aria-orientation` the machine *does* write.
    expect(tagOfPart(html, "root")).not.toContain(' orientation="vertical"');
  });

  it("hides the machine's own props from the served attributes", async () => {
    const html = await renderServer(() => (
      <SegmentGroup.Root defaultValue="React" name="fw" form="f" size="lg" />
    ));
    const root = tagOfPart(html, "root");

    for (const key of ["defaultValue", "name", "form", "size"]) {
      expect(root, key).not.toContain(`${key}=`);
    }
  });

  it("serves the group as a `radiogroup` the indicator can be measured against", async () => {
    const html = await renderServer(Served);
    const root = tagOfPart(html, "root");

    expect(root).toContain('role="radiogroup"');
    // The machine's own inline style, forwarded untouched — it is what the absolutely-positioned
    // indicator's `left` and `top` resolve against.
    expect(root).toMatch(/style="[^"]*position:relative/);
  });

  it("puts the group's own states on every segment", async () => {
    const html = await renderServer(() => (
      <SegmentGroup.Root disabled invalid required readOnly defaultValue="React">
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={ITEMS} />
      </SegmentGroup.Root>
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
    expect(tagOfPart(html, "indicator")).toContain("data-disabled");
    // A read-only group serves its inputs disabled, so the browser refuses the change as well.
    expect(html.match(/<input[^>]*>/)?.[0]).toContain("disabled");
  });

  it("lets a surrounding `Fieldset.Root` name the group and hand it both states", async () => {
    const html = await renderServer(() => (
      <Fieldset.Root id="framework" disabled invalid>
        <Fieldset.Legend>Framework</Fieldset.Legend>
        <SegmentGroup.Root defaultValue="React">
          <SegmentGroup.Items items={["React"]} />
        </SegmentGroup.Root>
      </Fieldset.Root>
    ));

    expect(tagOfPart(html, "root")).toContain('aria-labelledby="fieldset::framework::legend"');
    expect(tagOfPart(html, "item")).toContain("data-disabled");
    expect(tagOfPart(html, "item")).toContain("data-invalid");
  });

  it("resolves one class map on the Root and gives every segment the same strings", async () => {
    const html = await renderServer(Served);
    const classOf = (tag: string | undefined) => tag?.match(/\bclass="([^"]*)"/)?.[1];

    const itemClasses = tagsOfPart(html, "item").map(classOf);
    expect(new Set(itemClasses).size).toBe(1);
    expect(itemClasses[0]).toContain("segment-group__item");

    expect(html).toContain("segment-group__root");
    expect(html).toContain("segment-group__indicator");
    expect(html).toContain("segment-group__itemText");
    expect(html).toContain("segment-group__item--size_md");
  });

  it("drops every class under `unstyled` while keeping the anatomy", async () => {
    const html = await renderServer(() => (
      <SegmentGroup.Root unstyled defaultValue="React">
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={ITEMS} />
      </SegmentGroup.Root>
    ));

    expect(html).not.toContain("segment-group__");
    expect(html).toContain('data-part="indicator"');
  });

  it("carries `dir` from a `LocaleProvider` onto every part", async () => {
    const html = await renderServer(() => (
      <LocaleProvider locale="ar-AE">
        <Served />
      </LocaleProvider>
    ));

    for (const part of ["root", "item", "item-text", "indicator"]) {
      expect(tagOfPart(html, part), part).toContain('dir="rtl"');
    }
  });
});
