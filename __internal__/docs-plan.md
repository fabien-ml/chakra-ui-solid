# The docs site — the page specs

**Status:** opened 2026-08-09 between P6 and P7 with one page spec; **completed at P8**, same day.
Six specs and one template, and the two open questions closed.

**What this document is.** A spec per page: the frame, the section order, what each section must
show, and which already-settled decision it renders. A page is specced here before it is written, for
the same reason a component is blueprinted before it is stamped — the styling page in particular
becomes the thing every "working as designed" issue reply links to, so it is cheap to argue with here
and expensive later.

**What it is not.** The *app* and the *IA* — the stack, the deployment, the route map, the machinery
pages share, the build gate — which are `docs-site.md`. The division of labour is that document's §0
and is restated in §0 below so the boundary is not guessed at. Nor is it the decisions the pages
render: every claim below is cited to `plan.md`, `prior-art.md`, `component-blueprint.md`,
`roadmap.md`, `testing.md`, `definition-of-done.md` or `legal.md` by section, never restated as new.
**Where a page spec and its source document disagree, the source document wins**, and the spec is the
thing that gets fixed.

**Vocabulary, once.** **Static extraction** is Panda's build-time scan: it parses the consumer's
TypeScript, evaluates the expressions feeding style props, and generates exactly the CSS those values
name. A **style prop** is a CSS property passed as a JSX prop (`px={4}`). A **recipe** is a named
style definition with **variants** (`size="sm"`); a **slot recipe** is the multi-part version, one
style block per named slot. **`staticCss`** is the Panda config key that pre-generates CSS for values
no source file literally writes. A **machine** is a `@zag-js/*` state machine, and a **part
component** is one named element of its anatomy (`Dialog.Trigger`). **Silent unstyling** is this
project's central hazard: a Panda class whose CSS was never generated renders nothing and raises no
error (`plan.md` §0.2).

---

## 0. What this document specs, and where the rest of the site is

**The division of labour with `docs-site.md`**, stated in both files and nowhere elaborated twice:
that document answers *what exists, on what stack, and how do we know it works*; this one answers
*what does this page say, in what order, and which settled decision does it render*. The **route
map** — the only list of which pages exist and in what nav order — is `docs-site.md` §2.1, and its
`Spec` column points at the sections below. That pointer is the one thing written in both files, and
it is a cross-reference rather than a duplicate: **no page is specced twice.**

Seven specs: **four page specs, two tier specs, and one template applied 113 times.**

| # | Spec | Renders | Source |
|---|---|---|---|
| **§1** | `/guides/static-extraction` | §3.5's dynamic-value contract, as a consumer-facing contract rather than an architecture note | `plan.md` §3.5, §1.4, §0.2 |
| **§3** | Docs home | The parity sentence, verbatim: *"as close to Chakra v3 parity as is achievable without runtime CSS-in-JS"* | `plan.md` §0; `legal.md` §3.4, §4.1 |
| **§4** | Install / setup, and the `get-started/` tier | Panda as a hard prerequisite — the non-optional `peerDependency`, and the README's first line above the install snippet | `plan.md` §4.4, §3.4, §8, §12 row 14 |
| **§5** | Coming from Chakra UI (React) | The §0.4 delta table with its **Cause** column, plus the six per-component rows P6 corrected (`for`/`show` excluded, `portal`/`client-only`/`presence` shipped, `environment` relocated, charts excluded) | `plan.md` §0.4; `roadmap.md` §5, §13 row 1 |
| **§6** | `chakraConfig` reference | The preset's function export and its knobs, `responsive` among them | `plan.md` §3.3, §3.4, §3.8 |
| **§7** | The styling and theming tiers | Tokens, recipes, override paths 1–4, color mode as a consumer snippet | `plan.md` §3.6, §3.7, §7.1, §7.3 |
| **§8** | **The component page** — one template, applied 113 times | Anatomy, props, `ids`, `render`, the provider surface, the CIJ note | `roadmap.md` §4, §10; `component-blueprint.md` §3.4, §3.5 |

Two page families have **no spec and need none**: the token pages and the style-prop pages are
rendered from the installed preset and from our generated `isCssProperty` (`docs-site.md` §4.3).
There is no prose to argue with, which is the point of generating them.

The responsive opt-in does **not** get its own page. `plan.md:603` puts it on the same page as the
§0.2 warning — which is §1 — because a consumer who needs it has already hit the failure it fixes.
§6 carries the option's **shape** (the three grains, the expansion, what `chakraConfig` does with
it); §1 carries **the failure it fixes**. A reader arriving from a broken build lands on §1; a reader
writing a config lands on §6.

---

## 1. `/guides/static-extraction`

**Title:** "What extracts, what doesn't, and the escape hatches."

### 1.1 The frame, and why it is not Chakra's

Chakra's own guide at `chakra-ui.com/guides/styling-performance` is the nearest prior art and the
shape to borrow — do/don't pairs, a checklist, escape hatches in preference order. **Its argument
does not transfer.** That page argues *dynamic style values cost performance*: runtime serialization,
a new object per render, React reconciliation. Two of those three premises are absent here.

| Chakra's premise | Here |
|---|---|
| Emotion serializes the value at render time | Nothing serializes anything at runtime (`plan.md` §0) |
| A new style object triggers React reconciliation | Solid re-runs the `class` getter for the changed value; the component does not re-render, and the style-prop **key** list is computed once, not reactively (`prior-art.md` §2.5) |
| The cost is milliseconds | **The cost is the style.** A value Panda could not evaluate yields a class whose CSS was never generated: no warning, no console message, no failing test |

So the page keeps Chakra's structure and inverts its thesis. Chakra says *dynamic is slow*; we say
**dynamic is silent**. The recommended patterns coincide — data attributes, CSS custom properties,
recipes — which makes the page easy to write and the reasoning easy to get wrong. **The page must not
argue performance.** A reader who adopts these patterns for speed will abandon them the first time a
profile comes back flat, and then ship an unstyled component.

**What is not ported:** Chakra's §1 (the cost of dynamic styles) and its §5 (Panda as the
zero-runtime alternative — that is the premise here, not a recommendation).

### 1.2 Section order

