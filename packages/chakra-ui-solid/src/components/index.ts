/**
 * The package root. `chakra` is re-exported here because that is where `@chakra-ui/react` exports
 * it, and the re-export has to keep its **bare specifier** — that is what makes it a factory: Panda
 * registers `chakra` only when the module it was imported from is in the consumer's `importMap` and
 * the imported name equals `jsxFactory`. Bundled into a relative chunk it registers nothing, and
 * every `<chakra.button>` in the consumer's app then produces zero rules with no error.
 */
// `RecipeVariantOverrides` here and the two below it are the augmentation seam
// `styled-system/chakra-system-types.d.ts` writes into, and they are re-exported because a `declare
// module` merges into the interface the module it names *exports* — name one that exports none and
// TypeScript declares a second, unrelated interface and reports nothing. `chakra-ui-solid` is the
// only specifier a consumer can name, since pnpm's isolated `node_modules` does not resolve a
// dependency of ours from theirs.
export type {
  Chakra,
  ChakraComponent,
  ChakraFactoryOptions,
  ChakraProviderProps,
  ChakraStylingProps,
  CreateSystemOptions,
  CssFn,
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
// The other two seams, and they are Panda's own interfaces rather than a pair of ours. That is what
// makes a name a consumer's config invented legal *everywhere* a style key is: every style-object
// type in the library is derived from `SystemProperties` and `Conditions`, so one generated row
// reaches the JSX prop, the `css` prop, a nested condition and a recipe body alike. A pair of ours
// could only be mixed into the JSX props, which is a top-level prop and an unknown key one line in.
export type { Conditions, SystemProperties } from "@chakra-ui-solid/styled-system/types";
export * from "./absolute-center";
export * from "./alert";
export * from "./aspect-ratio";
export * from "./avatar";
export * from "./badge";
export * from "./bleed";
export * from "./blockquote";
export * from "./box";
export * from "./breadcrumb";
export * from "./button";
export * from "./card";
export * from "./center";
export * from "./checkbox";
export * from "./checkbox-card";
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
export * from "./input-addon";
export * from "./input-element";
export * from "./input-group";
export * from "./kbd";
export * from "./link";
export * from "./list";
export * from "./loader";
export * from "./locale";
export * from "./mark";
export * from "./native-select";
export * from "./popover";
export * from "./portal";
export * from "./quote";
export * from "./radio-group";
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
export * from "./switch";
export * from "./table";
export * from "./tabs";
export * from "./tag";
export * from "./text";
export * from "./textarea";
export * from "./timeline";
export * from "./visually-hidden";
export * from "./wrap";
