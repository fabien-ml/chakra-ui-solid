import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
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
    <Box
      display="grid"
      gap="4"
      // Panda's `gridTemplateColumns` is the raw CSS property, so a bare `"3"` compiles to
      // `grid-template-columns: 3`, which a browser resolves as the length `3px` and every card
      // collapses to a sliver. The track function is written out for that reason.
      gridTemplateColumns={{
        base: "repeat(1, minmax(0, 1fr))",
        sm: "repeat(2, minmax(0, 1fr))",
        lg: "repeat(3, minmax(0, 1fr))",
      }}
      mt="6"
      mb="10"
    >
      {props.children}
    </Box>
  );
}

export function Card(props: {
  title: string;
  slug?: string;
  href?: string;
  children?: JSX.Element;
}) {
  return (
    <Box
      display="block"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l2"
      bg="bg.panel"
      p="4"
      textDecoration="none"
      transition="border-color 0.2s"
      _hover={{ borderColor: "border.emphasized" }}
      // One Box, two link targets: the internal one is the router's typed splat link and the
      // external one is a plain anchor, so the branch is inside the render function rather than
      // around two copies of the card.
      render={(renderProps) => (
        <Show
          when={props.slug}
          fallback={
            <a href={props.href} class={renderProps.class as string}>
              {renderProps.children}
            </a>
          }
        >
          {(slug) => (
            <DocLink slug={slug()} class={renderProps.class as string}>
              {renderProps.children}
            </DocLink>
          )}
        </Show>
      )}
    >
      {/* `div`, not `span`: the card body is an MDX paragraph, and a `<p>` inside a `<span>` is
          invalid nesting the parser silently repairs — which moves the paragraph out of the
          styled element. */}
      <Box display="block" fontWeight="medium" color="fg">
        {props.title}
      </Box>
      <Box
        display="block"
        mt="1"
        fontSize="sm"
        color="fg.muted"
        // The paragraph is MDX's, not ours, so its margin is reached by a descendant selector —
        // which is what the `css` escape hatch is for.
        css={{ "& p": { margin: "0" } }}
      >
        {props.children}
      </Box>
    </Box>
  );
}
