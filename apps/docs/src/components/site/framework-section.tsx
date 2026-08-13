import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
import { For, Show } from "solid-js";
import { Container } from "~/components/container";
import { DocLink } from "~/components/doc-link";
import { Blob } from "~/components/site/blob";
import { BlitzIcon } from "~/components/site/logo";
import { HighlightHeading, Subheading } from "~/components/site/typography";

/**
 * chakra-ui.com's framework grid, ported — and it is **two cells rather than their five**, because
 * a SolidJS app no longer picks a framework. SolidStart retired into `@solidjs/vite-plugin`'s start
 * mode, TanStack Start is a plugin on the same Vite, and a client-only app is that Vite with one
 * flag off. What is left to choose between is who owns the server, which is what these two name.
 *
 * **Both cells land on the same page**, at the section for that choice. That is not a shortcut: the
 * answer for every setup is the identical empty configuration, and
 * `/docs/get-started/build-setup` measures it rather than asserting it.
 *
 * The logos are each project's own SVG, served from `public/logos/` rather than inlined, so the
 * generic `id="a"`…`id="d"` gradient ids in Solid's mark cannot collide with anything and ~4 KB of
 * path data stays out of every HTML document the prerender writes.
 *
 * **Each is the mark alone, never a lockup carrying the project's name.** The cell prints that name
 * underneath as text, so a wordmark in the image says it twice — which is why TanStack's emblem is
 * here rather than their stacked logo, and why Solid's is the `without-wordmark` file.
 */
interface Framework {
  title: string;
  slug: string;
  /** The heading id the cell lands on, so a two-cell grid still answers two different questions. */
  hash: string;
  logo: string;
  /** Only where the mark, or a part of it, would vanish against one of the two backgrounds. */
  logoDark?: string;
}

const frameworks: Framework[] = [
  {
    title: "Start mode",
    slug: "get-started/build-setup",
    hash: "server-rendered-apps",
    logo: "/logos/solid.svg",
  },
  {
    title: "TanStack Start",
    slug: "get-started/build-setup",
    hash: "tanstack-start",
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
            miss and the phrase would render unhighlighted (`~/components/site/typography`).

            **The highlight is the last phrase, and it is what the reader gets** — the same shape as
            the parity heading, which ends on *without the runtime headache* rather than on the
            absence it describes. *Nothing to configure* is the fact; *configures itself* is the
            thing that happens for them, and it is also literally what was measured: the plugin
            derives the settings from the dependency tree. */}
          <HighlightHeading level="h2" query="configures itself" maxW="xl">
            {"Whichever owns your server,\nthe build configures itself"}
          </HighlightHeading>
          <Subheading maxW="lg">
            Both run on the same Vite plugin, and it works out what our packages need from your
            dependency tree.
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
                  <DocLink
                    slug={framework.slug}
                    hash={framework.hash}
                    class={props.class as string}
                  >
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
