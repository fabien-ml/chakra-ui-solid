import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Radiomark } from "../radiomark";

/**
 * What the smoke suite cannot see: it renders every barrel export **once**, and Radiomark's whole
 * shape is which of two branches it took. A server that sends an empty circle where the client draws
 * a dot is a page that flashes the wrong state before hydration, and the smoke suite's "did any
 * element come back" check passes on both.
 */
describe("Radiomark on the server", () => {
  it("draws the dot when checked, and says so on `data-checked`", async () => {
    const html = await renderToStream(() => <Radiomark checked />);

    // Bare, not `data-checked=""`: Solid serialises an empty-string attribute without its value,
    // which is the same attribute to a selector. The unchecked case below is what pins the meaning.
    expect(html).toContain("data-checked");
    expect(html).toContain('class="dot"');
  });

  it("draws no dot when unchecked, and leaves the attribute off", async () => {
    const html = await renderToStream(() => <Radiomark />);

    expect(html).not.toContain('class="dot"');
    expect(html).not.toContain("data-checked");
  });

  it("resolves the recipe on the server", async () => {
    const html = await renderToStream(() => <Radiomark checked size="lg" />);

    expect(html).toContain("radiomark--size_lg");
    expect(html).toContain("radiomark--variant_solid");
  });

  it("drops the recipe under `unstyled` and keeps the dot the consumer's styles will find", async () => {
    const html = await renderToStream(() => <Radiomark checked unstyled />);

    expect(html).not.toContain("radiomark--");
    expect(html).toContain('class="dot"');
  });
});
