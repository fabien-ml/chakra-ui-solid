import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { CheckIcon } from "../../icons";
import { createIcon } from "../create-icon";
import { Icon } from "../icon";

/** A glyph as an icon package ships one — its own `svg`, taking whatever props it is handed. */
function StarIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    // `aria-hidden` before the spread, overwritten with the same `"true"` Icon computes — it is
    // there for the linter, which cannot see an attribute arriving in a spread.
    <svg aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path d="M0 0h24v24H0z" />
    </svg>
  );
}

/**
 * The two spellings that collapse, on the server.
 *
 * This is the half of the fix a browser test cannot reach, and the reason the nesting could not be
 * repaired by resolving the child: on the server a resolved child is already an HTML **string**, so
 * there is no element left to put the recipe class on. `as` and `render` never make one — the glyph
 * *is* the element, and the class is on it in the markup the server sends.
 */
describe("Icon's collapse on the server", () => {
  it("`as` sends one svg, carrying the recipe", async () => {
    const html = await renderToStream(() => <Icon as={StarIcon} size="lg" color="orange.400" />);

    expect(html).toContain("icon--size_lg");
    expect(html).toContain('viewBox="0 0 24 24"');
    // One opening `<svg`, which is the assertion the old wrapper failed: it sent two, and the recipe
    // was on the one that did no drawing.
    expect(html.match(/<svg/g)).toHaveLength(1);
  });

  it("`render` sends one svg too", async () => {
    const html = await renderToStream(() => (
      <Icon
        size="lg"
        render={(props) => <StarIcon {...(props as JSX.SvgSVGAttributes<SVGSVGElement>)} />}
      />
    ));

    expect(html).toContain("icon--size_lg");
    expect(html.match(/<svg/g)).toHaveLength(1);
  });

  it("frames raw glyph contents in the one svg it renders itself", async () => {
    const html = await renderToStream(() => (
      <Icon size="lg" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" />
      </Icon>
    ));

    expect(html).toContain("icon--size_lg");
    expect(html).toContain('d="M0 0h24v24H0z"');
    expect(html.match(/<svg/g)).toHaveLength(1);
  });
});

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
