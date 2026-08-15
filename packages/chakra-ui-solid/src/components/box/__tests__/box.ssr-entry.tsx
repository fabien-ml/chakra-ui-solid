import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Box } from "../box";

/**
 * The one Box tree the `ssr` and `browser` projects share, so the server render they compare is the
 * same subject rather than two hand-kept copies.
 *
 * The props are chosen for what they each risk: a spacing token (the common case), a semantic
 * colour token (the token layer), an aliased shorthand (`gapX`, one of the 17 our preset adds), a
 * conditional (`_hover`), the `css` escape hatch in its array form, and a renamed HTML attribute
 * on a nested element (`htmlWidth`). If any of those computes a different class on the server than
 * on the client, hydration reuses the server's node with the client's class — or replaces it — and
 * the element is styled by whichever side won.
 */
export function Tree(): JSX.Element {
  return (
    <Box as="section" p="4" bg="bg.panel" gapX="4" _hover={{ padding: "8" }} data-probe="root">
      <Box as="img" htmlWidth={40} htmlHeight={20} css={[{ margin: "2" }, { margin: "6" }]} />
    </Box>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=box`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
