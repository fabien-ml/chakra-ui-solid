import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Box } from "../../box";
import { Radiomark } from "../radiomark";

/**
 * The one Radiomark tree the `ssr` and `browser` projects share, so the server render they compare
 * is the same subject rather than two hand-kept copies.
 *
 * Both branches are here, adjacent, because the tree is **conditional**: a checked one renders a
 * `span.dot` and an unchecked one renders nothing at all. That is one hydration key or zero (`_hk`
 * is the positional marker Solid matches server and client nodes by), so the branch the server took
 * shifts every sibling after it. Neither mismatch says anything on its own — the markup, the dot and
 * the styles all still look right — and `hydrateFixture` is what turns both into a failure.
 *
 * `unstyled` is on the last one because that is how both consumers render it, and it takes a
 * different path through the class getter: the recipe drops out and only the `css` prop remains,
 * which server and client still have to name identically.
 */
export function Tree(): JSX.Element {
  return (
    <Box data-probe="root">
      <Radiomark data-probe="unchecked" />
      <Radiomark checked size="lg" data-probe="checked" />
      <Radiomark checked variant="outline" filled data-probe="outline" />
      <Radiomark checked unstyled css={{ "& .dot": { bg: "red.500" } }} data-probe="unstyled" />
    </Box>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=radiomark`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