**0 — The failure, first.** Two `<Box>` side by side, one styled and one not, with identical
`class` attributes in the DOM, no console output, and a passing test. Then the rule the rest of the
page elaborates: **the value must be a literal Panda can evaluate at the call site.**

**1 — What works.** Table, not prose. Responsive objects, ternaries between literals, conditions
nested inside responsive objects, same-file constants, arbitrary values, the `css` prop. Each row is
a fixture (§1.4).

**2 — What a Solid dev expects to break, and doesn't.** This section has no Chakra analogue and it
is the reason the page is worth writing rather than translating. A Solid reader's instinct is that
reactivity defeats a build-time scanner. It does not: extraction reads the *shape* of the expression,
and a signal call in a **condition** leaves both branches literal.

```jsx
<Box color={isActive() ? "blue.500" : "gray.500"} />          // ✅ signal in the condition
<Box color={{ base: "red.100", md: hovered() ? "red.200" : "red.300" }} />  // ✅ nested
<Show when={open()} fallback={<Box display="none" />}>        // ✅ two literal call sites
  <Box display="block" />
</Show>
<Box classList={{ [css({ color: "red.500" })]: flag() }} />   // ✅
```

**3 — What actually breaks it**, ordered by how often it bites, not by how surprising it is:

1. **A wrapper component forwarding a prop** — `function Card(props) { return <Box color={props.tone} /> }`.
   This is the case `plan.md` §1.6 names as mattering most, and the one where Solid's own idiom
   misleads: `splitProps` is the fix for the reactivity bug in the same line and does **nothing** for
   extraction. The page says so explicitly, next to the `splitProps` call, or the reader will assume
   the correct-looking code is correct.
2. **A constant imported from another file.** Panda resolves same-file constants and stops at the
   file boundary — no exception, no config for it.
3. **A derived style object** — `createMemo(() => ({ color: … }))`, or any object assembled before it
   reaches the prop.
4. **A store or context value** — theme-from-context, `colors[kind()]`, anything indexed by a runtime
   key.

**4 — The escape hatches, in preference order.** This is `plan.md` §3.5's three routes, plus the
responsive opt-in, written as a decision procedure rather than a list:

| Situation | Route |
|---|---|
| The value is one of a few things your own code chooses between | **Restructure to literals** — `<Show>`, or a data attribute the recipe styles against (§5) |
| A known finite set your source never literally writes | **`staticCss`** (`plan.md` §3.5 route 2) |
| Genuinely unbounded — a percentage, a user-picked color, a measured width | **A CSS custom property**: `style={{ "--w": w() }}` with `w="var(--w)"` (route 3) |
| `<Button size={{ base: "sm", md: "lg" }}>` — a responsive **recipe variant**, not a style prop | **`chakraConfig({ responsive })`**, three grains (`plan.md` §3.8) |

Route 3 carries a Solid-specific note the Chakra page cannot make: it is **cheaper here than in
React**. Solid writes a custom property straight onto the node when the value changes, so the
"escape hatch" is an idiomatic reactive write, not a concession. Say this. A hatch the reader
believes is a downgrade is a hatch they will avoid.

Route 3 also needs its own warning, because using it accidentally as route 1 fails silently — the
lint rule `plan.md` §3.5 requires. **The rule exists**: `check:style-contract` rule 1 lands at step 3
with the styling seam, five steps before this page ships (`testing.md` §6.1, §6.5). So the row states
what the rule enforces, and adds **one scope sentence**:

> The rule runs on **this library's** source, not yours. Your route-3 mistakes are in your files,
> scanned by your Panda run, and no consumer-facing equivalent ships at v1.

That is a scope statement, not a caveat, and the page **must not** tell a reader to run the rule on
their own code (`testing.md` §6.5). What a consumer *can* reach is section 6.

**Rejected, and recorded here so it is not re-offered in an issue reply:** putting our `dist` in the
consumer's Panda `include` is **not** an escape hatch for this. It hits the identical extraction
limit (`plan.md` §1.6). It stays documented for buildinfo skew (`plan.md` §4.1) and nothing else.

**5 — Data attributes, which you already have.** Chakra sells these as a performance technique. Here
they are simply how the components work: every part component's attributes — `data-state`,
`data-disabled`, `data-part` — come from the machine's `connect()`, we write none of them
(`component-blueprint.md` §3.7), and Panda's conditions (`_open`, `_closed`, `_checked`,
`_highlighted`) select on exactly those. **The example is on the recipe side, not the JSX side** —
the consumer writes no conditional prop at all, which is the whole point.

**6 — How you find out it broke.** The section Chakra's page has no reason to have, and the one that
makes the rest actionable. **Three mechanisms, and all three are ones a consumer can actually
reach** — the lint rule of section 4 is not among them, by `testing.md` §6.5:

