import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import { declarationsForClassList } from "@chakra-ui-solid/internal-test-utils/stylesheet";
import { describe, expect, it } from "vitest";
import { Box } from "../box";
import { Tree } from "./box.ssr-entry";

/**
 * There is no DOM here, so there is no `getComputedStyle` — but a class-name assertion is still
 * banned, and for the same reason it is banned in the browser project: `css()` computes a class and
 * never injects a rule, so `expect(html).toContain("p_4")` passes on an element with no padding.
 *
 * The substitute is to resolve the emitted classes **through the generated stylesheet** and assert
 * the declarations. That asks the same question the browser project asks — *what does this element
 * actually get?* — with the sheet standing in for the engine (`testing.md` §2).
 */

async function renderClassList(ui: () => ReturnType<typeof Box>): Promise<string> {
  const html = await renderServer(ui);
  const match = /class="([^"]*)"/.exec(html);
  if (match?.[1] === undefined) {
    throw new Error(`server render carried no class attribute:\n${html}`);
  }
  return match[1];
}

async function renderDeclarations(
  ui: () => ReturnType<typeof Box>,
): Promise<Record<string, string>> {
  return declarationsForClassList(await renderClassList(ui));
}

describe("Box — the server sends markup whose classes have real rules", () => {
  it("resolves a spacing token", async () => {
    expect(await renderDeclarations(() => <Box p="4" />)).toMatchObject({
      padding: "var(--chakra-spacing-4)",
    });
  });

  it("resolves a semantic colour token", async () => {
    expect(await renderDeclarations(() => <Box bg="bg.panel" />)).toMatchObject({
      background: "var(--chakra-colors-bg-panel)",
    });
  });

  it("resolves one of the 17 aliased shorthands", async () => {
    expect(await renderDeclarations(() => <Box gapX="4" />)).toMatchObject({
      "column-gap": "var(--chakra-spacing-4)",
    });
  });

  it("resolves the array form of the `css` prop, last winning", async () => {
    expect(
      await renderDeclarations(() => <Box css={[{ margin: "2" }, { margin: "6" }]} />),
    ).toMatchObject({
      margin: "var(--chakra-spacing-6)",
    });
  });

  it("emits nothing for a class the stylesheet has no rule for", async () => {
    // The negative control. Without it the assertions above could all be passing on an empty
    // lookup, which is precisely the failure they exist to catch.
    expect(declarationsForClassList("p_definitely-not-generated")).toEqual({});
  });
});

describe("Box — SSR output is a pure computation", () => {
  it("renders byte-identically twice", async () => {
    // `renderStyled`'s class getter touches no DOM, runs no effect and generates no id, and
    // `hash: false` makes `css()`'s names stable. Two renders that differ would mean one of those
    // stopped being true, and hydration would then reuse a server node under a client class.
    const first = await renderServer(() => <Tree />);
    const second = await renderServer(() => <Tree />);
    expect(first).toBe(second);
  });

  it("keeps style props off the element and renames the html* escape hatches", async () => {
    const html = await renderServer(() => <Box as="img" htmlWidth={40} p="4" />);
    expect(html).toContain('width="40"');
    expect(html).not.toMatch(/\sp="4"/);
    expect(html).not.toContain("htmlWidth");
  });
});
