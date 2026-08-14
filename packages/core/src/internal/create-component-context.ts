import { type Context, createContext, useContext } from "solid-js";

/**
 * Stands in for "no provider above this read". A module-private symbol, so no context value a
 * consumer can construct is ever mistaken for it.
 */
const NO_PROVIDER = Symbol("chakra-ui-solid/no-provider");
type NoProvider = typeof NO_PROVIDER;

/**
 * A context with two readers: one that names the component family when there is no provider above
 * it, and one that answers `undefined` instead.
 *
 * SolidJS 2.0 throws for a context created without a default value, and the raw message ("Context
 * must either be created with a default value or read under a provider") sends a reader to Solid's
 * docs rather than to the missing `<Collapsible.Root>`. Naming the family is worth more than that
 * message, so the context carries {@link NO_PROVIDER} as its default and the strict reader raises
 * the named error itself — the sentinel is what lets the *optional* reader exist at all, since a
 * throw from the read cannot be told apart from a throw inside a provider's own value.
 *
 * ```ts
 * const [CollapsibleProvider, useCollapsibleContext] =
 *   createComponentContext<CollapsibleContextValue>("Collapsible");
 * ```
 *
 * The third member is for a component that is *usable* outside the root and only enriched inside it
 * — a form control adopting the surrounding `Field.Root`'s ids and state, and rendering perfectly
 * well standing alone:
 *
 * ```ts
 * const [FieldProvider, useFieldContext, useOptionalFieldContext] =
 *   createComponentContext<FieldContextValue>("Field");
 * ```
 *
 * The provider is the context object itself — 2.0 renders a context as a component, so there is no
 * separate `.Provider` to return.
 */
export function createComponentContext<Value>(
  name: string,
): [Context<Value>, () => Value, () => Value | undefined] {
  const ComponentContext = createContext<Value | NoProvider>(NO_PROVIDER, {
    name: `${name}Context`,
  });

  const useComponentContext = (): Value => {
    const value = useContext(ComponentContext);
    if (value === NO_PROVIDER) {
      throw new Error(`${name} sub-components must be rendered inside a ${name} root component.`);
    }
    return value;
  };

  const useOptionalContext = (): Value | undefined => {
    const value = useContext(ComponentContext);
    return value === NO_PROVIDER ? undefined : value;
  };

  return [ComponentContext as Context<Value>, useComponentContext, useOptionalContext];
}
