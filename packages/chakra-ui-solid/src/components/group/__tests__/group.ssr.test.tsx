import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { Group } from "../group";

/**
 * Group is the one component here that reaches for the DOM during render, and the server has no DOM
 * at all — not an empty one. `child instanceof Element` is a **global** read, so on the server it is
 * a `ReferenceError` rather than a `false`, and it takes the whole page down: the docs route
 * carrying a Group returned a 500 with `Element is not defined`, with every unit and browser test
 * green.
 *
 * So this asserts the render *completes*, and that the decoration it completes without is the
 * documented cost: no `data-first` in the server's markup until the client takes over.
 */
describe("Group on the server", () => {
  it("renders its children rather than throwing", async () => {
    const html = await renderServer(() => (
      <Group attached>
        <button type="button">one</button>
        <button type="button">two</button>
      </Group>
    ));

    expect(html).toContain("chakra-group");
    expect(html).toContain("one");
    expect(html).toContain("two");
  });

  it("carries none of the position attributes, which is the route's known cost", async () => {
    const html = await renderServer(() => (
      <Group attached>
        <button type="button">one</button>
        <button type="button">two</button>
      </Group>
    ));

    // The attribute, not the string: the recipe's own class names spell those selectors out —
    // `[&_>_*[data-first]]:bdr-e_0!` — so a bare substring match passes on markup that has them.
    expect(html).not.toContain('data-first=""');
    expect(html).not.toContain('data-group-item=""');
  });
});
