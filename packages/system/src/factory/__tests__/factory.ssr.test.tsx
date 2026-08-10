import { declarationsForClassList } from "@chakra-ui-solid/internal-test-utils/stylesheet";
import { chakra } from "@chakra-ui-solid/system";
import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";

/**
 * There is no DOM here, so there is no `getComputedStyle` — and a class-name assertion is banned for
 * the same reason it is banned in the browser project: `css()` computes a class and never injects a
 * rule, so `expect(html).toContain("px_5")` passes on an element with no padding. The substitute is
 * to resolve the emitted classes **through the generated stylesheet** and assert the declarations.
 *
 * The factory has one server-specific risk and it is not styling: it is a `Proxy`, and a `get` trap
 * that minted a component for every probe would break the moment the SSR runtime looked at it. The
 * classes matching the client's is the other half — `renderStyled`'s class getter is pure render-time
 * computation and `hash: false` makes `css()`'s names stable, so a divergence would mean hydration
 * reuses the server's node under a different class.
 *
 * The recipe is deliberately the same one `factory.browser.test.tsx` declares: two files rendering
 * the same subject is what makes "server and client agree" a claim rather than a coincidence.
 */

const StyledButton = chakra("button", {
  base: { paddingInline: "5" },
  variants: {
    tone: {
      solid: { marginBlock: "2" },
      subtle: { marginBlock: "6" },
    },
  },
  defaultVariants: { tone: "solid" },
});

async function renderClassList(ui: () => ReturnType<typeof StyledButton>): Promise<string> {
  const html = await renderToStream(ui);
  const match = /class="([^"]*)"/.exec(html);
  if (match?.[1] === undefined) {
    throw new Error(`server render carried no class attribute:\n${html}`);
  }
  return match[1];
}

async function renderDeclarations(
  ui: () => ReturnType<typeof StyledButton>,
): Promise<Record<string, string>> {
  return declarationsForClassList(await renderClassList(ui));
}

describe("chakra — the server sends markup whose classes have real rules", () => {
  it("resolves the recipe's base and its default variant", async () => {
    expect(await renderDeclarations(() => <StyledButton type="button" />)).toMatchObject({
      "padding-inline": "var(--spacing-5)",
      "margin-block": "var(--spacing-2)",
    });
  });

  it("resolves the variant a prop selects", async () => {
    expect(
      await renderDeclarations(() => <StyledButton type="button" tone="subtle" />),
    ).toMatchObject({ "margin-block": "var(--spacing-6)" });
  });

  it("resolves a style prop over the recipe's own value", async () => {
    expect(
      await renderDeclarations(() => <StyledButton type="button" paddingInline="1" />),
    ).toMatchObject({ "padding-inline": "var(--spacing-1)" });
  });

  it("resolves the JSX-namespace form", async () => {
    expect(
      await renderDeclarations(() => <chakra.div paddingInline="5" marginBlock="2" />),
    ).toMatchObject({
      "padding-inline": "var(--spacing-5)",
      "margin-block": "var(--spacing-2)",
    });
  });

  it("renders byte-identically twice", async () => {
    // The class getter touches no DOM, runs no effect and generates no id. Two renders that
    // differed would mean one of those stopped being true, and hydration would then reuse a server
    // node under a client class.
    const first = await renderToStream(() => <StyledButton type="button" paddingInline="1" />);
    expect(first).toBe(
      await renderToStream(() => <StyledButton type="button" paddingInline="1" />),
    );
  });

  it("keeps variant keys and style props off the element", async () => {
    const html = await renderToStream(() => (
      <StyledButton type="button" tone="subtle" paddingInline="1" />
    ));

    expect(html).toContain('type="button"');
    expect(html).not.toContain("tone=");
    expect(html).not.toMatch(/\spaddingInline=/);
  });
});
