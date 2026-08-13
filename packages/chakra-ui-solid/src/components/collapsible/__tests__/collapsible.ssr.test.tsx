import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Collapsible } from "../index";

/** The `id` attribute of the element carrying `data-part="…"`, out of raw server markup. */
function idOfPart(html: string, part: string): string | undefined {
  const element = html.match(new RegExp(`<[a-z]+[^>]*data-part="${part}"[^>]*>`))?.[0];
  return element?.match(/\bid="([^"]*)"/)?.[1];
}

/**
 * What the smoke suite cannot see: it renders every barrel export once and asks only whether an
 * element came back. Collapsible's whole shape on the server is which state its machine started in —
 * and the machine starts in `onSettled`, which never runs there. So everything below is what
 * `initialState({ prop })` plus a `connect()` with no started machine produce, and a server that
 * disagrees with the client about any of it is a page that flashes the wrong state before hydration.
 */
describe("Collapsible on the server", () => {
  it("renders all four parts, closed", async () => {
    const html = await renderToStream(() => (
      <Collapsible.Root>
        <Collapsible.Trigger>
          Show
          <Collapsible.Indicator>▾</Collapsible.Indicator>
        </Collapsible.Trigger>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    for (const part of ["root", "trigger", "indicator", "content"]) {
      expect(html, part).toContain(`data-part="${part}"`);
    }
    expect(html).toContain('data-scope="collapsible"');
    expect(html).toContain('data-state="closed"');
  });

  it("points the trigger's `aria-controls` at the content's own id", async () => {
    // The IDREF and the element it names are produced by two different `connect()` getters reading
    // one scope. A generated id that moved between them would leave a dangling reference that axe
    // reports and nothing else does.
    const html = await renderToStream(() => (
      <Collapsible.Root>
        <Collapsible.Trigger>Show</Collapsible.Trigger>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    const controls = html.match(/aria-controls="([^"]*)"/)?.[1];

    expect(controls).toBeDefined();
    expect(controls).toBe(idOfPart(html, "content"));
    expect(controls).toMatch(/^collapsible:.+:content$/);
  });

  it("writes `aria-expanded` as a string, where Solid would drop the boolean", async () => {
    // Zag emits `aria-expanded: false`, and Solid's `setAttribute` removes an attribute whose value
    // is `false` — so without the adapter's boolean-ARIA stringification a closed trigger ships with
    // no `aria-expanded` at all, and a screen reader is told nothing.
    const html = await renderToStream(() => (
      <Collapsible.Root>
        <Collapsible.Trigger>Show</Collapsible.Trigger>
      </Collapsible.Root>
    ));

    expect(html).toContain('aria-expanded="false"');
  });

  it("hides a closed content, and leaves `hidden` off an open one", async () => {
    const closed = await renderToStream(() => (
      <Collapsible.Root>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));
    const open = await renderToStream(() => (
      <Collapsible.Root defaultOpen>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    expect(closed).toContain("hidden");
    expect(open).not.toContain("hidden");
    expect(open).toContain('data-state="open"');
  });

  it("leaves `data-state` off an initially-open content, so it does not animate in on load", async () => {
    // `connect()`'s `skip` — `!context.initial && open` — is true on the very first render of an
    // open collapsible, and it suppresses the content's `data-state` alone. The recipe keys its
    // `animationName` off `[data-state]`, so this is what stops a `defaultOpen` panel from playing
    // its enter animation as the page loads. The ROOT still says `open`, which is what a consumer
    // styles against.
    const html = await renderToStream(() => (
      <Collapsible.Root defaultOpen>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    const content = html.match(/<div[^>]*data-part="content"[^>]*>/)?.[0];

    expect(content).toBeDefined();
    expect(content).not.toContain("data-state");
    expect(html).toContain('data-state="open"');
  });

  it("gives two roots in one render two different ids", async () => {
    // Every part id is derived from one `createUniqueId()` per Root. Two roots sharing an id would
    // give both triggers the same `aria-controls`, and the machine's own `getElementById` would find
    // the wrong content.
    const html = await renderToStream(() => (
      <div>
        <Collapsible.Root>
          <Collapsible.Content>first</Collapsible.Content>
        </Collapsible.Root>
        <Collapsible.Root>
          <Collapsible.Content>second</Collapsible.Content>
        </Collapsible.Root>
      </div>
    ));

    const ids = [...html.matchAll(/id="(collapsible:[^"]*:content)"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("keeps a `lazyMount` content out of the markup entirely", async () => {
    const html = await renderToStream(() => (
      <Collapsible.Root lazyMount>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    expect(html).not.toContain('data-part="content"');
    expect(html).not.toContain("body");
  });

  it("resolves the slot recipe on the server", async () => {
    const html = await renderToStream(() => (
      <Collapsible.Root>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    expect(html).toContain("collapsible__root");
    expect(html).toContain("collapsible__content");
  });

  it("drops every slot class under a Root-level `unstyled`", async () => {
    const html = await renderToStream(() => (
      <Collapsible.Root unstyled>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    expect(html).not.toContain("collapsible__");
    expect(html).toContain('data-part="content"');
  });

  it("seeds the machine from `id` rather than naming the root element with it", async () => {
    // Ark puts `id` in the machine's half of its prop split, so the attribute becomes
    // `collapsible:{id}` and `ids` is the way to control the attributes themselves.
    const html = await renderToStream(() => (
      <Collapsible.Root id="faq">
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    expect(idOfPart(html, "root")).toBe("collapsible:faq");
    expect(idOfPart(html, "content")).toBe("collapsible:faq:content");
  });

  it("lets `ids` name the elements directly", async () => {
    const html = await renderToStream(() => (
      <Collapsible.Root ids={{ content: "answer" }}>
        <Collapsible.Trigger>Show</Collapsible.Trigger>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>
    ));

    expect(idOfPart(html, "content")).toBe("answer");
    expect(html).toContain('aria-controls="answer"');
  });
});
