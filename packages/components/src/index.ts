/**
 * The package root. `chakra` is re-exported here because that is where `@chakra-ui/react` exports
 * it, and the re-export has to keep its **bare specifier** — that is what makes it a factory: Panda
 * registers `chakra` only when the module it was imported from is in the consumer's `importMap` and
 * the imported name equals `jsxFactory`. Bundled into a relative chunk it registers nothing, and
 * every `<chakra.button>` in the consumer's app then produces zero rules with no error.
 */
export type {
  Chakra,
  ChakraComponent,
  ChakraFactoryOptions,
  ChakraStylingProps,
  HTMLChakraProps,
} from "@chakra-ui-solid/system";
export { chakra } from "@chakra-ui-solid/system";
export * from "./box";
export * from "./environment";
export * from "./locale";
