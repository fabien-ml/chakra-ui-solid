import { type Accessor, createMemo } from "solid-js";

export interface RenderStrategyProps {
  /** Delay the first mount until the node is first present. @default false */
  lazyMount?: boolean;
  /** Remove the node from the DOM once it stops being present. @default false */
  unmountOnExit?: boolean;
}

export interface RenderStrategy {
  /** True while the strategy says the node should not be in the DOM at all. */
  unmounted: Accessor<boolean>;
}

/**
 * Chakra's two mounting props — `lazyMount` and `unmountOnExit` — resolved against whatever the
 * owning component calls *present*.
 *
 * **It takes `present` rather than a presence instance**, because the two sources are not the same
 * shape and both exist. Collapsible's presence is the machine's own `api.visible` (it owns its exit
 * animation and ships no `@zag-js/presence` dependency); Dialog's will be a presence machine's
 * `present`. A strategy written against the second would have to be rewritten to serve the first.
 *
 * `wasEverPresent` is a closure variable rather than a signal: it only ever goes false → true, and
 * it is read only after `present()` has been read in the same memo, which is the one edge that can
 * flip it. So no read can see it stale, and nothing has to subscribe to it.
 *
 * The three states it distinguishes:
 *
 * | | never present | present | present, then not |
 * |---|---|---|---|
 * | `lazyMount` | unmounted | mounted | mounted |
 * | `unmountOnExit` | mounted | mounted | unmounted |
 */
export function createRenderStrategy(
  present: Accessor<boolean>,
  options: Accessor<RenderStrategyProps>,
): RenderStrategy {
  let wasEverPresent = false;

  const unmounted = createMemo(() => {
    if (present()) {
      wasEverPresent = true;
      return false;
    }
    return wasEverPresent ? options().unmountOnExit === true : options().lazyMount === true;
  });

  return { unmounted };
}
