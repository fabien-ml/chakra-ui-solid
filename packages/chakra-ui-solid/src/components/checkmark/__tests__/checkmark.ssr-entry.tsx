import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Box } from "../../box";
import { Checkmark } from "../checkmark";

/**
 * The one Checkmark tree the `ssr` and `browser` projects share, so the server render they compare
 * is the same subject rather than two hand-kept copies.
 *
 * All three branches are here, in the order that makes them adjacent siblings. A `Switch` renders
 * one of its arms and **the arms are not the same size**: indeterminate draws a `path`, checked
 * draws a `polyline`, unchecked draws nothing at all. Each consumes a different count of hydration
 * keys (`_hk`), so the branch the server took has to be the branch the client takes, and every
 * sibling after it shifts if they disagree. Neither mismatch says anything on its own — the markup,
 * the glyph and the styles all still look right — and `hydrateFixture` is what turns both into a
 * failure.
 *
 * `unstyled` is on the last one because that is how a Checkbox indicator renders it, and it takes a
 * different path through the class getter: the recipe drops out and only the presentation style
 * props remain, which server and client still have to name identically.
 */
export function Tree(): JSX.Element {
  return (
    <Box data-probe="root">
      <Checkmark data-probe="unchecked" />
      <Checkmark checked size="lg" data-probe="checked" />
      <Checkmark indeterminate variant="outline" filled data-probe="indeterminate" />
      <Checkmark checked unstyled data-probe="unstyled" />
    </Box>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=checkmark`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
