/**
 * The package root. `chakra` is re-exported here because that is where `@chakra-ui/react` exports
 * it, and the re-export has to keep its **bare specifier** — that is what makes it a factory: Panda
 * registers `chakra` only when the module it was imported from is in the consumer's `importMap` and
 * the imported name equals `jsxFactory`. Bundled into a relative chunk it registers nothing, and
 * every `<chakra.button>` in the consumer's app then produces zero rules with no error.
 */
// The five names under `CreateSystemOptions` are the augmentation seam `styled-system/chakra-system-types.d.ts`
// writes into, and they are re-exported here because a `declare module` merges into the interface
// the module it names *exports* — name one that exports none and TypeScript declares a second,
// unrelated interface and reports nothing. `chakra-ui-solid` is the only specifier a consumer can
// name, since pnpm's isolated `node_modules` does not resolve `@chakra-ui-solid/core` from theirs.
export type {
  Chakra,
  ChakraComponent,
  ChakraFactoryOptions,
  ChakraProviderProps,
  ChakraStylingProps,
  CreateSystemOptions,
  CssFn,
  CustomConditions,
  CustomStyleProps,
  CxFn,
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  RecipeVariantOverrides,
  SystemContext,
} from "@chakra-ui-solid/core";
// A consumer cannot reach `@chakra-ui-solid/core` themselves — pnpm's strict layout does not resolve
// a dependency of ours from their node_modules — so a core export they are meant to call has to
// surface here or it ships unreachable. `ChakraProvider` and `createSystem` are the pair every app
// root calls, and nothing renders without them.
export { ChakraProvider, chakra, createSystem, useChakraContext } from "@chakra-ui-solid/core";
export * from "./absolute-center";
export * from "./alert";
export * from "./aspect-ratio";
export * from "./badge";
export * from "./bleed";
export * from "./blockquote";
export * from "./box";
export * from "./breadcrumb";
export * from "./button";
export * from "./card";
export * from "./center";
export * from "./checkmark";
export * from "./circle";
export * from "./code";
export * from "./collapsible";
export * from "./color-swatch";
export * from "./container";
export * from "./data-list";
export * from "./dialog";
export * from "./download-trigger";
export * from "./drawer";
export * from "./em";
export * from "./empty-state";
export * from "./environment";
export * from "./field";
export * from "./fieldset";
export * from "./flex";
export * from "./float";
export * from "./grid";
export * from "./group";
export * from "./heading";
export * from "./icon";
export * from "./input";
export * from "./kbd";
export * from "./link";
export * from "./list";
export * from "./loader";
export * from "./locale";
export * from "./mark";
export * from "./native-select";
export * from "./popover";
export * from "./quote";
export * from "./radiomark";
export * from "./separator";
export * from "./simple-grid";
export * from "./skeleton";
export * from "./skip-nav";
export * from "./spacer";
export * from "./span";
export * from "./spinner";
export * from "./square";
export * from "./stack";
export * from "./stat";
export * from "./status";
export * from "./sticky";
export * from "./strong";
export * from "./table";
export * from "./tabs";
export * from "./tag";
export * from "./text";
export * from "./textarea";
export * from "./timeline";
export * from "./visually-hidden";
export * from "./wrap";
