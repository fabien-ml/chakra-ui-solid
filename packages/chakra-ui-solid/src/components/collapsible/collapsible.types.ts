import type {
  HTMLChakraProps,
  PropsProviderProps,
  RenderStrategyProps,
} from "@chakra-ui-solid/core";
import type { JSX } from "@solidjs/web";
import type { ElementIds, OpenChangeDetails } from "@zag-js/collapsible";

/** The ids of the three elements the machine addresses. Useful for composition. */
export interface CollapsibleElementIds extends ElementIds {}

/** What `onOpenChange` receives. */
export interface CollapsibleOpenChangeDetails extends OpenChangeDetails {}

/**
 * Everything {@link createCollapsible} takes: the machine's own props minus the two the library
 * injects, plus the render strategy.
 *
 * `dir` and `getRootNode` are the two that are missing, and they are missing because they come from
 * the locale and environment contexts rather than from the consumer — `@zag-js/collapsible`'s
 * `props.ts` lists eleven keys, and these are the other nine.
 */
export interface CreateCollapsibleProps extends RenderStrategyProps {
  /**
   * Seeds every id the machine hands out — the root is `collapsible:{id}`, the content
   * `collapsible:{id}:content`, the trigger `collapsible:{id}:trigger`. Defaults to a generated id,
   * and **does not become the root element's own `id`**: pass `ids` to control the attributes
   * themselves.
   */
  id?: string;
  /** Override individual element ids, for pointing an ARIA relationship at a specific one. */
  ids?: CollapsibleElementIds;
  /** The controlled open state. Pass `undefined` for uncontrolled. */
  open?: boolean;
  /** The open state a fresh, uncontrolled collapsible starts in. */
  defaultOpen?: boolean;
  /** Called whenever the open state changes, from either side. */
  onOpenChange?: (details: CollapsibleOpenChangeDetails) => void;
  /** Called once the exit animation has finished and the content is fully closed. */
  onExitComplete?: VoidFunction;
  /** Whether the trigger ignores clicks. */
  disabled?: boolean;
  /**
   * How tall the content stays when closed, instead of collapsing away entirely — the "read more"
   * shape. The content keeps its box and its tabbable children are made `inert`.
   */
  collapsedHeight?: number | string;
  /** The horizontal counterpart of {@link CreateCollapsibleProps.collapsedHeight}. */
  collapsedWidth?: number | string;
}

/**
 * The connected machine, as a **stable object of reactive getters** rather than the snapshot
 * `{ ...api }` React can take. Each read goes back to the live machine, so
 * `<Show when={collapsible.open}>` in a consumer's own tree tracks it.
 *
 * That is the `React→Solid` half, and the name is the other: SolidJS spells a primitive that
 * *creates* something `createX` and reserves `useX` for reading ambient context, so Chakra's
 * `useCollapsible` / `UseCollapsibleReturn` become `createCollapsible` / `CreateCollapsibleReturn`
 * here while `useCollapsibleContext` keeps its name. `useMachine` and `useFilter` are the two
 * exceptions in this repo, and both are exceptions for one reason: the name is upstream's.
 *
 * The last difference is `unmounted`, which is Ark's `isUnmounted` under this library's
 * render-strategy name — the word `RenderStrategy` and every presence-bearing component to come
 * already use for it.
 */
export interface CreateCollapsibleReturn {
  /** Whether the collapsible is open. */
  readonly open: boolean;
  /** Whether the content is in view — open, or still animating closed. */
  readonly visible: boolean;
  /** Whether the trigger ignores clicks. */
  readonly disabled: boolean;
  /** Whether the render strategy says the content does not belong in the DOM at all. */
  readonly unmounted: boolean;
  /** Open or close it. */
  setOpen(open: boolean): void;
  /** Re-measure the content, for when it changed size while open. */
  measureSize(): void;
  getRootProps(): JSX.HTMLAttributes<HTMLDivElement>;
  getTriggerProps(): JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  getContentProps(): JSX.HTMLAttributes<HTMLDivElement>;
  getIndicatorProps(): JSX.HTMLAttributes<HTMLDivElement>;
}

/**
 * The Root's own props, without the div's — what a `PropsProvider` above it may supply.
 *
 * `unstyled` is **not** here, where Chakra's `CollapsibleRootBaseProps` carries it through
 * `UnstyledProp`. It is one of the three props every component in this library takes from
 * `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them on a component's own
 * interface puts it on that component's props table as though the component added it. So `unstyled`
 * reaches a Root as a direct prop and not through a `PropsProvider`, which no Chakra example does.
 */
export interface CollapsibleRootBaseProps extends CreateCollapsibleProps {}

/**
 * `id` comes from {@link CreateCollapsibleProps}, not from the `div`: on the Root it seeds the
 * machine's scope rather than naming the element, so it is a `string` where every Solid DOM `id` is
 * `string | false | undefined`. `<Collapsible.RootProvider>` is the other way round, and its `id` is
 * the element's.
 */
export interface CollapsibleRootProps
  extends Omit<HTMLChakraProps<"div">, "id">,
    CollapsibleRootBaseProps {}

export interface CollapsibleRootProviderProps extends HTMLChakraProps<"div"> {
  /** A machine built by {@link createCollapsible}, so the consumer owns it rather than the Root. */
  value: CreateCollapsibleReturn;
}

export interface CollapsiblePropsProviderProps
  extends PropsProviderProps<CollapsibleRootBaseProps> {}

export interface CollapsibleTriggerProps extends HTMLChakraProps<"button"> {}

export interface CollapsibleContentProps extends HTMLChakraProps<"div"> {}

export interface CollapsibleIndicatorProps extends HTMLChakraProps<"div"> {}

export interface CollapsibleContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (collapsible: CreateCollapsibleReturn) => JSX.Element;
}
