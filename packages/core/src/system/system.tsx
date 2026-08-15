import type { RecipeCreatorFn, SystemStyleObject } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import { type Accessor, createMemo } from "solid-js";
import { createComponentContext } from "../internal/create-component-context";

/** One argument to `css()` — a style object, or one of the falsy values it skips. */
type StyleArgument = SystemStyleObject | undefined | null | false;

/**
 * Panda's `css()`: variadic, merging left to right, and returning a class **string**. It writes no
 * rule and touches no stylesheet — the rules were generated at build time and this only recomputes
 * the names they were generated under.
 */
export type CssFn = (...styles: (StyleArgument | StyleArgument[])[]) => string;

/** Panda's `cx()` — joins class names, skipping the falsy ones. */
export type CxFn = (...classes: (string | boolean | null | undefined)[]) => string;

/**
 * The styling runtime a `<ChakraProvider>` hands to everything below it.
 *
 * A consumer generates it with their own Panda run, so the class names on the element and the rules
 * in their stylesheet come out of one config. That is the whole point: a custom `utilities` entry
 * is a style prop here because *their* `isCssProperty` says so, and a renamed recipe class matches
 * because *their* recipe computed it.
 *
 * ```tsx
 * import { ChakraProvider, createSystem } from "chakra-ui-solid"
 * import * as css from "./styled-system/css"
 * import { isCssProperty } from "./styled-system/jsx/is-valid-prop"
 *
 * const system = createSystem({ ...css, isCssProperty })
 *
 * <ChakraProvider value={system}>
 *   <App />
 * </ChakraProvider>
 * ```
 *
 * The interface is ours and structural, so an object assembled by hand satisfies it as well as one
 * Panda generated — the member types are Panda's published ones only so that a generated runtime
 * type-checks against it whatever version emitted it.
 */
export interface SystemContext {
  /** Compute a class name from one or more style objects. */
  css: CssFn;
  /** Build a recipe — the inline `cva` config the `chakra` factory takes. */
  cva: RecipeCreatorFn;
  /** Join class names. */
  cx: CxFn;
  /** Whether a prop name is a style prop rather than a DOM attribute. */
  isValidProperty: (property: string) => boolean;
}

/**
 * What {@link createSystem} takes: the generated `styled-system/css` namespace, plus
 * `isCssProperty` from `styled-system/jsx/is-valid-prop`.
 *
 * The names are Panda's, not ours, so the whole thing spreads in — `createSystem({ ...css,
 * isCssProperty })` — and a namespace carrying extra members (`sva`, and whatever a later Panda
 * adds) is accepted rather than a type error.
 */
export interface CreateSystemOptions {
  css: CssFn;
  cva: RecipeCreatorFn;
  cx: CxFn;
  isCssProperty: (property: string) => boolean;
}

/**
 * Assembles a {@link SystemContext} from a Panda-generated styled-system.
 *
 * ```ts
 * import * as css from "./styled-system/css"
 * import { isCssProperty } from "./styled-system/jsx/is-valid-prop"
 *
 * export const system = createSystem({ ...css, isCssProperty })
 * ```
 */
export function createSystem(options: CreateSystemOptions): SystemContext {
  return {
    css: options.css,
    cva: options.cva,
    cx: options.cx,
    isValidProperty: options.isCssProperty,
  };
}

const MISSING_PROVIDER =
  "chakra-ui-solid components must be rendered inside a <ChakraProvider>, which hands them the " +
  "styled-system their class names are computed from.";

// The context carries an **accessor**, not the system itself, because SolidJS contexts are not
// reactive: a provider handed a new value leaves every class already computed below it untouched,
// so a runtime theme swap would silently do nothing. An accessor read inside each `class` getter is
// the Solid-native stand-in for React's re-render.
const [SystemContextProvider, useChakraContext] = createComponentContext<Accessor<SystemContext>>(
  "Chakra",
  MISSING_PROVIDER,
);

export { useChakraContext };

export interface ChakraProviderProps {
  /**
   * The styled-system, or a function returning it. Pass a signal to swap the whole look and feel at
   * runtime — every element below recomputes its classes.
   */
  value: SystemContext | Accessor<SystemContext>;
  children?: JSX.Element;
}

/**
 * Supplies the styled-system every chakra-ui-solid component styles itself from. One at the app
 * root is the usual shape; nesting a second one restyles that subtree.
 *
 * ```tsx
 * import { ChakraProvider } from "chakra-ui-solid"
 * import { system } from "../styled-system/chakra-system"
 *
 * <ChakraProvider value={system}>
 *   <App />
 * </ChakraProvider>
 * ```
 *
 * It renders no element and injects no stylesheet — the `@layer` order and any `globalCss` come out
 * of the sheet your own Panda build emits.
 */
export function ChakraProvider(props: ChakraProviderProps): JSX.Element {
  // Normalised here rather than at every read, so a consumer may pass a plain object and the
  // hundred `class` getters below still read one shape.
  const system = createMemo(() => {
    const value = props.value;
    return typeof value === "function" ? value() : value;
  });

  return <SystemContextProvider value={system}>{props.children}</SystemContextProvider>;
}
