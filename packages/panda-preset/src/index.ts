/**
 * One subpath, two exports. There is no `./config`: the consumer who needs the preset and the
 * consumer who needs the config fragment are the same consumer, and a second subpath only adds a
 * way to import half of what they need (`plan.md` §3.3).
 */

export { chakraPreset } from "./chakra-preset";
export type { ChakraConfigOverrides, ConditionalGrain, ResponsiveGrain } from "./config";
export { defineChakraConfig } from "./config";
export { defaultVariantsFor, recipeKeys, slotRecipeKeys, variantKeysFor } from "./contract";
export { defineChakraPreset } from "./define-chakra-preset";
export { chakraSolidPreset, chakraSolidPreset as default, createChakraSolidPreset } from "./preset";
