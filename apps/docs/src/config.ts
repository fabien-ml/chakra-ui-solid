/**
 * The three strings the site is obliged to carry verbatim, in one module so a reword is a diff
 * rather than a search. Every one of them has a document that owns its wording, and none of them
 * is ours to edit here.
 */

/** The docs-home descriptor, leading positive — the form settled at the P1 gate (`decisions-ledger.md` D-01). */
export const SITE_NAME = "chakra-ui-solid";

export const SITE_DESCRIPTION =
  "An independent SolidJS 2.0 component library targeting Chakra UI v3's component API and " +
  "design system, with styles compiled at build time and none at runtime.";

/**
 * `plan.md` §0's parity sentence, **verbatim**. Q3 is settled *prominent*, and the docs home is
 * the most prominent place it appears — in the section that also shows what it costs, not the hero
 * (`docs-plan.md` §3.2 section 2, §5.4).
 */
export const PARITY_SENTENCE =
  "as close to Chakra v3 parity as is achievable without runtime CSS-in-JS";

/**
 * `plan.md` §4.4's prerequisite line, wording unchanged, in the second and third of its three
 * placements: the docs home and above the install snippet on the install page. The first is the
 * README's first line.
 */
export const PANDA_PREREQUISITE =
  "Requires Panda CSS in your build. Not optional — this library publishes no CSS.";

/**
 * The disclaimer, verbatim (`docs-site.md` §3.4 row 4). Required near the top of the docs home **and** in the
 * footer of every page (`docs-site.md` §3.4 row 4), and the link to chakra-ui.com is part of the
 * wording rather than a courtesy — it is what turns a disclaimer into a redirect.
 *
 * Split at the link so the link is a real anchor rather than a string containing a URL.
 */
export const DISCLAIMER = {
  before:
    "chakra-ui-solid is not affiliated with, sponsored by, or endorsed by Chakra Systems Inc. or " +
    "the Chakra UI maintainers. “Chakra UI” is their trademark, and it is used here only to " +
    "describe what this library targets. If you are looking for the official React version, check out ",
  linkText: "chakra-ui.com",
  linkHref: "https://chakra-ui.com",
  after: ".",
} as const;
