import type { JSX } from "@solidjs/web";
import { Badge, Box, Checkmark, ColorSwatch, Container, Spinner, Stack } from "chakra-ui-solid";
import { DemoFrame, DemoStrip } from "~/components/home/demo-frame";
import { DocLinkButton } from "~/components/home/link-button";
import { HighlightHeading, Subheading } from "~/components/home/typography";
import { DocLink } from "~/components/ui/doc-link";
import { ArrowRightIcon, PartyPopperIcon, TerminalIcon } from "~/components/ui/icons";
import { DISCLAIMER } from "~/config";
import { sidebarGroups } from "~/lib/site-map";

/**
 * The hero, in chakra-ui.com's order and at their length: announcement pill, heading with one
 * phrase picked out, one subheading line, a call to action beside the install command — then a
 * full-bleed strip of live components.
 *
 * **Two things sit here that Chakra's hero has no reason to carry** (`docs-plan.md` §3.2 section 0):
 * the disclaimer, which must be above the fold and which a mark-derived name makes load-bearing,
 * and the requirements as one spec line. Everything else this page owes went to a section of its
 * own below — the parity sentence leads `ParitySection`. Stacking all of it here was the mistake:
 * a hero that opens with a list of caveats reads as a warning label, and the caveats are no less
 * true two screens down.
 */
export function HeroSection() {
  return (
    <Box as="section" position="relative" zIndex="base" pt="16" pb="20">
      <Container>
        <Box display="flex" flexDirection="column" gap={{ base: "5", md: "8" }} maxW="3xl">
          <AnnouncementPill />

          {/* Chakra's tagline, with our name in it — the port keeps the line the same way it keeps
            the component API. */}
          <HighlightHeading level="h1" query="with speed">
            chakra-ui-solid is a component system for building products with speed
          </HighlightHeading>

          <Subheading>
            Accessible SolidJS components for building high-quality web apps and design systems.{" "}
            <Box as="span" color="fg">
              Zero runtime CSS
            </Box>
          </Subheading>

          <Box
            display="flex"
            flexDirection={{ base: "column", sm: "row" }}
            alignItems={{ sm: "center" }}
            gap="3"
          >
            <DocLinkButton slug="get-started/installation">Start building</DocLinkButton>
            <InstallCommand />
          </Box>

          <Requirements />

          <Disclaimer />
        </Box>
      </Container>

      <Box mt="20">
        <ComponentDemos />
      </Box>
    </Box>
  );
}

/**
 * Counted off the sidebar rather than written down, because a number in this pill is a claim that
 * goes stale every batch — and the previous one did, sitting at *Box is the first component
 * shipped* long after it was not. `Concepts` is a group of prose pages, so it is excluded: the
 * count means components a reader can open, which is exactly what the sidebar already lists.
 */
function shippedComponentCount() {
  return sidebarGroups("components")
    .filter((group) => group.title !== "Concepts")
    .reduce((total, group) => total + group.pages.length, 0);
}

function AnnouncementPill() {
  return (
    <Box
      alignSelf="flex-start"
      display="inline-flex"
      alignItems="center"
      gap="2.5"
      px="4"
      py="2"
      fontSize="sm"
      fontWeight="medium"
      color="colorPalette.fg"
      bg="colorPalette.subtle"
      borderRadius="l2"
      textDecoration="none"
      focusRing="outside"
      render={(props) => (
        <DocLink slug="components/box" class={props.class as string}>
          {props.children}
        </DocLink>
      )}
    >
      {/* Chakra's pill is `popper · text · arrow`. Their arrow is Heroicons' where every other
        glyph on the site is Lucide's; ours is Lucide's `arrow-right`, so the icon set owes one
        upstream instead of two for a glyph the two libraries draw the same way. The pill is
        already `inline-flex` with a `gap`, so neither span needs spacing of its own. */}
      <Box as="span" display="inline-flex" flexShrink="0">
        <PartyPopperIcon />
      </Box>
      Early days: {shippedComponentCount()} components shipped
      <Box as="span" display="inline-flex" flexShrink="0">
        <ArrowRightIcon />
      </Box>
    </Box>
  );
}

/**
 * The spec line under the install command — the shape a download button has on any landing page,
 * not a section.
 *
 * It replaced a *Before you install* block that laid the same three facts out as cards, which read
 * as a wall of constraints one screen into the page. The **Panda** item is the one that cannot just
 * be dropped: without it a reader installs, runs, and every component renders naked with nothing
 * anywhere saying why (`plan.md` §4.4). The install page states all three at length, and the button
 * beside this line goes there.
 *
 * **`Requires` prefixes the strip so no item has to qualify itself.** The Panda entry read *Panda
 * CSS in your build*, which is the precise fact and the wrong register for a landing page — a
 * half-sentence sitting between two noun phrases, explaining a build step to a reader who has not
 * agreed to install anything yet. One leading verb covers all three, and *Panda CSS* stops reading
 * as something we use and starts reading as something they need. `PANDA_PREREQUISITE` is where the
 * precise version lives, verbatim, on the page that asks for the install.
 */
