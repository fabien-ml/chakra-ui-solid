import { type Context, createContext, useContext } from "solid-js";

/**
 * A context whose reader names the component family when there is no provider above it.
 *
 * SolidJS 2.0 already throws for a context created without a default value — that is what makes the
 * `undefined` first argument load-bearing here rather than incidental, and
 * `solid-contract.test.ts` pins both halves of it. What the throw does not say is *which* component
 * was used outside its root, and the raw message ("Context must either be created with a default
 * value or read under a provider") sends a reader to Solid's docs rather than to the missing
 * `<Collapsible.Root>`.
 *
 * ```ts
 * const [CollapsibleProvider, useCollapsibleContext] =
 *   createComponentContext<CollapsibleContextValue>("Collapsible");
 * ```
 *
 * The provider is the context object itself — 2.0 renders a context as a component, so there is no
 * separate `.Provider` to return.
 */
export function createComponentContext<Value>(name: string): [Context<Value>, () => Value] {
  const Context = createContext<Value>(undefined, { name: `${name}Context` });

  const useComponentContext = (): Value => {
    try {
      return useContext(Context);
    } catch {
      throw new Error(`${name} sub-components must be rendered inside a ${name} root component.`);
    }
  };

  return [Context, useComponentContext];
}
