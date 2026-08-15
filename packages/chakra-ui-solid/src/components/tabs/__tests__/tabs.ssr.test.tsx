import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "../../locale";
import { Tabs } from "../index";

/** The whole opening tag of the element carrying `data-part="…"`. */
function tagOfPart(html: string, part: string): string | undefined {
  return html.match(new RegExp(`<[a-z0-9]+[^>]*data-part="${part}"[^>]*>`))?.[0];
}

/** The `id` attribute of the element carrying `data-part="…"`. */
function idOfPart(html: string, part: string): string | undefined {
  return tagOfPart(html, part)?.match(/\bid="([^"]*)"/)?.[1];
}

/** Every opening tag carrying `data-part="…"` — a set of tabs has one per trigger and per panel. */
function tagsOfPart(html: string, part: string): string[] {
  return [...html.matchAll(new RegExp(`<[a-z0-9]+[^>]*data-part="${part}"[^>]*>`, "g"))].map(
    (match) => match[0],
  );
}

/** The whole opening tag of the element carrying `data-probe="…"`, for the parts with no `data-part`. */
function tagOfProbe(html: string, probe: string): string | undefined {
  return html.match(new RegExp(`<[a-z0-9]+[^>]*data-probe="${probe}"[^>]*>`))?.[0];
}

/** Two tabs and a panel each, with the first selected — what a page serves by writing `defaultValue`. */
const Served = () => (
  <Tabs.Root defaultValue="react">
    <Tabs.List>
      <Tabs.Trigger value="react">React</Tabs.Trigger>
      <Tabs.Trigger value="solid">Solid</Tabs.Trigger>
      <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Content value="react">React panel</Tabs.Content>
    <Tabs.Content value="solid">Solid panel</Tabs.Content>
  </Tabs.Root>
);

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. A set of tabs' whole shape on the server is which value its machine started on,
 * plus one `@zag-js/presence` per panel — and neither machine ever *starts* there, since both begin
 * in `onSettled`. So everything below is what `initialState({ prop })` plus a `connect()` with no
 * started machine produce, and a server that disagrees with the client about any of it is a page
 * that flashes the wrong panel before hydration.
 */
