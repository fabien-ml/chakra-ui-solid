import { createContext, useContext } from "solid-js";

/**
 * Whether there is a {@link Group} directly above — a marker with no value beyond its own presence.
 *
 * A plain `createContext(false)` rather than `createComponentContext`, because "no Group above me"
 * is the ordinary case and already has an answer: a child that renders perfectly well on its own has
 * nothing for a missing-provider throw to say.
 *
 * **It exists for one thing CSS cannot express.** Which child is first, last or in between is
 * structural and `group.tsx` selects on it directly; *being a group item at all* is not, because the
 * preset's avatar recipe rings a grouped avatar through `&[data-group-item]` and that selector is a
 * dependency's — we never re-emit a recipe body, so the attribute has to come from our side. React
 * writes it with `Children.toArray` + `cloneElement`; Solid has no `cloneElement`, and the child
 * asking whether it is in a group costs no effect, no resolution pass and no SSR
 * (`__internal__/decisions.md`, *A positional fact about a child is a selector*).
 */
const GroupItemContext = createContext(false);

/**
 * Wraps a `Group`'s children so each can ask whether it is one of them.
 *
 * The children must be **built inside it**: SolidJS resolves context through the owner that created
 * a component, so children read into a local in `Group`'s own body would be constructed under
 * `Group`'s owner and answer `false` — the same rule `Stack`'s separator provider carries.
 */
export { GroupItemContext as GroupItemProvider };

/**
 * Whether this component is a direct child of a `Group`, for the one component that has to write a
 * `data-group-item` attribute the preset's CSS keys on.
 */
export const useIsGroupItem = (): boolean => useContext(GroupItemContext);
