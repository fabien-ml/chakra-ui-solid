import { Box } from "@chakra-ui-solid/components";
import type { JSX } from "@solidjs/web";
import { Container } from "~/components/container";
import { DocLink } from "~/components/doc-link";
import { DemoFrame, DemoStrip } from "~/components/site/demo-frame";
import { DocLinkButton } from "~/components/site/link-button";
import { HighlightHeading, Subheading } from "~/components/site/typography";
import { DISCLAIMER } from "~/config";

/**
 * The hero, in chakra-ui.com's order and at their length: announcement pill, heading with one
 * phrase picked out, one subheading line, a call to action beside the install command — then a
 * full-bleed strip of live components.
 *
 * **The only addition is the disclaimer**, which `docs-plan.md` §3.2 requires above the fold and
 * which a mark-derived name makes load-bearing. Everything else this page owes has a section of its
 * own below: the parity sentence leads `ParitySection`, and the Panda prerequisite is a card in
 * `PrerequisitesSection`. Stacking all of it here was the mistake — a hero that opens with a list
 * of caveats reads as a warning label, and the caveats are no less true two screens down.
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
      Early — Box is the first component shipped{" "}
      <Box as="span" aria-hidden="true">
        →
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
 */
function Requirements() {
  return (
    <Box as="p" fontSize="sm" color="fg.subtle">
      SolidJS 2.0 · Panda CSS in your build · ESM only
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
      <TerminalIcon />
      <Box as="code">pnpm add @chakra-ui-solid/components</Box>
    </Box>
  );
}

/**
 * An `<svg>` stays an `<svg>`: its geometry attributes are not style props, and Box types its
 * element as `HTMLElement`. The sizing that *is* a style prop goes on the span around it.
 */
function TerminalIcon() {
  return (
    <Box as="span" display="inline-flex" flexShrink="0" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    </Box>
  );
}

/**
 * Chakra's strip demos five machine components. Ours demos the one that has shipped, five ways —
 * and says so in the captions rather than dressing five boxes up as five components. `roadmap.md`
 * §9.2's rule in its positive form: the absence is stated rather than left for a reader to find.
 */
function ComponentDemos() {
  return (
    <DemoStrip>
      <DemoFrame label="Box">
        <Box
          bg="colorPalette.solid"
          color="colorPalette.contrast"
          px="5"
          py="3"
          borderRadius="l2"
          fontWeight="medium"
        >
          This is the Box
        </Box>
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
