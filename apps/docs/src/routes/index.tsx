import { createFileRoute } from "@tanstack/solid-router";
import { Box } from "chakra-ui-solid";
import { Blob } from "~/components/home/blob";
import { DesignSystemSection } from "~/components/home/design-system-section";
import { FrameworkSection } from "~/components/home/framework-section";
import { HeroSection } from "~/components/home/hero-section";
import { NextStepsSection } from "~/components/home/next-steps-section";
import { ParitySection } from "~/components/home/parity-section";
import { SiteFooter } from "~/components/layout/footer";
import { BlitzIcon } from "~/components/ui/logo";

export const Route = createFileRoute("/")({ component: DocsHome });

/**
 * The docs home, in chakra-ui.com's section order — hero, demo strip, design system, frameworks,
 * closing call to action — with five of their sections gone and three of ours in their place.
 *
 * **Their framework grid survives at two cells rather than three**, and the cut is a measurement
 * rather than a taste: SolidStart retired into `@solidjs/vite-plugin`'s start mode, so the choice a
 * SolidJS app still makes is who owns the server, not which framework compiles it.
 *
 * **What is dropped, and why it is not a judgement about them.** *Used by*, the stats row,
 * testimonials, sponsors and the Pro tier are all claims about a project's standing, and this one
 * has none yet; a landing page that made them would be the first thing on the site that is not
 * true. What replaces them is the material `docs-plan.md` §3.2 requires and their page has no
 * reason to carry: the prerequisites, the parity delta, and what has not been built.
 *
 * **The bolt is Chakra's, used deliberately.** Their `BlitzIcon`, `BlitzFillIcon` and `LogoIcon`
 * come across under the same MIT grant as the rest of their source, attributed in
 * `~/components/ui/logo` and in the root `NOTICE.md`. The wordmark still reads
 * `chakra-ui-solid`, and the disclaimer above the fold is what says whose project this is not.
 *
 * **Every element on it is `Box` and style props**, not `css()` beside a `<div>`. This site is the
 * standing consumer instance the library is validated against (`docs-site.md` §1.1), and a landing
 * page that advertises a style-props API without using one is not evidence of anything.
 *
 * **The teal is scoped to this page, on this element.** Every accent below — the pill, the CTA, the
 * highlight mark, the eyebrows, the washes — reads `colorPalette.*`, and chakra-ui.com accents whole
 * marketing pages the same way, with one `colorPalette="teal"` at the page root. It cannot go on
 * `<body>`: `--chakra-colors-color-palette-*` inherits, so from there it also reaches the component
 * previews inside every docs example (`~/components/layout/shell`).
 */
function DocsHome() {
  return (
    <>
      {/* `overflowX="clip"`, never `hidden`. The job here is to clip the ambient blobs sideways,
        and `overflow-x: hidden` cannot do only that: the spec forces the other axis off `visible`,
        so this Box computes `overflow-y: auto` and becomes a **second vertical scroll container**
        inside the page's own. It shows no bar while its content happens to fit exactly, and grows
        one the moment anything overflows — which is what a mis-sized image in the framework grid
        did. `clip` clips without establishing a scroll container, which is why it exists. */}
      <Box position="relative" overflowX="clip" colorPalette="teal">
        <AmbientLights />

        {/* The bolt behind the hero, at chakra-ui.com's own offsets. It brings its own colour — the
          gradient names `fg.inverted` itself (`~/components/ui/logo`), so this Box only places it. */}
        <Box position="absolute" top="58px" right="67px" hideBelow="md" pointerEvents="none">
          <BlitzIcon />
        </Box>

        <HeroSection />
        <DesignSystemSection />
        <ParitySection />
        <FrameworkSection />
        <NextStepsSection />
      </Box>

      {/* Outside the Box above, not inside it: that one is `overflowX: hidden` to clip the blobs,
          and a clipping ancestor is also a scroll container the footer has no reason to sit in. */}
      <SiteFooter />
    </>
  );
}

/** The three washes chakra-ui.com floats behind its whole page, sized and placed for ours. */
function AmbientLights() {
  return (
    <>
      <Blob top="-50px" left="50%" transform="translateX(-50%)" />
      <Blob top="40%" left="-30%" />
      <Blob width="1200px" height="2000px" top="1200px" left="40%" />
    </>
  );
}
