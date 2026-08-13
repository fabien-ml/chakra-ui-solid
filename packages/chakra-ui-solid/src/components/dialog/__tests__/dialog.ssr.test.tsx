import { Portal, renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Dialog } from "../index";

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
 * A closed dialog with everything mounted — the shape a page serves when a consumer opts out of
 * `lazyMount`, and the only one whose parts exist in the markup at all under the defaults.
 */
const Eager = () => (
  <Dialog.Root lazyMount={false}>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Title>Delete file</Dialog.Title>
        <Dialog.Description>This cannot be undone.</Dialog.Description>
        <Dialog.CloseTrigger>✕</Dialog.CloseTrigger>
      </Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
);

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. A Dialog's whole shape on the server is decided by three machines that never
 * start there — the dialog's own, and one `@zag-js/presence` each for the content and the backdrop —
 * so everything below is what `initialState({ prop })` plus a `connect()` with no started machine
 * produce, and a server that disagrees with the client about any of it is a page that flashes the
 * wrong state before hydration.
 */
describe("a closed dialog on the server", () => {
  it("ships nothing but the trigger under Chakra's defaults", async () => {
    // `lazyMount` and `unmountOnExit` both default to `true` here, where Collapsible defaults both to
    // `false`. So the served page carries the button and none of the dialog — which is also why the
    // closed state raises no dangling-IDREF finding: there is no content element to point at.
    const html = await renderToStream(() => (
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>body</Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    ));

    expect(html).toContain('data-part="trigger"');
    for (const part of ["backdrop", "positioner", "content"]) {
      expect(html, part).not.toContain(`data-part="${part}"`);
    }
    expect(html).not.toContain("body");
  });

  it("drops the trigger's `aria-controls` while the content is unmounted", async () => {
    // Ark's line, ported: with no content element in the DOM the IDREF would dangle, and axe reports
    // it. It is gated on the render strategy rather than on `open`, so a mounted-but-closed content
    // keeps the reference — the next test.
    const html = await renderToStream(() => (
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>body</Dialog.Content>
      </Dialog.Root>
    ));

    expect(html).toContain('data-part="trigger"');
    expect(html).not.toContain("aria-controls");
  });

  it("renders every part with `lazyMount={false}`, and points `aria-controls` at the content", async () => {
    const html = await renderToStream(Eager);

    for (const part of [
      "trigger",
      "backdrop",
      "positioner",
      "content",
      "title",
      "description",
      // Dasherized, where the anatomy's key is `closeTrigger` — the attribute is what a recipe
      // selector and a test both match on.
      "close-trigger",
    ]) {
      expect(html, part).toContain(`data-part="${part}"`);
    }
    expect(html).toContain('data-scope="dialog"');

    const controls = html.match(/aria-controls="([^"]*)"/)?.[1];
    expect(controls).toBe(idOfPart(html, "content"));
    expect(controls).toMatch(/^dialog:.+:content$/);
  });

  it("hides the content and the backdrop, and says `closed` on both", async () => {
    // `hidden` comes from two writers agreeing: the machine emits it for a closed dialog, and each
    // presence merges its own over the top. Stripping either would leave a closed dialog visible on
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

  it("carries the `role` the consumer asked for", async () => {
    const html = await renderToStream(() => (
      <Dialog.Root lazyMount={false} role="alertdialog">
        <Dialog.Content>body</Dialog.Content>
      </Dialog.Root>
    ));

    expect(tagOfPart(html, "content")).toContain('role="alertdialog"');
  });

  it("gives two roots in one render two different ids", async () => {
    // Every part id is derived from one `createUniqueId()` per Root. Two roots sharing an id would
    // give both triggers the same `aria-controls`, and the machine's own `getElementById` would find
    // the wrong content.
    const html = await renderToStream(() => (
      <div>
        <Dialog.Root lazyMount={false}>
          <Dialog.Content>first</Dialog.Content>
        </Dialog.Root>
        <Dialog.Root lazyMount={false}>
          <Dialog.Content>second</Dialog.Content>
        </Dialog.Root>
      </div>
    ));

    const ids = [...html.matchAll(/id="(dialog:[^"]*:content)"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("seeds the machine from `id` rather than naming an element with it", async () => {
    // The Root renders no element at all, so unlike Collapsible there is no attribute for `id` to
    // land on even in principle — it is a machine argument and nothing else.
    const html = await renderToStream(() => (
      <Dialog.Root lazyMount={false} id="confirm">
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>body</Dialog.Content>
      </Dialog.Root>
    ));

    expect(idOfPart(html, "trigger")).toBe("dialog:confirm:trigger");
    expect(idOfPart(html, "content")).toBe("dialog:confirm:content");
  });

  it("lets `ids` name the elements directly", async () => {
    const html = await renderToStream(() => (
      <Dialog.Root lazyMount={false} ids={{ content: "sheet" }}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>body</Dialog.Content>
      </Dialog.Root>
    ));

    expect(idOfPart(html, "content")).toBe("sheet");
    expect(html).toContain('aria-controls="sheet"');
  });

  it("renders the three slot parts, which have no machine part behind them", async () => {
    // Header, Body and Footer exist in the recipe and not in `dialog.anatomy`, so they carry no
    // `data-part` and no machine props — a plain element apiece, and in Phase A a plain element is
    // all they are.
    const html = await renderToStream(() => (
      <Dialog.Root lazyMount={false}>
        <Dialog.Content>
          <Dialog.Header data-probe="header">head</Dialog.Header>
          <Dialog.Body data-probe="body">body</Dialog.Body>
          <Dialog.Footer data-probe="footer">
            <Dialog.ActionTrigger data-probe="action">Cancel</Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
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
      <Dialog.PropsProvider value={{ lazyMount: false }}>
        <Dialog.Root>
          <Dialog.Content>body</Dialog.Content>
        </Dialog.Root>
      </Dialog.PropsProvider>
    ));

    expect(html).toContain('data-part="content"');
  });

  it("keeps a `<Portal>` out of the server markup without shifting what follows it", async () => {
    // `@solidjs/web`'s server Portal returns `undefined` and consumes exactly one child id, which is
    // what keeps the client's own portal aligned. Here that shows up as an absent dialog and a
    // present sibling; that the sibling still *hydrates* is the browser test's half.
    const html = await renderToStream(() => (
      <Dialog.Root lazyMount={false}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Portal>
          <Dialog.Content>portalled</Dialog.Content>
        </Portal>
        <span data-probe="after-portal">after</span>
      </Dialog.Root>
    ));

    expect(html).not.toContain('data-part="content"');
    expect(html).not.toContain("portalled");
    expect(html).toContain('data-probe="after-portal"');
  });
});
