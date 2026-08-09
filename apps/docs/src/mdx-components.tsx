import { css, cx } from "@chakra-ui-solid/styled-system/css";
import { Dynamic } from "@solidjs/web";
import type { Component } from "solid-js";
import { codePaneClass } from "~/components/code-pane";
import { Example } from "~/components/example";
import { Card, CardGroup } from "~/components/mdx/card";
import { Step, Steps } from "~/components/mdx/steps";
import { PropsTable } from "~/components/props-table";

/**
 * MDX funnels every intrinsic element through `_components.<tag>` and **calls it as a component**.
 * Its built-in defaults map each tag to a string (`h1: "h1"`), which a React-style `jsx()` runtime
 * can handle and Solid's compiler cannot — it calls the value as a function, so `"h1"` renders
 * nothing. This provider replaces those defaults with real Solid components.
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
  hostComponents[tag] = (props) => <Dynamic component={tag} {...props} />;
}

// A link written in prose. Styled here rather than through a descendant selector in `proseClass`,
// because that selector would also beat the chrome that renders its own anchors inside the same
// element — the framework cards, the previous/next pager — and underline both.
const anchorClass = css({
  color: "fg",
  fontWeight: "medium",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  textDecorationThickness: "2px",
  textDecorationColor: "border.emphasized",
});

hostComponents.a = (props) => (
  <Dynamic component="a" {...props} class={cx(anchorClass, props.class as string | undefined)} />
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
