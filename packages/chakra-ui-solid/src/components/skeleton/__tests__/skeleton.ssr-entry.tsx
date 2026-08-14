import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Box } from "../../box";
import { Skeleton, SkeletonCircle, SkeletonPropsProvider, SkeletonText } from "../skeleton";

/**
 * The one Skeleton tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * `SkeletonText` is why this entry exists: its tree is conditional on a **count**, and on a boolean
 * that changes that count. Two lines, three lines and a `loading={false}` collapse to one are three
 * different numbers of hydration keys (`_hk` is the positional marker Solid matches server and
 * client nodes by), so a miscounted list shifts every sibling after it — and both failure modes are
 * silent, since a placeholder still looks like a placeholder either way.
 *
 * `SkeletonCircle` is the other half: it is one element built from two components, because `render`
 * hands the Circle's computed props to the Skeleton rather than nesting them. A side that resolved
 * that differently would spend a different number of keys for the same visible circle.
 *
 * Each `SkeletonText` sits inside a probe `Box` rather than carrying the attribute itself, because
 * every prop a SkeletonText does not claim goes to the **lines** — so a `data-probe` on one would
 * land on each of them.
 */
export function Tree(): JSX.Element {
  return (
    <Box data-probe="root">
      <Skeleton height="5" data-probe="plain" />
      <SkeletonCircle size="10" data-probe="circle" />
      <Box data-probe="two-lines">
        <SkeletonText noOfLines={2} />
      </Box>
      <Box data-probe="three-lines">
        <SkeletonText noOfLines={3} gap="4" />
      </Box>
      <Box data-probe="loaded">
        <SkeletonText loading={false}>
          <span>Chakra UI is cool</span>
        </SkeletonText>
      </Box>
      <SkeletonPropsProvider value={{ variant: "shine" }}>
        <Skeleton height="5" data-probe="from-context" />
      </SkeletonPropsProvider>
    </Box>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=skeleton`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
