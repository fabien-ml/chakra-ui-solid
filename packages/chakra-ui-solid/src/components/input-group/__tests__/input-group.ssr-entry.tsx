import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Box } from "../../box";
import { Input } from "../../input";
import { InputGroup } from "../input-group";

/**
 * The one InputGroup tree the `ssr` and `browser` projects share, so the server render they compare
 * is the same subject rather than two hand-kept copies.
 *
 * Four gates and four `children()` calls per group, which is what makes this worth a round trip.
 * `children()` resolves in the **ambient owner**, ahead of the element that surrounds it, so it
 * does not consume the hydration key (`_hk`, the positional marker Solid matches a server node to a
 * client node by) that a raw read at that position would — meaning everything after it keys
 * differently than the naive reading suggests. Three groups take three different combinations, so
 * each spends a different number of keys:
 *
 * - **search** — both elements, no addon, so `attached` is false and the two `InputAddon` gates
 *   render nothing at all;
 * - **site** — both addons and no element, the mirror image, and the arm where the seam between
 *   three children has to be collapsed by the server's own markup;
 * - **plain** — no slot at all, the arm that spends the fewest keys and where the control must come
 *   out with the recipe's own padding rather than a `calc()` against a variable nobody set.
 *
 * The control is **wrapped in a `Box`** in one of them, which is the thing the context route buys
 * and `cloneElement` cannot: the padding reaches a control that is not an immediate child.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <InputGroup startElement="@" endElement=".com" startOffset="4px" data-probe="search">
        <Input size="lg" data-probe="search-control" />
      </InputGroup>

      <InputGroup startAddon="https://" endAddon=".com" data-probe="site">
        <Box>
          <Input data-probe="site-control" />
        </Box>
      </InputGroup>

      <InputGroup data-probe="plain">
        <Input data-probe="plain-control" />
      </InputGroup>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=input-group`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
