import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { Portal } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Popover } from "../index";

/** The `id` attribute of the element carrying `data-part="…"`, out of raw server markup. */
function idOfPart(html: string, part: string): string | undefined {
  const element = html.match(new RegExp(`<[a-z0-9]+[^>]*data-part="${part}"[^>]*>`))?.[0];
  return element?.match(/\bid="([^"]*)"/)?.[1];
}

/** The whole opening tag of the element carrying `data-part="…"`. */
function tagOfPart(html: string, part: string): string | undefined {
  return html.match(new RegExp(`<[a-z0-9]+[^>]*data-part="${part}"[^>]*>`))?.[0];
}

/** The whole opening tag of the element carrying `data-probe="…"`, for the parts with no `data-part`. */
function tagOfProbe(html: string, probe: string): string | undefined {
  return html.match(new RegExp(`<[a-z0-9]+[^>]*data-probe="${probe}"[^>]*>`))?.[0];
}

/**
 * A closed popover with the whole tree in place — which under Chakra's Popover defaults is what a
 * page serves by writing nothing at all.
 */
const Served = () => (
  <Popover.Root>
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.Positioner>
      <Popover.Content>
        <Popover.Arrow />
        <Popover.Title>Delete file</Popover.Title>
        <Popover.Description>This cannot be undone.</Popover.Description>
        <Popover.CloseTrigger>✕</Popover.CloseTrigger>
      </Popover.Content>
    </Popover.Positioner>
  </Popover.Root>
);

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. A Popover's whole shape on the server is decided by two machines that never
 * start there — the popover's own and one `@zag-js/presence` for the content — plus
 * `@zag-js/popper`, whose imperative half is client-only by construction. So everything below is
 * what `initialState({ prop })` plus a `connect()` with no started machine produce, and a server
 * that disagrees with the client about any of it is a page that flashes the wrong state before
 * hydration.
 */
