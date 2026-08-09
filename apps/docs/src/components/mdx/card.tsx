import { css } from "@chakra-ui-solid/styled-system/css";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { DocLink } from "~/components/doc-link";

/**
 * The framework card grid chakra-ui.com puts at the top of its install page, so a reader picks
 * their toolchain before they read a single install step.
 *
 * `slug` links inside the docs (through the splat route, so the destination is type-checked);
 * `href` links out. A card has one or the other.
 */
export function CardGroup(props: { children?: JSX.Element }) {
  return (
    <div
      class={css({
        display: "grid",
        gap: "4",
        // Panda's `gridTemplateColumns` is the raw CSS property, so a bare `"3"` compiles to
        // `grid-template-columns: 3`, which a browser resolves as the length `3px` and every card
        // collapses to a sliver. The track function is written out for that reason.
        gridTemplateColumns: {
          base: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        mt: "6",
        mb: "10",
      })}
    >
      {props.children}
    </div>
  );
}

const cardClass = css({
  display: "block",
  borderWidth: "1px",
  borderColor: "border",
  borderRadius: "l2",
  bg: "bg.panel",
  p: "4",
  textDecoration: "none",
  transition: "border-color 0.2s",
  _hover: { borderColor: "border.emphasized" },
});

// `div`, not `span`: the card body is an MDX paragraph, and a `<p>` inside a `<span>` is invalid
// nesting the parser silently repairs — which moves the paragraph out of the styled element.
const titleClass = css({ display: "block", fontWeight: "medium", color: "fg" });
const bodyClass = css({
  display: "block",
  mt: "1",
  fontSize: "sm",
  color: "fg.muted",
  "& p": { margin: "0" },
});

export function Card(props: {
  title: string;
  slug?: string;
  href?: string;
  children?: JSX.Element;
}) {
  return (
    <Show
      when={props.slug}
      fallback={
        <a href={props.href} class={cardClass}>
          <div class={titleClass}>{props.title}</div>
          <div class={bodyClass}>{props.children}</div>
        </a>
      }
    >
      {(slug) => (
        <DocLink slug={slug()} class={cardClass}>
          <div class={titleClass}>{props.title}</div>
          <div class={bodyClass}>{props.children}</div>
        </DocLink>
      )}
    </Show>
  );
}
