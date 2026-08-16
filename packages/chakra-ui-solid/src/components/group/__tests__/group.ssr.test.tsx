import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { describe, expect, it } from "vitest";
import { Group } from "../group";

/**
 * A class name, where the rest of this suite asserts computed styles — because on the server there
 * is nothing else to read, and the class is the whole claim: the seam is a rule the browser applies
 * to the markup it was handed, so it is correct in the first byte with no client pass to wait for.
 * The `& > *` prefix is dropped from each expectation, since SSR escapes the `&` to `&amp;`.
 *
 * What guards the class against naming a rule Panda never generated is
 * `packages/styled-system/styled-system/styles.css`, which the browser suite renders against.
 */
const FIRST_OF_MANY =
  "_>_*:nth-child(1_of_:not([data-group-skip])):not(:nth-last-child(1_of_:not([data-group-skip])))]:bdr-e_0!";
const LAST_OF_MANY =
  "_>_*:nth-last-child(1_of_:not([data-group-skip])):not(:nth-child(1_of_:not([data-group-skip])))]:bdr-s_0!";

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

  it("carries the seam in its first byte", async () => {
    const html = await renderServer(() => (
      <Group attached>
        <button type="button">one</button>
        <button type="button">two</button>
      </Group>
    ));

    expect(html).toContain(FIRST_OF_MANY);
    expect(html).toContain(LAST_OF_MANY);
  });

  it("writes nothing onto the children it was handed", async () => {
    const html = await renderServer(() => (
      <Group stacking="last-on-top" attached>
        <button type="button">one</button>
        <button type="button">two</button>
      </Group>
    ));

    // The children's own tags, not the whole document — and that is the caveat coming back rather
    // than a weaker assertion. `Group`'s base now carries a rule keyed on `[data-group-item]` (the
    // lone-item ring suppression), so its own class name contains that string and a substring match
    // over `html` reports an attribute nobody wrote. What the claim was always about is what landed
    // on the children, and this reads exactly that.
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(2);

    for (const button of buttons) {
      expect(button).not.toContain("data-first");
      expect(button).not.toContain("data-group-item");
      expect(button).not.toContain("--group-index");
    }
  });
});
