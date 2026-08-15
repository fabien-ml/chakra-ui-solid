import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PropsProviderProps,
  renderStyled,
  type SkinVariant,
  withDefaults,
} from "@chakra-ui-solid/core";
import {
  type BreadcrumbVariantProps as BreadcrumbRecipeVariants,
  breadcrumb as breadcrumbRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, merge } from "solid-js";
import { ChevronRightIcon, EllpsisIcon } from "../icons";

/** The seven names the slot recipe carries — the anatomy's parts exactly. */
export type BreadcrumbSlot =
  | "root"
  | "list"
  | "item"
  | "link"
  | "currentLink"
  | "separator"
  | "ellipsis";

/**
 * The recipe's two variants, spelled out rather than inherited from the generated
 * `BreadcrumbVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tag on either.** The recipe's `defaultVariants` resolves `plain` and `md` from
 * `undefined` itself.
 */
export interface BreadcrumbVariantProps {
  /** Whether a link underlines on hover (`underline`) or only changes colour (`plain`). */
  variant?: ConditionalValue<"underline" | "plain" | SkinVariant<"breadcrumb", "variant">>;
  /** The type scale of every part, and the gap between an item and its separator. */
  size?: ConditionalValue<"sm" | "md" | "lg" | SkinVariant<"breadcrumb", "size">>;
}

/** The Root's own props, without the `nav`'s — what a `Breadcrumb.PropsProvider` may supply. */
export interface BreadcrumbRootBaseProps extends BreadcrumbVariantProps {}

export interface BreadcrumbRootProps extends HTMLChakraProps<"nav">, BreadcrumbRootBaseProps {}

export interface BreadcrumbPropsProviderProps extends PropsProviderProps<BreadcrumbRootBaseProps> {}

export interface BreadcrumbListProps extends HTMLChakraProps<"ol"> {}

export interface BreadcrumbItemProps extends HTMLChakraProps<"li"> {}

export interface BreadcrumbLinkProps extends HTMLChakraProps<"a"> {}

export interface BreadcrumbCurrentLinkProps extends HTMLChakraProps<"span"> {}

export interface BreadcrumbSeparatorProps extends HTMLChakraProps<"li"> {}

/**
 * An **`li`**, where Chakra's own type says `HTMLChakraProps<"span">` over an element that is one:
 * `BreadcrumbEllipsis` is `withContext("li", "ellipsis")` upstream and the type is wrong about it.
 * Parity is what a consumer observes, and what they observe is the `li` an `ol` requires.
 */
export interface BreadcrumbEllipsisProps extends HTMLChakraProps<"li"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  BreadcrumbSlot,
  BreadcrumbRootProps,
  BreadcrumbRecipeVariants
>({
  name: "Breadcrumb",
  recipe: breadcrumbRecipe,
  variantKeys: ["variant", "size"],
});

/** The classes the nearest {@link BreadcrumbRoot} resolved, one per slot. */
export const useBreadcrumbStyles = useStyles;

const StyledBreadcrumbRoot = withProvider("nav", "root");

/**
 * Breadcrumb.Root — where the current page sits in the site's hierarchy, as a trail of links.
 *
 * A `nav` landmark, and the `aria-label` is what tells the two apart when a page has more than one:
 * a screen reader announces "breadcrumb, navigation" rather than a second unnamed region.
 */
export const BreadcrumbRoot: Component<BreadcrumbRootProps> = (props) => {
  // A `withDefaults` entry rather than a JSX attribute before the spread: a wrapper forwarding an
  // unset `aria-label={props["aria-label"]}` would otherwise win with `undefined` and the landmark
  // would go back to being unnamed, silently (`CLAUDE.md`, *The third hazard*).
  const merged = withDefaults(props, {
    "aria-label": "breadcrumb",
  } satisfies Partial<BreadcrumbRootProps>);

  return <StyledBreadcrumbRoot {...merged} />;
};

/**
 * Supplies props to every {@link BreadcrumbRoot} below it. A Root that passes the prop itself still
 * wins.
 */
export const BreadcrumbPropsProvider: Component<BreadcrumbPropsProviderProps> = PropsProvider;

