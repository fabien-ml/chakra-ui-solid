import { createFileRoute } from "@tanstack/solid-router";
import { Box } from "chakra-ui-solid";
import { Blob } from "~/components/site/blob";
import { DesignSystemSection } from "~/components/site/design-system-section";
import { FrameworkSection } from "~/components/site/framework-section";
import { HeroSection } from "~/components/site/hero-section";
import { BlitzIcon } from "~/components/site/logo";
import { NextStepsSection } from "~/components/site/next-steps-section";
import { ParitySection } from "~/components/site/parity-section";

export const Route = createFileRoute("/")({ component: DocsHome });

/**
 * The docs home, in chakra-ui.com's section order — hero, demo strip, design system, frameworks,
 * closing call to action — with five of their sections gone and three of ours in their place.
 *
 * **What is dropped, and why it is not a judgement about them.** *Used by*, the stats row,
 * testimonials, sponsors and the Pro tier are all claims about a project's standing, and this one
 * has none yet; a landing page that made them would be the first thing on the site that is not
 * true. What replaces them is the material `docs-plan.md` §3.2 requires and their page has no
 * reason to carry: the prerequisites, the parity delta, and what has not been built.
 *
 * **The bolt is Chakra's, used deliberately.** Their `BlitzIcon`, `BlitzFillIcon` and `LogoIcon`
 * come across under the same MIT grant as the rest of their source, attributed in
 * `~/components/site/logo` and in the root `NOTICE.md`. The wordmark still reads
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
 * previews inside every docs example (`~/components/layout`).
 */
function DocsHome() {
  return (
    <Box position="relative" overflowX="hidden" colorPalette="teal">
      <AmbientLights />

      {/* The bolt behind the hero, at chakra-ui.com's own offsets. It brings its own colour — the
        gradient names `fg.inverted` itself (`~/components/site/logo`), so this Box only places it. */}
      <Box position="absolute" top="58px" right="67px" hideBelow="md" pointerEvents="none">
        <BlitzIcon />
      </Box>

      <HeroSection />
      <DesignSystemSection />
      <ParitySection />
      <FrameworkSection />
      <NextStepsSection />
    </Box>
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
