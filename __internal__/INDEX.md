# The anchor index

**Generated — do not edit.** `pnpm docs:index` rewrites it; `check:doc-index` fails the build when
it has drifted from the documents it describes.

**What a row is.** One section of one `__internal__` document: its anchor as a citation writes it,
the line range to read, and what reading that range costs.

```
§3.5   L 512–587    3.1 KB  Static extraction, and the third option
```

**Sizes nest — do not add them up.** A `§3` row spans its `§3.5` children, so it reports the cost of
reading the whole section. The child rows report the cost of reading only that part.

**Titles are the only text copied out of the documents.** A heading names a rule; the body states
it. The bodies stay in one place, which is the point of having an index at all.

**Read this file in slices.** The summary below says which file a citation lives in and where its
block starts *in this file*. A block is a few KB — read that one, not the whole index.

**Sizes are UTF-8 bytes**, the same measure `check:context-budget` enforces its ceilings in.

**A sharded entry is a file, and its anchor did not move.** `decisions.md` §3's entries live one
per file under `decisions/` and `testing.md` §8's check definitions under `testing/`, so
`§3.13` and `§8.2` are indexed under those paths rather than under the parent document.

---

## The 30 indexed files

| Document | Size | Lines | Sections | Largest section | Block starts |
|---|---|---|---|---|---|
| [`component-blueprint.md`](#component-blueprintmd) | 92.1 KB | 1663 | 79 | §11 at 20.9 KB | L65 |
| [`decisions.md`](#decisionsmd) | 50.2 KB | 495 | 14 | §6 at 11.6 KB | L149 |
| [`decisions/3.01-p1-identity-law-reference-policy.md`](#decisions301-p1-identity-law-reference-policymd) | 8.8 KB | 125 | 1 | §3.1 at 8.8 KB | L168 |
| [`decisions/3.02-p2-evidence-base.md`](#decisions302-p2-evidence-basemd) | 9.6 KB | 143 | 1 | §3.2 at 9.6 KB | L174 |
| [`decisions/3.03-p3-architecture.md`](#decisions303-p3-architecturemd) | 20.5 KB | 294 | 1 | §3.3 at 20.5 KB | L180 |
| [`decisions/3.04-p4-adapter-milestone-one.md`](#decisions304-p4-adapter-milestone-onemd) | 10.4 KB | 142 | 1 | §3.4 at 10.4 KB | L186 |
| [`decisions/3.05-p5-blueprint.md`](#decisions305-p5-blueprintmd) | 6.6 KB | 103 | 1 | §3.5 at 6.6 KB | L192 |
| [`decisions/3.06-p6-parity-matrix.md`](#decisions306-p6-parity-matrixmd) | 8.7 KB | 130 | 1 | §3.6 at 8.7 KB | L198 |
| [`decisions/3.07-p7-quality-bar.md`](#decisions307-p7-quality-barmd) | 5.7 KB | 85 | 1 | §3.7 at 5.7 KB | L204 |
| [`decisions/3.08-p8-docs-site.md`](#decisions308-p8-docs-sitemd) | 4.7 KB | 73 | 1 | §3.8 at 4.7 KB | L210 |
| [`decisions/3.09-p9-ledger-and-index.md`](#decisions309-p9-ledger-and-indexmd) | 1.1 KB | 17 | 1 | §3.9 at 1.1 KB | L216 |
| [`decisions/3.10-s1-repo-bootstrap.md`](#decisions310-s1-repo-bootstrapmd) | 4.8 KB | 66 | 1 | §3.10 at 4.8 KB | L222 |
| [`decisions/3.11-s1-review.md`](#decisions311-s1-reviewmd) | 6.7 KB | 86 | 1 | §3.11 at 6.7 KB | L228 |
| [`decisions/3.12-s2-zag-solid.md`](#decisions312-s2-zag-solidmd) | 15.7 KB | 192 | 1 | §3.12 at 15.7 KB | L234 |
| [`decisions/3.13-s3-styling-seam.md`](#decisions313-s3-styling-seammd) | 23.3 KB | 309 | 1 | §3.13 at 23.3 KB | L240 |
| [`decisions/3.14-s3b-visual-surfaces.md`](#decisions314-s3b-visual-surfacesmd) | 60.7 KB | 771 | 1 | §3.14 at 60.7 KB | L246 |
| [`decisions/3.15-context-budget.md`](#decisions315-context-budgetmd) | 18.8 KB | 228 | 1 | §3.15 at 18.8 KB | L252 |
| [`decisions/3.16-s4-reconciliation.md`](#decisions316-s4-reconciliationmd) | 10.0 KB | 129 | 1 | §3.16 at 10.0 KB | L258 |
| [`decisions/3.17-s5-landing-page-reconciliation.md`](#decisions317-s5-landing-page-reconciliationmd) | 7.6 KB | 96 | 1 | §3.17 at 7.6 KB | L264 |
| [`definition-of-done.md`](#definition-of-donemd) | 63.3 KB | 545 | 22 | §8 at 14.8 KB | L270 |
| [`docs-plan.md`](#docs-planmd) | 60.5 KB | 916 | 46 | §1 at 13.9 KB | L297 |
| [`docs-site.md`](#docs-sitemd) | 80.3 KB | 888 | 37 | §2 at 19.2 KB | L348 |
| [`plan.md`](#planmd) | 78.9 KB | 1167 | 51 | §3 at 14.7 KB | L390 |
| [`prior-art.md`](#prior-artmd) | 75.7 KB | 1140 | 45 | §2 at 11.1 KB | L446 |
| [`roadmap.md`](#roadmapmd) | 90.2 KB | 1209 | 50 | §4 at 14.6 KB | L496 |
| [`testing.md`](#testingmd) | 71.8 KB | 1032 | 51 | §3 at 11.4 KB | L551 |
| [`testing/8.01-doc-index.md`](#testing801-doc-indexmd) | 4.3 KB | 59 | 1 | §8.1 at 4.3 KB | L607 |
| [`testing/8.02-skill-pointers.md`](#testing802-skill-pointersmd) | 5.1 KB | 71 | 1 | §8.2 at 5.1 KB | L613 |
| [`testing/8.03-context-budget.md`](#testing803-context-budgetmd) | 10.2 KB | 150 | 3 | §8.3 at 10.2 KB | L619 |
| [`zag-solid-adapter.md`](#zag-solid-adaptermd) | 76.2 KB | 1031 | 45 | §6 at 11.5 KB | L627 |

## `component-blueprint.md`

```
§0     L  57–104   3.7 KB  Q7 — Dialog, and what Accordion would not have exercised
§0.1   L  59–75    1.7 KB  The answer: Dialog
§0.2   L  76–94    1.3 KB  Accordion, rejected — and the one thing it would have covered that Dialog does not
§0.3   L  95–104   0.5 KB  One correction to the brief's part list — `Portal` is not a Dialog part
§1     L 105–200   5.8 KB  The recurring floor, re-measured against Chakra
§1.1   L 111–124   0.9 KB  Row 1 — `hidden` vs the recipe's `display`: a global rule, not a per-component one
§1.2   L 125–157   1.8 KB  Row 2 — the labelling IDREF: half of it is Ark's, and we port it
§1.3   L 158–180   1.6 KB  Row 3 — `@zag-js/focus-visible` crashing Storybook: once per preview, not per component
§1.4   L 181–200   1.2 KB  What a component actually pays
§2     L 201–292   5.0 KB  Machine instantiation
§2.1   L 203–217   0.7 KB  A Root calls `useMachine` bare — and the idiom the plan teaches no longer exists
§2.2   L 218–233   1.0 KB  Where a `[STRICT_READ_UNTRACKED]` at that call site *is* a genuine defect
§2.3   L 234–254   1.0 KB  The four things every Root injects, and where they come from
§2.4   L 255–262   0.5 KB  Read the machine's prop list, do not invent one
§2.5   L 263–276   0.9 KB  `withDefaults`, never `merge`
§2.6   L 277–292   0.9 KB  The controlled-mode predicate, and the parts it touches
§3     L 293–447   8.5 KB  `anatomy` → part components
§3.1   L 295–325   1.7 KB  Two lists that are not the same set
§3.2   L 326–336   0.7 KB  The four part shapes
§3.3   L 337–358   1.2 KB  Context: composition, not inheritance
§3.4   L 359–396   2.1 KB  Prop forwarding and precedence
§3.5   L 397–409   0.5 KB  The `render` prop
§3.6   L 410–424   0.8 KB  Ref handling
§3.7   L 425–447   1.3 KB  `data-*` state attributes
§4     L 448–590   7.6 KB  `renderStyled` and the `recipeClass` seam
§4.1   L 455–515   3.7 KB  The four additions `renderStyled` needs
§4.1.1 L 466–515   2.8 KB  Addition 4, and the failure that forces it
§4.2   L 516–550   1.4 KB  Slot-recipe consumption: resolve once on the Root
§4.3   L 551–571   1.2 KB  What we depend on in the generated surface, and what we do not
§4.4   L 572–580   0.4 KB  `unstyled`, at two levels
§4.5   L 581–590   0.5 KB  The seam has no precedent — so the first component is a probe
§5     L 591–641   3.1 KB  Where inline `style` and CSS custom properties are legal
§5.1   L 593–602   0.9 KB  The three routes, at part level
§5.2   L 603–616   0.7 KB  What the machine emits as inline `style`, and why it is legal
§5.3   L 617–623   0.5 KB  The recipe's own custom properties are route 3, done by the recipe
§5.4   L 624–641   0.9 KB  Making the rule checkable, because route 3 used as route 1 fails silently
§6     L 642–704   3.4 KB  The `hidden`-vs-`display` rule
§6.1   L 644–656   0.7 KB  Both worked failures, so the mechanism is not re-derived
§6.2   L 657–666   0.6 KB  Chakra pays neither half, by two mechanisms that are ours to port
§6.3   L 667–690   1.6 KB  The rule, written to survive either answer to P3-E
§6.4   L 691–704   0.4 KB  The test that pins it
§7     L 705–861   7.8 KB  Presence — a build over a machine, not a carry-over
§7.1   L 707–726   1.5 KB  The split, drawn exactly
§7.2   L 727–820   4.0 KB  The render strategy, in full
§7.3   L 821–828   0.5 KB  `hideMode: "activity"` has no Solid equivalent
§7.4   L 829–841   0.7 KB  `hidden` and `data-state` come from presence, overriding the machine
§7.5   L 842–861   1.1 KB  Where a presence is created
§8     L 862–888   1.6 KB  Retained primitives: none. The column is deleted.
§9     L 889–956   4.5 KB  The a11y baseline, stated so a correct port cannot read as a regression
§9.1   L 891–908   1.2 KB  What a faithful Dialog port scores, and why
§9.2   L 909–935   1.9 KB  What is **not** an allowance — and this changes the expected count
§9.3   L 936–956   1.2 KB  How the definition of done has to say it
§10    L 957–1063  6.8 KB  SSR and hydration
§10.1  L 965–981   1.1 KB  `_hk` — Solid matches server and client nodes by position
§10.2  L 982–1010  2.0 KB  The `children()` decision procedure
§10.3  L1011–1036  1.4 KB  Portal-guarded cross-scope writes — and why a 1:1 port makes none
§10.4  L1037–1052  1.1 KB  Two hazards a machine component inherits from the compiler
§10.5  L1053–1063  0.8 KB  What is inferred, and where it gets checked
§11    L1064–1595 20.9 KB  Dialog, worked fully through
§11.1  L1069–1091  1.2 KB  File layout
§11.2  L1092–1123  1.3 KB  `dialog-context.ts`
§11.3  L1124–1238  4.5 KB  `dialog-root.tsx`
§11.4  L1239–1278  1.7 KB  `dialog-trigger.tsx` — shape A, plus the one line §1.2 buys
§11.5  L1279–1328  1.7 KB  `dialog-backdrop.tsx` — shape B, owning its own presence
§11.6  L1329–1352  0.8 KB  `dialog-positioner.tsx` — shape A, gated on the shared presence
§11.7  L1353–1400  1.8 KB  `dialog-content.tsx` — shape B, sharing the Root's presence
§11.8  L1401–1421  0.8 KB  `dialog-title.tsx` and `dialog-description.tsx` — shape A at its smallest
§11.9  L1422–1438  0.5 KB  `dialog-close-trigger.tsx` — shape A on a button
§11.10 L1439–1463  0.8 KB  `dialog-slots.tsx` — shape C, ×3
§11.11 L1464–1499  1.3 KB  `dialog-action-trigger.tsx` — shape D, and the only `composeEventHandlers` in the family
§11.12 L1500–1544  2.0 KB  `Portal` — a standalone component, in its own folder
§11.13 L1545–1578  1.3 KB  `namespace.ts` and what a consumer writes
§11.14 L1579–1595  1.0 KB  Everything it imports, and where each thing comes from
§12    L1596–1627  3.3 KB  Assumptions this blueprint rests on, and the gate for each
§12.1  L1598–1607  1.3 KB  `brief-plan` §8 assumptions
§12.2  L1608–1615  0.6 KB  `plan.md` §11.2's P3 assumptions this blueprint depends on
§12.3  L1616–1627  1.3 KB  New assumptions P5 introduces
§13    L1628–1644  3.8 KB  What P5 changes — re-plan P6 before P6 is written
§14    L1645–1663  2.4 KB  What P5 could not act on
```

## `decisions.md`

```
§0   L 34–91   4.3 KB  The division of labour — this file, `CLAUDE.md`, and the eleven `__internal__` documents
§0.1 L 67–73   0.4 KB  Citing the two plans
§0.2 L 74–91   1.0 KB  Changing a decision after this pass
§1   L 92–106  0.7 KB  The entry shape, fixed once
§2   L107–129  3.2 KB  Q1–Q8 — the gate that settled each, and where the answer lives
§3   L130–166  5.2 KB  The ledger
§4   L167–224  7.3 KB  The reversals, in one place
§5   L225–265  5.1 KB  The final build order — one list, each step's gate cited
§6   L266–414 11.6 KB  What the document pass did **not** settle
§6.1 L334–414  7.2 KB  The S4 marking pass — what was measured, and what was only ever predicted
§7   L415–495 10.7 KB  The reconciliation log — what P9 changed, and where
§7.1 L421–459  7.5 KB  Carried forward by name
§7.2 L460–481  1.4 KB  The citation convention, and the sites it was applied to
§7.3 L482–495  1.5 KB  Two rows found at P9 that were on nobody's list
```

## `decisions/3.01-p1-identity-law-reference-policy.md`

```
§3.1 L  1–125 8.8 KB  P1 — identity, law, and the reference policy
```

## `decisions/3.02-p2-evidence-base.md`

```
§3.2 L  1–143 9.6 KB  P2 — the evidence base, and the rule that reset the a11y scope
```

## `decisions/3.03-p3-architecture.md`

```
§3.3 L  1–294 20.5 KB  P3 — architecture
```

## `decisions/3.04-p4-adapter-milestone-one.md`

```
§3.4 L  1–142 10.4 KB  P4 — the adapter, milestone one
```

## `decisions/3.05-p5-blueprint.md`

```
§3.5 L  1–103 6.6 KB  P5 — the blueprint
```

## `decisions/3.06-p6-parity-matrix.md`

```
§3.6 L  1–130 8.7 KB  P6 — the parity matrix
```

## `decisions/3.07-p7-quality-bar.md`

```
§3.7 L 1–85 5.7 KB  P7 — the quality bar
```

## `decisions/3.08-p8-docs-site.md`

```
§3.8 L 1–73 4.7 KB  P8 — the docs site
```

## `decisions/3.09-p9-ledger-and-index.md`

```
§3.9 L 1–17 1.1 KB  P9 — the ledger and the index
```

## `decisions/3.10-s1-repo-bootstrap.md`

```
§3.10 L 1–66 4.8 KB  S1 — repo bootstrap
```

## `decisions/3.11-s1-review.md`

```
§3.11 L 1–86 6.7 KB  S1 review — the author has no way to see the work, and the order is what caused it
```

## `decisions/3.12-s2-zag-solid.md`

```
§3.12 L  1–192 15.7 KB  S2 — `@chakra-ui-solid/zag-solid`, milestone one
```

## `decisions/3.13-s3-styling-seam.md`

```
§3.13 L  1–309 23.3 KB  S3 — the styling seam
```

## `decisions/3.14-s3b-visual-surfaces.md`

```
§3.14 L  1–771 60.7 KB  S3b — the visual surfaces
```

## `decisions/3.15-context-budget.md`

```
§3.15 L  1–228 18.8 KB  The context budget — the documents as a working surface
```

## `decisions/3.16-s4-reconciliation.md`

```
§3.16 L  1–129 10.0 KB  S4 — the reconciliation pass, measured against predicted
```

## `decisions/3.17-s5-landing-page-reconciliation.md`

```
§3.17 L 1–96 7.6 KB  S5 — the landing page, and the documents that still described the old one
```

## `definition-of-done.md`

```
§0    L 21–42   1.2 KB  The gate rule
§1    L 43–66   3.4 KB  Per file
§2    L 67–103  6.3 KB  Per component
§3    L104–151 10.7 KB  Per batch
§3.0  L110–121  0.6 KB  The gate every batch shares
§3.1  L122–136  5.1 KB  The probe phase
§3.2  L137–151  4.8 KB  The batches
§4    L152–171  1.7 KB  Per release
§5    L172–208  3.1 KB  The axe allowance register — as it stands today
§6    L209–240  2.2 KB  The coverage allow-list — as it stands today
§7    L241–261  4.9 KB  Conventions, unenforced — labelled, not hidden
§7b   L262–348  5.9 KB  Named, not yet written — the enforcement census
§8    L349–469 14.8 KB  The assumption register
§8.1  L373–388  2.2 KB  `brief-plan` §8's originals
§8.2  L389–408  2.7 KB  P3, P4 and P5
§8.3  L409–421  2.1 KB  P6 and P7
§8.3b L422–444  2.7 KB  P8
§8.3c L445–455  2.8 KB  S4 — the reconciliation pass
§8.4  L456–469  0.7 KB  The three whose gate is a measurement plus a judgement
§9    L470–490  1.3 KB  The scheduled checks — what fires them, who reads them
§10   L491–513  3.5 KB  What P7 changes — re-plan P8 and P9 against this
§11   L514–545  3.2 KB  What P7 could not act on
```

## `docs-plan.md`

```
§0    L 32–71   3.3 KB  What this document specs, and where the rest of the site is
§1    L 72–274 13.9 KB  `/docs/styling/static-extraction`
§1.1  L 76–97   1.6 KB  The frame, and why it is not Chakra's
§1.2  L 98–200  6.9 KB  Section order
§1.3  L201–211  0.8 KB  Two things the page must state that no other page will
§1.4  L212–223  0.7 KB  The gate — the catalogue is a fixture, not prose
§1.5  L224–274  3.7 KB  D-1 answered — a dedicated minimal build, and the page is *generated from* it
§2    L275–286  1.1 KB  Open — both closed
§3    L287–385  6.1 KB  `/` — the docs home
§3.1  L297–320  1.6 KB  The frame — copied, minus the claims
§3.2  L321–378  3.8 KB  Section order
§3.3  L379–385  0.2 KB  What this page renders
§4    L386–507  7.2 KB  `/docs/get-started/*` — install, frameworks, environments
§4.1  L392–439  2.6 KB  `installation` — section order
§4.2  L440–476  2.6 KB  `frameworks/*` — one page each, one fact each
§4.3  L477–484  0.5 KB  `environments/{shadow-dom,iframe}`
§4.4  L485–498  0.9 KB  `ai/llms` — deferred to before first public release
§4.5  L499–507  0.4 KB  What this tier renders
§5    L508–592  6.2 KB  `/docs/get-started/migration` — coming from Chakra UI (React)
§5.1  L513–526  0.9 KB  The frame: two causes, and the page must not merge them
§5.2  L527–566  3.6 KB  Section order
§5.3  L567–572  0.3 KB  What this page must not do
§5.4  L573–592  1.1 KB  Where the parity sentence appears verbatim, and where it does not
§6    L593–658  4.2 KB  `/docs/theming/chakra-config` — the config function
§6.1  L608–650  3.1 KB  Section order
§6.2  L651–658  0.3 KB  What this page renders
§7    L659–765  7.5 KB  `/docs/styling/*` and `/docs/theming/*`
§7.1  L673–693  2.1 KB  The styling tier
§7.2  L694–721  2.0 KB  `dark-mode` and `semantic-tokens` — the contract, and the snippet
§7.3  L722–733  0.7 KB  `recipes` and `slot-recipes`
§7.4  L734–757  1.7 KB  `customization/*` — the four override paths
§7.5  L758–765  0.3 KB  What these tiers must not say
§8    L766–916  8.9 KB  The component page — one template, applied 111 times
§8.1  L784–797  0.8 KB  Frontmatter
§8.2  L798–803  0.3 KB  Live preview + code fusion
§8.3  L804–809  0.3 KB  `## Usage`
§8.4  L810–816  0.3 KB  `## Examples`
§8.5  L817–823  0.4 KB  `## Parts`
§8.6  L824–830  0.3 KB  `## Props`
§8.7  L831–847  0.9 KB  `### ids` — on every component page with a machine
§8.8  L848–866  1.3 KB  `### render`
§8.9  L867–877  0.6 KB  `### Context`, `### RootProvider`, `### PropsProvider`
§8.10 L878–895  1.3 KB  `### Dynamic values` — only on the eight implementations `roadmap.md` §3.1 marks
§8.11 L896–902  0.4 KB  `### Presence` — only on presence-gated components
§8.12 L903–908  0.3 KB  `### Accessibility` — optional, and drawn from the machine
§8.13 L909–916  0.4 KB  What the template must not contain
```

## `docs-site.md`

```
§0   L 43–65   1.6 KB  The division of labour with `docs-plan.md`
§1   L 66–207  9.9 KB  The app
§1.1 L 68–91   1.7 KB  The stack, and the second job it has to do
§1.2 L 92–108  1.8 KB  The config, and the four knobs that are not preferences
§1.3 L109–120  0.7 KB  Dev resolves to `src`, build resolves to `dist`
§1.4 L121–143  1.5 KB  MDX, and why the highlighter runs at build time
§1.5 L144–157  0.7 KB  Prerender: static output, not SPA mode
§1.6 L158–174  1.3 KB  Cloudflare Pages — the setup, in order
§1.7 L175–207  2.2 KB  Plan B — Vite SPA + `@solidjs/router`, and what makes it an exit rather than a rewrite
§2   L208–382 19.2 KB  The information architecture
§2.1 L210–301  8.8 KB  The route map
§2.2 L302–339  7.5 KB  What chakra-ui.com has and we do not — one reason each
§2.3 L340–355  1.2 KB  What we have and chakra-ui.com does not
§2.4 L356–382  1.6 KB  The count trap
§3   L383–524 11.7 KB  The copyright boundary — every place upstream expression would be reproduced
§3.1 L422–428  0.4 KB  The rule, cited
§3.2 L429–448  3.6 KB  The flag list
§3.3 L449–486  2.4 KB  The docs app is in the registry, and what `package: null` drops
§3.4 L487–524  2.6 KB  Trademark — the chrome
§4   L525–669 11.1 KB  The machinery every page shares
§4.1 L527–545  1.2 KB  The examples pipeline — an example is a deliverable
§4.2 L546–572  1.9 KB  The props table — generated from types, and what a missing one looks like
§4.3 L573–590  1.2 KB  Generated pages — tokens and style props
§4.4 L591–616  2.8 KB  The playground, constrained by `plan.md` §0
§4.5 L617–631  1.5 KB  Free-form editing — deferred, with the options recorded
§4.6 L632–669  2.4 KB  `llms.txt` — deferred to before first public release, with its cost stated
§5   L670–700  3.7 KB  What the docs must never say
§6   L701–765  7.9 KB  The docs build gate — a docs page is a deliverable
§6.1 L703–741  5.3 KB  What CI asserts
§6.2 L742–757  2.3 KB  What it cannot assert
§6.3 L758–765  0.3 KB  Where the job sits
§7   L766–815  3.9 KB  Assumptions
§7.1 L768–798  1.7 KB  `brief-plan` §8 assumption 6 — the runnable gate
§7.2 L799–815  2.1 KB  Assumptions P8 opens
§8   L816–834  3.4 KB  What P8 changes — re-plan P9 against this
§9   L835–865  2.9 KB  What P8 could not act on
§10  L866–888  2.1 KB  The P9 flags carried forward, untouched
```

## `plan.md`

```
§0    L  29–122   7.7 KB  The governing constraint: no runtime CSS-in-JS
§0.1  L  48–56    0.6 KB  Panda satisfies the rule
§0.2  L  57–72    0.8 KB  The hazard the rule creates — the central risk of the styling layer
§0.3  L  73–84    0.9 KB  What the rule does *not* forbid
§0.4  L  85–112   3.7 KB  What it costs — the parity delta, with its cause named
§0.5  L 113–122   0.4 KB  Consequence for the reference policy
§1    L 123–301  11.1 KB  Q2 — how consumers get CSS for variants their source never writes
§1.1  L 131–160   1.6 KB  The problem is one step wider than the plan states
§1.2  L 161–193   2.1 KB  Decision
§1.3  L 194–252   2.9 KB  What the preset declares, exactly
§1.4  L 253–261   1.2 KB  What `staticCss` cannot cover
§1.5  L 262–283   1.5 KB  If step 4 refutes it — the fallback ladder
§1.6  L 284–301   1.2 KB  Rejected
§2    L 302–402   5.9 KB  Q4 — the style-props API
§2.1  L 312–332   1.0 KB  Why Panda-shape, and what "Panda-shape" actually means here
§2.2  L 333–357   1.2 KB  The aliasing rule
§2.3  L 358–385   2.3 KB  Three additions `renderStyled` needs
§2.4  L 386–402   0.9 KB  Rejected
§3    L 403–645  14.7 KB  The styling layer
§3.1  L 405–431   2.4 KB  `panda.config.ts`, knob by knob
§3.2  L 432–460   2.0 KB  `eject` vs. an explicit `presets` array — decided, and the fix relocated
§3.3  L 461–494   2.6 KB  `@chakra-ui-solid/panda-preset` — what it is and what it exports
§3.4  L 495–533   1.9 KB  The consumer's config, and the two knobs that silently unstyle everything
§3.5  L 534–552   1.1 KB  The dynamic-value contract
§3.6  L 553–575   1.1 KB  How a component reaches a recipe
§3.7  L 576–596   1.4 KB  Override paths, and the one open preflight item
§3.8  L 597–645   2.1 KB  The responsive-variant opt-in
§4    L 646–741   6.0 KB  Distribution
§4.1  L 648–670   1.4 KB  Option B — ship the build info
§4.2  L 671–697   1.4 KB  The exports map
§4.3  L 698–706   0.5 KB  External, not inlined
§4.4  L 707–741   2.7 KB  We ship zero CSS — Panda is a prerequisite, not a preference
§5    L 742–872   8.9 KB  The package graph
§5.1  L 744–770   1.3 KB  The graph
§5.2  L 771–810   3.2 KB  Dependency direction — strictly downward
§5.3  L 811–832   2.3 KB  What `@chakra-ui-solid/system` owns
§5.4  L 833–845   0.7 KB  Seams
§5.5  L 846–872   1.4 KB  Subpath exports
§6    L 873–902   2.4 KB  Presence — a package-graph decision, not a component detail
§7    L 903–991   5.6 KB  Color mode, direction, locale, environment
§7.1  L 905–958   4.0 KB  Color mode: we ship a primitive, and no provider
§7.2  L 959–981   1.0 KB  Direction, locale and environment: two contexts, no catalog
§7.3  L 982–991   0.5 KB  RTL and logical properties
§8    L 992–1022  2.1 KB  Build mechanics
§9    L1023–1048  1.4 KB  Dev-time resolution and codegen ordering
§10   L1049–1090  2.6 KB  Workstream B — the non-machine surface
§11   L1091–1121  3.0 KB  Assumptions this architecture rests on
§11.1 L1093–1105  1.5 KB  `brief-plan` §8 assumptions P3 depends on
§11.2 L1106–1121  1.4 KB  New assumptions P3 introduces
§12   L1122–1142  4.1 KB  What P3 changes in the plan — re-plan P4 and P5 against this
§13   L1143–1167  1.9 KB  What P3 could not settle
```

## `prior-art.md`

```
§0    L  18–83    3.5 KB  How to read this
§0.1  L  20–29    0.3 KB  Every claim is runnable
§0.2  L  30–46    1.4 KB  The four refs
§0.3  L  47–64    0.9 KB  Paths moved between refs — this is the most common way to waste an hour
§0.4  L  65–83    0.9 KB  Two counting conventions, and why the difference matters
§1    L  84–110   1.8 KB  The headline: what the prior art proves, and what it does not
§2    L 111–337  11.1 KB  The Panda era — 43 commits to `e9c2f81`
§2.1  L 113–134   1.1 KB  Why they left, and why it is not a Panda failure
§2.2  L 135–177   1.7 KB  `panda.config.ts` — and the one knob that does not transfer
§2.3  L 178–210   2.0 KB  `jsxFramework: "solid"` must be **set** — traced to its source
§2.4  L 211–230   1.0 KB  `/patterns` are fair game; only `/jsx` is banned
§2.5  L 231–272   2.6 KB  `renderStyled` — 104 lines, and the four details that cost something to learn
§2.6  L 273–305   1.2 KB  The distribution shape hope-ui shipped
§2.7  L 306–337   1.4 KB  `staticCss` in a preset — the precedent nobody recorded
§3    L 338–480   9.6 KB  The spike — `spike/zag-solid`, 7 commits to `ef91b69`
§3.1  L 340–359   1.0 KB  What is on the branch
§3.2  L 360–383   2.2 KB  The verdict is a sequence of four commits, not a conclusion
§3.3  L 384–427   3.0 KB  The ten axes, as finally scored
§3.4  L 428–468   2.8 KB  The amortization result — the finding that makes a 100-component library viable
§3.5  L 469–480   0.6 KB  The identity question that stalled hope-ui is not live for us
§4    L 481–580   5.1 KB  §1.6's calibration — what the prior art does **not** de-risk
§4.1  L 486–509   0.8 KB  hope-ui never used `@chakra-ui/panda-preset`. At all.
§4.2  L 510–530   1.2 KB  The recipe layer, quantified
§4.3  L 531–557   1.9 KB  The `data-*` vocabulary advantage is real — spot-checked, not proven
§4.4  L 558–580   1.0 KB  hope-ui's own tests assert class names, which Panda makes insufficient
§5    L 581–689   6.5 KB  The three standing taxes, with both worked failures
§5.1  L 591–643   3.2 KB  `hidden` vs the recipe's `display` — a **styling-convention** collision
§5.2  L 644–660   1.0 KB  An unconditionally-emitted labelling IDREF — an **id-strategy** collision
§5.3  L 661–689   1.7 KB  `@zag-js/focus-visible` crashes Storybook — a **host-environment** collision
§6    L 690–738   4.3 KB  The measured adapter defects, and where they live now
§6.1  L 717–738   1.3 KB  The fork's own trajectory
§7    L 739–833   5.3 KB  The `inert` gap, re-measured at our target version
§8    L 834–969   9.9 KB  Two rules this evidence sets, and one boundary they draw
§8.1  L 836–877   3.1 KB  The methodology rule — measure the dependency, do not reason about its source
§8.2  L 878–937   4.9 KB  The port rule — no a11y beyond Zag, nothing Chakra does not have
§8.3  L 938–969   1.9 KB  Presence, drawn precisely — the one carry-over that becomes a build
§9    L 970–1057  8.1 KB  Carry-over verdicts with attribution status
§9.1  L1018–1034  1.0 KB  Carry-overs the evidence no longer supports copying
§9.2  L1035–1057  1.3 KB  The port rule removes the repo's only Apache-2.0 obligation
§10   L1058–1140  9.3 KB  What P2 contradicts — for re-planning before P3
§10.1 L1063–1083  3.2 KB  The port rule — the widest change, and it came from the P2 gate, not the checkout
§10.2 L1084–1100  3.2 KB  Measurement contradictions
§10.3 L1101–1115  1.2 KB  Structural facts, not contradictions, that later phases should not assume away
§10.4 L1116–1131  1.1 KB  Confirmed unchanged, so nobody re-checks them
§10.5 L1132–1140  0.5 KB  Not reproducible from git, and not disputed
```

## `roadmap.md`

```
§1    L  54–270  11.5 KB  The three enumerations, measured
§1.1  L  59–82    1.3 KB  Chakra — 115 component directories, not 118 entries
§1.2  L  83–129   2.3 KB  Zag — 51 machines, 49 anatomy exports, 406 parts
§1.3  L 130–258   7.2 KB  The preset — 18 recipes + 56 slot recipes, and three things the count hides
§1.4  L 259–270   0.6 KB  `brief-plan` §8 assumption 2 is closed
§2    L 271–408   7.9 KB  The 56-vs-51 reconciliation
§2.1  L 273–300   1.3 KB  Both of `plan.md` §10's sentences cannot be exactly true, and one of them is not
§2.2  L 301–319   1.2 KB  The seven slot recipes that reach a machine under a different name
§2.3  L 320–342   1.1 KB  The fifteen slot recipes with no machine
§2.4  L 343–377   2.4 KB  The seventeen machines with no slot recipe — and the thirteen with no Chakra component
§2.5  L 378–408   1.8 KB  Four components whose recipe key resolves to nothing — in Chakra too
§3    L 409–484   5.1 KB  The matrix — columns, and the one that needs re-pointing
§3.1  L 427–484   4.0 KB  What the CIJ column means, and what it must not become
§4    L 485–646  14.6 KB  The matrix
§4.1  L 487–536   6.4 KB  Machine components — 45 rows
§4.2  L 537–556   1.5 KB  Multi-part components with no machine — 15 rows
§4.3  L 557–582   2.1 KB  Atomic-recipe components — 21 rows
§4.4  L 583–615   1.8 KB  Styled primitives and layout — 25 rows
§4.5  L 616–646   2.8 KB  Utilities, providers and re-exports — 9 rows, 10 folders
§5    L 647–790   8.9 KB  Exclusions, one reason each
§5.1  L 654–700   3.1 KB  `portal` — not an exclusion, but cut to the two things Solid's `Portal` gets wrong
§5.2  L 701–714   1.0 KB  `client-only` — **not an exclusion** either
§5.3  L 715–726   0.7 KB  `for` — **excluded**
§5.4  L 727–735   0.5 KB  `show` — **excluded**
§5.5  L 736–747   0.7 KB  `environment` — **not excluded; relocated**
§5.6  L 748–759   0.7 KB  `presence` — **not excluded**
§5.7  L 760–770   0.6 KB  Charts — **excluded**, and the reason is a dependency, not a style
§5.8  L 771–790   1.2 KB  Seven of the fourteen `./hooks` — **excluded individually**
§6    L 791–857   3.2 KB  The presence-gated set — two families, not one
§6.1  L 796–815   0.9 KB  Family Z — a `@zag-js/presence` instance
§6.2  L 816–836   1.2 KB  Family M — machine-owned visibility, no presence instance
§6.3  L 837–857   0.9 KB  The `aria-controls` override, by component
§7    L 858–913   3.8 KB  The fifth part shape — the repeated part
§7.1  L 864–889   2.0 KB  The component that settles it: **Accordion**
§7.2  L 890–913   1.5 KB  What Accordion must prove
§8    L 914–973   3.6 KB  The floating seam, and where the first floating component lands
§8.1  L 916–941   1.3 KB  The seam, restated so the sequencing argument is legible
§8.2  L 942–973   2.2 KB  The first floating component: **Popover, at step 5b — immediately after Dialog, before volume**
§9    L 974–1045  7.7 KB  The build order
§9.1  L 980–1012  3.5 KB  The probe phase — unchanged, plus one insertion
§9.2  L1013–1034  3.4 KB  The batches
§9.3  L1035–1045  0.6 KB  Ordering constraints that are not preferences
§10   L1046–1081  2.7 KB  `RootProvider`, `PropsProvider`, `Context`, and `./hooks`
§11   L1082–1114  2.5 KB  What the matrix adds to the dependency graph
§12   L1115–1147  4.8 KB  Assumptions — closed, opened, left open
§12.1 L1117–1124  1.7 KB  `brief-plan` §8 assumptions P6 owns
§12.2 L1125–1135  2.3 KB  Assumptions P6 introduces
§12.3 L1136–1147  0.7 KB  Assumptions P6 depends on and does not touch
§13   L1148–1173  6.3 KB  What P6 changes — re-plan P7–P9 against this
§14   L1174–1209  3.8 KB  What P6 could not act on
```

## `testing.md`

```
§0   L  37–58    1.4 KB  The division of labour with `definition-of-done.md`
§1   L  59–188   7.7 KB  The three-project split, and why it is by module resolution
§1.1 L  74–82    0.4 KB  `unit` — node, no DOM
§1.2 L  83–94    0.8 KB  `ssr` — the only project resolving the server builds of **both** `solid-js` and `@solidjs/web`
§1.3 L  95–101   0.4 KB  `browser` — real Chromium, real scrollbars
§1.4 L 102–122   1.3 KB  `mount()` — the reactivity-diagnostic gate
§1.5 L 123–138   1.0 KB  Hydration round-trip fixtures
§1.6 L 139–155   1.1 KB  `solid-contract` characterization tests
§1.7 L 156–170   1.0 KB  `check:test-projects` — a mis-suffixed test is a test that never runs
§1.8 L 171–188   1.1 KB  Sequencing: the harness and the split land at **milestone one**
§2   L 189–254   2.8 KB  Computed-style assertions, and the ban on class-name assertions
§2.1 L 191–209   0.8 KB  The worked failure, so the rule is not re-derived
§2.2 L 210–237   1.1 KB  What a correct assertion looks like
§2.3 L 238–245   0.4 KB  The one carve-out, so the rule is not wrong
§2.4 L 246–254   0.4 KB  Enforcement — `check:style-contract` rule 3
§3   L 255–449  11.4 KB  The generated-CSS coverage check — `check:css-coverage`
§3.1 L 262–273   0.6 KB  What it diffs
§3.2 L 274–308   1.9 KB  How set E is built
§3.3 L 309–330   1.4 KB  The dedupe step — or seven permanent false failures
§3.4 L 331–359   1.3 KB  The allow-list — shape
§3.5 L 360–390   1.6 KB  The configuration canary — failing loudly on a `hash`/`prefix` mismatch
§3.6 L 391–425   1.8 KB  Failure output
§3.7 L 426–438   2.0 KB  What it does **not** catch — five things, each with the artefact that does
§3.8 L 439–449   0.6 KB  Where it runs
§4   L 450–530   4.5 KB  axe
§4.1 L 452–481   1.7 KB  The runner
§4.2 L 482–515   2.0 KB  The allowance register — shape
§4.3 L 516–530   0.8 KB  What the register's contents are, and where they live
§5   L 531–609   4.6 KB  The §0 checks — two checks, not one grep
§5.1 L 542–554   0.7 KB  `check:no-cij-manifest`
§5.2 L 555–569   0.8 KB  `check:no-runtime-sheet`
§5.3 L 570–595   1.6 KB  What merging them would have wrongly failed — in both directions
§5.4 L 596–609   0.7 KB  When they run (`zag-solid-adapter.md` §5.5)
§6   L 610–719   6.6 KB  The lint rules
§6.1 L 618–639   1.3 KB  Rule 1 — `style-prop-static-value` (route 3 used as route 1)
§6.2 L 640–673   2.1 KB  Rule 2 — `require-style-source` (the style-prop collision)
§6.3 L 674–677   0.1 KB  Rule 3 — `no-class-name-assertion`
§6.4 L 678–695   1.1 KB  The census — `check:style-prop-collisions` (P5-D's gate, and `dir`'s tripwire)
§6.5 L 696–719   1.5 KB  The answer to `docs-plan.md` §2 **D-2**
§7   L 720–831   7.1 KB  Storybook — the local playground
§7.1 L 727–732   0.3 KB  Scope, restated because it decides what is *not* built
§7.2 L 733–770   2.3 KB  The warm-up and the pin — P7's configuration, once per preview
§7.3 L 771–800   2.1 KB  There is no story gate, because a story is not the validation surface
§7.4 L 801–831   2.0 KB  What only Storybook can see
§8   L 832–880   9.4 KB  The distribution, styling-config and structural checks
§9   L 881–933   5.1 KB  The attribution checks
§10  L 934–968   2.5 KB  The bundle measurement — `check:bundle`
§11  L 969–987   2.6 KB  The scheduled upstream checks
§12  L 988–1009  2.4 KB  The CI job map
§13  L1010–1026  1.0 KB  What this apparatus assumes
§14  L1027–1032  0.3 KB  Where this document ends
```

## `testing/8.01-doc-index.md`

```
§8.1 L 1–59 4.3 KB  `check:doc-index` — the anchor index
```

## `testing/8.02-skill-pointers.md`

```
§8.2 L 1–71 5.1 KB  `check:skill-pointers` — the repo-authored skills
```

## `testing/8.03-context-budget.md`

```
§8.3   L  1–150 10.2 KB  `check:context-budget` — the growth guard, in two halves
§8.3.1 L 25–108  5.4 KB  The static half
§8.3.2 L109–150  3.1 KB  The transcript half — `pnpm check:context-budget --sessions`
```

## `zag-solid-adapter.md`

```
§0   L  34–59    1.3 KB  What milestone one is, and what "done" means
§1   L  60–168   8.0 KB  Q6 — copied or re-derived, answered twice
§1.1 L  78–101   2.0 KB  The fork — **copied, from `ef91b69`, all fourteen files**
§1.2 L 102–128   2.3 KB  The hope-ui-owned code milestone one needs — **copied, per item, per ref**
§1.3 L 129–168   2.7 KB  The rejected alternative for the fork — re-derive from upstream `1.43.0`
§2   L 169–253   4.7 KB  The upstream file set, exactly
§2.1 L 171–190   1.1 KB  Eight files, 594 lines, at `@zag-js/solid@1.43.0`
§2.2 L 191–216   1.4 KB  The fork is **7 + 7** — one file dropped, and why
§2.3 L 217–233   0.9 KB  v1 and v2 share the adapter **byte for byte** — a stronger claim than the plan's
§2.4 L 234–253   1.3 KB  What that means for a future v2 move — the move is adapter-*free*, not merely adapter-local
§3   L 254–339   6.7 KB  The public API, and parity with the react/vue/svelte/preact/vanilla siblings
§3.1 L 256–271   1.0 KB  The surface
§3.2 L 272–291   1.3 KB  Parity with the siblings
§3.3 L 292–301   0.9 KB  Two exports the fork does not carry
§3.4 L 302–318   2.0 KB  Five divergences *behind* the unchanged surface
§3.5 L 319–339   1.4 KB  What that costs a future re-sync
§4   L 340–430   8.5 KB  The four defects, at their current state
§4.1 L 345–358   2.1 KB  The four, as they stand
§4.2 L 359–384   1.6 KB  What P5 must **not** inherit — B5's idiom no longer exists
§4.3 L 385–430   4.6 KB  The predicted rows, re-checked — and three real deltas against `1.43.0`
§5   L 431–553   8.1 KB  The §0 compliance audit of the Zag machine set
§5.1 L 440–471   2.1 KB  The rule the audit is auditing against, stated first
§5.2 L 472–497   1.4 KB  What the audit runs
§5.3 L 498–521   2.3 KB  The result — run at P4
§5.4 L 522–540   1.1 KB  What a failure would mean
§5.5 L 541–553   0.6 KB  When it runs
§6   L 554–702  11.5 KB  The test plan — proving the adapter correct with no component involved
§6.1 L 559–585   2.4 KB  The four upstream test files, by name
§6.2 L 586–616   3.0 KB  The seven fork test files — and the overlap nobody should double-count
§6.3 L 617–649   2.5 KB  `solid-contract` characterization tests
§6.4 L 650–667   1.2 KB  What is deliberately **not** tested at this milestone
§6.5 L 668–702   2.2 KB  The gate
§7   L 703–815   6.0 KB  The attribution checklist — lands in the same commit as the code
§7.1 L 718–755   1.6 KB  The seven headers
§7.2 L 756–786   1.9 KB  The `NOTICE.md` rows — and the number that matters
§7.3 L 787–815   1.7 KB  The checklist, in commit order
§8   L 816–936   7.1 KB  The two upstream filings
§8.1 L 822–878   3.5 KB  A1 — boolean `aria-*` in `@zag-js/solid`
§8.2 L 879–936   3.3 KB  `ariaHidden` → `suppressOthers` in `@zag-js/aria-hidden`
§9   L 937–989   5.4 KB  Assumptions this milestone rests on, and their gates
§9.1 L 939–953   1.9 KB  `brief-plan` §8 assumptions
§9.2 L 954–978   2.2 KB  What `prior-art.md` §10.5 gets re-measured here, and what does not
§9.3 L 979–989   1.3 KB  New assumptions P4 introduces
§10  L 990–1017  5.1 KB  What P4 changes — re-plan P5 before P5 is written
§11  L1018–1031  1.8 KB  What P4 could not act on
```