describe("Tabs on the server", () => {
  it("renders all five anatomy parts, and no part for the content group", async () => {
    // Five, not six: the slot recipe carries a `contentGroup` name and `tabs.anatomy` does not, so
    // that element ships a slot class and nothing else. Asserting the absence is what keeps it a
    // decision rather than an oversight.
    const html = await renderServer(() => (
      <Tabs.Root defaultValue="react">
        <Tabs.List>
          <Tabs.Trigger value="react">React</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.ContentGroup data-probe="group">
          <Tabs.Content value="react">React panel</Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    ));

    for (const part of ["root", "list", "trigger", "content", "indicator"]) {
      expect(html, part).toContain(`data-part="${part}"`);
    }
    expect(html).toContain('data-scope="tabs"');

    expect(html).not.toContain('data-part="content-group"');
    expect(html).not.toContain('data-part="contentGroup"');
    expect(tagOfProbe(html, "group")).toContain("tabs__contentGroup");
    expect(tagOfProbe(html, "group")).not.toContain("data-part");
  });

  it("lets `defaultValue` decide which panel is served un-`hidden`", async () => {
    const html = await renderServer(Served);
    const [first, second] = tagsOfPart(html, "content");

    expect(first).not.toContain("hidden");
    // Bare, with no `=""`: `dataAttr(true)` is the empty string and Solid's server serializer writes
    // an empty attribute as a name alone. The DOM reads it back as `""` either way.
    expect(first).toContain("data-selected");
    expect(second).toContain("hidden");
    expect(second).not.toContain("data-selected");
    // Both panels are in the markup: `lazyMount` and `unmountOnExit` both default to `false`, and
    // Chakra passes Tabs no `defaultProps` that would change either.
    expect(html).toContain("Solid panel");
  });

  it('ships `data-state="open"` on the selected panel, where Collapsible\'s is suppressed', async () => {
    // The difference is one prop `TabsContent` does not pass. `createPresence` blanks `data-state`
    // only when `skipAnimationOnMount` is set and the machine says `skip`; Collapsible's own machine
    // suppresses the attribute so a `defaultOpen` panel does not animate in on load. Nothing does
    // that here, so the selected panel carries its state from the very first byte — and a recipe
    // keyed on `[data-state]` would animate it in.
    const html = await renderServer(Served);
    const [first, second] = tagsOfPart(html, "content");

    expect(first).toContain('data-state="open"');
    expect(second).toContain('data-state="closed"');
  });

  it("marks every trigger `data-ssr`, which is the flag the client's first frame clears", async () => {
    // `context.ssr` starts `true` and the machine's `entry` action `syncSsr` sets it false — and
    // `entry` runs when the machine starts, which never happens on a server. The preset reads it:
    // `.tabs__trigger--variant_plain[data-selected][data-ssr]` paints the selected tab's background
    // before the indicator has measured anything, so a served page is not missing its highlight.
    const html = await renderServer(Served);

    for (const trigger of tagsOfPart(html, "trigger")) {
      expect(trigger).toContain("data-ssr");
    }
  });

  it("hides the indicator, with none of the offsets it has not measured yet", async () => {
    // `hidden` is `isRectEmpty(rect)` and `indicatorRect` starts `null`, so a served indicator is a
    // hidden element with no `--left`/`--width` in its style attribute — `toPx(undefined)` is
    // `undefined`, which Solid omits. Without that the bar would be painted at the document's
    // top-left corner until the machine's first measurement.
    const html = await renderServer(Served);
    const indicator = tagOfPart(html, "indicator");

    expect(indicator).toContain("hidden");
    // The **declarations**, not the substrings: `left:var(--left)` below mentions `--left` and is
    // supposed to.
    expect(indicator).not.toContain("--left:");
    expect(indicator).not.toContain("--width:");
    // The reactive half of the seam is already in the served attribute: the property the machine
    // will fill in one frame later is referenced from the start.
    expect(indicator).toContain("left:var(--left)");
  });

  it("writes `aria-selected` as a string, where Solid would drop the boolean", async () => {
    // Zag emits a real `false`, and Solid's `setAttribute` removes an attribute whose value is
    // `false` — so without the adapter's boolean-ARIA stringification an unselected tab ships with
    // no `aria-selected` at all, and a screen reader is told nothing about the set.
    const html = await renderServer(Served);
    const [first, second] = tagsOfPart(html, "trigger");

    expect(first).toContain('aria-selected="true"');
    expect(second).toContain('aria-selected="false"');
  });

  it("points `aria-controls` at a panel from the selected trigger only", async () => {
    // Zag emits the IDREF on the selected trigger alone, which is why `TabsTrigger` needs none of
    // Dialog's presence gate: the panel an IDREF names is present by definition, so an unmounted one
    // can never leave a dangling reference for axe to find.
    const html = await renderServer(Served);
    const [first, second] = tagsOfPart(html, "trigger");
    const selectedPanel = tagsOfPart(html, "content")[0];

    const controls = first?.match(/aria-controls="([^"]*)"/)?.[1];
    expect(controls).toBeDefined();
    expect(controls).toBe(selectedPanel?.match(/\bid="([^"]*)"/)?.[1]);
    expect(second).not.toContain("aria-controls");
  });

  it("gives two roots in one render two different ids", async () => {
    // Every part id is derived from one `createUniqueId()` per Root. Two roots sharing an id would
    // give both triggers the same `aria-controls`, and the machine's own `getElementById` would find
    // the wrong panel.
    const html = await renderServer(() => (
      <div>
        <Tabs.Root defaultValue="one">
          <Tabs.Content value="one">first</Tabs.Content>
        </Tabs.Root>
        <Tabs.Root defaultValue="one">
          <Tabs.Content value="one">second</Tabs.Content>
        </Tabs.Root>
      </div>
    ));

    const ids = [...html.matchAll(/id="(tabs:[^"]*content-one)"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("seeds the machine from `id` rather than naming the root element with it", async () => {
    // The per-value ids are joined with a **hyphen**, not the colon every other suffix uses:
    // `tabs:{id}:trigger-{value}`. A test looking for `:trigger:react` would never find one.
    const html = await renderServer(() => (
      <Tabs.Root id="frameworks" defaultValue="react">
        <Tabs.List>
          <Tabs.Trigger value="react">React</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="react">React panel</Tabs.Content>
      </Tabs.Root>
    ));

    expect(idOfPart(html, "root")).toBe("tabs:frameworks");
    expect(idOfPart(html, "list")).toBe("tabs:frameworks:list");
    expect(idOfPart(html, "trigger")).toBe("tabs:frameworks:trigger-react");
    expect(idOfPart(html, "content")).toBe("tabs:frameworks:content-react");
    expect(idOfPart(html, "indicator")).toBe("tabs:frameworks:indicator");
  });

  it("lets `ids` name a panel directly, with `aria-controls` following it", async () => {
    // `ids.content` is a **function of the value**, unlike Collapsible's plain string — one Root
    // names N panels. The IDREF is produced by a different `connect()` getter than the `id` is, so
    // this is the pair agreeing rather than one attribute being renamed.
    const html = await renderServer(() => (
      <Tabs.Root defaultValue="react" ids={{ content: (value) => `panel-${value}` }}>
        <Tabs.List>
          <Tabs.Trigger value="react">React</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="react">React panel</Tabs.Content>
      </Tabs.Root>
    ));

    expect(idOfPart(html, "content")).toBe("panel-react");
    expect(html).toContain('aria-controls="panel-react"');
  });

  it("ships only the selected panel under `lazyMount`", async () => {
    const html = await renderServer(() => (
      <Tabs.Root defaultValue="react" lazyMount>
        <Tabs.List>
          <Tabs.Trigger value="react">React</Tabs.Trigger>
          <Tabs.Trigger value="solid">Solid</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="react">React panel</Tabs.Content>
        <Tabs.Content value="solid">Solid panel</Tabs.Content>
      </Tabs.Root>
    ));

    expect(tagsOfPart(html, "content")).toHaveLength(1);
    expect(html).toContain("React panel");
    expect(html).not.toContain("Solid panel");
    // Still a live IDREF: the one panel an `aria-controls` can name is the selected one, and that is
    // exactly the one `lazyMount` keeps.
    expect(html).toContain('aria-controls="');
  });

  it("resolves the slot recipe on the server, and drops every class under `unstyled`", async () => {
    const styled = await renderServer(Served);
    const unstyled = await renderServer(() => (
      <Tabs.Root defaultValue="react" unstyled>
        <Tabs.List>
          <Tabs.Trigger value="react">React</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="react">React panel</Tabs.Content>
      </Tabs.Root>
    ));

    for (const slot of ["tabs__root", "tabs__list", "tabs__trigger", "tabs__content"]) {
      expect(styled, slot).toContain(slot);
    }
    expect(styled).toContain("tabs__root--size_md");
    expect(styled).toContain("tabs__list--variant_line");

    expect(unstyled).not.toContain("tabs__");
    expect(unstyled).toContain('data-part="content"');
  });

  it("carries `dir` from a `LocaleProvider` onto every part", async () => {
    // The machine takes `dir` as a prop and `connect()` writes it onto all five parts, so the whole
    // set is directional from the first byte. `createTabs` reads it from the locale context rather
    // than from the consumer, which is why nothing on `Tabs.Root` mentions it.
    const html = await renderServer(() => (
      <LocaleProvider locale="ar-AE">
        <Served />
      </LocaleProvider>
    ));

    for (const part of ["root", "list", "trigger", "content", "indicator"]) {
      expect(tagOfPart(html, part), part).toContain('dir="rtl"');
    }
  });

  it("orients every part, and gives the tablist an `aria-orientation` besides", async () => {
    const html = await renderServer(() => (
      <Tabs.Root defaultValue="react" orientation="vertical">
        <Tabs.List>
          <Tabs.Trigger value="react">React</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="react">React panel</Tabs.Content>
      </Tabs.Root>
    ));

    for (const part of ["root", "list", "trigger", "content", "indicator"]) {
      expect(tagOfPart(html, part), part).toContain('data-orientation="vertical"');
    }
    expect(tagOfPart(html, "list")).toContain('aria-orientation="vertical"');
  });
});
