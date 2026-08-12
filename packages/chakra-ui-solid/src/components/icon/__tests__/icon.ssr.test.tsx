import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { CheckIcon } from "../../icons";
import { createIcon } from "../create-icon";

/**
 * `createIcon` is where this row can take a route down, and the smoke suite cannot see it: that
 * suite renders every *barrel export*, and `createIcon` is a function that returns a component
 * rather than being one.
 *
 * Two failures live here. A caller writing `path: <path … />` instead of `path: () => …` builds JSX
 * when the module is imported, which is a `ReferenceError` in a server runtime before anything
 * renders — the option's type is what prevents it and this is what proves the supported shape
 * works. And the internal glyphs are `chakra.svg`, so they run the whole style pipeline on the
 * server too.
 */
describe("createIcon on the server", () => {
  it("renders the glyph its `path` returns", async () => {
    const HeartIcon = createIcon({
      displayName: "HeartIcon",
      path: () => <path fill="currentColor" d="M19.5 13.572 12 21l-7.5-7.428" />,
    });

    const html = await renderToStream(() => <HeartIcon size="lg" />);

    expect(html).toContain("<svg");
    expect(html).toContain("M19.5 13.572 12 21l-7.5-7.428");
    expect(html).toContain('viewBox="0 0 24 24"');
  });

  it("renders the `d` shorthand as a single path", async () => {
    const DotIcon = createIcon({ d: "M12 12h.01" });

    const html = await renderToStream(() => <DotIcon />);

    expect(html).toContain('d="M12 12h.01"');
    expect(html).toContain('fill="currentColor"');
  });

  it("takes a caller's viewBox over the default", async () => {
    const WideIcon = createIcon({ viewBox: "0 0 32 32", d: "M16 16h.01" });

    const html = await renderToStream(() => <WideIcon />);

    expect(html).toContain('viewBox="0 0 32 32"');
    expect(html).not.toContain('viewBox="0 0 24 24"');
  });

  it("server-renders an internal glyph, style pipeline and all", async () => {
    const html = await renderToStream(() => <CheckIcon />);

    expect(html).toContain("<svg");
    expect(html).toContain('d="M20 6 9 17l-5-5"');
  });
});
