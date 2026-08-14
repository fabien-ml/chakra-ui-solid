import {
  createRecipeContext,
  type HTMLChakraProps,
  mergeProps,
  withDefaults,
} from "@chakra-ui-solid/core";
import { type SkeletonVariantProps, skeleton } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import { type Component, For, omit } from "solid-js";
import { Circle, type CircleProps } from "../circle";
import { Stack, type StackProps } from "../stack";

/**
 * The two variants spelled out rather than inherited from the generated `SkeletonVariantProps`, so
 * each carries a description a reader can use and a type they can read — Badge's precedent, and
 * this is the interface the docs page's props table is built from. Drift is caught at the call
 * below, whose key tuple is typed against the generated variants.
 */
export interface SkeletonProps extends HTMLChakraProps<"div"> {
  /**
   * Whether the placeholder is showing. `false` hides the children's stand-in and fades the real
   * content in — the element stays, so the layout does not jump.
   *
   * @default true
   */
  loading?: ConditionalValue<boolean>;
  /**
   * How the placeholder animates — `pulse` fades a solid block, `shine` sweeps a gradient across
   * it, and `none` holds still.
   *
   * @default "pulse"
   */
  variant?: ConditionalValue<"pulse" | "shine" | "none">;
}

const { withContext, PropsProvider } = createRecipeContext<SkeletonProps, SkeletonVariantProps>({
  recipe: skeleton,
  variantKeys: ["loading", "variant"],
});

/**
 * Skeleton — a placeholder block standing in for content that has not arrived, styled by the
 * `skeleton` recipe.
 *
 * It has no size of its own: give it one (`<Skeleton height="200px" />`) or let it wrap the content
 * it is standing in for, which is what `loading` is for — the children are laid out and then hidden
 * (`visibility`, not `display`), so the placeholder is exactly the shape the real thing will be.
 *
 * The `shine` variant reads `--start-color` and `--end-color`, so a consumer recolours the sweep
 * with `css={{ "--start-color": "colors.pink.500" }}` rather than with a prop.
 */
export const Skeleton = withContext("div");

/**
 * Supplies props to every {@link Skeleton} below it — `<SkeletonPropsProvider value={{ variant: "shine" }}>`
 * sets the animation for a subtree. A `Skeleton` that passes the prop itself still wins.
 */
export const SkeletonPropsProvider = PropsProvider;

export interface SkeletonCircleProps extends SkeletonProps {
  /** The diameter, taking whatever `width` takes. */
  size?: CircleProps["size"];
}

/**
 * SkeletonCircle — a {@link Skeleton} shaped by {@link Circle}, for an avatar's placeholder.
 *
 * **One element, not two.** Chakra composes the two with `asChild`, which merges the Circle's
 * computed props onto the Skeleton and renders a single node; `render` is the Solid-native form of
 * that same merge — the Circle computes its class and hands the whole bag to the Skeleton to place.
 * Nesting a Skeleton inside a Circle instead would give the placeholder a square animation inside a
 * round box, since the recipe's `borderRadius` is on the inner element.
 */
export const SkeletonCircle: Component<SkeletonCircleProps> = (props) => (
  <Circle
    {...props}
    // The cast is the `as`-polymorphism boundary rather than a smell: `render` is typed against the
    // element Circle would otherwise have rendered, and Skeleton's props are the same DOM surface
    // with the style-prop vocabulary layered over it — the two disagree only where Panda claims a
    // name the DOM also has (`translate`).
    render={(circleProps) => <Skeleton {...(circleProps as unknown as SkeletonProps)} />}
  />
);

export interface SkeletonTextProps extends SkeletonProps {
  /**
   * How many lines to draw. The last one is short, the way a paragraph's last line is — unless
   * there is only one, which is drawn full width.
   *
   * @default 3
   */
  noOfLines?: number;
  /** Props for the {@link Stack} that holds the lines, rather than for the lines themselves. */
  rootProps?: StackProps;
}

/** This component's own props, which are not the Skeleton's and must not reach one. */
const TEXT_KEYS = ["noOfLines", "rootProps", "gap"] as const;

/**
 * SkeletonText — a stack of {@link Skeleton} lines standing in for a paragraph.
 *
 * `gap` is the Stack's, not the lines': it is the space *between* the lines, so passing it through
 * to each Skeleton would set a flex gap on an empty block instead.
 *
 * When `loading` is `false` it collapses to one line — the fading-in wrapper for whatever children
 * were passed — which is why the count is read inside the accessor rather than fixed at build.
 */
export const SkeletonText: Component<SkeletonTextProps> = (props) => {
  const merged = withDefaults(props, {
    loading: true,
    noOfLines: 3,
  } satisfies Partial<SkeletonTextProps>);

  const lines = () =>
    Array.from({ length: merged.loading ? merged.noOfLines : 1 }, (_, index) => index);

  // Every read goes to `merged`, never to `props`: `withDefaults` copies nothing, so `omit(props, …)`
  // would hand the lines a bag with the defaults missing. Bound to a name rather than spread as a
  // call expression — Solid's compiler wraps a call in a JSX spread in a memo, and reading that memo
  // inside the child's body is the `STRICT_READ_UNTRACKED` diagnostic `mount()` fails on.
  const lineProps = omit(merged, ...TEXT_KEYS, "loading");

  // `merged.rootProps` is bound to a name for the same reason, and it is the sharper case: a JSX
  // spread of a **member expression** compiles to a memo, and the untracked read then lands in the
  // component receiving it rather than here — measured, four `STRICT_READ_UNTRACKED` diagnostics
  // from that one spread.
  //
  // The adapter's `mergeProps`, not Solid's `merge`, and that is what makes the accessor source
  // legal: any bag with a **dynamic key set** is enumerated by `renderStyled`'s `Object.keys` in the
  // receiving component's body, and only this proxy answers a structural question without
  // subscribing to it (`merge-props.ts`, *the union of every source's own enumerable keys*).
  const rootProps = mergeProps(() => merged.rootProps ?? {});

  return (
    <Stack gap={merged.gap} width="full" {...rootProps}>
      <For each={lines()}>
        {(index) => (
          <Skeleton
            loading={merged.loading}
            height={merged.loading ? "4" : undefined}
            maxW={
              merged.loading
                ? index === merged.noOfLines - 1 && merged.noOfLines > 1
                  ? "80%"
                  : "100%"
                : undefined
            }
            {...lineProps}
          />
        )}
      </For>
    </Stack>
  );
};