1. **Assert computed styles, never class names, in your own tests.** `classList.contains("p_4")`
   passes on a completely unstyled element (`plan.md` §0.2; `testing.md` §2.1's worked failure).
   `expect(getComputedStyle(el).padding).toBe("16px")` is the form, and the reason it is not a
   stylistic preference is that the class-name form is *compatible with* the failure it is meant to
   catch. This is the one mechanism that works in a consumer's repo on day one, with no tooling of
   ours involved.
2. **The generated-CSS coverage check's behaviour, and what its failure output means.** It diffs the
   classes components can emit against the rules the sheet actually carries, and **every failing row
   names the declaration site that should have covered it** — the class, the package that emits it,
   where it was declared, and whether it was declared-but-not-generated or declared nowhere
   (`testing.md` §3.6). The page shows the failure shape, because a reader who has seen it once
   recognises their own build breaking. What it does **not** see is the consumer's own style prop:
   *their* source, *their* Panda run, *their* sheet, and our sets never look at it (`testing.md`
   §3.7 row 1). **That blind spot is why this page exists**, and saying so is what stops a reader
   assuming CI has their back.
3. **This page's own ✅/❌ rows are fixture-backed** (§1.4), so a row that quietly became false fails
   a build rather than misleading a reader. The page says so, once, near the reference card —
   documentation that claims to be checked and is not is worse than documentation that claims
   nothing.

**7 — Reference card.** The ✅/❌ table from sections 1 and 3 on one screen, and the four-row
decision procedure from section 4. Nothing new — a reader who returns to this page has already read
it once and wants the table.

### 1.3 Two things the page must state that no other page will

- **Extraction is the consumer's build, over the consumer's source.** We ship no CSS (`plan.md`
  §4.4), so every class on this page is generated by *their* Panda run scanning *their* files. This
  reframes every ❌ above from a library limitation to a property of where the scan happens, and it
  is the sentence that makes the file-boundary rule stop feeling arbitrary.
- **`<Box>` needs no registration.** With `jsxFramework` set, Panda's default `jsxStyleProps: "all"`
  extracts style props from any capitalized JSX component, verified in production in the prior art
  (`prior-art.md` §2.3). Readers arriving from Tailwind expect a content-glob step and readers arriving
  from Chakra expect a provider; the page pre-empts both in one line.

### 1.4 The gate — the catalogue is a fixture, not prose

**Every ✅ and ❌ row in sections 1, 2 and 3 exists as a line in a real source file that a real Panda
build scans, with a test asserting whether the corresponding rule appears in the generated
stylesheet.** The page is generated from, or diffed against, that fixture.

This is not documentation hygiene. A ✅ row that quietly becomes false is `plan.md` §0.2's failure
mode aimed at the docs: nothing errors, the page still reads correctly, and consumers write code the
page promised would work. Prose cannot hold that claim across a Panda minor version; a fixture can.

**Owner: P8**, and it is the page's blocking prerequisite — the fixture is written before the page.

### 1.5 D-1 answered — a dedicated minimal build, and the page is *generated from* it

**The fixture runs against a dedicated minimal Panda build, not the docs app's own.** Concretely: a
second Panda config living inside `apps/docs`, spreading **the same `chakraConfig()` call** the docs
app spreads, with `include` narrowed to the fixture directory and its own `outdir`. The fixture
directory is outside the docs app's own `include`.

**The deciding reason is the ❌ half, and it is not a preference.** A ❌ row asserts a class is
**absent** from the generated sheet, and an absence assertion is only sound over a corpus you control
completely. Against the docs app's sheet — 113 component pages and every example file — a row
asserting that `<Box color={props.tone} />` produced no `c_red.500` rule fails the day any other page
in the site writes `color="red.500"` literally. Two ways that goes wrong, and both are bad: the row
turns red for a reason that has nothing to do with it, or the row is written against a value nobody
else would ever use, which makes the page's examples unrepresentative of the consumer code it is
teaching. **A false green on this page is `plan.md` §0.2 aimed at the documentation**, which is the
whole reason §1.4 exists.

Three secondary reasons, in order of weight:

1. **It is what a consumer's config actually looks like** — `chakraConfig()` plus `include` and
   `outdir`, and nothing else (`plan.md` §3.4). The docs app's `include` also carries the buildinfo
   and 113 pages' worth of source; the fixture's carries one directory.
2. **It is fast enough to run on every Panda and preset bump**, which is when the rows are most
   likely to change (`legal.md` §5). A full site build per fixture run would make the check something
   people batch, and a check that is batched is a check that is read late.
3. **Reusing the same `chakraConfig()` call removes the drift the "dedicated build" objection is
   about.** The honest worry with a separate build is that it stops resembling what ships; sharing
   the *function call* rather than copying the knobs means there is nothing to drift.

**The cost, either way, stated plainly:**

| | Dedicated minimal build (**chosen**) | The docs app's own build |
|---|---|---|
| ❌ rows | **Sound** — only the fixture's own lines are scanned | **Unsound** — any other page can generate the class, and the row's failure mode is a false green |
| Config fidelity | Same `chakraConfig()` call, narrowed `include`. `check:docs-consumer-config` covers the shared half (`docs-site.md` §6.1) | Exactly what ships, by construction |
| Run cost | One extra `codegen` + `cssgen` task in the docs app's pipeline | A full site build per run |
| New surface | A second Panda config file and a Turbo task. **No new workspace package**, so `plan.md` §5.1's graph is unchanged | None |
| Residual risk | A ✅ row could pass here and differ in the docs app if the two configs ever diverge — bounded by the shared call and the check above | The ❌ half cannot be trusted at all |

**And the page is generated from the fixture, not diffed against it.** Each fixture row carries an
id, the source line, the expected outcome, and the class it should or should not produce; sections 1,
2, 3 and the section 7 reference card are emitted from that manifest at build time. Diffing would
detect drift; generating makes it unconstructable, and it costs the same. The consequence is
deliberate: **the catalogue tables are not hand-editable prose**, and changing a row means changing a
fixture line and watching the assertion move with it.

The check is `check:extraction-fixture` (`docs-site.md` §6.1), and it is a blocking prerequisite for
the page in the literal sense — it is written first, and the page cannot render without its output.

---

## 2. Open — both closed

| # | Question | Blocks | Resolved |
|---|---|---|---|
| **D-1** | Does the fixture in §1.4 run against the docs app's own Panda build, or a dedicated minimal one? A dedicated build is honest about what a consumer's config looks like; the docs app's is what actually ships | §1.4 | **P8 — §1.5.** A dedicated minimal build, sharing the docs app's `chakraConfig()` call with a narrowed `include`; the page is *generated from* it. The deciding reason is that ❌ rows are absence assertions and need a corpus we control |
| **D-2** | Does the route-3 lint rule exist by the time this page ships? If not, §1.2 section 4 says so rather than implying it | §1.2 | **P7 — `testing.md` §6.5.** Yes, by five steps, with one qualification: the rule runs on **our** source, not the consumer's. Absorbed into §1.2 — section 4 lost its hedge and gained the scope sentence; section 6 carries the three consumer-reachable mechanisms. **Not re-answered here** |

This section keeps its number because `testing.md` §6.5 and `definition-of-done.md` §10 row 2 cite
it, as do §1.2 and §1.4. New specs start at §3 for the same reason.

---

## 3. `/` — the docs home

**Title:** `chakra-ui-solid`. **Frame:** not a marketing page.

### 3.1 The frame, and the one page whose structure is not copied

Every other page in `docs-site.md` §2.1 mirrors chakra-ui.com's structure. This one does not, and the
reason is specific rather than squeamish: **a marketing page's structure is its claims.** Copying the
shape of a hero, a feature grid and a testimonial row means writing our version of each of their
claims, and three of theirs are false here — runtime theming, a `css` prop that takes anything, and a
zero-config install.

What this page is instead: **the page that sets expectations**, because mis-set expectations are the
main support cost of a project like this (`legal.md` §4.1). A reader should be able to decide in
thirty seconds whether this library is usable for them, and the two facts that decide it — Solid 2.0,
and Panda in their build — are above the fold.

### 3.2 Section order

**0 — The name, the descriptor, and the parity sentence.** The descriptor is `legal.md` §4.1's
docs-home form, leading positive: styles compiled at build time, none at runtime. Immediately under
it, `plan.md` §0's sentence **verbatim**:

> as close to Chakra v3 parity as is achievable without runtime CSS-in-JS

**Q3 is settled *prominent*, and this is the most prominent place it appears.** §5.4 is where the
whole list of verbatim placements lives, so it is not repeated here.

**1 — The disclaimer, verbatim, above the fold.** `legal.md` §3.4's wording, unchanged, with
chakra-ui.com as a live link. `legal.md` §3.3.3 item 1 requires it on the docs home *and* in the
footer of every page, and requires it near the top rather than below the fold: under a mark-derived
name the disclaimer is doing that work alone. The link is not a courtesy — it is what turns a
disclaimer into a redirect.

**2 — Three prerequisites, as a checklist, before anything else.**

- SolidJS **2.0**. Not 1.x — the packages import `@solidjs/web`, and a 1.x install fails at load
  (`legal.md` §4.1's *"say SolidJS 2.0"*).
- **Panda CSS in your build.** `plan.md` §4.4's README first line, same wording, same position
  relative to the install snippet: *"Requires Panda CSS in your build. Not optional — this library
  publishes no CSS."*
- ESM only.

**3 — What you get, and what you do not.** Two short columns, not the delta table. Left: Chakra v3's
component API, its design system through the official preset, Zag's behavior and ARIA, style props,
recipes and variants. Right: no runtime theming, no runtime style values, no `asChild`. Each right-
hand item links to §5, which carries the reasoning. **The whole table on the home page would be read
by nobody**; three items and a link get read.

**4 — Install**, four lines, linking §4 for the config.

**5 — Where to go next**, three links and no more: `/guides/static-extraction` (described as the page
to read *before* you write a wrapper component), the component index, theming.

**6 — What is not here yet.** Charts, with its one-line reason (a dependency ground — there is no
Solid charting substrate to bind to, `roadmap.md` §5.7), and anything the batch order has not reached
(`roadmap.md` §9.2). This is the positive form of *a page for an unbuilt component is a promise*:
the absence is stated rather than left for a reader to discover through a 404.

### 3.3 What this page renders

`plan.md` §0's parity sentence (Q3, prominent) · `legal.md` §3.4's disclaimer · `plan.md` §4.4's
prerequisite · `roadmap.md` §5.7's exclusion.

---

## 4. `/docs/get-started/*` — install, frameworks, environments

**Frame:** Chakra's `get-started/` tier, structurally 1:1. Its shape transfers because the steps are
the same steps; its content does not, because their step two is a provider and ours is a build
config.

### 4.1 `installation` — section order

**0 — The prerequisite line, above the install snippet.** `plan.md` §4.4's wording again, in the
second of its three placements (`docs-site.md` §8 row 5). A reader who skipped the home page meets it
here, before they have installed anything.

**1 — Install.** Three of ours and one of theirs:

```
@chakra-ui-solid/components  @chakra-ui-solid/preset  @chakra-ui-solid/styled-system
@pandacss/dev  (a dev dependency of yours — we declare it as a non-optional peer)
```

The peer is stated as a mechanism, not a footnote: **the install warning is the enforcement**
(`plan.md` §4.4). Without it, the failure is `npm install`, run the app, every component renders
naked, and no tool anywhere says why.

**2 — `panda.config.ts`.** `plan.md` §3.4's snippet, verbatim, including `importMap`, the buildinfo
path in `include`, the consumer's own source glob, and `outdir`. Two sentences beside it and no more:
the preset is not imported here because `chakraConfig()` already puts it in `presets`; and
**spreading is shallow**, so a consumer who re-declares `presets`, `staticCss` or `theme` replaces
ours wholesale — `mergeConfigs([chakraConfig(), { … }])` is the documented form for those. The full
reference is §6; this page shows the shape that works.

**3 — Generate, and import the stylesheet you generated.** `panda codegen`, then the consumer imports
**their own** `styled-system/styles.css`. This is the sentence that stops *"we publish no CSS"* from
reading as *"there is no CSS"*, and it is the single most misreadable claim on the site: **their sheet
exists and is theirs; ours does not exist at all.**

**4 — Did it work?** The verification step, and it does not check a class name:

```tsx
<Box p="4" bg="bg.panel" />
// then, in a test or the console:
getComputedStyle(el).padding  // "16px" — not classList.contains("p_4")
```

`plan.md` §0.2's hazard in its consumer-facing form. A class-name check passes on a completely
unstyled element, so an install that silently did nothing looks identical to one that worked
(`testing.md` §2.1). This paragraph is the highest-value one on the page and it belongs at the end of
setup, where a reader is looking for exactly this.

**5 — Troubleshooting: everything renders naked.** Three causes, in the order they occur: Panda never
ran; `hash` or `prefix` disagrees across the boundary (`plan.md` §3.4 — our published runtime emits
`p_4`, a hashed sheet carries something else, and every class we compute is then absent from their
sheet with no error anywhere); or a recipe variant needs the responsive opt-in (§6, and
`/guides/static-extraction`).

### 4.2 `frameworks/*` — one page each, one fact each

| Page | The fact |
|---|---|
| `vite` | Nothing special. Stated, because a page that exists to say "no special steps" saves a reader looking for them |
| `tanstack-start` | `ssr.noExternal` for our packages, and no client-side pre-bundling of them |
| `solid-start` | The same two, by name (`plan.md` §8's *"document `ssr.noExternal` for SolidStart consumers"*) |
| `storybook` | The `@zag-js/focus-visible` warm-up and the Storybook version pin |

The first three are one fact wearing three hats, and the fact is `plan.md` §8's: we ship
**JSX-preserved `.jsx`** under the `"solid"` export condition with no fallback, so the consumer's
toolchain compiles it. Externalized during SSR, Node cannot import it; pre-bundled on the client, the
JSX is compiled as React and the component renders nothing. The page shows the two config lines and
says which symptom each prevents, because both symptoms name *our* package in the error and neither
names the cause.

**`storybook` is the page that saves someone a day.** Storybook replaces `HTMLElement.prototype.focus`
with an accessor; `@zag-js/focus-visible` reads that property off the prototype, so the getter runs
with `this === HTMLElement.prototype`, `ownerDocument` throws `Illegal invocation`, and **every story
crashes** (`component-blueprint.md` §1.3; `prior-art.md` §5.3). Every Zag machine pulls focus-visible
tracking, so this hits a consumer's whole Storybook, not one story. The fix is a three-line
`trackFocusVisible()` warm-up at module scope plus a version pin, and it is a consumer-facing hazard
even though Storybook is only a dev harness for us (`brief-plan` §2.10) — which is exactly why it is a
docs page rather than an internal note.

### 4.3 `environments/{shadow-dom,iframe}`

Both pages are the environment context: a machine finds its own elements through `getRootNode()`
(`plan.md` §7.2), so a component rendered inside a shadow root or an iframe needs the context to point
at that root. Our `Portal` defaults its mount target to the environment's root rather than
`document.body` for the same reason — and the failure it prevents is **silent**: a machine that cannot
find its content simply does nothing (`roadmap.md` §5.1). That sentence is the page.

### 4.4 `ai/llms`

The directory page for the generated files: what each contains, when to use the split ones, and the
three sentences `/llms.txt` leads with (`docs-site.md` §4.6). Short, and the only page whose audience
is a person configuring a tool rather than writing code.

### 4.5 What this tier renders

`plan.md` §4.4 (the prerequisite and its three placements) · §3.4 (the consumer config and the two
knobs that silently unstyle everything) · §8 (JSX-preserved output and its two config consequences) ·
§0.2 (the verification step) · §7.2 (the environment context) · `component-blueprint.md` §1.3 (the
Storybook crash).

---

## 5. `/docs/get-started/migration` — coming from Chakra UI (React)

**Title:** "Coming from Chakra UI (React)". **Frame:** Chakra's own `get-started/migration` page is
the structural analogue — theirs is v2→v3, ours is React→Solid *and* Emotion→Panda.

### 5.1 The frame: two causes, and the page must not merge them

`plan.md` §0.4's table separates them with a **Cause** column, and that column is the page's spine:

- **CSS-in-JS** deltas follow from `plan.md` §0 and are **permanent**. No amount of work removes
  them, because removing them means shipping a runtime style engine.
- **React→Solid** deltas follow from the target framework and **would exist in any Solid port**. They
  are not consequences of our styling decision, and presenting them as such would make the styling
  decision look more expensive than it is — and would let a reader believe that a different styling
  choice would have brought `asChild` back.

**The table is reproduced with the Cause column intact**, all eleven rows, not summarised and not
re-ordered. A reader scanning for "why can't I do X" needs the *why* in the same row as the *what*.

### 5.2 Section order

**1 — The delta table**, `plan.md` §0.4 verbatim, Cause column included.

**2 — Per-component corrections.** Six rows P6 measured, each with its one reason (`roadmap.md` §5,
§13 row 1). These matter because an earlier draft of the plan listed all six as exclusions, and a
reader who finds `Portal` in our exports after reading that it was excluded stops trusting the page:

| Component | Status | The reason, in one line |
|---|---|---|
| `for` | **excluded** | Solid-native. `solid-js`'s `<For>` has the same three-part API and reference-keyed reconciliation, which `.map()` destroys. Use `<For>` — the only delta is that `index` is an accessor (`roadmap.md` §5.3) |
| `show` | **excluded** | Solid-native. Same API, strictly better semantics, already in your imports (`roadmap.md` §5.4) |
| `portal` | **ships**, cut to ~6 lines | Solid's own `Portal` **throws** during SSR, and mounts to `document.body` while the machine looks its elements up through `getRootNode()`. **`disabled` is not shipped in either form** — a non-reactive prop that silently ignores changes is `plan.md` §0.2 in prop form, and omitting it makes passing it a type error (`roadmap.md` §5.1) |
| `client-only` | **ships**, ~12 lines | Not a React idiom: server markup and first-client-render markup must agree. `createSignal(false)` + `onMount` is the Solid form of the same behavior (`roadmap.md` §5.2) |
| `presence` | **ships** | A public, styled component in Chakra, and a public one here. The one thing it does not get is `hideMode: "activity"` — React 19's `<Activity>` has no Solid equivalent (`roadmap.md` §5.6; `component-blueprint.md` §7.3) |
| `environment` | **relocated** | A context, not a component. It ships from `@chakra-ui-solid/system` and is re-exported from `components/environment` so Chakra's import path resolves (`roadmap.md` §5.5) |

Plus **charts**, which is the one clean exclusion and is not one of the 115: `@chakra-ui/charts` peer-
depends on `recharts` and `react`, and there is no Solid charting substrate to bind to. **The reason
is a dependency, not a style** — this is the sentence that stops readers assuming the no-CSS-in-JS
rule cost them charts (`roadmap.md` §5.7).

**3 — Translations you need on day one**, as a table: `asChild` → the `render` prop, **a function,
never a JSX element** (`component-blueprint.md` §3.5); `useRecipe`/`useSlotRecipe` → a static import
from the generated recipes; `createSystem` → `panda.config.ts`; a `css` prop with runtime values →
the three routes, linking `/guides/static-extraction`; `useToken()` → a read of the build-time token
map; `forwardRef`/`ComponentPropsWithoutRef` → Solid props plus `render`; the seven `./hooks` that
have no Solid meaning, each with its one-line reason, and the seven that ship (`roadmap.md` §5.8).

**4 — What is unchanged**, and it is most of it: part names, variant names, `defaultVariants`,
tokens, the `data-*` state vocabulary, the import paths (`plan.md` §5.5's subpaths mirror Chakra's
one-to-one). **A differences page that only lists differences leaves a reader believing the whole API
moved.** The delta table above is eleven rows against a surface of 113 components.

**5 — `ids`, because it is where a React habit becomes a hazard here.** Putting an `id` on a part is
ordinary in React and works here too — a consumer `id` is last-wins — but the machine resolves both
the emitted attribute *and* its own element lookup through the same function, so overriding the
attribute alone desynchronizes them. **`ids` on the Root is the supported override**
(`component-blueprint.md` §3.4). One paragraph here, and the same note on every component page (§8.7).

### 5.3 What this page must not do

Re-argue the delta. Every row cites `plan.md` §0.4 or a `roadmap.md` §5 subsection, and a reader who
wants the argument follows the link into a repository they may not have. So each row's *reason* is one
sentence, complete on its own, and the page never says "for architectural reasons".

### 5.4 Where the parity sentence appears verbatim, and where it does not

Q3 is settled **prominent** (`plan.md` §9). Prominent means four placements, and it means stopping
there:

| Verbatim | Why there |
|---|---|
| **The README's first paragraph** | The npm package page is where a mistaken install begins (`legal.md` §3.3.3 item 1) |
| **The docs home**, under the descriptor (§3.2) | The first thing a reader meets |
| **The install page**, above the snippet (§4.1) — as the Panda prerequisite line, which is its operative half | The last moment before a reader commits |
| **This page's lede** | The page a reader arrives at *from* Chakra, already comparing |

**Where it is not repeated, and repeating it would be noise:** every component page, every styling
and theming page, every props table, every example. The delta is already visible where it bites — a
component page carries the CIJ note only if `roadmap.md` §3.1 marks it (§8.10), and the styling pages
carry the dynamic-value contract rather than a slogan. **A sentence a reader has seen four times and
sees a fifth stops being read**, which would cost exactly the page it matters most on.

---

## 6. `/docs/reference/chakra-config` — the config function

**Frame:** an API reference for one function. Chakra has no analogue — its equivalent is
`createSystem`, which does not exist here — so this page's *existence* is a `plan.md` §0.4
consequence, and it is filed under `reference/` rather than `get-started/` for that reason
(`docs-site.md` §2.1).

**Who lands here:** somebody with a broken build, or somebody writing a config. Both want the knob
list, not the reasoning, so the reasoning is one line per knob and the failure it prevents is stated
in the same row.

### 6.1 Section order

**0 — What it is.** `@chakra-ui-solid/preset`, one subpath `.`, two exports: `chakraSolidPreset`
(default, the Panda preset) and `chakraConfig(options?)` (named, a function returning a
`defineConfig`-shaped fragment). **A function even with no arguments** — `chakraConfig()` — so the
responsive opt-in is a change of argument rather than a change of call shape (`plan.md` §3.3).

**1 — The minimal config**, §4.1's snippet again. Repeated deliberately: a reference page a reader
has to leave to find the working example is a reference page that gets replaced by a StackOverflow
answer.

**2 — What it sets, and why none of it is yours to set.**

| Key | Why `chakraConfig()` owns it |
|---|---|
| `hash` | Our published runtime was generated with `hash: false` and emits `p_4`. A consumer sheet built with `hash: true` carries hashed rules, so **every class we compute is absent from their sheet** — `plan.md` §0.2 at total scale, with no error anywhere. This function exists to make that unconstructable (`plan.md` §3.4) |
| `importMap` | Points Panda at our published `styled-system`, which is what makes the library and the app share one `css` runtime |
| `presets` | Already contains `chakraSolidPreset`; composing is override path 4, §7.4 |
| `eject`, `jsxFramework`, `preflight` | Each load-bearing and each learned the hard way (`plan.md` §3.1). `jsxFramework: "solid"` in particular is what makes **your** style props extract from **any** capitalized component |

**3 — What *is* yours: `include` and `outdir`.** With the buildinfo path explained — it is what
carries the variants our components emit but your source never writes — and Option A (adding our
`dist` to `include`) named as the documented escape hatch it is (`plan.md` §4.1), with the warning
that it does **not** solve dynamic values and is not an escape hatch for extraction limits
(`/guides/static-extraction` §1.2's *rejected* note).

**4 — Spreading is shallow.** The one gotcha with real consequences: any key you re-declare replaces
ours wholesale. Fine for `include` and `outdir`; a hazard for `presets`, `staticCss` and `theme`,
where "and also mine" is what people mean. `mergeConfigs([chakraConfig(), { … }])` is the documented
form (`plan.md` §3.4).

**5 — `responsive`.** The option's shape, in full: the three grains with their rule counts, the
shorthand's expansion into the `staticCss` form Panda already understands, and why it is emitted as a
top-level block rather than through `theme.extend` (`plan.md` §3.8). **And the sentence that makes it
matter: types cannot follow the flag.** `size={{ base: "sm", md: "lg" }}` type-checks whether or not
the rules were generated, because the prop types come from our recipes while the CSS comes from your
config — so forgetting the opt-in is a silent unstyling with no type error. The *failure* and its
diagnosis stay on `/guides/static-extraction` §1.2 section 4; this page links there rather than
retelling it (§0's boundary).

**6 — What it is not.** Not a theme, not a runtime system, no `createSystem`. Theming is §7.

### 6.2 What this page renders

`plan.md` §3.3 (the package's two exports and the one subpath) · §3.4 (the consumer config and the
`hash`/`prefix` hazard) · §3.8 (the three grains, and types not following the flag) · §4.1 (Option
B, and Option A as an escape hatch).

---

## 7. `/docs/styling/*` and `/docs/theming/*`

**Frame:** Chakra's two tiers, structurally 1:1, minus the pages whose mechanism does not exist here
and plus nothing. The split between them is Chakra's and it transfers: **styling is what you write on
a component; theming is what you change in the config.** That split happens to be exactly the
build-time boundary here, which makes it a better organising principle for us than it is for them.

**One lead-in section, shared by both tiers' overview pages**, because it is the fact both tiers
depend on:

> The preset supplies tokens and recipes. **Your** Panda run reads your source and your config and
> writes **your** stylesheet. There is no runtime system object, and nothing computes a style while
> your app is running.

### 7.1 The styling tier

`overview` is the tier's entry and its first link is `/guides/static-extraction` — before the style-
prop reference, before conditional styles. A reader who learns style props before they learn what
extracts will write a wrapper component in the next hour (`brief-plan` §7 concern 2).

| Page | What it must show | Source |
|---|---|---|
| `overview` | Where a class comes from; the four things you can write (style props, the `css` prop, recipes, `cx`) | `plan.md` §3.5, §3.6 |
| `styled-factory` | `renderStyled`, the `styled` factory, and the **precedence order**: `recipeClass` → style props + `css` → your `class`, with inline `style` beating every class | `component-blueprint.md` §3.4 order 2; `prior-art.md` §2.5 |
| `conditional-styles` | Panda's conditions (`_open`, `_checked`, `_highlighted`) selecting on the machine's own `data-*`. **The example is on the recipe side** — you write no conditional prop | `component-blueprint.md` §3.7 |
| `responsive-design` | Responsive **style props** work normally. Responsive **recipe variants** are the opt-in, and this is where a reader first meets it | `plan.md` §3.8, §1.4 |
| `css-variables` | Route 3, and override path 1 — including that the recipes already write their own custom properties, which is why the cheapest override needs no build participation | `plan.md` §3.5, §3.7; `component-blueprint.md` §5.3 |
| `focus-ring`, `layer-styles`, `text-styles`, `animation-styles`, `cascade-layers`, `virtual-color`, `color-opacity-modifier` | Preset features, one page each. Mechanically identical to Chakra's because they are the same preset | the preset |
| `style-props/*` — 18 pages | **Generated** (`docs-site.md` §4.3) | our utilities + the generated `isCssProperty` |

`styled-factory` carries one thing Chakra's equivalent page does not need: **`as` stays a loose
`ValidComponent`**, never a generic that re-types props from the element — deliberately, to avoid the
deep-conditional polymorphic-type cost that wrecks editor completions (`prior-art.md` §2.5). A reader
who expected `as="a"` to type `href` deserves the reason rather than a gap.

### 7.2 `dark-mode` and `semantic-tokens` — the contract, and the snippet

**We ship no color-mode provider**, because Chakra ships none either: it distributes color mode as a
snippet installed into the consumer's app, and the port rule follows that (`plan.md` §7.1). So this
page is unusual — it is a docs page that *is* the feature.

What it must contain, in order: the snippet, in full, ready to paste; the selector it must produce on
the root element; and the statement that the preset's semantic tokens are written against Panda's
`_dark` condition, so **the selector is our entire contract**. `@solid-primitives` or the consumer's
own store does the toggling and nothing about it touches `plan.md` §0.

The selector is verified rather than asserted — `check:dark-selector` runs a computed-colour
assertion under exactly the attribute this page tells consumers to set (`testing.md` §8). **The page
and the check must name the same selector**, which is the one thing that could quietly drift here.

### 7.3 `recipes` and `slot-recipes`

The variant **API** is Chakra's — same variant names, same `unstyled` opt-out, same defaults from
`defaultVariants`. The **resolution** is a static import from the generated recipes rather than a
runtime system lookup, and that is the only structural difference in the path (`plan.md` §3.6). Both
sentences on the page, in that order, because the first is what a reader needs and the second is what
they will otherwise discover through a missing `useRecipe`.

Also here: a recipe's slots are not the same set as a machine's parts, and neither contains the other
(`component-blueprint.md` §3.1). The component pages show both lists (§8.5); this page says why there
are two.

### 7.4 `customization/*` — the four override paths

The tier's spine is `plan.md` §3.7's four paths, cheapest to widest, **one worked example each**:

| # | Path | Needs a build? | The case it is for |
|---|---|---|---|
| 1 | **CSS custom properties** on any element | **No** | Retuning one instance. The recipes compile to custom properties, so this reaches inside a component with nothing but a `style` attribute |
| 2 | **Style props / the `css` prop** on any part | Yours, which is already running | The common case, full parity |
| 3 | **`theme.extend.slotRecipes.<key>`** in your config | Yours | The Chakra-equivalent of `createSystem(defaultConfig, { theme: … })`, moved to build time |
| 4 | **A different preset** — `presets: [chakraSolidPreset, myPreset]` | Yours | Wholesale |

Path 1 is first because it is the only one a consumer can reach at runtime, and because readers
arriving from `createSystem` assume nothing is reachable at runtime at all.

**Two things this tier owes that Chakra's does not:**

- **What our preset adds over the official one**, so a reader knows their theme is
  `@chakra-ui/panda-preset` plus a short list: the `container` recipe (which the preset is missing and
  Chakra's runtime theme has) and one `cursor.switch` token key (which restores a `cursor: pointer`
  the preset silently loses). Two keys, both named, with what each fixes (`definition-of-done.md` §6).
- **That `@chakra-ui/panda-preset` is in your dependency tree**, by design — we depend, we do not
  vendor (`legal.md` §1.5). It is one config-only package with no CSS, and it is *the* reason the
  design system matches. `legal.md` §1.5 asks for this to be said in the docs; this is where.

### 7.5 What these tiers must not say

That theming happens at runtime, in any wording, on any page. `createSystem` does not exist, a theme
object cannot be swapped while the app runs, and every path above is a build. §5's delta table is the
link, once per tier, not per page.

---

## 8. The component page — one template, applied 113 times

**Frame:** Chakra's component page structure, copied exactly — frontmatter, preview, `## Usage`,
`## Examples`, `## Props`. **Structure is not expression** (`legal.md` §1.4); the sentences inside it
are ours (`docs-site.md` §3.2 rows 1 and 2).

The template is a spec, not a file: every section below is either generated (and therefore identical
across pages) or written per component against a stated question. **A section is omitted, never left
empty** — an empty section reads as a missing feature, and half of these sections legitimately do not
exist on most components.

### 8.1 Frontmatter

`title`, `description` (ours, one line, written from the component's behavior), and `links`:

| Link | Points at |
|---|---|
| `source` | the component's directory |
| `recipe` | its preset key — `S:dialog`, `A:button`, or absent where the key resolves to nothing (`roadmap.md` §4) |
| `machine` | its `@zag-js/*` machine, or absent for the 15 multi-part components and the layout surface |
| `chakra` | **the upstream page for the same component.** An outward link, and `legal.md` §3.3.3 item 2 makes it a virtue rather than a courtesy: a reader who wanted the official project should leave in one click |

**No `storybook` link.** Chakra's frontmatter has one; ours does not, because Storybook here is a dev
harness and a compile-mode canary, not user-facing docs (`brief-plan` §2.10).

### 8.2 Live preview + code fusion

One example, two panes: the rendered component, and **the source of the file that rendered it**, read
at build time rather than transcribed (`docs-site.md` §4.1). Preview and code cannot diverge, which
is the property a copy-pasted snippet cannot have.

### 8.3 `## Usage`

The import line — which must match `plan.md` §5.5's subpaths, and is checked
(`check:docs-examples`) — and the anatomy snippet: the part tree, nested as it is written. Part names
are API shape and owe nothing (`legal.md` §1.4); the tree is ours where our anatomy differs.

### 8.4 `## Examples`

One `###` per example, each backed by a real file that mounts, renders and passes axe
(`docs-site.md` §4.1). Which examples a component gets is a per-component judgement; **that every one
of them is opened is not** — `prior-art.md` §8.1's fourth clause, and the reason `check:docs-examples`
mounts rather than typechecks.

### 8.5 `## Parts`

Two lists, side by side, with the note that **they are not the same set and neither contains the
other** (`component-blueprint.md` §3.1): the machine's anatomy parts, and the recipe's unique slots.
Generated from the same sources `check:anatomy-parts` reads (`testing.md` §8), so a part component
that exists and a slot that has no component are both visible on the page rather than only in CI.

### 8.6 `## Props`

One `###` per part, each a **generated** table (`docs-site.md` §4.2). Three inputs merged — the
machine's `Props` type, our own part props, and the recipe's variant map with its `defaultVariants`.
Never hand-written: a hand-written table omits a new prop silently, and a reader concludes the prop
does not exist.

### 8.7 `### ids` — on every component page with a machine

The section `component-blueprint.md` §13 row 10 assigns to the docs, and it is not optional per
component:

- A consumer `id` on a part **reaches the element** — `id` is last-wins in the prop bag, Ark ships
  this and so do we, and no part strips it.
- **It is also a hazard.** The machine resolves the emitted attribute and its own `getElementById`
  lookup through the same function, so overriding the attribute alone desynchronizes them — the
  element gets your id and the machine looks for its own.
- **`ids` on the Root is the supported override**, it covers every part at once, and it keeps both
  sides in agreement. `<Dialog.Root ids={{ content: "my-content", title: "my-title" }}>`.

All three sentences, on every such page, because the middle one is what a reader discovers otherwise
and the failure is a component that stops responding rather than an error
(`component-blueprint.md` §3.4).

### 8.8 `### render`

Polymorphism is the `render` prop, on every part. It is a **function** receiving the computed props
and returning the element — **never a JSX element, and never `asChild`** — because a Solid JSX element
is an already-constructed node by the time it reaches us and there is no `cloneElement`, so accepting
one could only mean dropping every computed prop (`component-blueprint.md` §3.5). One example per
page, on the part where it is most used.

### 8.9 `### Context`, `### RootProvider`, `### PropsProvider`

**Only where the component has them**, and the counts are why the template has three separate slots
rather than one: `Context` on **43** components, `RootProvider` on **41**, `PropsProvider` on **47**
(`roadmap.md` §10). Each ships with its component's batch rather than as a later sweep, so the page
section appears in the same commit as the export.

Where a component has a public `useX` / `useXContext` hook, it is documented here too — exported from
**the component's own subpath**, not from `./hooks`, which is fourteen unrelated utility hooks of
which seven ship (`roadmap.md` §5.8, §10).

### 8.10 `### Dynamic values` — only on the eight implementations `roadmap.md` §3.1 marks

The per-component CIJ note. **Only on the marked rows**, and the two marks get different notes:

- **`●` — unbounded** (`aspect-ratio`, `grid`/`GridItem`, `input-group`, `simple-grid`, `float`).
  Chakra computes the value at render time and serializes it; we route it through a **CSS custom
  property**, which means the value is a `style` attribute you can set — including from your own
  runtime state. State what Chakra computed, what property we expose, and that setting it is
  supported rather than a workaround.
- **`○` — bounded** (`bleed`, `flex`, `square`/`circle`). A finite set, pre-generated. Nothing for a
  consumer to do, and the note exists only so the §0.4 delta is visible where it applies.

**Not on the other 104 pages** — the eight marked implementations span **nine** component folders.
Two things are deliberately outside this note (`roadmap.md` §3.1):
machine-emitted inline `style` — legal, not a delta, and marking every positioned component would
turn the column into "has inline styles" — and consumer style props, which carry the delta on **every**
styled component and are therefore stated once, globally, on `/guides/static-extraction`.

### 8.11 `### Presence` — only on presence-gated components

`lazyMount`, `unmountOnExit`, `skipAnimationOnMount`, and the six components where Chakra defaults
`lazyMount`/`unmountOnExit` to `true` say so (`roadmap.md` §6.1). **`hideMode: "activity"` is absent**
and the section says so plainly rather than omitting the prop and leaving a reader to try it — it is a
`React→Solid` row, not a gap (`component-blueprint.md` §7.3).

### 8.12 `### Accessibility` — optional, and drawn from the machine

The ARIA pattern and the keyboard map, from the machine's own contract. **The axe allowance register
is internal and does not appear here** (`definition-of-done.md` §5) — it is a record of what our tests
tolerate, not a property of the component a consumer needs.

### 8.13 What the template must not contain

- **A parity restatement.** §5.4: four verbatim placements, and a component page is not one of them.
- **A Storybook link** (§8.1).
- **Any prop the generator did not produce.** A hand-added row is a claim with nothing behind it, and
  it will outlive the prop.
- **An empty section.** Omit it; §8's opening rule.
