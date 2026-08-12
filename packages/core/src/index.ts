/**
 * @license
 * Portions of this file are derived from Zag.js (`@zag-js/solid`,
 * `packages/frameworks/solid/src/index.ts`).
 * Copyright (c) 2021 Chakra UI
 * https://github.com/chakra-ui/zag
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

/**
 * The package barrel. Its `src/zag/` half is the SolidJS 2.0 adapter for Zag.js machines —
 * `useMachine`, plus the prop normalize/merge helpers a Zag-backed component needs. It is
 * re-exported from here rather than from a barrel of its own, because a barrel that only
 * re-exports is erased at bundle time and takes the `@license` header above with it.
 *
 * **Provenance of `src/zag/`:** started as a vendored fork of `@zag-js/solid@1.42.0` (`chakra-ui/zag`,
 * `packages/frameworks/solid`, MIT), because the official adapter targets Solid 1.x. It began as a
 * *minimal-diff* fork so the eventual swap back would be a drop-in; **that constraint has been
 * lifted**, and the adapter is now written the way SolidJS 2.0 wants rather than the way Solid 1.x
 * did. The public API (`useMachine`, `mergeProps`, `normalizeProps`) is unchanged, so a component
 * written against it still ports, but the internals are ours:
 *
 * - **`mergeProps` is a lazy proxy** (`$PROXY` + traps), the shape SolidJS's own `merge` uses,
 *   rather than an eager key-set enumeration with a getter per key. Nothing is read at construction,
 *   so there is no untracked read to explain away, and the key set is no longer frozen. Its
 *   structural traps (`has`/`ownKeys`) are deliberately untracked — see `merge-props.ts`.
 * - **Seed reads are named.** `useMachine` runs the machine's construction callbacks through
 *   `seedFromProps`, so a consumer writes a bare `useMachine(...)` in a render body instead of
 *   wrapping it in an `untrack` of its own (both `ZagDialog` and `ZagListbox` used to).
 * - **No React-shaped state.** `{ current }` ref boxes are plain closure variables; `bindable`
 *   memoizes its params instead of rebuilding them on every read; `useSyncExternalStore` is gone
 *   (it existed only for 1:1 API parity and nothing consumed it).
 * - `onMount` → `onSettled`, `mergeProps` → `merge`, and the split `createEffect(compute, effect)`
 *   pair, because 2.0 removed the alternatives outright.
 * - **`bindable`'s signal is boxed** (`{ value: T }` + an unwrapping `equals`): 2.0's
 *   `createSignal(fn)` is the memo overload and would invoke a function-valued state.
 * - **`flush` is Solid 2.0's real `flush`**, not upstream's no-op. 1.x propagated writes
 *   synchronously; 2.0's client build defers them, so the machine's state write is drained at the
 *   call site — what the React adapter spells `flushSync`.
 * - **`normalizeProps` stringifies boolean `aria-*` values** — a bug fix rather than a migration.
 *   Solid's `setAttribute` writes `true` as `""` and drops the attribute for `false`, so Zag's
 *   boolean ARIA state shipped as `aria-modal=""` or as nothing at all. Upstream has the same bug.
 * - `Key` (from `@solid-primitives/keyed`) is not re-exported: uninstalled, and no Zag component
 *   needs keyed rendering yet.
 *
 * See `__internal__/zag-solid/machine.md` for the deviation table, and
 * `__internal__/zag-solid-adapter.md` for what the fork is and when it retires.
 */

export type {
  EnvironmentContext,
  EnvironmentProviderProps,
  RootNode,
} from "./environment/environment";
export { EnvironmentProvider, useEnvironmentContext } from "./environment/environment";
export type {
  Chakra,
  ChakraComponent,
  ChakraFactoryOptions,
  ChakraStylingProps,
  HTMLChakraProps,
} from "./factory/factory";
export { chakra } from "./factory/factory";
export type { CreateRegisteredIdOptions } from "./internal/create-registered-id";
export { createRegisteredId } from "./internal/create-registered-id";
export type { Locale, LocaleProviderProps, UseFilterProps, UseFilterReturn } from "./locale/locale";
export { LocaleProvider, useFilter, useLocaleContext } from "./locale/locale";
export type { RecipeClassOptions, RecipeFn, SlotRecipeFn } from "./recipe/recipe";
export { createRecipeClass, createSlotClasses } from "./recipe/recipe";
export type {
  PropsProviderProps,
  RecipeContext,
  RecipeContextOptions,
} from "./recipe/recipe-context";
export { createRecipeContext } from "./recipe/recipe-context";
export type { RenderElementOptions, RenderProp } from "./render/render";
export { renderElement } from "./render/render";
export type { DisplacedHtmlProp, HtmlProps, PatchHtmlProps } from "./render-styled/html-props";
export { HTML_PROP_RENAMES } from "./render-styled/html-props";
export type { CssProp, PlainCssValue, RenderStyledOptions } from "./render-styled/render-styled";
export { composeCss, composeStyle, renderStyled } from "./render-styled/render-styled";
export type { WithDefaults } from "./utils/defaults";
export { withContextDefaults, withDefaults } from "./utils/defaults";
export type { EventHandlerEvent } from "./utils/events";
export { composeEventHandlers } from "./utils/events";
export type { KeyboardEventFor, KeyboardHandler } from "./utils/keymap";
export { createKeyboardHandler } from "./utils/keymap";
export { runIfFunction } from "./utils/run-if-function";
export { useMachine } from "./zag/machine";
export { mergeProps } from "./zag/merge-props";
export type { PropTypes } from "./zag/normalize-props";
export { normalizeProps } from "./zag/normalize-props";
