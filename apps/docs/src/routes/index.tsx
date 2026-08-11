import { createFileRoute } from "@tanstack/solid-router";
import { Box } from "chakra-ui-solid";
import { Blob } from "~/components/site/blob";
import { DesignSystemSection } from "~/components/site/design-system-section";
import { FrameworkSection } from "~/components/site/framework-section";
import { HeroSection } from "~/components/site/hero-section";
import { BlitzIcon } from "~/components/site/icons";
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
 * `~/components/site/icons` and in the root `NOTICE.md`. The wordmark still reads
 * `chakra-ui-solid`, and the disclaimer above the fold is what says whose project this is not.
 *
 * **Every element on it is `Box` and style props**, not `css()` beside a `<div>`. This site is the
 * standing consumer instance the library is validated against (`docs-site.md` §1.1), and a landing
 * page that advertises a style-props API without using one is not evidence of anything.
 */
function DocsHome() {
  return (
    <Box position="relative" overflowX="hidden">
      <AmbientLights />

      {/* The bolt behind the hero, at chakra-ui.com's own offsets. It brings its own colour — the
        gradient names `fg.inverted` itself (`~/components/site/icons`), so this Box only places it. */}
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
