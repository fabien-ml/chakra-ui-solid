import {
  createRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PresetVariantProps,
} from "@chakra-ui-solid/core";
import type { InputAddonVariantProps } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The two variants spelled out rather than inherited from the generated `InputAddonVariantProps`, so
 * each carries a description a reader can use and a type they can read — Badge's precedent, and this
 * is the interface the docs page's props table is built from. It names Chakra's own variants; what
 * the seam partitions by is whatever the system's `inputAddon` recipe accepts.
 */
export interface InputAddonProps extends HTMLChakraProps<"div">, PresetVariantProps<"inputAddon"> {
  /**
   * The horizontal padding and text style together — the same seven steps `Input` has, so an addon
   * and the field beside it are matched by giving both the same value. Each step also publishes the
   * field height it pairs with as `--input-height`; the addon's own height comes from the row it
   * stretches to fill.
   *
   * @default "md"
   */
  size?: ConditionalValue<
    "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | PresetVariant<"inputAddon", "size">
  >;
  /**
   * How the addon is drawn, mirroring `Input`'s three — `outline` is a filled block with a full
   * border, `subtle` fills more strongly behind a transparent one, and `flushed` keeps only the
   * bottom edge with no radius or horizontal padding.
   *
   * @default "outline"
   */
  variant?: ConditionalValue<
    "outline" | "subtle" | "flushed" | PresetVariant<"inputAddon", "variant">
  >;
}

// The seam's props context is left **dormant**: `withContext` reads it, and nothing publishes to
// it, because upstream's `input-addon/index.ts` exports only the component and its props type. A
// provider we export and Chakra does not is an API a consumer can see that Chakra v3 lacks, which
// is a divergence rather than a convenience (`CLAUDE.md`, *The port rule*). Two addons are kept in
// step by giving both the same `size`, as the note below says.
const { withContext } = createRecipeContext<InputAddonProps, InputAddonVariantProps>({
  recipe: "inputAddon",
});

/**
 * InputAddon — the static label welded to the side of a field, styled by the `inputAddon` recipe.
 *
 * It renders a `div` and belongs inside an attached `Group`, which is what collapses the seam
 * between the two and rounds only the outer corners:
 *
 * ```tsx
 * <Group attached>
 *   <InputAddon>https://</InputAddon>
 *   <Input placeholder="yoursite.com" />
 * </Group>
 * ```
 *
 * `size` and `variant` are not inherited from the field — give the addon the same values you gave
 * the `Input`, or the two steps will not line up.
 */
export const InputAddon = withContext("div");
