import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Box } from "../../box";
import { Span } from "../../span";
import { Loader } from "../loader";

/**
 * The one Loader tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * Both branches that resolve a slot through `children()` are here, and that is what the round trip
 * is for. `children()` resolves in the **ambient owner**, ahead of the element that surrounds it,
 * so it does not consume the hydration key (`_hk`) a raw read at that position would — meaning the
 * whole subtree after it keys differently than the naive reading suggests. Server and client have
 * to agree on that, or `hydrate()` reuses a server node under a client tree, or silently gives up
 * and client-renders the page. Neither says anything on its own; `hydrateFixture` is what turns
 * both into a failure.
 *
 * The first Loader takes both slots as **element props** — the getter form, the one that multiplies
 * on re-read. The second takes neither, so its spinner is the default built inside `children()`,
 * and its children go through the `visibility: hidden` wrapper under a real positioned ancestor.
 */
export function Tree(): JSX.Element {
  return (
    <Box position="relative" width="200px" data-probe="root">
      <Loader
        spinner={<Span data-probe="custom-spinner">◐</Span>}
        text={<Span data-probe="text">Saving…</Span>}
      />
      <Loader>
        <Span data-probe="label">Save</Span>
      </Loader>
    </Box>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=loader`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
