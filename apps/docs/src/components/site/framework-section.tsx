import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
import { For, Show } from "solid-js";
import { Container } from "~/components/container";
import { DocLink } from "~/components/doc-link";
import { Blob } from "~/components/site/blob";
import { BlitzIcon } from "~/components/site/logo";
import { HighlightHeading, Subheading } from "~/components/site/typography";

/**
 * chakra-ui.com's framework grid, ported to the three frameworks a Solid app actually uses — their
 * five are React's (`docs-site.md` §2.2).
 *
 * **Each cell is a link to that framework's guide**, where theirs is a logo with a `title`
 * attribute — the same grid, doing something when you click it.
 *
 * The logos are each project's own SVG, served from `public/logos/` rather than inlined. Two
 * reasons, both practical: Vite's and SolidStart's carry `<mask>`, `<filter>` and `<clipPath>` ids
 * that would collide across a page once inlined, and an `<img>` keeps ~31 KB of path data out of
 * every HTML document the prerender writes.
 *
 * **Each is the mark alone, never a lockup carrying the project's name.** The cell prints that name
 * underneath as text, so a wordmark in the image says it twice — which is why TanStack's emblem is
 * here rather than their stacked logo, and why Vite's bare `logo.svg` is here rather than the
 * `VITE(⚡)` lockup that is the only form they publish a dark-ink version of.
 */
interface Framework {
  title: string;
  slug: string;
  logo: string;
  /** Only where the mark, or a part of it, would vanish against one of the two backgrounds. */
  logoDark?: string;
}

const frameworks: Framework[] = [
  {
    title: "Vite",
    slug: "get-started/frameworks/vite",
    logo: "/logos/vite-light.svg",
    logoDark: "/logos/vite-dark.svg",
  },
  {
    title: "SolidStart",
    slug: "get-started/frameworks/solid-start",
    logo: "/logos/solid-start.svg",
  },
  {
    title: "TanStack Start",
    slug: "get-started/frameworks/tanstack-start",
    logo: "/logos/tanstack-light.svg",
    logoDark: "/logos/tanstack-dark.svg",
  },
];

export function FrameworkSection() {
  return (
    <Box as="section" position="relative" zIndex="base" py="20" overflow="hidden">
      <Blob width="2000px" height="2000px" top="-90%" left="-50%" />

      {/* The second bolt, mirrored to the left as it is on chakra-ui.com. */}
      <Box position="absolute" top="-28" left="-20" hideBelow="md" pointerEvents="none">
        <BlitzIcon />
      </Box>

      <Container
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={{ base: "10", md: "16" }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={{ base: "4", md: "6" }}
          textAlign="center"
        >
          {/* The `\n` is a hard break — a `<br />` here would make the highlight split silently
            miss and the phrase would render unhighlighted (`~/components/site/typography`). */}
          <HighlightHeading level="h2" query="framework" maxW="xl">
            {"Works with your favorite\nSolidJS framework"}
          </HighlightHeading>
          <Subheading maxW="md">
            One guide each, one screen long, because the difference between them is a build setting
            rather than a provider.
          </Subheading>
        </Box>

        {/* Collapsed hairlines: each cell pulls its trailing edges back over its neighbour's, so
          the grid reads as one ruled surface instead of a row of separate boxes. */}
        <Box display="flex" flexWrap="wrap" justifyContent="center">
          <For each={frameworks}>
            {(framework) => (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap="4"
                width={{ base: "150px", md: "190px" }}
                height={{ base: "120px", md: "160px" }}
                px="3"
                borderWidth="1px"
                borderColor="border.muted"
                marginInlineEnd="-1px"
                marginBlockEnd="-1px"
                fontSize="sm"
                fontWeight="medium"
                color="fg.muted"
                textAlign="center"
                textDecoration="none"
                transition="background-color 0.2s, color 0.2s"
                focusRing="outside"
                _hover={{ bg: "bg.subtle", color: "fg" }}
                render={(props) => (
                  <DocLink slug={framework.slug} class={props.class as string}>
                    {props.children}
                  </DocLink>
                )}
              >
                <FrameworkLogo framework={framework} />
                {framework.title}
              </Box>
            )}
          </For>
        </Box>
      </Container>
    </Box>
  );
}

/**
 * `alt=""` on every one of these, deliberately: the cell already carries the framework's name as
 * visible text, so alt text would make a screen reader announce it twice.
 *
 * A mark that would disappear against one of the two backgrounds gets a **second `<img>`** rather
 * than a CSS filter. Both are in the prerendered HTML and the colour mode picks one with `display`,
 * so the swap needs no JavaScript — and a filter could not do this job anyway: Vite's is two-tone,
 * and only its parentheses change between the pair.
 *
 * The height is a literal on every branch rather than a field on `Framework`: a style prop read out
 * of an object computes a class name Panda never generated, which renders unstyled and raises
 * nothing (`plan.md` §0.2). `check:style-contract` rule 1 is what makes that a build failure.
 */
function FrameworkLogo(props: { framework: Framework }) {
  /**
   * Box computed the class; the `<img>` is what wears it.
   *
   * **`source` is an accessor, not a string.** A `render` callback is invoked by `renderElement`
   * outside any tracking scope, so calling `darkSource()` at the call site was a reactive read with
   * nothing watching it — `[STRICT_READ_UNTRACKED] … in <Box>`, once per framework that has a dark
   * mark. Taking the accessor moves the read into the `src` attribute, which is a tracked position.
   */
  const image = (source: () => string, computed: { class?: unknown }): JSX.Element => (
    <img class={computed.class as string} src={source()} alt="" />
  );

  return (
    <Show
      when={props.framework.logoDark}
      fallback={
        <Box height="9" width="auto" render={(p) => image(() => props.framework.logo, p)} />
      }
    >
      {(darkSource) => (
        <>
          <Box
            height="9"
            width="auto"
            _dark={{ display: "none" }}
            render={(p) => image(() => props.framework.logo, p)}
          />
          <Box
            height="9"
            width="auto"
            display="none"
            _dark={{ display: "block" }}
            render={(p) => image(darkSource, p)}
          />
        </>
      )}
    </Show>
  );
}
