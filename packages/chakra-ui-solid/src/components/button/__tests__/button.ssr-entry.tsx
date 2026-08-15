import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Span } from "../../span";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";

/**
 * The one Button tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * All three shapes Button can take are here, because the thing under test is the **hydration key**
 * (`_hk` — the positional marker Solid matches a server node to a client node by), and each shape
 * consumes a different number of them:
 *
 * - loading **with** `loadingText`, whose Loader replaces the children with a spinner and a label;
 * - loading with neither, whose Loader hides the children in place under a centred spinner;
 * - not loading, whose children are written straight into the element.
 *
 * The first two resolve their slots through `children()`, which allocates in the **ambient owner**
 * rather than at the position it is read — so it does not consume the key a raw read there would,
 * and the whole subtree after it keys accordingly. Server and client have to agree about that, and
 * when they do not, `hydrate()` either claims a server node under a different client tree or gives
 * up and client-renders. Both are silent: the markup, the styles and the geometry all still look
 * right. `hydrateFixture` is what turns either into a failure.
 *
 * The `ButtonGroup` above them is not decoration: it is the props context on the server, which is
 * the one path a client-only render would never exercise.
 */
export function Tree(): JSX.Element {
  return (
    <ButtonGroup size="sm" variant="outline">
      <Button
        loading
        loadingText={<Span data-probe="loading-text">Saving…</Span>}
        spinner={<Span data-probe="custom-spinner">◐</Span>}
      >
        <Span data-probe="replaced-label">Save</Span>
      </Button>
      <Button loading>
        <Span data-probe="hidden-label">Delete</Span>
      </Button>
      <Button>
        <Span data-probe="plain-label">Cancel</Span>
      </Button>
    </ButtonGroup>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=button`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
