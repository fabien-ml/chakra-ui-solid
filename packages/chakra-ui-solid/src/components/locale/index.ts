/**
 * Not a component — a re-export, so `chakra-ui-solid/locale` resolves where a reader coming from
 * Chakra expects it to. See the note in `../environment/index.ts`.
 */

export type {
  Locale,
  LocaleProviderProps,
  UseFilterProps,
  UseFilterReturn,
} from "@chakra-ui-solid/system";
export { LocaleProvider, useFilter, useLocaleContext } from "@chakra-ui-solid/system";
