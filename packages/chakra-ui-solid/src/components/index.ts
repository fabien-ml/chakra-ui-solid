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
} from "@chakra-ui-solid/core";
export { chakra } from "@chakra-ui-solid/core";
export * from "./absolute-center";
export * from "./aspect-ratio";
export * from "./bleed";
export * from "./box";
export * from "./center";
export * from "./circle";
export * from "./container";
export * from "./em";
export * from "./environment";
export * from "./flex";
export * from "./float";
export * from "./grid";
export * from "./group";
export * from "./locale";
export * from "./quote";
export * from "./simple-grid";
export * from "./spacer";
export * from "./span";
export * from "./square";
export * from "./stack";
export * from "./sticky";
export * from "./strong";
export * from "./visually-hidden";
export * from "./wrap";
