import { cx } from "@chakra-ui-solid/styled-system/css";
import { Dynamic } from "@solidjs/web";
import { Box, type BoxProps } from "chakra-ui-solid";
import type { Component } from "solid-js";
import { Card, CardGroup } from "~/components/mdx/card";
import { codePaneClass } from "~/components/mdx/code-pane";
import { Example } from "~/components/mdx/example";
import { PropsTable } from "~/components/mdx/props-table";
import { mdxInlineCodeClass, mdxTableClass, proseTagClasses } from "~/components/mdx/prose";
import { Step, Steps } from "~/components/mdx/steps";

/**
 * MDX funnels every intrinsic element through `_components.<tag>` and **calls it as a component**.
 * Its built-in defaults map each tag to a string (`h1: "h1"`), which a React-style `jsx()` runtime
 * can handle and Solid's compiler cannot — it calls the value as a function, so `"h1"` renders
 * nothing. This provider replaces those defaults with real Solid components.
 *
 * It is also where an article's typography lands. Every rule that used to be a descendant selector
 * on the prose wrapper is now a class on the element rendered here, because the wrapper contains
 * more than prose — an `<Example>`'s live preview and the props table sit inside it, and a
 * descendant selector beat both (`~/components/mdx/prose`).
 */
type AnyProps = Record<string, unknown>;

const HTML_TAGS = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
] as const;

const hostComponents: Record<string, Component<AnyProps>> = {};
for (const tag of HTML_TAGS) {
  const tagClass = proseTagClasses[tag];
  hostComponents[tag] = tagClass
    ? (props) => (
        <Dynamic
          component={tag}
          {...props}
          class={cx(tagClass, props.class as string | undefined)}
        />
      )
    : (props) => <Dynamic component={tag} {...props} />;
}

// A link written in prose. Styled here rather than through a descendant selector in `proseClass`,
// because that selector would also beat the chrome that renders its own anchors inside the same
// element — the framework cards, the previous/next pager — and underline both.
//
// `href` and the rest of MDX's bag ride in on the spread: Box's props are typed against
// `JSX.HTMLAttributes<HTMLElement>` and never re-typed by `as`, so an element-specific attribute
// type-checks only through a cast here or through the `render` prop.
hostComponents.a = (props) => (
  <Box
    as="a"
    color="fg"
    fontWeight="medium"
    textDecoration="underline"
    textUnderlineOffset="3px"
    textDecorationThickness="2px"
    textDecorationColor="border.emphasized"
    {...(props as BoxProps)}
  />
);

// A table written in markdown. Styled here for the anchor's reason: as `& table` in `proseClass`
// the same rules also matched the props table, which renders its own table inside a bordered box.
hostComponents.table = (props) => (
  <Dynamic
    component="table"
    {...props}
    class={cx(mdxTableClass, props.class as string | undefined)}
  />
);

// Shiki writes each token's colour as a `--shiki-light`/`--shiki-dark` pair rather than a
// committed value, and `keepBackground: false` leaves the surface to us — so the fence wears the
// same class as an example's source pane and both follow the colour mode from one rule.
hostComponents.pre = (props) => (
  <Dynamic
    component="pre"
    {...props}
    class={cx(codePaneClass, props.class as string | undefined)}
  />
);

// Only *inline* code gets the chip. A fence renders `pre > code` as well, and chipping that one
// draws a box inside the code pane's box — `rehype-pretty-code` is what tells them apart, by
// writing `data-language` on the fenced one and nothing on an inline backtick.
hostComponents.code = (props) => (
  <Dynamic
    component="code"
    {...props}
    class={cx(
      props["data-language"] === undefined ? mdxInlineCodeClass : undefined,
      props.class as string | undefined,
    )}
  />
);

/**
 * Components an `.mdx` page may use with no import: MDX routes any capitalized name it cannot
 * resolve locally through this provider.
 */
export function useMDXComponents(): Record<string, Component<AnyProps>> {
  return {
    ...hostComponents,
    Example: Example as Component<AnyProps>,
    PropsTable: PropsTable as Component<AnyProps>,
    Steps: Steps as Component<AnyProps>,
    Step: Step as Component<AnyProps>,
    CardGroup: CardGroup as Component<AnyProps>,
    Card: Card as Component<AnyProps>,
  };
}
