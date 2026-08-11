import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Span } from "../../span";
import { Loader } from "../loader";
import { Tree } from "./loader.ssr-entry";

/**
 * There is no DOM here, so the question is not what the Loader looks like — it is which branch the
 * *server* picked, and whether it picked it the same way twice. A branch that resolves differently
 * on the server than on the client is a hydration mismatch with no styling symptom at all.
 */
describe("Loader on the server", () => {
  it("sends the children with no wrapper when it is not visible", async () => {
    const html = await renderToStream(() => (
      <Loader visible={false}>
        <Span data-probe="label">Save</Span>
      </Loader>
    ));

    expect(html).toContain('data-probe="label"');
    // The wrapper's only marker is its `display: contents` class, so its absence is asserted
    // through the declaration rather than through a tag name — a bare `<span>` count would also
    // match the child.
    expect(html).not.toContain("d_contents");
  });

  it("places the spinner before the text, and after it on request", async () => {
    const start = await renderToStream(() => (
      <Loader text="Saving…" spinner={<Span data-probe="spinner" />} />
    ));
    const end = await renderToStream(() => (
      <Loader text="Saving…" spinnerPlacement="end" spinner={<Span data-probe="spinner" />} />
    ));

    expect(start.indexOf("data-probe")).toBeLessThan(start.indexOf("Saving…"));
    expect(end.indexOf("data-probe")).toBeGreaterThan(end.indexOf("Saving…"));
  });

  it("renders byte-identically twice", async () => {
    // Two renders that differ would mean a branch gate or a slot resolution stopped being pure
    // render-time computation — and hydration would then claim the server's node under a tree the
    // client built a different way.
    const first = await renderToStream(() => <Tree />);
    const second = await renderToStream(() => <Tree />);

    expect(first).toBe(second);
  });

  it("keeps its own props off the element", async () => {
    const html = await renderToStream(() => <Loader spinnerPlacement="end">Save</Loader>);

    expect(html).not.toContain("spinnerPlacement");
    expect(html).not.toContain("visible=");
  });
});
