/**
 * Not a component — a re-export, so `@chakra-ui-solid/components/environment` resolves where a
 * reader coming from Chakra expects it to.
 *
 * The context itself lives in `@chakra-ui-solid/system`, because machines consume it and the system
 * layer is what machines depend on. Chakra's own `components/environment/index.ts` is a pure
 * re-export of Ark's provider for the same reason (`plan.md` §7.2; `roadmap.md` §4.5).
 */

export type {
  EnvironmentContext,
  EnvironmentProviderProps,
  RootNode,
} from "@chakra-ui-solid/system";
export { EnvironmentProvider, useEnvironmentContext } from "@chakra-ui-solid/system";