function Requirements() {
  return (
    <Box as="p" fontSize="sm" color="fg.subtle">
      Requires SolidJS 2.0 · Panda CSS · ESM only
    </Box>
  );
}

/**
 * The disclaimer, verbatim and above the fold. Under a mark-derived name it is doing that work
 * alone, and the link is what turns it into a redirect (`docs-site.md` §3.4).
 */
function Disclaimer() {
  return (
    <Box
      as="aside"
      mt="4"
      maxW="2xl"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l2"
      bg="bg.subtle"
      p="4"
      fontSize="sm"
      lineHeight="moderate"
      color="fg.muted"
    >
      <Box as="strong" color="fg" fontWeight="semibold">
        Unofficial.
      </Box>{" "}
      {DISCLAIMER.before}
      <Box
        color="fg"
        textDecoration="underline"
        render={(props) => (
          <a {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} href={DISCLAIMER.linkHref}>
            {props.children}
          </a>
        )}
      >
        {DISCLAIMER.linkText}
      </Box>
      {DISCLAIMER.after}
    </Box>
  );
}

function InstallCommand() {
  return (
    <Box
      as="pre"
      display="flex"
      alignItems="center"
      gap="2.5"
      minH="12"
      ps="4"
      pe="6"
      overflowX="auto"
      shadow="inset"
      bg="bg.subtle"
      color="colorPalette.fg"
      fontSize="sm"
      fontWeight="semibold"
      borderRadius="l2"
    >
      {/* The glyph is `1em`, so it tracks the `fontSize="sm"` above. The span carries the one thing
        that is a style prop and must not reach the `<svg>`. */}
      <Box as="span" display="inline-flex" flexShrink="0">
        <TerminalIcon />
      </Box>
      <Box as="code">pnpm add chakra-ui-solid</Box>
    </Box>
  );
}

/**
 * Chakra's strip demos five machine components. Ours mixes **real components with the styling API
 * underneath them**, because both are the claim: the components are Chakra's part-for-part, and the
 * style props beside them are what compiles to a stylesheet instead of running.
 *
 * It used to demo Box five ways and say so, which was honest when Box was the only component that
 * had shipped and became the page's stalest sentence once it was not (`roadmap.md` §9.2 — the
 * absence is stated, but so is the presence).
 *
 * **Nothing in flight appears here.** A frame is a claim that a reader can go and use the thing, so
 * a component earns one when its docs page is live, not when its source lands.
 */
function ComponentDemos() {
  return (
    <DemoStrip>
      <DemoFrame label="Badge">
        <Stack direction="row">
          <Badge variant="solid">Solid</Badge>
          <Badge variant="subtle">Subtle</Badge>
          <Badge variant="outline">Outline</Badge>
        </Stack>
      </DemoFrame>

      <DemoFrame label="Checkmark">
        <Stack direction="row" align="center">
          <Checkmark checked />
          <Checkmark indeterminate />
          <Checkmark />
          <Checkmark checked disabled />
        </Stack>
      </DemoFrame>

      <DemoFrame label="Color Swatch">
        <Stack direction="row" align="center">
          <ColorSwatch value="#bada55" />
          <ColorSwatch value="#0ea5e9" />
          <ColorSwatch value="#f97316" />
          <ColorSwatch value="#a855f7" />
        </Stack>
      </DemoFrame>

      <DemoFrame label="Spinner">
        <Spinner />
      </DemoFrame>

      <DemoFrame label="Style props">
        <Box
          p="4"
          borderWidth="1px"
          borderColor="border.emphasized"
          borderRadius="l2"
          color="fg.muted"
          fontSize="sm"
          fontFamily="mono"
        >
          p="4" borderWidth="1px"
        </Box>
      </DemoFrame>

      <DemoFrame label="Semantic tokens">
        <Box display="flex" flexDirection="column" gap="2" width="100%" fontSize="xs">
          <Box bg="bg.subtle" color="fg.muted" px="3" py="2" borderRadius="l1">
            bg.subtle
          </Box>
          <Box bg="bg.emphasized" color="fg" px="3" py="2" borderRadius="l1">
            bg.emphasized
          </Box>
          <Box bg="colorPalette.subtle" color="colorPalette.fg" px="3" py="2" borderRadius="l1">
            colorPalette.subtle
          </Box>
        </Box>
      </DemoFrame>

      <DemoFrame label="Conditional styles">
        <Box
          px="5"
          py="3"
          borderRadius="l2"
          fontWeight="medium"
          bg="bg.emphasized"
          color="fg"
          _hover={{ bg: "colorPalette.solid", color: "colorPalette.contrast" }}
        >
          Hover me
        </Box>
      </DemoFrame>

      <DemoFrame label="Render prop">
        <Box
          px="5"
          py="3"
          borderRadius="l2"
          borderWidth="1px"
          borderColor="border.emphasized"
          color="colorPalette.fg"
          fontWeight="medium"
          textDecoration="none"
          render={(props) => (
            <a
              {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
              href="https://panda-css.com"
            >
              {props.children}
            </a>
          )}
        >
          A styled anchor
        </Box>
      </DemoFrame>
    </DemoStrip>
  );
}
