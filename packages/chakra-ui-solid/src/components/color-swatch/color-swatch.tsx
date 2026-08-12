import {
  composeStyle,
  createRecipeClass,
  createRecipeContext,
  type HTMLChakraProps,
  renderStyled,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import { type ColorSwatchVariantProps, colorSwatch } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, For, merge, omit, untrack } from "solid-js";
import { Grid } from "../grid";

/**
 * The two variants spelled out rather than inherited from the generated `ColorSwatchVariantProps`,
 * so each carries a description a reader can use and a type they can read — a generated type has
 * neither, and this is the interface the docs page's props table is built from. Drift is caught by
 * {@link VARIANT_KEYS}, which is typed against the generated variants.
 */
export interface ColorSwatchProps extends HTMLChakraProps<"span"> {
  /**
   * The colour to show, as any CSS colour — `#bada55`, `rgba(255, 0, 0, 0.5)`, `tomato`.
   *
   * **Required, where the React version's own usage snippet omits it.** It is painted as a gradient
   * over the checkerboard, and both live in one `background` shorthand: with no colour the
   * shorthand is invalid at computed-value time and reverts to its initial value, so the swatch
   * loses the checkerboard too and renders as nothing at all.
   */
  value: string;
  /**
   * The swatch's width and height together, as a scale step. `inherit` takes the size from an
   * enclosing swatch, which is how {@link ColorSwatchMix} sizes its cells; `full` fills the parent.
   *
   * @default "md"
   */
  size?: ConditionalValue<"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "inherit" | "full">;
  /**
   * The corner treatment — `rounded` is the theme's own radius, `square` has none, `circle` is a
   * full radius.
   *
   * @default "rounded"
   */
  shape?: ConditionalValue<"square" | "circle" | "rounded">;
}

/** The DOM props ColorSwatch forwards to the rendered element. */
type ColorSwatchElementProps = ComponentProps<"span">;

/**
 * The recipe's own inputs, as literal keys typed against the generated variants. A variant renamed
 * upstream stops the build here rather than reaching the DOM as an attribute, and the test asserts
 * the same equality at runtime against `colorSwatch.variantKeys`.
 */
const VARIANT_KEYS = ["size", "shape"] as const satisfies readonly (keyof ColorSwatchVariantProps &
  keyof ColorSwatchProps)[];

/**
 * The props context on its own — no `withContext`, and no recipe handed to the seam, which is
 * `Button`'s shape and for the same reason: this body is more than the recipe class plus the
 * style-prop pipeline. It writes an inline custom property and a `data-value`.
 */
const { PropsProvider, usePropsContext } = createRecipeContext<ColorSwatchProps>();

/**
 * ColorSwatch — a preview of one colour, painted over a checkerboard so an alpha channel reads.
 *
 * **The colour rides an inline CSS custom property, and on this row that is the whole design.** The
 * recipe's `background` is two layers: `linear-gradient(var(--color), var(--color))` over a
 * `repeating-conic-gradient` checkerboard. The React version supplies `--color` through `css`, which
 * here is Panda — and `value` is an arbitrary runtime string, so Panda would have nothing to
 * extract, emit no rule, and leave a swatch that paints no colour and raises no error
 * (`CLAUDE.md`, *The hazard*). So it takes the third route: the `style` attribute, which is not CSS
 * a build has to generate. `--swatch-size` is the opposite case and needs nothing — the recipe's
 * nine `size` variants set it, and all nine are pre-generated.
 *
 * One consequence worth naming: our `--color` is an inline style and therefore beats a consumer's
 * `css={{ "--color": … }}`, where the React version layers theirs on top. The route forces it, and
 * it is the same trade `Grid` makes for its track lists.
 */
