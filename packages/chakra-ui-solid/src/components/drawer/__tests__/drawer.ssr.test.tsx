import { Portal, renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Drawer } from "../index";

/** The `id` attribute of the element carrying `data-part="…"`, out of raw server markup. */
function idOfPart(html: string, part: string): string | undefined {
  const element = html.match(new RegExp(`<[a-z0-9]+[^>]*data-part="${part}"[^>]*>`))?.[0];
  return element?.match(/\bid="([^"]*)"/)?.[1];
}

/** The whole opening tag of the element carrying `data-part="…"`. */
function tagOfPart(html: string, part: string): string | undefined {
  return html.match(new RegExp(`<[a-z0-9]+[^>]*data-part="${part}"[^>]*>`))?.[0];
}

/**
 * A closed drawer with everything mounted — the shape a page serves when a consumer opts out of
 * `lazyMount`, and the only one whose parts exist in the markup at all under the defaults.
 */
const Eager = () => (
  <Drawer.Root lazyMount={false}>
    <Drawer.Trigger>Open</Drawer.Trigger>
    <Drawer.Backdrop />
    <Drawer.Positioner>
      <Drawer.Content>
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Description>Narrow the results.</Drawer.Description>
        <Drawer.CloseTrigger>✕</Drawer.CloseTrigger>
      </Drawer.Content>
    </Drawer.Positioner>
  </Drawer.Root>
);

/**
 * A drawer's whole shape on the server is decided by three machines that never start there — the
 * dialog machine it runs, and one `@zag-js/presence` each for the content and the backdrop — so
 * everything below is what `initialState({ prop })` plus a `connect()` with no started machine
 * produce. A server that disagrees with the client about any of it is a page that flashes the wrong
 * state before hydration.
 */
