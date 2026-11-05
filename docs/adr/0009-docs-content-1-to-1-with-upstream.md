# Docs content is 1:1 with Chakra's docs

Each page follows its counterpart in Chakra's docs (`apps/www/content/docs`): section order, headings, example set, sentences. We adapt only where our API changes the claim (import path, `class` for `className`, `render` for `asChild`, Panda's build-time extraction). A local addition is appended after the section it qualifies, never in place of it. Our `<Example name=...>` maps 1:1 to upstream's `<ExampleTabs name=...>`; a page whose upstream counterpart has no examples gets none.

Examples carry upstream's content, not our corrections (an unlabelled close trigger in upstream stays unlabelled). Divergences are recorded as ADRs, not on the page ([0007](0007-divergences-recorded-docs-silent.md)).

## Placement and existence

- **No upstream page, no page.** `span`, `strong`, `quote`, `sticky` and `loader` are documented nowhere on chakra-ui.com, so they get nothing here. Being ported does not mean owing a page.
- **Document a component where upstream does.** `circle` and `square` are sections of the `center` page; `spacer` is a section of `flex`; the `input-group`, `input-addon` and `input-element` family lives inside `input`, with no pages of its own. Props upstream documents on no page (`startOffset`, `placement`, the addon pass-throughs) go undocumented here too; if that is ever felt, the fix is a section of the `input` page, never a page.
- **A nav entry needs a counterpart in upstream's own docs config.**

## Why

A near-copy was the goal, and a site written from a plan's template without opening the reference came out as "another website, not a chakra-ui docs on Solid": wrong sidebar scoping, a Box page with 2 examples instead of 6, a section upstream does not have. The reference is a checkout to open, not to reason about.

## Considered options

- **Rewrite every sentence.** Rejected: the licence does not require it ([0010](0010-docs-content-mit-derivative.md)) and it produced a site that did not read as Chakra's docs.
