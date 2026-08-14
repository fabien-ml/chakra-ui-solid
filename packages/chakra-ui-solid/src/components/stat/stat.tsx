import {
  chakra,
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PropsProviderProps,
  renderStyled,
  withDefaults,
} from "@chakra-ui-solid/core";
import {
  type StatVariantProps as StatRecipeVariants,
  stat as statRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { ArrowDownIcon, ArrowUpIcon } from "../icons";

/** The six names the slot recipe carries — the anatomy's parts exactly. */
export type StatSlot = "root" | "label" | "helpText" | "valueText" | "valueUnit" | "indicator";

/**
 * The recipe's one variant, spelled out rather than inherited from the generated
 * `StatVariantProps`, so it carries a description a reader can use.
 *
 * **No `@default` tag.** The recipe's `defaultVariants` resolves `md` from `undefined` itself.
 */
export interface StatVariantProps {
  /**
   * The type scale of the **value alone** — `xl`, `2xl`, `3xl`. The label, the help text and the
   * unit hold their own sizes at every step, so this is the one number that grows.
   */
  size?: ConditionalValue<"sm" | "md" | "lg">;
}

/**
 * Shared by the Root and {@link StatGroup}, so the two cannot disagree about which keys belong to
 * the recipe. Never `recipe.variantKeys`: `omit` narrows by the keys it is given, and a `string[]`
 * narrows nothing.
 */
const VARIANT_KEYS = ["size"] as const;

/** The Root's own props, without the `dl`'s — what a `Stat.PropsProvider` may supply. */
export interface StatRootBaseProps extends StatVariantProps {}

export interface StatRootProps extends HTMLChakraProps<"dl">, StatRootBaseProps {}

export interface StatPropsProviderProps extends PropsProviderProps<StatRootBaseProps> {}

export interface StatLabelProps extends HTMLChakraProps<"dt"> {}

export interface StatValueTextProps extends HTMLChakraProps<"dd"> {}

export interface StatHelpTextProps extends HTMLChakraProps<"span"> {}

export interface StatValueUnitProps extends HTMLChakraProps<"span"> {}

/**
 * What the two trend arrows have in common — one attribute, which is the whole of what separates
 * them.
 */
interface StatTrendIndicatorProps extends HTMLChakraProps<"span"> {
  /**
   * Which way the trend goes, as the attribute the recipe colours the arrow from: `up` is
   * `fg.success`, `down` is `fg.error`. Each component supplies its own, so there is rarely a
   * reason to pass it.
   *
   * Declared here where the React version leaves it to a `data-*` index signature its JSX types
   * carry and ours do not.
   */
  "data-type"?: "up" | "down";
}

export interface StatUpIndicatorProps extends StatTrendIndicatorProps {}

export interface StatDownIndicatorProps extends StatTrendIndicatorProps {}

export interface StatGroupProps extends HTMLChakraProps<"div">, StatVariantProps {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  StatSlot,
  StatRootProps,
  StatRecipeVariants
>({
  name: "Stat",
  recipe: statRecipe,
  variantKeys: VARIANT_KEYS,
});

/** The classes the nearest {@link StatRoot} resolved, one per slot. */
export const useStatStyles = useStyles;

/**
 * Stat.Root — one number with its name, and optionally a trend beside it.
 *
 * A `dl`, so the name and the number are a description pair to a screen reader rather than two
 * loose runs of text. It is `flex: 1`, which is what lets {@link StatGroup} share a row between
 * several of them without any of them sizing itself.
 */
export const StatRoot = withProvider("dl", "root");

/**
 * Supplies props to every {@link StatRoot} below it. A Root that passes the prop itself still wins.
 */
export const StatPropsProvider: Component<StatPropsProviderProps> = PropsProvider;

/** What the number is, as the `dl`'s `dt`. An `inline-flex` row, so an info tip sits beside it. */
export const StatLabel = withContext<StatLabelProps>("dt", "label");

/** The number itself, as the `dl`'s `dd`. This is the only part `size` resizes. */
export const StatValueText = withContext<StatValueTextProps>("dd", "valueText");

/**
 * The line under the number — a comparison, a period, a caveat.
 *
 * A **`span` inside a `dl`**, which is not markup a `dl` allows: only `dt`, `dd`, `div`, and
 * scripting elements are. Upstream renders exactly this, so it ships — someone arriving from the
 * React version is owed what they know. A consumer who needs valid markup passes `as="dd"`.
 */
export const StatHelpText = withContext<StatHelpTextProps>("span", "helpText");

/** The unit after the number — `hr`, `min`, `k`. Muted and unbolded against the value it follows. */
export const StatValueUnit = withContext<StatValueUnitProps>("span", "valueUnit");

type SpanProps = ComponentProps<"span">;

/**
 * The two trend arrows share a slot and differ only by `data-type`, which is what the recipe
 * colours them from: `up` is `fg.success`, `down` is `fg.error`.
 *
 * Neither can be minted by `withContext`, because both carry defaults — the arrow and the
 * `data-type` itself. The `data-type` is a `withDefaults` entry rather than a JSX attribute before
 * the spread, so a wrapper forwarding an unset one cannot delete it and leave a colourless arrow
 * (`CLAUDE.md`, *The third hazard*).
 */
function createTrendIndicator(
  type: "up" | "down",
  Glyph: typeof ArrowUpIcon,
): Component<StatUpIndicatorProps> {
  return (props) => {
    const styles = useStyles();
    const merged = withDefaults(props, {
      "data-type": type,
    } satisfies Partial<StatUpIndicatorProps>);

    const elementProps = merge(merged, {
      // A **getter**, not a `withDefaults` entry: `withDefaults` evaluates its defaults object
      // where it is written, so a JSX-valued default there would construct the arrow on every
      // render and throw it away whenever the consumer passed their own.
      //
      // `!== undefined` rather than `??`: Chakra applies a part's default children through
      // `mergeProps`, which yields only to a value that is not `undefined`, so
      // `<Stat.UpIndicator>{null}</Stat.UpIndicator>` renders an empty span there — and
      // `{cond() ? <X/> : null}` is ordinary Solid. Read into a local first, because the prop is a
      // getter that rebuilds its element on every read and the test plus the result would be two
      // constructions.
      get children() {
        const provided = merged.children;
        return provided !== undefined ? provided : <Glyph />;
      },
    }) as SpanProps;

    return renderStyled<SpanProps, HTMLSpanElement>({
      as: (merged.as ?? "span") as ValidComponent,
      props: elementProps,
      render: merged.render,
      recipeClass: () => styles().indicator,
    });
  };
}

/** The rising arrow, coloured `fg.success`. A consumer's own child replaces the glyph entirely. */
export const StatUpIndicator: Component<StatUpIndicatorProps> = createTrendIndicator(
  "up",
  ArrowUpIcon,
);

/** The falling arrow, coloured `fg.error`. A consumer's own child replaces the glyph entirely. */
export const StatDownIndicator: Component<StatDownIndicatorProps> = createTrendIndicator(
  "down",
  ArrowDownIcon,
);

/**
 * StatGroup — a wrapping row of {@link StatRoot}s that share their width evenly.
 *
 * The one component in this family the styling seam does not mint: it is a plain `div` with no slot
 * of its own, and its job is to supply `size` to every Stat below it. That makes it the library's
 * second props-context writer, after `ButtonGroup`, and it splits the variant off the same way —
 * a named object of getters into the provider, `omit` for the element — rather than through Panda's
 * `splitVariantProps`, which destructures eagerly and would stop a changed `size` re-resolving.
 *
 * Its four layout properties are defaults the consumer overrides by passing their own, and they sit
 * in the same `withDefaults` bag as `role` rather than as JSX attributes before the spread — that
 * spelling is a presence merge, so a wrapper forwarding an unset `display` would flatten the row to
 * a block (`CLAUDE.md`, *The third hazard*). All four values are already in the preset's
 * `staticCss.css`, which is what keeps them reachable now that no extractor sees them.
 */
export const StatGroup: Component<StatGroupProps> = (props) => {
  // A named object of getters, never an inline `value={{ size: props.size }}`: the provider
  // snapshots its key set with `untrack`, and an inline literal is rebuilt on every read of it.
  const variantProps = {
    get size() {
      return props.size;
    },
  };

  const merged = withDefaults(props, {
    role: "group",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "flex-start",
  } satisfies Partial<StatGroupProps>);
  // Named, and spread as an identifier — a call expression in a JSX spread compiles to a memo the
  // receiving component then reads untracked.
  const groupProps = omit(merged, ...VARIANT_KEYS);

  return (
    <StatPropsProvider value={variantProps}>
      <chakra.div {...groupProps} />
    </StatPropsProvider>
  );
};