describe("a closed drawer on the server", () => {
  it("ships nothing but the trigger under Chakra's defaults", async () => {
    const html = await renderToStream(() => (
      <Drawer.Root>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>body</Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    ));

    expect(html).toContain('data-part="trigger"');
    for (const part of ["backdrop", "positioner", "content"]) {
      expect(html, part).not.toContain(`data-part="${part}"`);
    }
    expect(html).not.toContain("body");
  });

  it("drops the trigger's `aria-controls` while the content is unmounted", async () => {
    const html = await renderToStream(() => (
      <Drawer.Root>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Content>body</Drawer.Content>
      </Drawer.Root>
    ));

    expect(html).toContain('data-part="trigger"');
    expect(html).not.toContain("aria-controls");
  });

  it("renders every part with `lazyMount={false}`, and names them for the machine a drawer runs", async () => {
    // `data-scope="dialog"`, and `dialog:{id}:content` — not `drawer:`. Chakra's Drawer imports
    // `@ark-ui/react/dialog` and aliases `useDialog as useDrawer`, so the scope a consumer sees in
    // the DOM and in a CSS selector is the machine's, never the component's. It is the first thing
    // someone writing `[data-scope="drawer"]` will get wrong, so it is pinned here.
    const html = await renderToStream(Eager);

    for (const part of ["trigger", "backdrop", "positioner", "content", "title", "description"]) {
      expect(html, part).toContain(`data-part="${part}"`);
    }
    // Dasherized, where the anatomy's key is `closeTrigger` — the attribute is what a recipe
    // selector and a test both match on.
    expect(html).toContain('data-part="close-trigger"');
    expect(html).toContain('data-scope="dialog"');
    expect(html).not.toContain('data-scope="drawer"');

    const controls = html.match(/aria-controls="([^"]*)"/)?.[1];
    expect(controls).toBe(idOfPart(html, "content"));
    expect(controls).toMatch(/^dialog:.+:content$/);
  });

  it("hides the content and the backdrop, and says `closed` on both", async () => {
    // `hidden` comes from two writers agreeing: the machine emits it for a closed drawer, and each
    // presence merges its own over the top. Stripping either would leave a closed panel visible on
    // the served page until hydration.
    const html = await renderToStream(Eager);

    expect(tagOfPart(html, "content")).toContain("hidden");
    expect(tagOfPart(html, "backdrop")).toContain("hidden");
    expect(tagOfPart(html, "content")).toContain('data-state="closed"');
    expect(tagOfPart(html, "backdrop")).toContain('data-state="closed"');
    // The positioner has neither — the machine emits no `hidden` for it and it carries no presence
    // props, so it is the one gated part whose visibility is entirely the recipe's business.
    expect(tagOfPart(html, "positioner")).not.toContain("hidden");
  });

  it("writes the boolean ARIA attributes as strings, where Solid would drop them", async () => {
    // Zag emits real booleans, and Solid's `setAttribute` writes `true` as `""` and removes the
    // attribute for `false` — so without the adapter's boolean-ARIA stringification a closed trigger
    // ships with no `aria-expanded` and a modal content with `aria-modal=""`.
    const html = await renderToStream(Eager);

    expect(html).toContain('aria-expanded="false"');
    expect(tagOfPart(html, "content")).toContain('aria-modal="true"');
  });

  it("keeps the three recipe variants out of the DOM entirely", async () => {
    // `size`, `placement` and `contained` are slot-recipe variants — they pick class names and
    // nothing else. A variant leaking through to the host element would be an invalid attribute on
    // every drawer a consumer serves, and the server is where such a leak is visible as text.
    const html = await renderToStream(() => (
      <Drawer.Root lazyMount={false} size="md" placement="start" contained>
        <Drawer.Positioner>
          <Drawer.Content>body</Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    ));

    expect(html).toContain('data-part="content"');
    for (const variant of ["placement=", "contained=", 'size="md"']) {
      expect(html, variant).not.toContain(variant);
    }
  });

  it("seeds the machine from `id` rather than naming an element with it", async () => {
    // The Root renders no element at all, so there is no attribute for `id` to land on even in
    // principle — it is a machine argument and nothing else.
    const html = await renderToStream(() => (
      <Drawer.Root lazyMount={false} id="filters">
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Content>body</Drawer.Content>
      </Drawer.Root>
    ));

    expect(idOfPart(html, "trigger")).toBe("dialog:filters:trigger");
    expect(idOfPart(html, "content")).toBe("dialog:filters:content");
  });

  it("gives two roots in one render two different ids", async () => {
    const html = await renderToStream(() => (
      <div>
        <Drawer.Root lazyMount={false}>
          <Drawer.Content>first</Drawer.Content>
        </Drawer.Root>
        <Drawer.Root lazyMount={false}>
          <Drawer.Content>second</Drawer.Content>
        </Drawer.Root>
      </div>
    ));

    const ids = [...html.matchAll(/id="(dialog:[^"]*:content)"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("renders the three slot parts, which have no machine part behind them", async () => {
    // Header, Body and Footer exist in the recipe and not in the machine's anatomy, so they carry no
    // `data-part` and no machine props. The ActionTrigger has neither a part nor a recipe slot, and
    // its `type="button"` is the one thing it adds.
    const html = await renderToStream(() => (
      <Drawer.Root lazyMount={false}>
        <Drawer.Content>
          <Drawer.Header data-probe="header">head</Drawer.Header>
          <Drawer.Body data-probe="body">body</Drawer.Body>
          <Drawer.Footer data-probe="footer">
            <Drawer.ActionTrigger data-probe="action">Cancel</Drawer.ActionTrigger>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
    ));

    for (const probe of ["header", "body", "footer", "action"]) {
      expect(html, probe).toContain(`data-probe="${probe}"`);
    }
    expect(html).toContain('type="button"');
  });

  it("lets a `PropsProvider`'s `lazyMount` beat the Root's own default", async () => {
    // The precedence chain in full: the literal default resolves against the value the context
    // supplied, not against the raw prop — so a provider's `false` wins over the `true` the Root
    // would otherwise apply, and a Root passing the prop itself would still win over the provider.
    const html = await renderToStream(() => (
      <Drawer.PropsProvider value={{ lazyMount: false }}>
        <Drawer.Root>
          <Drawer.Content>body</Drawer.Content>
        </Drawer.Root>
      </Drawer.PropsProvider>
    ));

    expect(html).toContain('data-part="content"');
  });

  it("keeps a `<Portal>` out of the server markup without shifting what follows it", async () => {
    // `@solidjs/web`'s server Portal returns `undefined` and consumes exactly one child id, which is
    // what keeps the client's own portal aligned. Here that shows up as an absent drawer and a
    // present sibling; that the sibling still *hydrates* is the browser test's half.
    const html = await renderToStream(() => (
      <Drawer.Root lazyMount={false}>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Portal>
          <Drawer.Content>portalled</Drawer.Content>
        </Portal>
        <span data-probe="after-portal">after</span>
      </Drawer.Root>
    ));

    expect(html).not.toContain('data-part="content"');
    expect(html).not.toContain("portalled");
    expect(html).toContain('data-probe="after-portal"');
  });
});
