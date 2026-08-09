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

## The 29 indexed files

| Document | Size | Lines | Sections | Largest section | Block starts |
|---|---|---|---|---|---|
| [`component-blueprint.md`](#component-blueprintmd) | 90.4 KB | 1642 | 79 | §11 at 20.9 KB | L64 |
| [`decisions.md`](#decisionsmd) | 40.1 KB | 400 | 13 | §7 at 10.7 KB | L148 |
| [`decisions/3.01-p1-identity-law-reference-policy.md`](#decisions301-p1-identity-law-reference-policymd) | 8.8 KB | 125 | 1 | §3.1 at 8.8 KB | L166 |
| [`decisions/3.02-p2-evidence-base.md`](#decisions302-p2-evidence-basemd) | 9.6 KB | 143 | 1 | §3.2 at 9.6 KB | L172 |
| [`decisions/3.03-p3-architecture.md`](#decisions303-p3-architecturemd) | 20.5 KB | 294 | 1 | §3.3 at 20.5 KB | L178 |
| [`decisions/3.04-p4-adapter-milestone-one.md`](#decisions304-p4-adapter-milestone-onemd) | 10.4 KB | 142 | 1 | §3.4 at 10.4 KB | L184 |
| [`decisions/3.05-p5-blueprint.md`](#decisions305-p5-blueprintmd) | 6.6 KB | 103 | 1 | §3.5 at 6.6 KB | L190 |
| [`decisions/3.06-p6-parity-matrix.md`](#decisions306-p6-parity-matrixmd) | 8.7 KB | 130 | 1 | §3.6 at 8.7 KB | L196 |
| [`decisions/3.07-p7-quality-bar.md`](#decisions307-p7-quality-barmd) | 5.7 KB | 85 | 1 | §3.7 at 5.7 KB | L202 |
| [`decisions/3.08-p8-docs-site.md`](#decisions308-p8-docs-sitemd) | 4.7 KB | 73 | 1 | §3.8 at 4.7 KB | L208 |
| [`decisions/3.09-p9-ledger-and-index.md`](#decisions309-p9-ledger-and-indexmd) | 1.1 KB | 17 | 1 | §3.9 at 1.1 KB | L214 |
| [`decisions/3.10-s1-repo-bootstrap.md`](#decisions310-s1-repo-bootstrapmd) | 4.8 KB | 66 | 1 | §3.10 at 4.8 KB | L220 |
| [`decisions/3.11-s1-review.md`](#decisions311-s1-reviewmd) | 6.7 KB | 86 | 1 | §3.11 at 6.7 KB | L226 |
| [`decisions/3.12-s2-zag-solid.md`](#decisions312-s2-zag-solidmd) | 15.7 KB | 192 | 1 | §3.12 at 15.7 KB | L232 |
| [`decisions/3.13-s3-styling-seam.md`](#decisions313-s3-styling-seammd) | 23.3 KB | 309 | 1 | §3.13 at 23.3 KB | L238 |
| [`decisions/3.14-s3b-visual-surfaces.md`](#decisions314-s3b-visual-surfacesmd) | 60.7 KB | 771 | 1 | §3.14 at 60.7 KB | L244 |
| [`decisions/3.15-context-budget.md`](#decisions315-context-budgetmd) | 18.8 KB | 228 | 1 | §3.15 at 18.8 KB | L250 |
| [`definition-of-done.md`](#definition-of-donemd) | 57.6 KB | 511 | 21 | §8 at 11.7 KB | L256 |
| [`docs-plan.md`](#docs-planmd) | 57.9 KB | 883 | 46 | §1 at 13.9 KB | L282 |
| [`docs-site.md`](#docs-sitemd) | 75.5 KB | 825 | 37 | §2 at 19.2 KB | L333 |
| [`legal.md`](#legalmd) | 65.3 KB | 980 | 36 | §3 at 22.1 KB | L375 |
| [`plan.md`](#planmd) | 77.3 KB | 1155 | 51 | §3 at 14.7 KB | L416 |
| [`prior-art.md`](#prior-artmd) | 75.7 KB | 1140 | 45 | §2 at 11.1 KB | L472 |
| [`roadmap.md`](#roadmapmd) | 89.1 KB | 1193 | 50 | §4 at 14.6 KB | L522 |
| [`testing.md`](#testingmd) | 69.5 KB | 1005 | 51 | §3 at 11.4 KB | L577 |
| [`testing/8.01-doc-index.md`](#testing801-doc-indexmd) | 4.3 KB | 59 | 1 | §8.1 at 4.3 KB | L633 |
| [`testing/8.02-skill-pointers.md`](#testing802-skill-pointersmd) | 5.1 KB | 71 | 1 | §8.2 at 5.1 KB | L639 |
| [`testing/8.03-context-budget.md`](#testing803-context-budgetmd) | 10.2 KB | 150 | 3 | §8.3 at 10.2 KB | L645 |
| [`zag-solid-adapter.md`](#zag-solid-adaptermd) | 75.3 KB | 1022 | 45 | §6 at 10.7 KB | L653 |

## `component-blueprint.md`

```
§0     L  38–85    3.7 KB  Q7 — Dialog, and what Accordion would not have exercised
§0.1   L  40–56    1.7 KB  The answer: Dialog
§0.2   L  57–75    1.3 KB  Accordion, rejected — and the one thing it would have covered that Dialog does not
§0.3   L  76–85    0.5 KB  One correction to the brief's part list — `Portal` is not a Dialog part
§1     L  86–181   5.8 KB  The recurring floor, re-measured against Chakra
§1.1   L  92–105   0.9 KB  Row 1 — `hidden` vs the recipe's `display`: a global rule, not a per-component one
§1.2   L 106–138   1.8 KB  Row 2 — the labelling IDREF: half of it is Ark's, and we port it
§1.3   L 139–161   1.6 KB  Row 3 — `@zag-js/focus-visible` crashing Storybook: once per preview, not per component
§1.4   L 162–181   1.2 KB  What a component actually pays
§2     L 182–273   5.0 KB  Machine instantiation
§2.1   L 184–198   0.7 KB  A Root calls `useMachine` bare — and the idiom the plan teaches no longer exists
§2.2   L 199–214   1.0 KB  Where a `[STRICT_READ_UNTRACKED]` at that call site *is* a genuine defect
§2.3   L 215–235   1.0 KB  The four things every Root injects, and where they come from
§2.4   L 236–243   0.5 KB  Read the machine's prop list, do not invent one
§2.5   L 244–257   0.9 KB  `withDefaults`, never `merge`
§2.6   L 258–273   0.9 KB  The controlled-mode predicate, and the parts it touches
§3     L 274–428   8.5 KB  `anatomy` → part components
§3.1   L 276–306   1.7 KB  Two lists that are not the same set
§3.2   L 307–317   0.7 KB  The four part shapes
§3.3   L 318–339   1.2 KB  Context: composition, not inheritance
§3.4   L 340–377   2.1 KB  Prop forwarding and precedence
§3.5   L 378–390   0.5 KB  The `render` prop
§3.6   L 391–405   0.8 KB  Ref handling
§3.7   L 406–428   1.3 KB  `data-*` state attributes
§4     L 429–571   7.6 KB  `renderStyled` and the `recipeClass` seam
§4.1   L 436–496   3.7 KB  The four additions `renderStyled` needs
§4.1.1 L 447–496   2.8 KB  Addition 4, and the failure that forces it
§4.2   L 497–531   1.4 KB  Slot-recipe consumption: resolve once on the Root
§4.3   L 532–552   1.2 KB  What we depend on in the generated surface, and what we do not
§4.4   L 553–561   0.4 KB  `unstyled`, at two levels
§4.5   L 562–571   0.5 KB  The seam has no precedent — so the first component is a probe
§5     L 572–622   3.1 KB  Where inline `style` and CSS custom properties are legal
§5.1   L 574–583   0.9 KB  The three routes, at part level
§5.2   L 584–597   0.7 KB  What the machine emits as inline `style`, and why it is legal
§5.3   L 598–604   0.5 KB  The recipe's own custom properties are route 3, done by the recipe
§5.4   L 605–622   0.9 KB  Making the rule checkable, because route 3 used as route 1 fails silently
§6     L 623–685   3.4 KB  The `hidden`-vs-`display` rule
§6.1   L 625–637   0.7 KB  Both worked failures, so the mechanism is not re-derived
§6.2   L 638–647   0.6 KB  Chakra pays neither half, by two mechanisms that are ours to port
§6.3   L 648–671   1.6 KB  The rule, written to survive either answer to P3-E
§6.4   L 672–685   0.4 KB  The test that pins it
§7     L 686–842   7.8 KB  Presence — a build over a machine, not a carry-over
§7.1   L 688–707   1.5 KB  The split, drawn exactly
§7.2   L 708–801   4.0 KB  The render strategy, in full
§7.3   L 802–809   0.5 KB  `hideMode: "activity"` has no Solid equivalent
§7.4   L 810–822   0.7 KB  `hidden` and `data-state` come from presence, overriding the machine
§7.5   L 823–842   1.1 KB  Where a presence is created
§8     L 843–869   1.6 KB  Retained primitives: none. The column is deleted.
§9     L 870–935   4.2 KB  The a11y baseline, stated so a correct port cannot read as a regression
§9.1   L 872–889   1.2 KB  What a faithful Dialog port scores, and why
§9.2   L 890–916   1.9 KB  What is **not** an allowance — and this changes the expected count
§9.3   L 917–935   1.0 KB  How the definition of done has to say it
§10    L 936–1042  6.8 KB  SSR and hydration
§10.1  L 944–960   1.1 KB  `_hk` — Solid matches server and client nodes by position
§10.2  L 961–989   2.0 KB  The `children()` decision procedure
§10.3  L 990–1015  1.4 KB  Portal-guarded cross-scope writes — and why a 1:1 port makes none
§10.4  L1016–1031  1.1 KB  Two hazards a machine component inherits from the compiler
§10.5  L1032–1042  0.8 KB  What is inferred, and where it gets checked
§11    L1043–1574 20.9 KB  Dialog, worked fully through
§11.1  L1048–1070  1.2 KB  File layout
§11.2  L1071–1102  1.3 KB  `dialog-context.ts`
§11.3  L1103–1217  4.5 KB  `dialog-root.tsx`
§11.4  L1218–1257  1.7 KB  `dialog-trigger.tsx` — shape A, plus the one line §1.2 buys
§11.5  L1258–1307  1.7 KB  `dialog-backdrop.tsx` — shape B, owning its own presence
§11.6  L1308–1331  0.8 KB  `dialog-positioner.tsx` — shape A, gated on the shared presence
§11.7  L1332–1379  1.8 KB  `dialog-content.tsx` — shape B, sharing the Root's presence
§11.8  L1380–1400  0.8 KB  `dialog-title.tsx` and `dialog-description.tsx` — shape A at its smallest
§11.9  L1401–1417  0.5 KB  `dialog-close-trigger.tsx` — shape A on a button
§11.10 L1418–1442  0.8 KB  `dialog-slots.tsx` — shape C, ×3
§11.11 L1443–1478  1.3 KB  `dialog-action-trigger.tsx` — shape D, and the only `composeEventHandlers` in the family
§11.12 L1479–1523  2.0 KB  `Portal` — a standalone component, in its own folder
§11.13 L1524–1557  1.3 KB  `namespace.ts` and what a consumer writes
§11.14 L1558–1574  1.0 KB  Everything it imports, and where each thing comes from
§12    L1575–1606  3.3 KB  Assumptions this blueprint rests on, and the gate for each
§12.1  L1577–1586  1.3 KB  `brief-plan` §8 assumptions
§12.2  L1587–1594  0.6 KB  `plan.md` §11.2's P3 assumptions this blueprint depends on
§12.3  L1595–1606  1.3 KB  New assumptions P5 introduces
§13    L1607–1623  3.8 KB  What P5 changes — re-plan P6 before P6 is written
§14    L1624–1642  2.4 KB  What P5 could not act on
```

## `decisions.md`

```
§0   L 34–91   4.3 KB  The division of labour — this file, `CLAUDE.md`, and the eleven `__internal__` documents
§0.1 L 67–73   0.4 KB  Citing the two plans
§0.2 L 74–91   1.0 KB  Changing a decision after this pass
§1   L 92–106  0.7 KB  The entry shape, fixed once
§2   L107–129  3.2 KB  Q1–Q8 — the gate that settled each, and where the answer lives
§3   L130–164  4.6 KB  The ledger
§4   L165–213  5.8 KB  The reversals, in one place
§5   L214–250  4.6 KB  The final build order — one list, each step's gate cited
§6   L251–319  4.3 KB  What the document pass did **not** settle
§7   L320–400 10.7 KB  The reconciliation log — what P9 changed, and where
§7.1 L326–364  7.5 KB  Carried forward by name
§7.2 L365–386  1.4 KB  The citation convention, and the sites it was applied to
§7.3 L387–400  1.5 KB  Two rows found at P9 that were on nobody's list
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

## `definition-of-done.md`

```
§0    L 21–42   1.2 KB  The gate rule
§1    L 43–66   3.2 KB  Per file
§2    L 67–103  5.5 KB  Per component
§3    L104–151 10.3 KB  Per batch
§3.0  L110–121  0.5 KB  The gate every batch shares
§3.1  L122–136  4.8 KB  The probe phase
§3.2  L137–151  4.8 KB  The batches
§4    L152–171  1.7 KB  Per release
§5    L172–208  3.1 KB  The axe allowance register — as it stands today
§6    L209–240  2.2 KB  The coverage allow-list — as it stands today
§7    L241–261  4.9 KB  Conventions, unenforced — labelled, not hidden
§7b   L262–330  4.8 KB  Named, not yet written — the enforcement census
§8    L331–435 11.7 KB  The assumption register
§8.1  L350–365  2.2 KB  `brief-plan` §8's originals
§8.2  L366–385  2.7 KB  P3, P4 and P5
§8.3  L386–398  2.1 KB  P6 and P7
§8.3b L399–421  2.7 KB  P8
§8.4  L422–435  0.7 KB  The three whose gate is a measurement plus a judgement
§9    L436–456  1.3 KB  The scheduled checks — what fires them, who reads them
§10   L457–479  3.5 KB  What P7 changes — re-plan P8 and P9 against this
§11   L480–511  3.2 KB  What P7 could not act on
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
§3    L287–352  3.5 KB  `/` — the docs home
§3.1  L291–303  0.8 KB  The frame, and the one page whose structure is not copied
§3.2  L304–345  2.4 KB  Section order
§3.3  L346–352  0.2 KB  What this page renders
§4    L353–474  7.2 KB  `/docs/get-started/*` — install, frameworks, environments
§4.1  L359–406  2.6 KB  `installation` — section order
§4.2  L407–443  2.6 KB  `frameworks/*` — one page each, one fact each
§4.3  L444–451  0.5 KB  `environments/{shadow-dom,iframe}`
§4.4  L452–465  0.9 KB  `ai/llms` — deferred to before first public release
§4.5  L466–474  0.4 KB  What this tier renders
§5    L475–559  6.2 KB  `/docs/get-started/migration` — coming from Chakra UI (React)
§5.1  L480–493  0.9 KB  The frame: two causes, and the page must not merge them
§5.2  L494–533  3.6 KB  Section order
§5.3  L534–539  0.3 KB  What this page must not do
§5.4  L540–559  1.1 KB  Where the parity sentence appears verbatim, and where it does not
§6    L560–625  4.2 KB  `/docs/theming/chakra-config` — the config function
§6.1  L575–617  3.1 KB  Section order
§6.2  L618–625  0.3 KB  What this page renders
§7    L626–732  7.5 KB  `/docs/styling/*` and `/docs/theming/*`
§7.1  L640–660  2.1 KB  The styling tier
§7.2  L661–688  2.0 KB  `dark-mode` and `semantic-tokens` — the contract, and the snippet
§7.3  L689–700  0.7 KB  `recipes` and `slot-recipes`
§7.4  L701–724  1.7 KB  `customization/*` — the four override paths
§7.5  L725–732  0.3 KB  What these tiers must not say
§8    L733–883  8.9 KB  The component page — one template, applied 111 times
§8.1  L751–764  0.8 KB  Frontmatter
§8.2  L765–770  0.3 KB  Live preview + code fusion
§8.3  L771–776  0.3 KB  `## Usage`
§8.4  L777–783  0.3 KB  `## Examples`
§8.5  L784–790  0.4 KB  `## Parts`
§8.6  L791–797  0.3 KB  `## Props`
§8.7  L798–814  0.9 KB  `### ids` — on every component page with a machine
§8.8  L815–833  1.3 KB  `### render`
§8.9  L834–844  0.6 KB  `### Context`, `### RootProvider`, `### PropsProvider`
§8.10 L845–862  1.3 KB  `### Dynamic values` — only on the eight implementations `roadmap.md` §3.1 marks
§8.11 L863–869  0.4 KB  `### Presence` — only on presence-gated components
§8.12 L870–875  0.3 KB  `### Accessibility` — optional, and drawn from the machine
§8.13 L876–883  0.4 KB  What the template must not contain
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
§3   L383–461  6.9 KB  The copyright boundary — every place upstream expression would be reproduced
§3.1 L407–413  0.4 KB  The rule, cited
§3.2 L414–432  3.3 KB  The flag list
§3.3 L433–445  0.6 KB  The mechanical proxy, because rows 2 and 3 are a reading
§3.4 L446–461  0.9 KB  Trademark — the chrome
§4   L462–606 11.1 KB  The machinery every page shares
§4.1 L464–482  1.2 KB  The examples pipeline — an example is a deliverable
§4.2 L483–509  1.9 KB  The props table — generated from types, and what a missing one looks like
§4.3 L510–527  1.2 KB  Generated pages — tokens and style props
§4.4 L528–553  2.8 KB  The playground, constrained by `plan.md` §0
§4.5 L554–568  1.5 KB  Free-form editing — deferred, with the options recorded
§4.6 L569–606  2.4 KB  `llms.txt` — deferred to before first public release, with its cost stated
§5   L607–637  3.7 KB  What the docs must never say
§6   L638–702  7.9 KB  The docs build gate — a docs page is a deliverable
§6.1 L640–678  5.3 KB  What CI asserts
§6.2 L679–694  2.3 KB  What it cannot assert
§6.3 L695–702  0.3 KB  Where the job sits
§7   L703–752  3.9 KB  Assumptions
§7.1 L705–735  1.7 KB  `brief-plan` §8 assumption 6 — the runnable gate
§7.2 L736–752  2.1 KB  Assumptions P8 opens
§8   L753–771  3.4 KB  What P8 changes — re-plan P9 against this
§9   L772–802  2.9 KB  What P8 could not act on
§10  L803–825  2.1 KB  The P9 flags carried forward, untouched
```

## `legal.md`

```
§0     L 22–76   4.6 KB  Summary — what this repo owes, to whom
§0.1   L 58–76   1.3 KB  The reference checkouts these claims were verified against
§1     L 77–303 14.6 KB  License compatibility
§1.1   L 79–99   1.2 KB  The whole dependency graph is MIT
§1.2   L100–184  5.6 KB  The one Apache-2.0 route — real, analysed, and closed at P2
§1.3   L185–217  2.3 KB  The `@zag-js/solid` fork is a direct MIT derivative
§1.4   L218–243  1.8 KB  Reading a reference owes nothing — and the line is drawn at *expression*
§1.5   L244–274  2.0 KB  `@chakra-ui/panda-preset`: depend, do not vendor
§1.6   L275–288  0.9 KB  hope-ui carry-overs are ours, and still get a provenance note
§1.7   L289–303  0.8 KB  The look-and-feel question
§2     L304–411  5.2 KB  The attribution mechanism
§2.1   L306–311  0.2 KB  What triggers it
§2.2   L312–341  1.2 KB  The `@license` JSDoc header
§2.3   L342–360  1.0 KB  Why `@license` is load-bearing, not decoration
§2.4   L361–369  0.4 KB  Root `NOTICE.md` and per-package `NOTICE.md`
§2.5   L370–383  0.6 KB  License files in `package.json#files`
§2.6   L384–411  1.8 KB  Checklist for a new derivative file
§3     L412–757 22.1 KB  Trademark
§3.1   L414–432  1.2 KB  What the MIT grant does not give us
§3.2   L433–448  1.0 KB  What we *may* say
§3.3   L449–462  0.9 KB  Package name and npm scope
§3.3.1 L463–516  3.5 KB  `@chakra-ui-solid` is owned — what that does and does not settle
§3.3.2 L517–565  3.0 KB  `@solid-chakra` is also owned — the lower-confusion form, and not the one chosen
§3.3.3 L566–658  6.2 KB  Decision: `chakra-ui-solid`, under `@chakra-ui-solid`
§3.4   L659–678  1.1 KB  Repo description and README disclaimer
§3.5   L679–704  1.8 KB  The repository name
§3.6   L705–726  1.6 KB  Docs-site naming
§3.7   L727–757  1.7 KB  Talking to Chakra — the trigger, and the answer if they object
§4     L758–926 11.1 KB  Brand proposal — the P1 gate
§4.1   L769–810  2.9 KB  The descriptor — arguing with the working assumption
§4.2   L811–840  2.3 KB  The shortlist
§4.3   L841–886  2.9 KB  The case for and against each
§4.4   L887–900  1.0 KB  What is deliberately not proposed
§4.5   L901–926  1.4 KB  What the choice unblocked, and what is still outstanding
§5     L927–957  3.3 KB  Tracking upstream over time
§6     L958–980  3.4 KB  Open items
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
§5    L 742–860   7.4 KB  The package graph
§5.1  L 744–768   1.1 KB  The graph
§5.2  L 769–798   1.7 KB  Dependency direction — strictly downward
§5.3  L 799–820   2.3 KB  What `@chakra-ui-solid/system` owns
§5.4  L 821–833   0.7 KB  Seams
§5.5  L 834–860   1.4 KB  Subpath exports
§6    L 861–890   2.4 KB  Presence — a package-graph decision, not a component detail
§7    L 891–979   5.6 KB  Color mode, direction, locale, environment
§7.1  L 893–946   4.0 KB  Color mode: we ship a primitive, and no provider
§7.2  L 947–969   1.0 KB  Direction, locale and environment: two contexts, no catalog
§7.3  L 970–979   0.5 KB  RTL and logical properties
§8    L 980–1010  2.1 KB  Build mechanics
§9    L1011–1036  1.4 KB  Dev-time resolution and codegen ordering
§10   L1037–1078  2.6 KB  Workstream B — the non-machine surface
§11   L1079–1109  3.0 KB  Assumptions this architecture rests on
§11.1 L1081–1093  1.5 KB  `brief-plan` §8 assumptions P3 depends on
§11.2 L1094–1109  1.4 KB  New assumptions P3 introduces
§12   L1110–1130  4.1 KB  What P3 changes in the plan — re-plan P4 and P5 against this
§13   L1131–1155  1.9 KB  What P3 could not settle
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
§1    L  38–254  11.5 KB  The three enumerations, measured
§1.1  L  43–66    1.3 KB  Chakra — 115 component directories, not 118 entries
§1.2  L  67–113   2.3 KB  Zag — 51 machines, 49 anatomy exports, 406 parts
§1.3  L 114–242   7.2 KB  The preset — 18 recipes + 56 slot recipes, and three things the count hides
§1.4  L 243–254   0.6 KB  `brief-plan` §8 assumption 2 is closed
§2    L 255–392   7.9 KB  The 56-vs-51 reconciliation
§2.1  L 257–284   1.3 KB  Both of `plan.md` §10's sentences cannot be exactly true, and one of them is not
§2.2  L 285–303   1.2 KB  The seven slot recipes that reach a machine under a different name
§2.3  L 304–326   1.1 KB  The fifteen slot recipes with no machine
§2.4  L 327–361   2.4 KB  The seventeen machines with no slot recipe — and the thirteen with no Chakra component
§2.5  L 362–392   1.8 KB  Four components whose recipe key resolves to nothing — in Chakra too
§3    L 393–468   5.1 KB  The matrix — columns, and the one that needs re-pointing
§3.1  L 411–468   4.0 KB  What the CIJ column means, and what it must not become
§4    L 469–630  14.6 KB  The matrix
§4.1  L 471–520   6.4 KB  Machine components — 45 rows
§4.2  L 521–540   1.5 KB  Multi-part components with no machine — 15 rows
§4.3  L 541–566   2.1 KB  Atomic-recipe components — 21 rows
§4.4  L 567–599   1.8 KB  Styled primitives and layout — 25 rows
§4.5  L 600–630   2.8 KB  Utilities, providers and re-exports — 9 rows, 10 folders
§5    L 631–774   8.9 KB  Exclusions, one reason each
§5.1  L 638–684   3.1 KB  `portal` — not an exclusion, but cut to the two things Solid's `Portal` gets wrong
§5.2  L 685–698   1.0 KB  `client-only` — **not an exclusion** either
§5.3  L 699–710   0.7 KB  `for` — **excluded**
§5.4  L 711–719   0.5 KB  `show` — **excluded**
§5.5  L 720–731   0.7 KB  `environment` — **not excluded; relocated**
§5.6  L 732–743   0.7 KB  `presence` — **not excluded**
§5.7  L 744–754   0.6 KB  Charts — **excluded**, and the reason is a dependency, not a style
§5.8  L 755–774   1.2 KB  Seven of the fourteen `./hooks` — **excluded individually**
§6    L 775–841   3.2 KB  The presence-gated set — two families, not one
§6.1  L 780–799   0.9 KB  Family Z — a `@zag-js/presence` instance
§6.2  L 800–820   1.2 KB  Family M — machine-owned visibility, no presence instance
§6.3  L 821–841   0.9 KB  The `aria-controls` override, by component
§7    L 842–897   3.8 KB  The fifth part shape — the repeated part
§7.1  L 848–873   2.0 KB  The component that settles it: **Accordion**
§7.2  L 874–897   1.5 KB  What Accordion must prove
§8    L 898–957   3.6 KB  The floating seam, and where the first floating component lands
§8.1  L 900–925   1.3 KB  The seam, restated so the sequencing argument is legible
§8.2  L 926–957   2.2 KB  The first floating component: **Popover, at step 5b — immediately after Dialog, before volume**
§9    L 958–1029  7.7 KB  The build order
§9.1  L 964–996   3.5 KB  The probe phase — unchanged, plus one insertion
§9.2  L 997–1018  3.4 KB  The batches
§9.3  L1019–1029  0.6 KB  Ordering constraints that are not preferences
§10   L1030–1065  2.7 KB  `RootProvider`, `PropsProvider`, `Context`, and `./hooks`
§11   L1066–1098  2.5 KB  What the matrix adds to the dependency graph
§12   L1099–1131  4.8 KB  Assumptions — closed, opened, left open
§12.1 L1101–1108  1.7 KB  `brief-plan` §8 assumptions P6 owns
§12.2 L1109–1119  2.3 KB  Assumptions P6 introduces
§12.3 L1120–1131  0.7 KB  Assumptions P6 depends on and does not touch
§13   L1132–1157  6.3 KB  What P6 changes — re-plan P7–P9 against this
§14   L1158–1193  3.8 KB  What P6 could not act on
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
§4   L 450–518   3.5 KB  axe
§4.1 L 452–469   0.7 KB  The runner
§4.2 L 470–503   2.0 KB  The allowance register — shape
§4.3 L 504–518   0.8 KB  What the register's contents are, and where they live
§5   L 519–597   4.6 KB  The §0 checks — two checks, not one grep
§5.1 L 530–542   0.7 KB  `check:no-cij-manifest`
§5.2 L 543–557   0.8 KB  `check:no-runtime-sheet`
§5.3 L 558–583   1.6 KB  What merging them would have wrongly failed — in both directions
§5.4 L 584–597   0.7 KB  When they run (`zag-solid-adapter.md` §5.5)
§6   L 598–707   6.6 KB  The lint rules
§6.1 L 606–627   1.3 KB  Rule 1 — `style-prop-static-value` (route 3 used as route 1)
§6.2 L 628–661   2.1 KB  Rule 2 — `require-style-source` (the style-prop collision)
§6.3 L 662–665   0.1 KB  Rule 3 — `no-class-name-assertion`
§6.4 L 666–683   1.1 KB  The census — `check:style-prop-collisions` (P5-D's gate, and `dir`'s tripwire)
§6.5 L 684–707   1.5 KB  The answer to `docs-plan.md` §2 **D-2**
§7   L 708–819   7.1 KB  Storybook — the local playground
§7.1 L 715–720   0.3 KB  Scope, restated because it decides what is *not* built
§7.2 L 721–758   2.3 KB  The warm-up and the pin — P7's configuration, once per preview
§7.3 L 759–788   2.1 KB  There is no story gate, because a story is not the validation surface
§7.4 L 789–819   2.0 KB  What only Storybook can see
§8   L 820–868   9.4 KB  The distribution, styling-config and structural checks
§9   L 869–906   3.8 KB  The attribution checks
§10  L 907–941   2.5 KB  The bundle measurement — `check:bundle`
§11  L 942–960   2.6 KB  The scheduled upstream checks
§12  L 961–982   2.4 KB  The CI job map
§13  L 983–999   1.0 KB  What this apparatus assumes
§14  L1000–1005  0.3 KB  Where this document ends
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
§6   L 554–693  10.7 KB  The test plan — proving the adapter correct with no component involved
§6.1 L 559–585   2.4 KB  The four upstream test files, by name
§6.2 L 586–616   3.0 KB  The seven fork test files — and the overlap nobody should double-count
§6.3 L 617–649   2.5 KB  `solid-contract` characterization tests
§6.4 L 650–667   1.2 KB  What is deliberately **not** tested at this milestone
§6.5 L 668–693   1.3 KB  The gate
§7   L 694–806   6.0 KB  The attribution checklist — lands in the same commit as the code
§7.1 L 709–746   1.6 KB  The seven headers
§7.2 L 747–777   1.9 KB  The `NOTICE.md` rows — and the number that matters
§7.3 L 778–806   1.7 KB  The checklist, in commit order
§8   L 807–927   7.1 KB  The two upstream filings
§8.1 L 813–869   3.5 KB  A1 — boolean `aria-*` in `@zag-js/solid`
§8.2 L 870–927   3.3 KB  `ariaHidden` → `suppressOthers` in `@zag-js/aria-hidden`
§9   L 928–980   5.4 KB  Assumptions this milestone rests on, and their gates
§9.1 L 930–944   1.9 KB  `brief-plan` §8 assumptions
§9.2 L 945–969   2.2 KB  What `prior-art.md` §10.5 gets re-measured here, and what does not
§9.3 L 970–980   1.3 KB  New assumptions P4 introduces
§10  L 981–1008  5.1 KB  What P4 changes — re-plan P5 before P5 is written
§11  L1009–1022  1.8 KB  What P4 could not act on
```