/**
 * The trail itself, as a real `ol` — the order of the crumbs is the hierarchy, so a list that
 * announces "1 of 3" is the point. It is the flex row every item and separator sits in.
 */
export const BreadcrumbList = withContext<BreadcrumbListProps>("ol", "list");

/** One crumb. An `inline-flex` row, so a glyph inside the link lines up with its text. */
export const BreadcrumbItem = withContext<BreadcrumbItemProps>("li", "item");

/**
 * A crumb that navigates. A real `a`, so it needs an `href`; for a router's own link component,
 * pass `render`: `<Breadcrumb.Link render={(props) => <A href="/docs" {...props} />} />`.
 */
export const BreadcrumbLink = withContext<BreadcrumbLinkProps>("a", "link");

type SpanProps = ComponentProps<"span">;

/**
 * The last crumb — the page you are on. A `span` rather than an `a`, because a link to the current
 * page is a link that does nothing; `role="link"` plus `aria-current="page"` is what keeps it in a
 * screen reader's list of links while saying which one it is.
 *
 * Both are `withDefaults` entries rather than JSX attributes before the spread, so a wrapper
 * forwarding either unset cannot delete it (`CLAUDE.md`, *The third hazard*).
 */
export const BreadcrumbCurrentLink: Component<BreadcrumbCurrentLinkProps> = (props) => {
  const styles = useStyles();
  const merged = withDefaults(props, {
    role: "link",
    "aria-current": "page",
  } satisfies Partial<BreadcrumbCurrentLinkProps>);

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (merged.as ?? "span") as ValidComponent,
    props: merged as SpanProps,
    render: merged.render,
    recipeClass: () => styles().currentLink,
  });
};

type ListItemProps = ComponentProps<"li">;

/**
 * The mark between two crumbs — a chevron unless a child replaces it. `aria-hidden`, because the
 * list already conveys the sequence and a screen reader reading "greater than" three times does not.
 */
export const BreadcrumbSeparator: Component<BreadcrumbSeparatorProps> = (props) => {
  const styles = useStyles();
  const merged = withDefaults(props, {
    "aria-hidden": "true",
  } satisfies Partial<BreadcrumbSeparatorProps>);

  const elementProps = merge(merged, {
    // A **getter**, not a `withDefaults` entry: `withDefaults` evaluates its defaults object where
    // it is written, so a JSX-valued default there would construct the chevron on every render and
    // throw it away whenever the consumer passed their own.
    //
    // `!== undefined` rather than `??`: Chakra applies a part's default children through
    // `mergeProps`, which yields only to a value that is not `undefined`, so
    // `<Breadcrumb.Separator>{null}</Breadcrumb.Separator>` renders an empty `li` there — and
    // `{cond() ? <X/> : null}` is ordinary Solid. Read into a local first, because the prop is a
    // getter that rebuilds its element on every read and the test plus the result would be two
    // constructions.
    get children() {
      const provided = merged.children;
      return provided !== undefined ? provided : <ChevronRightIcon />;
    },
  }) as ListItemProps;

  return renderStyled<ListItemProps, HTMLLIElement>({
    as: (merged.as ?? "li") as ValidComponent,
    props: elementProps,
    render: merged.render,
    recipeClass: () => styles().separator,
  });
};

/**
 * Stands in for the crumbs a long trail leaves out. `role="presentation"` and `aria-hidden`
 * together: the `li` carries no meaning of its own, and the ellipsis is not a name worth reading.
 *
 * An `li`, not the `span` Chakra's type claims — see {@link BreadcrumbEllipsisProps}.
 */
export const BreadcrumbEllipsis: Component<BreadcrumbEllipsisProps> = (props) => {
  const styles = useStyles();
  const merged = withDefaults(props, {
    role: "presentation",
    "aria-hidden": "true",
  } satisfies Partial<BreadcrumbEllipsisProps>);

  const elementProps = merge(merged, {
    get children() {
      const provided = merged.children;
      return provided !== undefined ? provided : <EllpsisIcon />;
    },
  }) as ListItemProps;

  return renderStyled<ListItemProps, HTMLLIElement>({
    as: (merged.as ?? "li") as ValidComponent,
    props: elementProps,
    render: merged.render,
    recipeClass: () => styles().ellipsis,
  });
};
