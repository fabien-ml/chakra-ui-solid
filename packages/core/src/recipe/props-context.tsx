import type { JSX } from "@solidjs/web";
import { type Component, createContext, untrack, useContext } from "solid-js";

export interface PropsProviderProps<Props extends object> {
  /** Props supplied to every matching component below, each one a local prop can override. */
  value: Partial<Props>;
  children?: JSX.Element;
}

/** What {@link createPropsContext} returns — the ancestor that pushes props down, and its reader. */
export interface PropsContext<Props extends object> {
  /** The ancestor that pushes props down — `<ButtonGroup>` and `<Collapsible.PropsProvider>`. */
  PropsProvider: Component<PropsProviderProps<Props>>;
  /** The bag the nearest provider supplied, or an empty one. */
  usePropsContext(): Partial<Props>;
}

/**
 * Chakra's props context: an ancestor supplies a component's props from above, and a local prop
 * still wins.
 *
 * Every machine component has one — Chakra's namespace carries `PropsProvider` on all of them — and
 * a recipe-bound component gets it through {@link createRecipeContext}, which is nothing but this
 * plus the recipe seam. It is its own function so a component that is not minted by `withContext`
 * (Button, and every machine Root) reuses the provider's untracked key-set snapshot rather than
 * writing a second one that looks the same and drops a hazard.
 */
export function createPropsContext<Props extends object>(): PropsContext<Props> {
  // Defaulted rather than Chakra's `strict: false` plus an undefined check at every read: no
  // provider is the overwhelmingly common case — a `<Text>` with no ancestor supplying it is not a
  // mistake — so the empty bag is the answer, not a branch. The repo's other contexts carry an
  // `Accessor<Value>`; this one carries a **props object**, for the reason the provider states.
  const Context = createContext<Partial<Props>>({});

  const usePropsContext = () => useContext(Context);

  const PropsProvider: Component<PropsProviderProps<Props>> = (props) => {
    // A props object of getters, never the accessor the shape suggests. Solid's `merge` turns a
    // **function** source into a memo, and `renderStyled` enumerates the merged bag in a component
    // body — reading a memo there is the `STRICT_READ_UNTRACKED` diagnostic `mount()` fails on
    // (measured). A plain object enumerates without reading anything, which is the shape
    // `withDefaults` already uses for the same reason.
    //
    // So the key SET is snapshotted here, deliberately untracked, and each VALUE stays lazy — the
    // same split `renderStyled` makes over its own style props, and what lets
    // `<ButtonGroup size={size()}>` re-resolve every component below when the signal changes.
    const provided = Object.defineProperties(
      {},
      Object.fromEntries(
        untrack(() => Object.keys(props.value)).map((key) => [
          key,
          {
            get: () => (props.value as Record<string, unknown>)[key],
            enumerable: true,
            configurable: true,
          },
        ]),
      ),
    ) as Partial<Props>;

    return <Context value={provided}>{props.children}</Context>;
  };

  return { PropsProvider, usePropsContext };
}
