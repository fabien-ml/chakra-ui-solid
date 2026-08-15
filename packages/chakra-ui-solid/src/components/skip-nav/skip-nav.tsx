import {
  chakra,
  createRecipeClass,
  type HTMLChakraProps,
  renderStyled,
  withDefaults,
} from "@chakra-ui-solid/core";
import { skipNavLink } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

/**
 * The id both halves agree on when neither is given one. A consumer who passes `id` must pass the
 * **same** one to both, which is the whole of this component's contract — the link's `href` is
 * built from it and the content's `id` answers it.
 */
const FALLBACK_ID = "chakra-skip-nav";

export interface SkipNavLinkProps extends HTMLChakraProps<"a"> {
  /**
   * The id of the {@link SkipNavContent} to jump to. It becomes the link's `href`, not the link's
   * own `id`.
   *
   * @default "chakra-skip-nav"
   */
  id?: string;
}

/** The DOM props SkipNavLink forwards to the rendered element, as Box names its own. */
type SkipNavLinkElementProps = ComponentProps<"a">;

/**
 * SkipNavLink — the first thing a keyboard user reaches on a page, and invisible until they do.
 *
 * The `skipNavLink` recipe hides it the way {@link VisuallyHidden} does and un-hides it on
 * `:focus-visible`, pinning it to the top-left of the viewport. Put it as high in the tree as it
 * will go: it is only useful if it comes *before* the navigation it skips (WCAG 2.4.1).
 *
 * `id` is a default rather than a JSX attribute before the spread, so a wrapper forwarding an unset
 * `id={props.id}` still produces a working link instead of `href="#undefined"` — the failure would
 * be silent, since the anchor still renders and still takes focus.
 */
export const SkipNavLink: Component<SkipNavLinkProps> = (props) => {
  const merged = withDefaults(props, { id: FALLBACK_ID } satisfies Partial<SkipNavLinkProps>);

  const recipeClass = createRecipeClass(skipNavLink, { variantProps: () => ({}) });

  // `id` names the *target*, so it is consumed here rather than forwarded — an `id` on the link
  // itself would put two elements with the same id on the page and break the jump it exists for.
  const elementProps = merge(omit(merged, "id"), {
    get href() {
      return `#${merged.id}`;
    },
  });

  return renderStyled<SkipNavLinkElementProps>({
    as: (merged.as ?? "a") as ValidComponent,
    render: merged.render,
    props: elementProps as unknown as SkipNavLinkElementProps,
    recipeClass,
  });
};

export interface SkipNavContentProps extends HTMLChakraProps<"div"> {
  /**
   * The id the {@link SkipNavLink} points at. Pass the same value to both or neither.
   *
   * @default "chakra-skip-nav"
   */
  id?: string;
}

/**
 * SkipNavContent — where {@link SkipNavLink} lands. Either a self-closing marker before the main
 * content or a wrapper around it.
 *
 * `tabindex={-1}` is what makes a `div` focusable by the jump without putting it in the tab order,
 * and the inline `outline: 0` is there because that focus is programmatic — a visible ring on a
 * whole content region would read as a bug rather than as feedback. Both are defaults a consumer
 * can override, so both live in the bag beside `id` rather than as JSX attributes before the
 * spread: a wrapper forwarding an unset `tabindex` would beat the literal with `undefined` and the
 * jump would land on an element that cannot take focus (`CLAUDE.md`, *The third hazard*). Neither
 * is a style prop — `outline` goes out as the DOM `style` attribute — so neither owes a preset row.
 */
export const SkipNavContent: Component<SkipNavContentProps> = (props) => {
  const merged = withDefaults(props, {
    id: FALLBACK_ID,
    tabindex: -1,
    style: { outline: "0" },
  } satisfies Partial<SkipNavContentProps>);

  return <chakra.div {...merged} />;
};
