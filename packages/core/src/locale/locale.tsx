import type { JSX } from "@solidjs/web";
import { createFilter, type FilterOptions, type FilterReturn, isRTL } from "@zag-js/i18n-utils";
import { type Accessor, createContext, createMemo, useContext } from "solid-js";

export interface Locale {
  locale: string;
  dir: "ltr" | "rtl";
}

/**
 * The locale and text direction every machine reads.
 *
 * Two fields, no catalog, no resolver, no message formatting — Chakra ships none of those. Every
 * Zag machine takes `dir` as a prop and every root element sets the `dir` attribute; RTL
 * correctness beyond that rides on the preset, whose recipes are authored against logical
 * properties the browser resolves from `dir` (`plan.md` §7.2, §7.3).
 *
 * It carries a default rather than throwing when there is no provider, because `en-US`/`ltr` is a
 * meaningful fallback and requiring a provider for it would make every component unusable on its
 * own.
 */
const LocaleContext = createContext<Accessor<Locale>>(() => ({ locale: "en-US", dir: "ltr" }));

export interface LocaleProviderProps {
  /** BCP-47 locale tag. Text direction is derived from it. @default "en-US" */
  locale: string;
  children?: JSX.Element;
}

export function LocaleProvider(props: LocaleProviderProps): JSX.Element {
  const locale = createMemo(
    (): Locale => ({
      locale: props.locale,
      dir: isRTL(props.locale) ? "rtl" : "ltr",
    }),
  );

  return <LocaleContext value={locale}>{props.children}</LocaleContext>;
}

export function useLocaleContext(): Accessor<Locale> {
  return useContext(LocaleContext);
}

export interface UseFilterProps extends FilterOptions {}
export interface UseFilterReturn extends Accessor<FilterReturn> {}

/**
 * Locale-aware string matching — `startsWith`, `endsWith`, `contains` — for the collection
 * components' typeahead.
 *
 * It is `createFilter` from `@zag-js/i18n-utils` with the ambient locale filled in, not a
 * reimplementation: the same MIT package the direction check above comes from, and the same one
 * Chakra reaches through Ark.
 */
export function useFilter(props: UseFilterProps): UseFilterReturn {
  const context = useLocaleContext();
  return createMemo(() => createFilter({ ...props, locale: props.locale ?? context().locale }));
}
