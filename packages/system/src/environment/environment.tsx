import type { JSX } from "@solidjs/web";
import { getDocument, getWindow } from "@zag-js/dom-query";
import { type Accessor, createContext, createMemo, createSignal, Show, useContext } from "solid-js";

export type RootNode = ShadowRoot | Document | Node;

export interface EnvironmentContext {
  /** The root node every machine looks elements up against. @default document */
  getRootNode(): RootNode;
  /** The document owning that root node. @default document */
  getDocument(): Document;
  /** The window owning that root node. @default window */
  getWindow(): Window & typeof globalThis;
}

/**
 * Where a machine looks up its own elements.
 *
 * It exists because `document.getElementById` is the wrong question inside a shadow root or an
 * iframe: the element is there, the lookup returns `null`, and the machine's focus management and
 * outside-click detection stop working with nothing to say so. Every Zag machine takes
 * `getRootNode` for this reason.
 *
 * Defaulted rather than mandatory — the overwhelmingly common answer is `document`, and requiring a
 * provider for it would make every component unusable on its own.
 */
const Context = createContext<Accessor<EnvironmentContext>>(() => ({
  getRootNode: () => document,
  getDocument: () => document,
  getWindow: () => window,
}));

export interface EnvironmentProviderProps {
  /** The root node, or a function returning it. Omit it and the provider discovers its own. */
  value?: RootNode | (() => RootNode);
  children?: JSX.Element;
}

export function EnvironmentProvider(props: EnvironmentProviderProps): JSX.Element {
  const [probe, setProbe] = createSignal<HTMLSpanElement>();

  // With no explicit `value`, the root node is discovered by asking a real DOM node inside this
  // subtree what its root is — which is the only way to learn that the subtree was mounted into a
  // shadow root. The probe renders only in that case, so a provider given an explicit value adds
  // no element to the tree.
  const getRootNode = () => {
    const value = props.value;
    if (value !== undefined) {
      return typeof value === "function" ? value() : value;
    }
    return probe()?.getRootNode() ?? document;
  };

  const environment = createMemo(
    (): EnvironmentContext => ({
      getRootNode,
      getDocument: () => getDocument(getRootNode()),
      getWindow: () => getWindow(getRootNode()),
    }),
  );

  return (
    <Context value={environment}>
      {props.children}
      <Show when={props.value === undefined}>
        <span hidden ref={setProbe} />
      </Show>
    </Context>
  );
}

export function useEnvironmentContext(): Accessor<EnvironmentContext> {
  return useContext(Context);
}
