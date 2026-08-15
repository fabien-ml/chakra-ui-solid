import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { Checkmark } from "../checkmark";

/**
 * What the smoke suite cannot see: it renders every barrel export **once**, and Checkmark's whole
 * shape is which of three branches it took. A server that sends an empty box where the client draws
 * a tick is a page that flashes the wrong state before hydration, and the smoke suite's "did any
 * element come back" check passes on all three.
 */
describe("Checkmark on the server", () => {
  it("draws the tick when checked", async () => {
    const html = await renderServer(() => <Checkmark checked />);

    expect(html).toContain('data-state="checked"');
    expect(html).toContain('points="20 6 9 17 4 12"');
    expect(html).not.toContain("<path");
  });

  it("draws the dash when indeterminate, and lets it beat `checked`", async () => {
    const html = await renderServer(() => <Checkmark checked indeterminate />);

    expect(html).toContain('data-state="indeterminate"');
    expect(html).toContain('d="M5 12h14"');
    expect(html).not.toContain("<polyline");
  });

  it("draws an empty box when neither, and still says so", async () => {
    const html = await renderServer(() => <Checkmark />);

    // The attribute is present in all three states rather than dropped in the resting one: every
    // variant's paint rule reads `[data-state=checked], [data-state=indeterminate]`, so `unchecked`
    // is a value the recipe was written against, not the absence of one.
    expect(html).toContain('data-state="unchecked"');
    expect(html).not.toContain("<path");
    expect(html).not.toContain("<polyline");
  });

  it("resolves the recipe and the presentation styles on the server", async () => {
    const html = await renderServer(() => <Checkmark checked size="lg" />);

    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain("checkmark--size_lg");
    expect(html).toContain("checkmark--variant_solid");
    // `stroke` and its four neighbours are style props on this stack, so they leave as classes
    // rather than as SVG attributes. Whether those classes have any CSS behind them is the browser
    // test's question; whether the server named them at all is this one's.
    expect(html).toContain("stk_currentColor");
  });

  it("drops the recipe under `unstyled` and keeps the stroke that draws the tick", async () => {
    const html = await renderServer(() => <Checkmark checked unstyled />);

    expect(html).not.toContain("checkmark--");
    expect(html).toContain("stk_currentColor");
  });
});
