/**
 * Not a component — a re-export, so `chakra-ui-solid/environment` resolves where a reader coming
 * from Chakra expects it to.
 *
 * The context itself lives in `@chakra-ui-solid/core`, because machines consume it and the core
 * layer is what machines depend on. Chakra's own `components/environment/index.ts` is a pure
 * re-export of Ark's provider for the same reason (`plan.md` §7.2; `roadmap.md` §4.5).
 */

export type {
  EnvironmentContext,
  EnvironmentProviderProps,
  RootNode,
} from "@chakra-ui-solid/core";
export { EnvironmentProvider, useEnvironmentContext } from "@chakra-ui-solid/core";