export const ColorSwatch: Component<ColorSwatchProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order, and the seam's. By
  // *value*, not by presence: `merge` would let a wrapper's unset `shape={props.shape}` beat the
  // provider above it, since the key is there to win with (`CLAUDE.md`, *The third hazard*).
  const merged = withContextDefaults(props, usePropsContext());

  const recipeClass = createRecipeClass(colorSwatch, {
    variantProps: () => ({ size: merged.size, shape: merged.shape }),
  });

  // `value` is omitted rather than forwarded: it is not a style prop, so `renderStyled` would pass
  // it straight through and the element would render as `<span value="#bada55">`. It reaches the
  // DOM as `data-value` instead, which is where Chakra puts it too.
  //
  // Both keys sit *after* the spread, which is Chakra's order here — `data-value` is written after
  // `{...localProps}`, so the component's wins. `style` has to be last either way: it is the
  // component's own colour, and `composeStyle` is what lets a caller's `style` layer over it
  // instead of replacing it.
  const elementProps = merge(omit(merged, ...VARIANT_KEYS, "value", "style"), {
    get "data-value"() {
      return merged.value;
    },
    get style(): JSX.HTMLAttributes<HTMLElement>["style"] {
      return composeStyle({ "--color": merged.value }, merged.style);
    },
  });

  return renderStyled<ColorSwatchElementProps>({
    as: (merged.as ?? "span") as ValidComponent,
    render: merged.render,
    props: elementProps as unknown as ColorSwatchElementProps,
    recipeClass,
  });
};

/**
 * Supplies props to every {@link ColorSwatch} below it — `<ColorSwatchPropsProvider
 * value={{ shape: "circle" }}>` rounds a whole subtree. A swatch that passes the prop itself still
 * wins.
 */
export const ColorSwatchPropsProvider = PropsProvider;

export interface ColorSwatchMixProps extends Omit<ColorSwatchProps, "value"> {
  /** The colours to show, at most four. A fifth throws. */
  items: string[];
}

/** Chakra's message, kept verbatim: it is what a consumer greps for. */
const TOO_MANY_COLORS = "ColorSwatchMix doesn't support more than 4 colors";

/**
 * ColorSwatchMix — up to four colours inside one swatch, in the space a single swatch takes.
 *
 * **It is an oversized grid under `overflow: hidden`**, and that reads like a bug until it is said
 * out loud. Each cell is `size="inherit"`, so it is the *full* size of the swatch around it, laid
 * out on a grid two full sizes wide. The outer swatch clips to its own box, and what survives is the
 * centre: half and half for two colours, quadrants for four, and — because the last of three takes
 * `gridColumn="span 2 / span 2"` and `width="unset"` — two over one for three.
 *
 * **The guard is a body-level check, and it has to be**, which is a Solid fact rather than a
 * preference. Moved into the accessor `<For>` reads — so that a list *growing* to five would throw
 * too — it throws from inside a memo, and Solid 2.0 answers an uncaught error in the reactive graph
 * by halting the graph for the whole page: `[REACTIVITY_HALTED] Update ignored`, after which every
 * later render anywhere no-ops. Measured, on this component. So the check reads `items` once at
 * construction, which is where Chakra's is too — React re-runs the body, so a later growth throws
 * there and only counts the cells here. Nothing is invented to cover the difference.
 */
export const ColorSwatchMix: Component<ColorSwatchMixProps> = (props) => {
  // `untrack` because the read really is untracked and Solid is right to say so: this is a
  // construction-time check, and the alternative is the halted graph described above.
  if (untrack(() => props.items.length) > 4) {
    throw new Error(TOO_MANY_COLORS);
  }

  const spansTwoColumns = (index: number) =>
    props.items.length === 3 && index === props.items.length - 1;

  // Named rather than spread inline. A **call expression** in a JSX spread is compiled to a memo,
  // and the receiving component then reads a reactive value in its own body — `STRICT_READ_UNTRACKED`,
  // reported against `<Anonymous>` with nothing pointing back here.
  const swatchProps = omit(props, "items");

  // `overflow="hidden"` is a JSX attribute before the spread, not a `merge` default: a style prop in
  // an object literal inside a function call is not statically extractable, and this one is what
  // makes the whole layout work (`CLAUDE.md`, *The hazard*, and *The third hazard*'s second home for
  // a default). Before the spread is also Chakra's order, so a caller can still override it.
  return (
    <ColorSwatch overflow="hidden" {...swatchProps} value="transparent">
      <Grid templateColumns="var(--swatch-size) var(--swatch-size)">
        <For each={props.items}>
          {(item, index) => (
            <ColorSwatch
              size="inherit"
              rounded="none"
              boxShadow="none"
              value={item}
              gridColumn={spansTwoColumns(index()) ? "span 2 / span 2" : undefined}
              width={spansTwoColumns(index()) ? "unset" : undefined}
            />
          )}
        </For>
      </Grid>
    </ColorSwatch>
  );
};
