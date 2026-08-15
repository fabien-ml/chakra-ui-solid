import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { ColorSwatch, ColorSwatchMix, ColorSwatchPropsProvider } from "../color-swatch";

/**
 * What the smoke suite cannot see: it renders every barrel export **once** and asks only whether an
 * element came back. ColorSwatch's colour is not in its markup's tags — it is in an inline `style`,
 * and a server that omits it sends a swatch whose whole `background` shorthand is invalid at
 * computed-value time. The page then flashes an empty box, checkerboard and all, before hydration.
 */
describe("ColorSwatch on the server", () => {
  it("writes the colour into an inline style, because it cannot be a class", async () => {
    const html = await renderServer(() => <ColorSwatch value="#bada55" />);

    expect(html).toContain("--color:#bada55");
    expect(html).toContain('data-value="#bada55"');
  });

  it("keeps `value` off the element, where it would be an invalid attribute", async () => {
    const html = await renderServer(() => <ColorSwatch value="#bada55" />);

    expect(html).not.toContain('value="#bada55"><');
    expect(html).not.toContain(' value="#bada55"');
  });

  it("resolves the recipe on the server", async () => {
    const html = await renderServer(() => <ColorSwatch value="tomato" size="lg" shape="circle" />);

    expect(html).toContain("color-swatch--size_lg");
    expect(html).toContain("color-swatch--shape_circle");
  });

  it("drops the recipe under `unstyled` and keeps the colour the consumer's styles will paint", async () => {
    const html = await renderServer(() => <ColorSwatch value="tomato" unstyled />);

    expect(html).not.toContain("color-swatch--");
    expect(html).toContain("--color:tomato");
  });

  it("reads a props provider on the server, where there is no effect to fix it up later", async () => {
    const html = await renderServer(() => (
      <ColorSwatchPropsProvider value={{ shape: "circle" }}>
        <ColorSwatch value="tomato" />
      </ColorSwatchPropsProvider>
    ));

    expect(html).toContain("color-swatch--shape_circle");
  });

  it("renders one cell per colour, which is what decides every hydration key after it", async () => {
    const two = await renderServer(() => <ColorSwatchMix items={["red", "pink"]} />);
    const three = await renderServer(() => <ColorSwatchMix items={["red", "pink", "green"]} />);

    expect(two.match(/--color:/g)).toHaveLength(3);
    expect(three.match(/--color:/g)).toHaveLength(4);
    // Only the last of three spans, and only on the server too — the class is computed during
    // render, so a branch the server took differently would be a mismatch nothing else can see.
    expect(two).not.toContain("grid-c_span_2");
    expect(three).toContain("grid-c_span_2");
  });

  it("throws on a fifth colour before it can render a broken grid", async () => {
    // The render fails rather than producing a page with five cells crammed into two columns, so a
    // route sees a 500. It surfaces as a rejection rather than a synchronous throw because the
    // component body runs inside the `<ChakraProvider>`'s own children memo — one boundary the
    // guard now crosses, and the same one every part component under a machine root already sits
    // behind.
    await expect(
      renderServer(() => <ColorSwatchMix items={["a", "b", "c", "d", "e"]} />),
    ).rejects.toThrow("doesn't support more than 4 colors");
  });
});
