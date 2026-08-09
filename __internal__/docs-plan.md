# The docs site — page inventory and page specs

**Status:** opened 2026-08-09, between P6 and P7. Owned by **P8**; seeded with one page spec (§1).

**What this document is.** The docs site's page inventory, and a spec per page: the frame, the
section order, what each section must show, and which already-settled decision it renders. A page is
specced here before it is written, for the same reason a component is blueprinted before it is
stamped — the styling page in particular becomes the thing every "working as designed" issue reply
links to, so it is cheap to argue with here and expensive later.

**What it is not.** The docs *app* — TanStack Start at `apps/docs` (`plan.md` §5.1) — nor the
decisions the pages render. Every claim below is cited to `plan.md`, `prior-art.md`,
`component-blueprint.md` or `roadmap.md` by section, never restated as new. **Where a page spec and
its source document disagree, the source document wins**, and the spec is the thing that gets fixed.

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

## 0. Inventory

Pages the plan already commits to, so P8 has a full list rather than one page in isolation. Only §1
is specced; the rest carry their source and owner so the spec can be written without re-deriving it.

| Page | What it renders | Source | Spec |
|---|---|---|---|
| **`/guides/static-extraction`** | §3.5's dynamic-value contract, as a consumer-facing contract rather than an architecture note | `plan.md` §3.5, §1.4, §0.2 | **§1 below** |
| Docs home | The parity sentence, verbatim: *"as close to Chakra v3 parity as is achievable without runtime CSS-in-JS"* | `plan.md` §0 | — |
| Install / setup | Panda as a hard prerequisite — the non-optional `peerDependency`, and the README's first line above the install snippet | `plan.md` §4.4, §12 row 14 | — |
| Chakra → Solid mapping | The §0.4 delta table with its **Cause** column, plus the six per-component rows P6 corrected (`for`/`show` excluded, `portal`/`client-only`/`presence` shipped, `environment` relocated, charts excluded) | `plan.md` §0.4, `roadmap.md` §5, §13 row 1 | — |
| `chakraConfig` reference | The preset's function export and its knobs, `responsive` among them | `plan.md` §3.3, §3.4, §3.8 | — |
| Theming | Tokens, recipes, override paths 1–4 | `plan.md` §3.7 | — |

The responsive opt-in does **not** get its own page. `plan.md:603` puts it on the same page as the
§0.2 warning — which is §1 — because a consumer who needs it has already hit the failure it fixes.

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
lint rule `plan.md` §3.5 requires. If the rule does not exist when the page ships, the page says the
rule does not exist yet.

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
makes the rest actionable:

- **Assert computed styles, never class names.** `classList.contains("p_4")` passes on a completely
  unstyled element (`plan.md` §0.2).
- The route-3 lint rule (§3.5).
- The generated-CSS coverage check, and what its failure output means.

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

---

## 2. Open

| # | Question | Blocks | Resolved by |
|---|---|---|---|
| **D-1** | Does the fixture in §1.4 run against the docs app's own Panda build, or a dedicated minimal one? A dedicated build is honest about what a consumer's config looks like; the docs app's is what actually ships | §1.4 | P8 |
| **D-2** | Does the route-3 lint rule exist by the time this page ships? If not, §1.2 section 4 says so rather than implying it | §1.2 | P7 |