describe("a closed popover on the server", () => {
  it("ships the whole tree under Chakra's defaults, where Dialog ships only the trigger", async () => {
    // The inversion that makes Popover worth its own SSR file. `dialog.tsx` passes `lazyMount: true`
    // and `unmountOnExit: true` to `withRootProvider`; `popover.tsx` passes no options object at
    // all, so `createRenderStrategy`'s own `false`/`false` stand and the closed content is real
    // markup — hidden, but present, and pointed at by a live `aria-controls`.
    const html = await renderServer(Served);

    for (const part of [
      "trigger",
      "positioner",
      "content",
      "arrow",
      "arrow-tip",
      "title",
      "description",
      // Dasherized, where the anatomy's key is `closeTrigger` — the attribute is what a recipe
      // selector and a test both match on.
      "close-trigger",
    ]) {
      expect(html, part).toContain(`data-part="${part}"`);
    }
    expect(html).toContain('data-scope="popover"');

    const controls = html.match(/aria-controls="([^"]*)"/)?.[1];
    expect(controls).toBe(idOfPart(html, "content"));
    expect(controls).toMatch(/^popover:.+:content$/);
  });

  it("hides the content and says `closed` on it, with nothing of either on the positioner", async () => {
    // `hidden` comes from two writers agreeing: the machine emits it for a closed popover, and the
    // Root's presence merges its own over the top. Stripping either would leave a closed popover
    // visible on the served page until hydration — and unlike Dialog's, this element is *always*
    // served, so the flash would be the default experience rather than an opt-in one.
    const html = await renderServer(Served);

    expect(tagOfPart(html, "content")).toContain("hidden");
    expect(tagOfPart(html, "content")).toContain('data-state="closed"');
    expect(tagOfPart(html, "positioner")).not.toContain("hidden");
    expect(tagOfPart(html, "positioner")).not.toContain("data-state");
  });

  it("parks the positioner off-screen, which is the no-flash fact the server can assert", async () => {
    // `@zag-js/popper` computes nothing here — `getPlacement` runs in a `raf` inside an effect of the
    // machine's `open` state, and neither exists on a server. What the server *can* send is the
    // fallback `getPlacementStyles()` emits while `currentPlacement` is undefined: `pointer-events:
    // none` and a transform 100vh above the viewport. Without those two the served positioner sits
    // at the document's top-left corner, visible and clickable, until the first client frame.
    const html = await renderServer(Served);
    const positioner = tagOfPart(html, "positioner");

    expect(positioner).toContain("position:absolute");
    expect(positioner).toContain("pointer-events:none");
    expect(positioner).toContain("translate3d(0, -100vh, 0)");
    // The reactive half of the seam, already in the served attribute: the custom property popper
    // will fill in one frame later is referenced from the very first byte.
    expect(positioner).toContain("z-index:var(--z-index)");
  });

  it("serves the trigger only, with no `aria-controls`, when a consumer opts into `lazyMount`", async () => {
    // The gate's server half. With no content element in the markup the IDREF would dangle and axe
    // reports it, so the machine's own bag is rewritten to drop the attribute. It is gated on the
    // render strategy rather than on `open` — which is why the default, mounted-but-closed shape
    // above keeps it.
    const html = await renderServer(() => (
      <Popover.Root lazyMount>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>body</Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));

    expect(html).toContain('data-part="trigger"');
    for (const part of ["positioner", "content"]) {
      expect(html, part).not.toContain(`data-part="${part}"`);
    }
    expect(html).not.toContain("aria-controls");
    expect(html).not.toContain("body");
  });

  it("serves both labelling IDREFs even with nothing to point at, exactly as React's server does", async () => {
    // **Deliberate, and shared with the React version — do not "fix" this half.** The machine's
    // `renderedElements` starts `{ title: true, description: true }` and is corrected by a DOM sniff
    // one frame after the machine starts. A server runs no frames and has no DOM, so both IDREFs go
    // out optimistically and both dangle; React's server render emits the same two, from the same
    // initial context. The client corrects them on hydrate — which is what
    // `popover.browser.test.tsx`, *the labelling IDREFs*, pins.
    //
    // Suppressing them here would make our markup differ from React's and would change the
    // attributes hydration has to reconcile, to buy nothing a real reader can perceive: no
    // assistive technology reads a page in the window before hydration.
    const html = await renderServer(() => (
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>body</Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));
    const content = tagOfPart(html, "content");

    expect(html).not.toContain('data-part="title"');
    expect(html).not.toContain('data-part="description"');
    expect(content).toContain('aria-labelledby="popover:');
    expect(content).toContain('aria-describedby="popover:');
  });

  it("writes the boolean ARIA attributes as strings, where Solid would drop them", async () => {
    // Zag emits real booleans, and Solid's `setAttribute` writes `true` as `""` and removes the
    // attribute for `false` — so without the adapter's boolean-ARIA stringification a closed trigger
    // ships with no `aria-expanded` and a modal content with `aria-modal=""`.
    const html = await renderServer(() => (
      <Popover.Root modal>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>body</Popover.Content>
      </Popover.Root>
    ));

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(tagOfPart(html, "content")).toContain('aria-modal="true"');
  });

  it("gives two roots in one render two different ids", async () => {
    // Every part id is derived from one `createUniqueId()` per Root. Two roots sharing an id would
    // give both triggers the same `aria-controls`, and the machine's own `getElementById` would find
    // the wrong content.
    const html = await renderServer(() => (
      <div>
        <Popover.Root>
          <Popover.Content>first</Popover.Content>
        </Popover.Root>
        <Popover.Root>
          <Popover.Content>second</Popover.Content>
        </Popover.Root>
      </div>
    ));

    const ids = [...html.matchAll(/id="(popover:[^"]*:content)"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("seeds the machine from `id` rather than naming an element with it", async () => {
    // The Root renders no element at all, so there is no attribute for `id` to land on even in
    // principle — it is a machine argument and nothing else. The positioner is the one part whose
    // suffix is not its part name: `popover:{id}:popper`, which a test looking for `:positioner`
    // would never find.
    const html = await renderServer(() => (
      <Popover.Root id="confirm">
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>body</Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    ));

    expect(idOfPart(html, "trigger")).toBe("popover:confirm:trigger");
    expect(idOfPart(html, "content")).toBe("popover:confirm:content");
    expect(idOfPart(html, "positioner")).toBe("popover:confirm:popper");
  });

  it("lets `ids` name the elements directly", async () => {
    const html = await renderServer(() => (
      <Popover.Root ids={{ content: "sheet" }}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>body</Popover.Content>
      </Popover.Root>
    ));

    expect(idOfPart(html, "content")).toBe("sheet");
    expect(html).toContain('aria-controls="sheet"');
  });

  it("renders the three slot parts as `header`, `div` and `footer`", async () => {
    // Header, Body and Footer exist in the recipe and not in `popover.anatomy`, so they carry no
    // `data-part` and no machine props — the slot class is the only handle anything has on one. The
    // tags are upstream's own (`withContext("header", "header")`, `("div", "body")`,
    // `("footer", "footer")`), and the DOM is what a recipe selector and a screen reader see.
    const html = await renderServer(() => (
      <Popover.Root>
        <Popover.Content>
          <Popover.Header data-probe="header">head</Popover.Header>
          <Popover.Body data-probe="body">body</Popover.Body>
          <Popover.Footer data-probe="footer">actions</Popover.Footer>
        </Popover.Content>
      </Popover.Root>
    ));

    expect(tagOfProbe(html, "header")).toMatch(/^<header\b/);
    expect(tagOfProbe(html, "body")).toMatch(/^<div\b/);
    expect(tagOfProbe(html, "footer")).toMatch(/^<footer\b/);
    for (const probe of ["header", "body", "footer"]) {
      expect(tagOfProbe(html, probe), probe).not.toContain("data-part");
    }
  });

  it("renders Title and Description as `div`s, where Dialog's Title is an `h2`", async () => {
    const html = await renderServer(() => (
      <Popover.Root>
        <Popover.Content>
          <Popover.Title>Delete file</Popover.Title>
          <Popover.Description>This cannot be undone.</Popover.Description>
        </Popover.Content>
      </Popover.Root>
    ));

    expect(tagOfPart(html, "title")).toMatch(/^<div\b/);
    expect(tagOfPart(html, "description")).toMatch(/^<div\b/);
  });

  it("serves the Arrow's default tip, and lets a consumer's child replace it", async () => {
    // The JSX-valued slot default, resolved inside the `children()` call. On the server it has to
    // *not* be a module-scope constant — JSX there is constructed at import time and 500s the route
    // before anything renders.
    const withDefault = await renderServer(() => (
      <Popover.Root>
        <Popover.Content>
          <Popover.Arrow />
        </Popover.Content>
      </Popover.Root>
    ));

    expect(withDefault).toContain('data-part="arrow-tip"');

    const replaced = await renderServer(() => (
      <Popover.Root>
        <Popover.Content>
          <Popover.Arrow>
            <span data-probe="custom-tip">▲</span>
          </Popover.Arrow>
        </Popover.Content>
      </Popover.Root>
    ));

    expect(replaced).toContain('data-probe="custom-tip"');
    expect(replaced).not.toContain('data-part="arrow-tip"');
  });

  it("gives the Anchor no recipe class, where every other part gets one", async () => {
    // Upstream wires `PopoverAnchor` with `withContext(…, undefined)` even though `anchor` is a slot
    // the recipe carries, so the element is a bare positioning handle. Asserting the *absence* is
    // the only way this stays a decision rather than drifting into an oversight.
    const html = await renderServer(() => (
      <Popover.Root>
        <Popover.Anchor>anchored</Popover.Anchor>
        <Popover.Trigger>Open</Popover.Trigger>
      </Popover.Root>
    ));

    expect(tagOfPart(html, "anchor")).not.toContain("popover__anchor");
    expect(tagOfPart(html, "trigger")).toContain("popover__trigger");
  });

  it("lets a `PropsProvider`'s `lazyMount` take the content out of the markup", async () => {
    // The precedence chain in full, and the one direction that is observable here: the Root applies
    // no literal default of its own, so a provider's `true` is what decides, and a Root passing the
    // prop itself would still win over the provider.
    const html = await renderServer(() => (
      <Popover.PropsProvider value={{ lazyMount: true }}>
        <Popover.Root>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>body</Popover.Content>
        </Popover.Root>
      </Popover.PropsProvider>
    ));

    expect(html).toContain('data-part="trigger"');
    expect(html).not.toContain('data-part="content"');
  });

  it("keeps a `<Portal>` out of the server markup without shifting what follows it", async () => {
    // `@solidjs/web`'s server Portal returns `undefined` and consumes exactly one child id, which is
    // what keeps the client's own portal aligned. Here that shows up as an absent popover and a
    // present sibling; that the sibling still *hydrates* is the browser test's half.
    const html = await renderServer(() => (
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>portalled</Popover.Content>
          </Popover.Positioner>
        </Portal>
        <span data-probe="after-portal">after</span>
      </Popover.Root>
    ));

    expect(html).not.toContain('data-part="content"');
    expect(html).not.toContain("portalled");
    expect(html).toContain('data-probe="after-portal"');
  });
});
