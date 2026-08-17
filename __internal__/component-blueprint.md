# The component blueprint — the pattern every machine component is stamped from

> **Provenance, marked at S4, 2026-08-10 — read this before citing anything below as evidence.**
> **This document is a design, not a report.** It was written at P5, before any component existed,
> and **no machine component exists yet**: the first is Dialog at step 5. So unless a passage names a
> decision (`D-nnn`), a shipped file, or a measurement, treat it as **P — a prediction nobody has
> run.** That includes every line of §11's worked Dialog, which the document itself says will
> *"compile once the packages exist"* and which nothing has compiled.
>
> **The parts that are not P**, because their subject shipped at steps 1–3b:
> §1.3 (`@zag-js/focus-visible`, measured — `f57403b`), §2.1–§2.2 (`useMachine` and the
> `[STRICT_READ_UNTRACKED]` rule, exercised by `machine.browser.test.tsx`), §3.4's precedence and
> §3.5's `as` and `render` props (**I** — `packages/core/src/render-styled/`, with tests), §9's a11y baseline
> (**M** for the retired allowances, **P** for the three predicted ones — `definition-of-done.md` §5
> marks each row itself), and §10's `_hk` hazard (**M** — the hydrate fixture is
> `packages/internal-test-utils/src/hydrate-fixture/`).
>
> **Marking each remaining claim inline was rejected.** The document is 90 KB and the honest ratio is
> *nearly all of it*; a `— P` after every sentence would be noise carrying one bit. The bit is here
> instead, once, at the top, where a reader arrives.

**Status:** written at P5, 2026-08-09. Settles **Q7** (Dialog vs Accordion, §0) and fixes the shape
every machine component is written to — the 56 slot recipes are the machine surface (`plan.md` §10),
and each one is several parts. It gets stamped 100+ times, so it is cheap to argue with here and
expensive later.

**What this document is.** The pattern: how a Root starts a machine, how the machine's named parts
become components, how a part reaches its slice of the Panda slot recipe, what precedence the props
resolve in, where an inline `style` is legal and where a recipe variant is required, and what SSR
and hydration constrain. Then **Dialog worked fully through**, in code concrete enough to compile
once the packages exist.

**What it is not.** The evidence base (`prior-art.md`), the architecture (`plan.md`), or the adapter
spec (`zag-solid-adapter.md`). All three are cited by section rather than restated. **Where this
document and the plan disagree, `prior-art.md` §10 and `zag-solid-adapter.md` §10 win**; §13 lists
every place P5 departs from them so P6 gets re-planned before P6 begins.

**Vocabulary, once.** A **machine** is a `@zag-js/*` state machine — framework-agnostic behavior and
ARIA. Its **anatomy** is its list of named parts (`trigger`, `content`, …), each of which becomes one
**part component** (`Dialog.Trigger`). A **slot recipe** is a Panda style definition for a multi-part
component: one style block per named **slot**, resolved to one class string per slot. A **compound
variant** is a style block that fires only when several variants hold at once — Chakra's preset has
none (`plan.md` §1.1). `staticCss` is the Panda declaration that pre-generates CSS for values no
source file literally writes. **Presence** is enter/exit lifecycle: whether a node is in the DOM, and
whether it is mid-animation. **`_hk`** is the positional key Solid stamps on server-rendered nodes and
matches against on hydrate. **Silent unstyling** is this project's central hazard: a Panda class whose
CSS was never generated renders nothing and raises no error (`plan.md` §0.2).

**Settled earlier, not reopened here.** The brand `chakra-ui-solid` / `@chakra-ui-solid`; the **port
rule** — *no accessibility behavior beyond what Zag ships, nothing invented that Chakra UI v3 does
not have, SolidJS idioms excepted* (`prior-art.md` §8.2); Zag `1.43.0`; Solid `2.0.0-rc.0`; the
a11y kernel struck to `createRegisteredId` alone; §0's two scopes (`plan.md` §0); P3's Q2 and Q4;
P4's Q6.

---

## 0. Q7 — Dialog, and what Accordion would not have exercised

### 0.1 The answer: Dialog

**Dialog.** It is the only candidate that crosses every seam this project has no evidence for at
once, and `prior-art.md` §0.2 is explicit that no Zag machine has ever rendered through a Panda
recipe in this lineage — let alone through Chakra's preset. The worked component's job is to spend
that ignorance early.

| Seam | Dialog exercises it | Why it matters |
|---|---|---|
| **A slot recipe** | 10 slots, 4 variant keys, 18 variant values, `defaultVariants` on all four | `prior-art.md` §4's unproven layer, and the largest slot recipe surface among the plausible candidates |
| **Presence as a build** | Two independent presences (Backdrop's own, Content+Positioner's shared), `lazyMount`/`unmountOnExit` on by default | `plan.md` §6 — ~30 lines of ours over a machine. Nothing else in the library gets this wrong in a way tests catch late |
| **Portal** | Content and Backdrop render outside the Root's DOM position | The only place `_hk` (Solid's positional hydration key) and cross-scope writes interact (§10.3) |
| **Focus trap + scroll lock + the `aria-hidden` blanket** | All three, from the machine | The a11y baseline (§9) is set here or it is set by a bug report |
| **Cross-scope ids** | `aria-labelledby` / `aria-describedby` resolved by the machine sniffing the DOM one frame after open | The pattern `createRegisteredId` was built for — and the one where a 1:1 port needs none of it (§10.3) |
| **`hidden` on a slot that sets `display`** | `content` is `display: flex` **and** carries `hidden` | The exact cell `prior-art.md` §5.1's tax lives in (§6) |
| **Chakra-only slots** | `header`, `body`, `footer` have recipe slots and no machine part | Every slot recipe has some; the shape has to be named once (§3.2 shape C) |

### 0.2 Accordion, rejected — and the one thing it would have covered that Dialog does not

**What Accordion would have exercised:** a slot recipe (6 slots, 2 variant keys), `data-state` per
item, a **nested machine inside a part** (`AccordionItemContent` delegates to Collapsible), and one
Chakra-only slot (`itemBody`).

**What it would have missed** — all of it load-bearing: Portal and therefore every cross-tree
hydration question; the focus trap, scroll lock and `aria-hidden` blanket, and therefore the entire
a11y baseline of §9; presence with `lazyMount`/`unmountOnExit` (Accordion's content is Collapsible's
concern, and Chakra sets neither default on it); the `aria-controls` presence gate (§1.2); and the
`hidden`-vs-`display` collision at full strength.

**The one residual, named so it is not lost:** Accordion has a **repeated part** — `Item`,
`ItemTrigger`, `ItemContent`, `ItemIndicator` render once per item under one Root, each needing a
per-item context carrying `{ value }`. Dialog has no repeated part, so §3 does not settle that shape.
Ark's `useAccordionItemPropsContext` is the reference for *what* it must carry. **Assigned to P6**,
which sequences the second worked component; the first component after Dialog that has a repeated
part extends §3.2 with a fifth shape rather than inventing one per component.

### 0.3 One correction to the brief's part list — `Portal` is not a Dialog part

The task brief lists `Portal` among Dialog's parts. It is not one, in Zag or in Chakra:
`dialog.anatomy.ts` names seven parts and `portal` is not among them, and Chakra's
`components/dialog/namespace.ts` exports fifteen names with no `Portal`. Chakra ships **`Portal` as a
standalone component** (`components/portal/index.ts` is a one-line re-export of Ark's), used *inside*
`Dialog.Root`. §11 writes it that way, and §13 records the consequence for P6.

**Corrected at the `dialog` ship: we port no `Portal` component at all.** `@solidjs/web` ships
`<Portal>` and a consumer imports it from there. It does not throw on the server, as §11.12 assumes —
its server version renders nothing, returns `undefined`, and consumes exactly one hydration child id,
the same number its client counterpart consumes, so nothing after a portal shifts between the two
builds. Dialog's round trip measures that with a probed sibling placed immediately after one.

---

## 1. The recurring floor, re-measured against Chakra

`prior-art.md` §3.4 measures hope-ui's recurring cost at a **~15-line, three-row per-component
floor**, and §5 works each row's failure. **That number is hope-ui's, against hope-ui's stack, and
none of the three rows survives contact with Chakra in the form it was measured.** Row by row:

### 1.1 Row 1 — `hidden` vs the recipe's `display`: a global rule, not a per-component one

hope-ui paid ~5 lines per part: strip Zag's `hidden`, gate the render on presence instead
(`prior-art.md` §5.1, both worked failures). **We pay zero per component**, by two mechanisms that
are Chakra's and are ours to port rather than invent (`prior-art.md` §5.1's correction):

1. Chakra's preflight makes `[hidden]` unbeatable with `!important`. One `globalCss` line in our
   preset if Panda's own `preflight: true` does not already emit it — **open, assigned to
   implementation step 3** (`plan.md` §3.7, assumption P3-E).
2. Presence supplies `hidden` itself, overriding the machine's, and unmounts the node entirely under
   Chakra's `unmountOnExit: true` default.

The per-component obligation reduces to a **rule** (§6) and a **test** (§6.4), not lines of code.

### 1.2 Row 2 — the labelling IDREF: half of it is Ark's, and we port it

`prior-art.md` §5.2 records two unconditionally-emitted IDREFs and concludes *"neither spike took it
— and neither do we,"* on the basis that *"Ark forwards `getTriggerProps()` / `getContentProps()`
straight through."* **Measured at the checkout, that is wrong for the `aria-controls` half and right
for the `aria-labelledby` half.**

```bash
grep -rn "aria-controls" __reference-impl__/ark-ui/packages/react/src/components/ | grep -v test
```

Six Ark components — `dialog`, `drawer`, `popover`, `menu`, `floating-panel`, `accordion` — carry the
override explicitly:

```tsx
'aria-controls': presence.unmounted ? undefined : triggerPropsRaw['aria-controls'],
```

and four of the six carry a dedicated test for it (`accordion`, `dialog`, `popover`, `menu`, each
named *"should not have aria-controls if lazy mounted"*). It is **presence-gated,
not open-gated** — which is a different and better rule than the one hope-ui proposed: while the
content is mounted-but-closed the IDREF resolves to a real element and stays. Chakra inherits it
unchanged, and with `lazyMount: true` / `unmountOnExit: true` as Chakra's Dialog defaults, the closed
trigger emits **no** `aria-controls` at all.

**Verdict: port it.** Under the port rule this is not an accessibility improvement over the target —
it *is* the target, and omitting it would be the divergence. Cost: **one line** in the merge, on
presence-gated trigger parts only. §9.2 records what it does to the axe baseline.

`aria-labelledby` on listbox content stays **not taken**: Ark's `ListboxContent` is
`mergeProps(() => listbox().getContentProps(), props)` and nothing else, so Chakra ships that dangling
IDREF and so do we. The fix belongs upstream in Zag (`zag-solid-adapter.md` §8).

### 1.3 Row 3 — `@zag-js/focus-visible` crashing Storybook: once per preview, not per component

`prior-art.md` §5.3's fix is a 3-line `trackFocusVisible()` warm-up at module scope plus a Storybook
version pin. It runs **once per Storybook preview file** — `setupGlobalFocusEvents` is
once-per-window and every later call early-returns. Per-component cost: **zero**. It is P7's
Storybook configuration, not this blueprint's.

**P7 also changed Storybook's status, which this section describes as a dev harness.** It is that
*and* a **required CI job** — `test:storybook` builds and drives every story, and it must be
Storybook rather than `composeStories` under Vitest, because the two failures it exists for are
invisible to any other compile: the `focus`-accessor crash above, and the restrictive-content-model
compile crash of §10.4, which only `hydratable: false` produces (`testing.md` §7.3, §7.4;
`definition-of-done.md` rule 2.6, §10 row 7).

> **Reversed at S3b (D-133), and the paragraph above is left standing as the record.** Storybook is a
> **local playground**: no gate, no CI job, no `test:storybook`, and no rule that a story must exist.
> The two failures it is the only witness to are real — the `focus`-accessor crash is now *measured*
> here rather than predicted (**D-130**), and §10.4's is *unreproduced* at this toolchain
> (**D-131**) — but nothing automated looks for either. **What proves a component works is a real app
> using it**: `apps/docs` and `check:docs-examples` (`docs-site.md` §4.1). The warm-up in the
> paragraph above is unaffected and stays exactly as written; it is what makes the playground usable
> at all.

### 1.4 What a component actually pays

| Row | hope-ui's cost | Ours |
|---|---|---|
| `hidden` vs `display` | ~5 lines/part | **0** — a preset `globalCss` line once (§6), plus one computed-style test per presence-gated part |
| `aria-controls` | not taken | **1 line**, on presence-gated trigger parts only (§1.2) |
| `aria-labelledby` | not taken | **0** — not taken (§1.2) |
| Storybook focus-visible | 3 lines | **0** per component |
| **New, and ours:** style-prop extraction reading a merged bag | did not arise | **1 argument** per part — `styleSource` (§4.1, addition 4) |
| **New, and ours:** the recipe seam | never wired | **1 argument** per part — `recipeClass` (§4.2) |

**The honest per-part floor is two named arguments and, on trigger parts, one line.** The rest of a
part is assembly. Two things this does *not* mean: `prior-art.md` §3.4's warning that the floor
**grows by category** still stands — Dialog and Listbox are two data points and a floating component
(`prior-art.md` §3.3 seam 3: Zag writing `--layer-index` imperatively into the same `style` attribute
Solid binds reactively) is untested by anyone; and the floor is not the cost, the **assembly** is
(component #2 cost 405 code lines of it).

---

## 2. Machine instantiation

### 2.1 A Root calls `useMachine` bare — and the idiom the plan teaches no longer exists

```tsx
const service = useMachine(dialog.machine, machineProps)
```

No `untrack`. **`plan.md` §3.5's B5 row and §4.1's document-4 contents both instruct this document to
teach *"the `untrack`-around-`useMachine` seed idiom."* Do not.** The fork moved that fix down into
`machine.ts`'s `seedFromProps` helper at `ef91b69`, and both root components at the tip have zero
`untrack` (`prior-art.md` §6 row B5; `zag-solid-adapter.md` §4.2).

Teaching the wrapper would stamp a redundant `untrack` into 100+ components, and **each one would
suppress the diagnostic that catches the real bug** — permanently, silently, and in the exact place
the bug would appear.

### 2.2 Where a `[STRICT_READ_UNTRACKED]` at that call site *is* a genuine defect

Solid 2.0 labels certain phases strict-read — component render bodies, `<For>`/`repeat` callbacks, an
effect's second callback — and reports untracked reads inside them. `mount()` fails a test on one.
Two causes remain live, and both are real:

1. **The component's own render body reads a reactive value untracked.** Computing anything from
   `props.x` outside a getter, a memo, or the machine-props accessor. The fix is to move the read,
   never to wrap the call.
2. **The machine's `machine.watch?.()` reads props directly** rather than through a `track` dep.
   `seedFromProps`'s JSDoc records this boundary deliberately: `watch` only *registers* `track`
   effects whose deps are collected in their own tracking scope, so *"a machine that reads props
   directly there has a real bug, and should keep getting the diagnostic."*

If either fires, file it — against our component or against Zag. Do not silence it.

### 2.3 The four things every Root injects, and where they come from

```tsx
const machineProps = createMemo<dialog.Props>(() => ({
  id: merged.id ?? scopeId,
  dir: locale().dir,
  getRootNode: environment().getRootNode,
  ...componentProps,
}))
```

| Injected | Source | Why |
|---|---|---|
| `id` | the consumer's `id` if present, else `createUniqueId()` once per Root | Every part id is `dialog:${scope.id}:<part>` (`dialog.dom.ts`), and it must survive the SSR→hydrate round-trip. `id` stays public because Ark exposes it |
| `dir` | the locale context (`plan.md` §7.2) | Machines take direction as a prop; the preset's logical properties resolve off the `dir` attribute (`plan.md` §7.3) |
| `getRootNode` | the environment context (`plan.md` §7.2) | Shadow-DOM- and iframe-correct element lookup |
| everything else | the component's own props | §2.5 |

Pass `machineProps` as an **accessor**, never a plain object: the fork re-reads it through a memo, so
guards, actions and computed values see current values (`machine.ts`'s JSDoc).

### 2.4 Read the machine's prop list, do not invent one

`<machine>.props.ts` exports the authoritative key list (`dialog.props.ts` has 26). A Root exposes a
**subset**, chosen to match Chakra's public surface — which is Ark's `createSplitProps` list, and for
Dialog is exactly those 26 minus `dir` and `getRootNode`, both injected: **24**. Anything Chakra does not expose, we
do not expose; anything Chakra exposes that the machine does not have is a presence or render-strategy
prop (§7).

### 2.5 `withDefaults`, never `merge`

Solid 2.0's `merge` resolves a key by **presence**, not by value: a later source wins as soon as it
has the key at all, even when the value is `undefined`. So `merge({ modal: true }, props)` gives a
wrapper that forwards `modal={props.modal}` with `modal` unset a **non-modal dialog** — no focus trap,
no scroll lock, no `aria-modal`, no error. `withDefaults(props, { modal: true })` resolves each
defaulted key with `??`. It is `plan.md` §5.3 row 6's *mandatory* carry-over and it is mandatory for
exactly this.

**And the corollary that is easier to get wrong:** once merged, the returned object is the *only*
props object for the rest of the body. `withDefaults` copies nothing — it exposes defaults as getters
over a new object — so reaching back to the raw `props` for a defaulted key silently reads
`undefined`. Merge once at the top; feed *that* result to everything downstream.

### 2.6 The controlled-mode predicate, and the parts it touches

`zag-solid-adapter.md` §4.3 D3 aligns the fork's `bindable.ts` to upstream's strict
`props().value !== undefined`. Under the fork's previous loose `!=`, `value={null}` meant
*uncontrolled*; under `!==` it means *controlled with null*, which is what all six upstream adapters
and Chakra do.

**What that means at part level:** any component exposing a nullable value prop — `select`,
`combobox`, `listbox` (`highlightedValue`), `color-picker`, `date-picker`, and Dialog's own
`triggerValue` — must document `null` as *"controlled, and empty"*, and must not use `null` as a
"leave it alone" sentinel. Dialog's `triggerValue` is the worked instance:
`<Dialog.Root triggerValue={null}>` pins the active trigger to none rather than handing control back
to the machine. Use `undefined` for "uncontrolled".

---

## 3. `anatomy` → part components

### 3.1 Two lists that are not the same set

The **machine's anatomy** and the **recipe's slot list** overlap but neither contains the other, and
conflating them is the fastest way to a part with no styles or a slot with no component.

```
dialog.anatomy.ts   trigger backdrop positioner content title description closeTrigger        (7)
preset slot recipe  trigger backdrop positioner content title description closeTrigger
                    header body footer                                                        (10)
Chakra's namespace  Root Trigger Backdrop Positioner Content Title Description CloseTrigger
                    Header Body Footer ActionTrigger RootProvider PropsProvider Context      (15)
```

Three rules follow:

1. **Every machine part gets a part component.** Non-negotiable — a missing part means an ARIA
   relationship the machine emits and nothing consumes.
2. **A slot with no machine part is shape C** (§3.2): recipe class, style props, no machine props.
3. **A component with neither** — `ActionTrigger` — is shape D: behavior from context, style props,
   and no slot at all.

`data-part` is **kebab-cased** by `createAnatomy`: `closeTrigger` → `data-part="close-trigger"`. The
recipe's slot key is camelCase. They are different strings for the same thing; Panda's `_open`-style
conditions select on `data-state`, not on `data-part`, so this only matters when hand-writing a
selector.

**One live trap in the preset while you are here.** `dialog`'s `slots` array lists `backdrop`
**twice**, and the slot-recipe registry key for Switch is misspelled **`swittch`** upstream
(`prior-art.md` §4.2). Neither is ours to fix from outside: both are `plan.md` §1.3's consume-the-key-
verbatim case, and the `switch` row shipped on exactly that. What the misspelling costs is *not* a
class name — `swittch`'s own `className` is `switch`, so `switch__control` is what reaches the DOM —
it is the `cursor` token of the same name, which `preset.ts` restores with one `theme.extend` key.

### 3.2 The four part shapes

Every part component that **renders an element** is one of these. Full code in §11. `parity-matrix.md`
§7 hands the fifth — the repeated part — and one part component renders nothing at all, below.

| Shape | Has | Example | Body |
|---|---|---|---|
| **A** Machine part | machine props + recipe slot | `Title`, `Description`, `CloseTrigger`, `Positioner` | `mergeProps(machine, props)` → `renderStyled` |
| **B** Presence-gated machine part | A + presence | `Content`, `Backdrop` | A + a `<Show>` gate, presence's `presenceProps`, and presence's `setNode` as the internal ref |
| **C** Slot-only part | recipe slot only | `Header`, `Body`, `Footer` | `renderStyled` with a `recipeClass` and nothing else |
| **D** Behavior-only part | context behavior, no slot | `ActionTrigger` | `renderStyled` with a composed handler and no `recipeClass` |

**The `Context` part is none of the shapes** — it renders no element, takes no props but `children`,
has no slot, and never reaches `renderStyled`. 43 components ship one (`parity-matrix.md` §10). Its
whole body is one line:

```tsx
export function CollapsibleContext(props: CollapsibleContextProps): JSX.Element {
  return props.children(useCollapsibleContext())
}
```

**That line is where the hazard is: the call happens once, in the part's own body, which is not a
tracking scope.** So the render prop must return JSX — a callback returning a plain string reads the
machine untracked and freezes on the value it had at mount.

```tsx
{(c) => (c.open ? "Show Less" : "Show More")}                        // frozen at mount
{(c) => <Show when={c.open} fallback="Show More">Show Less</Show>}   // tracked
```

The React version writes the bare ternary and it works there, so **every ported example that uses a
`Context` hits this** — Collapsible's Partial Height did. `tsc` sees nothing (both branches are valid
`JSX.Element`), and no unit test sees it either; the docs-examples suite is what fails.

### 3.3 Context: composition, not inheritance

The context value **holds** the machine's connected API; it never spreads it. One field always, plus
two that only presence-bearing families need:

```ts
interface DialogContextValue extends CreateDialogReturn {
  slots: Accessor<Record<DialogSlot, string>> // always — the resolved slot classes, one string per slot
  contentPresence: PresenceApi                // presence families only — the Root-created shared presence (§7.5)
  renderStrategy: RenderStrategyProps         // presence families only — for parts building their own
}
```

`CreateDialogReturn` is the **store shape**: a stable object of reactive getters and delegating
methods over the one `createMemo(() => connect(service, normalizeProps))`, so a part writes
`ctx.getTitleProps()` and a consumer writes `dialog.open`. This section originally predicted an
`api: Accessor<Api>` field instead, and it was wrong on two counts — it makes the public value and
the context value two different shapes, and property access is what SolidJS 2.0 tracks through for
every other bag of reactive state it ships (props, stores). Measured in `e549713`, whose
`store-shape.browser.test.tsx` times six candidate shapes over a real machine at 10, 30 and 78 api
members — `date-picker`'s width, the widest Zag ships, so no later machine moves these numbers. The
getter object is the fastest of the shapes that read idiomatically; an accessor-returning shape costs
4–8% more at wide apis, and a `createStore`/`createProjection` shape costs 17–36% more per transition
to buy per-key granularity nothing downstream can use — and the one variant that could deliver that
granularity is inapplicable to the 32 machines whose prop getters take a required argument. The test
was deleted with the decision settled: it reimplemented all six shapes inline and so guarded nothing
in `createMachineStore`, which `packages/core/src/machine-store/__tests__/` covers instead.

**Neither half is written out — both are mechanisms.** The value is
`createMachineStore(api, extra)` (`@chakra-ui-solid/core`), which enumerates the connected api once
under `untrack`, makes every data member a getter and every function member a **rest-args** delegate
(Zag has multi-argument members), and lets `extra` — the library's own additions, `unmounted` and
friends — win. The type inherits, exactly as `ark-ui`'s `use-dialog.ts` does:

```ts
export interface CreateDialogReturn extends Readonly<dialog.Api<PropTypes>> {
  readonly unmounted: boolean // only what the library adds is declared
}
```

so a member a Zag minor release adds reaches both without an edit. `Readonly` is what makes
`store.open = true` a compile error. One accepted loss: a `T["element"]` return widens to
`JSX.HTMLAttributes<any>`, since that is what our own `PropTypes["element"]` is.

Anything a part needs that is none of those four is a smell: it means the part is reaching for state
the machine already owns. The one legitimate addition is a **per-item context** for repeated parts
(§0.2), and it carries the item's identity, not behavior.

Use `createComponentContext(name)` — Solid 2.0's `createContext` already returns the Provider
directly and already throws when unmounted; the wrapper adds an error naming the component family.
It is a hope-ui carry-over that `plan.md` §5.3 does not list; §13 records that.

### 3.4 Prop forwarding and precedence

Two independent precedence orders, and they are easy to confuse.

**Order 1 — the prop bag,** resolved by the adapter's `mergeProps` (`zag-solid-adapter.md` §3.1):

```tsx
const elementProps = mergeProps(
  () => dialog.api().getContentProps(),   // 1. machine: data-*, aria-*, id, role, hidden, style, handlers
  () => presence.presenceProps(),         // 2. presence: overrides hidden + data-state
  props,                                  // 3. consumer: wins ties
)
```

- `class`, `style`, `className` and every `on*` handler **compose across sources**; everything else is
  **last-defined-wins**. That is `@zag-js/core`'s rule and the fork routes to it unchanged.
- Because handlers compose, **a machine part never calls `composeEventHandlers`.** The carry-over
  stays (`plan.md` §5.3 row 6) for shapes C and D, which have no machine props to merge.
- Handler order is **machine first, consumer second** — Chakra's and Ark's order. Zag's own handlers
  open with `if (event.defaultPrevented) return`, so a consumer cannot cancel one by calling
  `preventDefault()` in their own. That is a real ergonomic loss against hope-ui's convention, and it
  is the port target's behavior.
- **On a part, a consumer `id` wins over the machine's**, because `id` is last-wins. Ark ships this;
  so do we. It is a hazard: the machine resolves both the emitted attribute and its own
  `getElementById` lookup through the same function (`dialog.dom.ts`), so overriding the attribute
  alone desynchronizes them. **The supported route is `ids` on the Root** — proven to work, and the
  retraction of the claim that it could not is `prior-art.md` §8.1. Document it on every Root; do not
  strip `id` from parts (hope-ui did; Chakra does not).
- **On a Root, `id` never reaches the element at all — it seeds the machine.** This bullet read as one
  rule for both until Collapsible was ported, and Dialog could not have caught it: Ark's `DialogRoot`
  renders nothing, so every prop it takes is the machine's by default and the two cases look like one.
  A Root that *does* render an element splits them, and **40 of the 42 Ark roots that render one put
  `id` in the machine's half** (`splitCollapsibleProps`, `AccordionRoot`'s inline list, …; the two
  that do not are `swap` and `toggle`, which have no `id` to split). The root's own attribute becomes
  `collapsible:{id}`, and `ids` is again the way to name the elements.

  So a Root's props interface **omits the element's `id`** — `Omit<HTMLChakraProps<"div">, "id">` —
  which also changes its type from `string | false | undefined` to `string`. `RootProvider` is the
  other way round: it starts no machine, so its `id` is the element's and stays on `HTMLChakraProps`.

**Order 2 — the computed `class`,** resolved by `renderStyled` (`prior-art.md` §2.5), low → high:

```
recipeClass  →  style props + the `css` prop  →  the consumer's `class`
```

with the consumer's `class` appended last so it wins ties. **Inline `style` is forwarded untouched and
always beats a class** — which is what makes §5's route 3 work.

### 3.5 The `as` and `render` props

Polymorphism is `as` or `render`, never `asChild` (`CLAUDE.md`, *Reference use*). The two are one
mechanism with two spellings, and `renderElement` is where they meet: `as` names the element,
`render` is a **function** receiving the computed props and returning it. Never a JSX element,
because a Solid JSX element is an already-constructed DOM node by the time it reaches us and Solid
has no `cloneElement`, so accepting one could only mean dropping every computed prop. **That is what
`asChild` is rejected for — the JSX child, not the idea. `as` is not rejected at all.**

```tsx
<Dialog.CloseTrigger render={(props) => <Button {...props}>Close</Button>} />
<Dialog.CloseTrigger as="a" />
```

**Both, on every part, because the React version has both on every part.** Its parts are
`chakra(ArkPart, …, { forwardAsChild: true })`, and its factory turns `as` on such a part into
`asChild` with a synthesized child (`factory.tsx:254`):

```jsx
<FinalTag asChild {...finalProps}><props.as>{finalProps.children}</props.as></FinalTag>
```

— the machine's computed props rendered onto the consumer's element, which is exactly what
`<Dynamic component={as} {...props} />` does here. Dropping `as` would be removing behavior Chakra
has, and it fails silently twice over: `tsc` accepts the prop either way, because `as` reaches every
part through `ChakraStylingProps`, and the generated props table then advertises it on a page where
it does nothing.

**So a part's element is a fallback, never a literal:**

```tsx
as: (props.as ?? "button") as ValidComponent,
```

`??`, never `merge` and never a bare literal — a wrapper forwarding an unset `as` resolves by
presence and would hand the part `undefined`, which `<Dynamic>` renders as nothing at all
(`CLAUDE.md`, *The third hazard*). Each part owes the `<X as={undefined} />` test alongside the one
that names an element.

`render` wins when a part is given both: `renderElement` returns on `render` before it reads `as`,
and the factory behaves the same way.

`renderElement` owns both; `renderStyled` passes them through. Every part accepts both.

**Collapsible shipped without `as` and is where this was found** — its four parts hardcoded their
element, stamped from the ten call sites in §11 below, which had it wrong before this section did.
Nothing mechanical catches it; what does is that the four `as`/`render` tests in
`collapsible.browser.test.tsx` are part of the stamp and travel with it.

### 3.6 Ref handling

`renderElement` merges the component's internal ref and the consumer's `ref` into **one function ref**,
by calling `applyRef([internalRef, consumerRef], element)` inside a single callback — and it reads the
consumer's ref *inside* that callback, so the read lands in the render target's own ref effect rather
than in the component body. No part hand-rolls a `mergeRefs`, and there is no `mergeRefs` utility in
this repo.

Merging to one function rather than handing the raw array to the render target is load-bearing: only
host elements flatten a ref array, and a `render` target that is a *component* reading `props.ref`
itself usually honours function refs only.

The only internal ref in a machine component is presence's `setNode` (§7). Everything else the machine
needs, it finds by id.

### 3.7 `data-*` state attributes

**We write none.** Every state attribute a recipe styles against — `data-state`, `data-disabled`,
`data-highlighted`, `data-selected`, `data-invalid`, `data-placeholder-shown` — comes from the
machine's `connect()`, and Panda's conditions (`_open`, `_closed`, `_checked`, `_highlighted`, …) are
written against exactly those. That the two vocabularies line up is the structural advantage of
consuming the official preset (`plan.md` §1.5 in the plan; `prior-art.md` §4.3 spot-checks it at 6 of
56 slot recipes, all matching).

**It is an assumption, not a result** — assumption 9, the one `plan.md` §11.1 calls *"the single
cheapest check with the largest downside if skipped,"* verified at implementation step 4 by diffing
the preset's `data-*` selectors against the machines' emitted attributes. If it fails, every affected
slot recipe needs a translation getter per part, which is a per-component tax this blueprint does not
currently price. **Do not add a translation getter speculatively**: an unnecessary one is invisible.

The one known non-match from the spot check is still not a mismatch, but **not for the reason this
line gave until the `tabs` ship**: Panda's `_active` is `&:is(:active, [data-active])`, so it does
select a `data-active` the tabs machine never emits. What makes it harmless is where the recipe puts
it — nested inside `_disabled`, and a disabled `<button>` never enters `:active` either. The rule is
dead CSS upstream, so there is nothing to translate.

`data-slot` — hope-ui's own convention — appears in **zero** Chakra files and is not carried
(`prior-art.md` §3.3 seam 2).

---

## 4. `renderStyled` and the `recipeClass` seam

**This is the part with no worked precedent anywhere.** `renderStyled` is hope-ui's 104-line styling
factory, and its `recipeClass?: Accessor<string | undefined>` seam is **unused at `e9c2f81`** — its own
JSDoc says so (`prior-art.md` §2.5). hope-ui never wired a recipe of any kind. Everything in this
section is written to be falsified at implementation step 4.

### 4.1 The four additions `renderStyled` needs

`plan.md` §2.3 names three. **P5 adds a fourth, and it is the one with a live worked failure.**

| # | Change | Why |
|---|---|---|
| 1 | `css` accepts an array; spread it into the variadic `css()` | Chakra's `css?: SystemStyleObject \| (SystemStyleObject \| undefined)[]`. One line |
| 2 | `unstyled?: boolean` gates `recipeClass` — and is omitted from the forwarded props | Chakra's *"opt out of the theme styles."* Two lines |
| 3 | Chakra's five `html*` renames — `htmlSize`, `htmlWidth`, `htmlHeight`, `htmlTranslate`, `htmlContent` | `color`/`size`/`translate`/`transition`/`width`/`height`/`content` are style props, so without the renames seven HTML attributes are unreachable on any styled element |
| **4** | ~~**`styleSource?: object`** — the object whose **keys** are scanned for style props. Defaults to `props`~~ **Not built.** `renderStyled` ships seven options and this is not among them; `forwardProp` answers the collision instead (§11's preamble) | §4.1.1 |

#### 4.1.1 Addition 4, and the failure that forces it

> **Addition 4 was never built, and the failure below is still real.** The `dialog` ship measured
> `renderStyled`'s options as `as`, `props`, `render`, `ref`, `recipeClass`, `baseStyles` and
> `forwardProp` — no `styleSource`. `forwardProp` is what answers the collision this section
> describes, and **nothing has exercised it**: no key `dialog.connect()` or `popover.connect()`
> emits is a style prop, so `editable`'s `size: 1` is still the first live case. Read the failure,
> not the mechanism.

`renderStyled` computes its style-prop key list once, as `Object.keys(props).filter(isCssProperty)`.
In hope-ui that `props` was the consumer's own props. **In a machine part it would be the merged bag —
which contains the machine's emitted DOM attributes.**

The worked failure is in the checkout today:

```bash
grep -n 'size:' __reference-impl__/zag/packages/machines/editable/src/editable.connect.ts
```

`editable`'s `getInputProps()` emits a top-level **`size: 1`** — the HTML attribute that makes the
input auto-resize. And `size` is a style prop *here* by construction: addition 3 adopts Chakra's five
`html*` renames precisely because `color`/`size`/`translate`/`transition`/`width`/`height`/`content`
are style props, so `htmlSize` exists in our surface and bare `size` means the CSS one. Fed a merged
bag, `renderStyled` would fold the machine's `size` into `css({ size: 1 })`, the attribute would never
reach the `<input>`, autoresize would silently stop working, and **the class-name assertion would
pass** — `plan.md` §0.2's hazard, arriving from a direction nobody was watching.

`dir` is the near-miss worth naming, because it would have been catastrophic rather than local: **320
sites** across the machine set emit it, and every part of every component carries one. It is safe —
`direction` is the CSS property and `dir` is not among Chakra's 95 shorthands — but "safe" here is a
fact about a generated `isCssProperty`, which is generated from *our* config (`plan.md` §2.1). Adding
a `dir` alias under §2.2's aliasing rule would break the entire library silently. The rule below is
what makes that unconstructable rather than merely unlikely.

**Chakra does not have this bug, structurally rather than deliberately.** Its layering is
`chakra(ArkDialog.Content)` — the styled factory wraps the Ark component, so the factory only ever
sees the *consumer's* props and Ark applies the machine's props underneath it. Our layering is flat:
one part component does both jobs. So what Chakra gets from nesting, we have to say out loud.

**The rule: a part passes `styleSource: props` — its own props — and `props: elementProps` — the merged
bag.** Style props are a consumer-facing API; machine props are DOM attributes; they are never read
from the same object.

```tsx
renderStyled({
  as: (props.as ?? "div") as ValidComponent,
  props: elementProps,   // machine ∪ presence ∪ consumer — forwarded to the element
  styleSource: props,    // the consumer's own props — the ONLY source of style-prop keys
  ...
})
```

**Checkable, not merely stated:** a lint rule asserting that any `renderStyled` call whose `props` is a
`mergeProps(...)` result also passes `styleSource`. That is a two-node AST match, and it is the only
mechanical guard — the generated-CSS coverage check cannot see this failure, because the class it
emits does exist.

### 4.2 Slot-recipe consumption: resolve once on the Root

`plan.md` §3.6 fixes the path. Chakra resolves recipes through a runtime system object; we have none,
so the recipe is a **static import** from the generated artifacts:

```
@chakra-ui-solid/styled-system/recipes   generated: one exported function per recipe
        ↓ static import
Root                                     resolves the variants once → Record<slot, string>
        ↓ context
a part                                   renderStyled({ recipeClass: () => ctx.slots().content })
```

The variant **API** is Chakra's — same variant names, same `defaultVariants`, same `unstyled` opt-out.
Only the resolution differs, and that is the `plan.md` §0.4 row.

Two properties the Root's resolution must have:

- **Reactive.** `size` can change; the slot classes are a memo over the variant props.
- **Resolved once per Root, not per part.** N parts × one `sva()` call each is N× the work for one
  answer, and it puts N copies of the variant-reading logic in the tree.

The `@chakra-ui-solid/core` helper (`plan.md` §5.3 row 3, *build*):

```ts
export function createSlotClasses<Slot extends string, Variants>(
  recipe: SlotRecipeFn<Slot, Variants>,
  options: {
    variantProps: Accessor<Variants>
    /** Root-level opt-out. A part may also opt out for itself — see renderStyled addition 2. */
    unstyled?: Accessor<boolean | undefined>
  },
): Accessor<Record<Slot, string>>
```

### 4.3 What we depend on in the generated surface, and what we do not

Panda is installed in no checkout here (`plan.md` §13), so the generated slot-recipe function's exact
members are **read from Panda's documentation, not from an artifact**. This blueprint depends on
exactly two:

| Member | Used by | If absent |
|---|---|---|
| `recipe(variantProps) → Record<Slot, string>` | every Root | The design fails; there is no fallback and step 4 is where we find out |
| `recipe.splitVariantProps(props)` | **not by Dialog** — see below | Cheap to work around |

Dialog's Root **renders no host element**, forwards no rest bag, and therefore never needs
`splitVariantProps`: it reads its four variant props by name, typed. `splitVariantProps` becomes
load-bearing only where a recipe-bearing component *also* renders an element — which is every atomic
recipe in Workstream B (`plan.md` §10) and any part that carries the variants itself. Recorded as
assumption **P5-B** (§12) rather than assumed.

We depend on **no** `classNameMap`. Chakra needs one because Emotion serializes at runtime and the
stable per-slot class has to come from somewhere; Panda's `sva()` returns the stable class as part of
the string it already gives us.

### 4.4 `unstyled`, at two levels

Chakra supports it on the Root (kills every slot) and on each part (kills that slot). Only the Root
costs a line:

- Root: `createSlotClasses(..., { unstyled: () => merged.unstyled })` returns empty strings.
- Part: **nothing.** This said `recipeClass: () => (props.unstyled ? undefined : ctx.slots().content)`
  until Collapsible's four parts were written against it, and the ternary is dead code: `renderStyled`
  reads `props.unstyled` itself and suppresses both `recipeClass` and `baseStyles` when it is true
  (addition 2, which also keeps the prop off the element). A part passes `recipeClass` unconditionally
  and hands `unstyled` straight through in its props bag.

### 4.5 The seam has no precedent — so the first component is a probe

Before Dialog is written at implementation step 5, **step 4 exists to falsify §4.2 in isolation**: one
real slot-recipe component, styled in a throwaway consumer project wired per `plan.md` §4.1, whose own
source never names the variant (`plan.md` §1.5). If per-recipe `staticCss` does not survive
`theme.extend`'s merge, the fallback ladder costs a config line, not a redesign. **Do not write Dialog
before step 4 reports.**

---

## 5. Where inline `style` and CSS custom properties are legal

### 5.1 The three routes, at part level

`plan.md` §3.5's contract, restated as a decision a part author makes:

| The value is… | Route | What you write |
|---|---|---|
| a literal or token, known at author time | **1** | a style prop or a recipe base — `p="6"`, `bg="bg.panel"` |
| from a **finite set** the component's own logic picks | **2** | a recipe **variant** — and for recipe variants this is *automatic*: the preset declares `staticCss` per recipe (`plan.md` §1.2), so no component author declares anything. It stays manual only for **atomic** values a component picks, like `Flex`'s `inline` prop toggling `display: inline-flex` |
| genuinely unbounded — a pixel offset, a measured height, a consumer-supplied number | **3** | a **CSS custom property** through inline `style`, consumed by a static class: `style={{ "--dialog-margin": value }}`, with the recipe reading `var(--dialog-margin)` |

### 5.2 What the machine emits as inline `style`, and why it is legal

Zag's `normalizeProps` emits `style` objects, and 128 sites across the machine set do. Dialog's are:

```ts
getPositionerProps() → style: { pointerEvents: !open || !modal ? "none" : undefined }
getContentProps()    → style: { pointerEvents: modal ? undefined : "auto" }
```

Both are route 3 by construction — a DOM attribute, not a stylesheet — and `plan.md` §0.3 lists inline
`style` as explicitly allowed. **Forward it untouched. Never translate a machine's `style` into a
class.** Doing so would be a second source of truth for a value the machine owns, and it would lose
the ordering guarantee (§3.4 order 2) that an inline `style` beats any class.

### 5.3 The recipe's own custom properties are route 3, done by the recipe

Dialog's slot recipe writes `--dialog-z-index`, `--dialog-margin` and `--dialog-base-margin`, and its
`size: cover|full` variants set `--dialog-margin: 0`. That is the same mechanism, authored upstream —
and it is what makes `plan.md` §3.7's override path 1 (a CSS custom property on any element) work with
no build participation at all — the cheapest override, reachable from a consumer's runtime.

### 5.4 Making the rule checkable, because route 3 used as route 1 fails silently

Three mechanisms, in order of how early they fire:

1. **A lint rule.** A style-prop value that is not a literal, a token reference, or a `var(--…)` string
   is an error. This is the loud half of `plan.md` §3.5's *"needs a lint rule."*
2. **The generated-CSS coverage check** (`plan.md` §0.2): CI proves every recipe/slot-recipe variant a
   component can emit exists in the generated stylesheet. It catches the atomic case a component picks
   and nobody declared.
3. **Computed-style assertions** in browser tests (`plan.md` §0.2): a class name proves nothing under
   Panda, so every visual assertion reads `getComputedStyle`.

None of the three catches a consumer's wrapper forwarding an arbitrary style prop — `plan.md` §7
concern 2's case. That is a documentation problem, and the dynamic-value contract is the loudest page
in the docs, not a footnote in theming.

---

## 6. The `hidden`-vs-`display` rule

### 6.1 Both worked failures, so the mechanism is not re-derived

Zag emits `hidden` on parts it considers closed. `[hidden] { display: none }` is a **UA** rule, which
any explicit `display` beats — and a slot recipe sets `display` on most slots. hope-ui hit it twice, on
two machines, one component apart (`prior-art.md` §5.1):

- **The dialog backdrop.** Every hope dialog slot set a `display`, so a closed dialog left a
  full-viewport layer over the page.
- **The listbox check glyph.** `getItemIndicatorProps()` returns `hidden: !selected`; the
  `itemIndicator` slot was `absolute right-2 flex`, so the glyph was permanently visible on every row.

hope-ui's fix in both cases was to **strip `hidden` at the merge** and gate the render on presence.

### 6.2 Chakra pays neither half, by two mechanisms that are ours to port

1. **Preflight makes `[hidden]` unbeatable.**
   `"[hidden]:where(:not([hidden='until-found']))": { display: "none !important" }` — `!important`
   wins over any recipe `display`, in any cascade layer. hope-ui's own reset carried no such rule,
   which is the entire reason its recipes beat `hidden`.
2. **Chakra unmounts rather than hides.** Six components ship
   `defaultProps: { unmountOnExit: true, lazyMount: true }` — `dialog`, `drawer`, `tooltip`, `menu`,
   `action-bar`, `floating-panel` — so a closed Dialog's content is not in the DOM at all.

### 6.3 The rule, written to survive either answer to P3-E

**P3-E is answered, at the `dialog` ship: Panda's own `preflight: true` emits Chakra's rule
verbatim** — `[hidden]:where(:not([hidden='until-found'])) { display: none !important }`, in
`@layer reset`. Our preset owes it no `globalCss` line, and point 3 below is already paid. The one
consequence left to state is a consumer's: Panda with `preflight: false` leaves a mounted-but-closed
Dialog content fully visible, because `.dialog__content` declares `display: flex` and there is then
nothing `!important` to beat it. Nothing errors.

The rule below does not depend on the answer:

> **Never strip Zag's `hidden` to work around a recipe's `display`.**
>
> 1. On a **presence-gated** part, presence supplies `hidden` itself and it overrides the machine's
>    (§7.4). Nothing to strip.
> 2. On a part with **no** presence, `hidden` is the machine's answer and it stands.
> 3. Making `[hidden]` win is a **global** concern: our preset's `globalCss` carries Chakra's rule
>    verbatim if Panda's preflight does not. One line, once, for the whole library.
> 4. **The one legitimate strip is a delegation, not a workaround** — when another owner supplies the
>    same attribute. Ark's `AccordionItemContent` drops `hidden` and `data-state` from the machine's
>    props precisely because it hands the element to `Collapsible.Content`, which supplies both. Strip
>    only when you can name the new owner.

**The one cell that can still fail**, named so it gets a test rather than a bug report: a part whose
recipe slot sets an explicit `display`, which carries `hidden`, **and** which is mounted while closed
(`unmountOnExit={false}` — an explicit consumer opt-out, since Chakra's default is `true`). For Dialog
that is exactly one part: `content` is `display: flex`, and `backdrop` sets no `display` at all so the
UA rule already suffices for it. `positioner` sets `display: flex` but carries no `hidden`.

### 6.4 The test that pins it

One browser test per presence-gated part, asserting **computed style**, in the failing configuration:

```tsx
render(() => <Dialog.Root unmountOnExit={false} lazyMount={false}>…</Dialog.Root>)
expect(getComputedStyle(content).display).toBe("none")
```

A class-name assertion cannot see this. That is `prior-art.md` §4.4's finding applied to the one place
it bites hardest.

---

## 7. Presence — a build over a machine, not a carry-over

### 7.1 The split, drawn exactly

`prior-art.md` §8.3 and `plan.md` §6 fix the line. **`createPresence` from hope-ui is not carried.**
`@zag-js/presence` is a Zag machine, consumed through **our own adapter**, exactly like `dialog` or
`listbox` — no special case, and **not Ark**: Ark is not a dependency and never will be.

| Concern | Owner |
|---|---|
| `present`, `onExitComplete`, `immediate`; `skip`/`present`/`setNode`/`unmount`; **animation-name detection and `animationend` waiting** | **`@zag-js/presence`** |
| `lazyMount`, `unmountOnExit`, `skipAnimationOnMount`, `hideMode`; the `data-state` + `hidden` prop getter; the gate that renders nothing when unmounted | **Ours** — ~30 lines of render strategy that is not in the machine. Ark invents them and Chakra's public API exposes them, so parity requires them. `hideMode` is the one we do not ship (§7.3) |

Reading Ark for the prop names and semantics is API-shape tier and owes nothing (`CLAUDE.md`, *Reference use*).
Reproducing its expression would not be.

**The plan's objection is closed and does not return.** `brief-plan` §8 assumption 11 doubted that
animation-*name*-based presence composes with Chakra's animations. Measured across all 56 slot
recipes: 9 use `animationName` and **not one** uses `transitionProperty` inside an `_open`/`_closed`
block (`prior-art.md` §8.2). Zag's presence is the correct mechanism for this preset; hope-ui's
transition-based kernel was never the right shape here. **Do not re-open it.**

### 7.2 The render strategy, in full

> **Superseded by what shipped at step 5 — read the note, not the listing.** This section was
> written before `createPresence` and `createRenderStrategy` were split, and the code below is one
> function that owns both halves. What `core` actually exports is two:
>
> - `createPresence(props: Accessor<CreatePresenceProps>): Presence` in
>   `core/src/presence/presence.ts` — `present`, `setNode`, `presenceProps`, and **no `unmounted`**.
>   `CreatePresenceProps` carries no `lazyMount` or `unmountOnExit` either.
> - `createRenderStrategy(present: Accessor<boolean>, props: Accessor<RenderStrategyProps>)` in
>   `core/src/render-strategy/render-strategy.ts`, returning `{ unmounted }`.
>
> The split is what lets family **M** — `collapsible`, `accordion` — take `present` from its own
> machine's `visible` and still get the strategy, with no `@zag-js/presence` instance in play. A
> caller composes the two, and Dialog does it twice: once on the Root for Content and Positioner,
> once inside Backdrop over the Root's strategy object. It also means the argument is an
> `Accessor`, not `MaybeAccessor`.
>
> Everything below about `wasEverPresent`, the deleted `useEvent`, the `<Show>` gate and
> `presenceProps` reading the **prop** rather than the machine shipped unchanged and is still the
> reason for each line.

```tsx
// packages/core/src/presence/presence.ts — inside `core`, so the adapter is reached relatively.
// A file in `core` importing `@chakra-ui-solid/core` is the self-reference `decisions.md` measures:
// it extracts fine and publishes `declare const …: any`.
import * as presence from "@zag-js/presence"
import { type Accessor, createMemo } from "solid-js"
import { useMachine } from "../zag/machine"
import type { MaybeAccessor } from "../zag/merge-props"
import { normalizeProps } from "../zag/normalize-props"

export interface RenderStrategyProps {
  /** Delay the first mount until the node is first present. Default `false`. */
  lazyMount?: boolean
  /** Remove the node from the DOM once its exit animation finishes. Default `false`. */
  unmountOnExit?: boolean
}

export interface CreatePresenceProps extends RenderStrategyProps {
  present?: boolean
  onExitComplete?: VoidFunction
  immediate?: boolean
  /** Suppress the enter animation on the very first present. Default `false`. */
  skipAnimationOnMount?: boolean
}

export interface PresenceApi {
  /** True while the node belongs in the DOM — stays true through the exit animation. */
  present: Accessor<boolean>
  /** True when the render strategy says the node should not be in the DOM at all. */
  unmounted: Accessor<boolean>
  /** Hand the machine its element as early as possible; it reads computed styles off it. */
  setNode: (node: Element | null) => void
  /** `hidden` + `data-state`, merged *over* the owning machine's own values. */
  presenceProps: Accessor<{ hidden: boolean; "data-state": "open" | "closed" | undefined }>
}

export function createPresence(props: MaybeAccessor<CreatePresenceProps>): PresenceApi {
  const options = () => (typeof props === "function" ? props() : props)

  const service = useMachine(presence.machine, () => ({
    present: options().present,
    onExitComplete: options().onExitComplete,
    immediate: options().immediate,
  }))

  const api = createMemo(() => presence.connect(service, normalizeProps))

  // A closure variable, not a signal. Ark spends a `useRef` here to survive a re-render; Solid
  // components run once, and `unmounted` below re-reads it only after reading `present()`, which is
  // the only edge that can flip it. Monotonic, so no read can see it stale.
  let wasEverPresent = false

  const present = createMemo(() => {
    const value = api().present
    if (value) wasEverPresent = true
    return value
  })

  const unmounted = createMemo(() =>
    present() ? false : wasEverPresent ? !!options().unmountOnExit : !!options().lazyMount,
  )

  // `service.send`, not `api().setNode`. Reading the `api()` memo here would be an untracked read
  // from a component render body — the phase Solid 2.0 labels strict-read — and `mount()` fails a
  // test on one. The machine's own NODE.SET handler is what `setNode` wraps anyway.
  const setNode = (node: Element | null) => {
    if (node) service.send({ type: "NODE.SET", node })
  }

  const presenceProps = createMemo(() => ({
    hidden: !present(),
    // `options().present` — the PROP — not `present()`, the machine's. They diverge for exactly the
    // window that matters: while closing, the prop is already false and the machine is still
    // "unmountSuspended", so `data-state="closed"` drives the exit animation on a node that is
    // still mounted. Reading the machine here would flip `data-state` only after the animation it
    // was supposed to start had finished.
    "data-state": (api().skip && options().skipAnimationOnMount
      ? undefined
      : options().present
        ? "open"
        : "closed") as "open" | "closed" | undefined,
  }))

  return { present, unmounted, setNode, presenceProps }
}
```

Three places the Solid version is simply smaller than Ark's, and each deletion is a decision:

- `wasEverPresent` is a closure variable, not a `useRef`.
- `useEvent(props.onExitComplete)` is a React stale-closure workaround — **deleted outright**, because
  Solid props are already live and the machine re-reads through the props memo.
- The presence gate is `<Show when={!presence.unmounted()}>`, not a component. Ark needs a
  `PresenceGate` component because `hideMode: "activity"` requires wrapping children in React 19's
  `<Activity>`; we ship no `hideMode`, so there is nothing to wrap.

### 7.3 `hideMode: "activity"` has no Solid equivalent

Ark's React `usePresence` accepts `hideMode: 'display-none' | 'activity'`; `'activity'` renders
children inside React 19's `<Activity mode="hidden">`, which keeps the subtree mounted with its
effects **paused**. Solid has no equivalent, and Ark's own **Solid** package does not ship the prop
either. **We ship `"display-none"` only.** That is a `plan.md` §0.4 row with cause `React→Solid`, not a
gap to paper over and not a thing to emulate with a `<Show>`.

### 7.4 `hidden` and `data-state` come from presence, overriding the machine

This is the mechanism §6 depends on, and it looks wrong until you read the window it covers:

| Phase | machine `getContentProps()` | presence `presenceProps` | on the element |
|---|---|---|---|
| open | `hidden: false`, `data-state: "open"` | `hidden: false`, `data-state: "open"` | agree |
| closing (mid exit animation) | `hidden: true` — **already** | `hidden: false` — **still** | presence wins; the node stays visible while it animates out |
| closed, mounted | `hidden: true` | `hidden: true` | agree |
| closed, unmounted | — | — | `<Show>` renders nothing |

Presence is the **second** merge source for exactly this reason (§3.4 order 1).

### 7.5 Where a presence is created

**One per independently-mounted subtree**, not one per Root and not one per part:

- **Content and Positioner share one**, created on the Root and read from context. Content mounts
  lazily; a presence created *inside* Content would see `present` already true on its first run and
  latch straight to "entered", skipping the enter animation.
- **Backdrop owns its own**, created in the Backdrop, because it mounts independently of Content and
  animates on its own curve (`fade-in`/`fade-out` against Content's `scale-in, fade-in`).

That is the split Ark makes on both of its packages, and hope-ui reached it independently
(`zag-dialog-root.tsx`'s JSDoc). Both presences read the same `renderStrategy` off context, so
`unmountOnExit` on the Root reaches both.

**Cost, stated:** each presence is a machine instance. A Dialog runs three — dialog, content presence,
backdrop presence. `plan.md` §5.2's package table gains `@zag-js/presence` on `core`; the per-graph
bundle toll gets re-measured at milestone 5 (`zag-solid-adapter.md` §9.2).

---

## 8. Retained primitives: none. The column is deleted.

`plan.md`'s ancestor reserved *"drop by default, **adopt by exception**"* for the rest of hope-ui's
internal primitives, and §7 concern 3 built a **per-component column** in the roadmap to record each
exception.

**The port rule removed the exception mechanism** (`prior-art.md` §10.1 row D). There is no exception
to record, so:

- **`roadmap.md` does not carry a retained-primitive column.** P6 does not build it.
- `createHideOutside` and `createFocusRestore` are struck outright: `inert` appears **zero times** in
  both `chakra-ui/packages/react/src/` and `ark-ui/packages/react/src/`, and Ark adds no focus
  handling at all, so Chakra's open modal leaves the background keyboard-reachable and a non-modal
  Chakra dialog does not restore focus on Escape either. Copying either would make us more accessible
  than the library we are porting.
- `createPresence` is **replaced by a build**, not dropped (§7).
- `createRegisteredId` is **available, not a pattern**. It is 12 lines of `onSettled` deferral around
  Solid 2.0's `[REACTIVE_WRITE_IN_OWNED_SCOPE]`, and it has **no call site in a 1:1 port** — Zag
  derives ids from a scope and Ark never registers upward (§10.3). Do not build anything on it.
- Everything else in `primitives/internal/*` is dropped with no exceptions — which is also what
  removes the repo's only planned Apache-2.0 obligation (`prior-art.md` §9.2).

**Net:** the retained kernel is 12 lines, and they are a Solid 2.0 write-deferral mechanism rather
than accessibility. The behavior kernel is Zag's, entirely.

---

## 9. The a11y baseline, stated so a correct port cannot read as a regression

### 9.1 What a faithful Dialog port scores, and why

The gap is real and it is Chakra's. `@zag-js/aria-hidden`'s published entry exports one function,
`ariaHidden`, which calls `hideOthers` unconditionally; `dialog.machine.ts:201` calls it with no prop,
option or alternative to redirect it; and the package's `exports` map is `"." → dist/index` only, so
the `inertOthers`/`suppressOthers` pair that exists in the **source** at 1.43.0 is unreachable by a
consumer even with a deep import (`prior-art.md` §7; `zag-solid-adapter.md` §8.2).

So background content behind an open modal gets `aria-hidden` and **stays in the tab order**. axe
flags `aria-hidden-focus` on every open modal — in Chakra v3 exactly as in ours.

**Measured at the `dialog` ship, and the severity class was predicted wrong: axe returns
`aria-hidden-focus` as `incomplete`, not as a violation**, on the trigger, with *"check that
focusable elements are not tabbable in the current state"*. It is a rule axe ran and declined to
decide, which is the category `expectNoA11yViolations` already has a channel for. So the whole cost
is one `allowIncomplete: ["aria-hidden-focus"]` entry on open-state calls, and **the helper needs no
allowance channel for violations** — the thing this section's prediction would otherwise have
forced.

**Every axe assertion taken while the Dialog is open needs an `aria-hidden-focus` allowance. That is
the baseline, not a defect.** Each allowance cites the upstream filing `zag-solid-adapter.md` §8.2
records — one Zag issue, pointing `ariaHidden` at the `suppressOthers` that already exists and already
does the feature-detected dispatch. It is the only route to closing the gap, and it closes it for
React, Vue, Svelte, Preact, vanilla **and Chakra** at once, which is precisely why our layer is the
wrong place.

### 9.2 What is **not** an allowance — and this changes the expected count

`prior-art.md` §7 records ZagDialog's measurement as **six** axe assertions with an allowance on all
six: `aria-valid-attr-value` on the three closed-state calls, `aria-hidden-focus` on the three
open-state ones. The task brief carries that number forward.

**The three closed-state allowances do not transfer to a Chakra-faithful port**, for three independent
reasons — and the point of listing all three is that no single one of them is load-bearing:

1. **The `aria-controls` override is Ark's, and we port it** (§1.2). With the content unmounted, the
   closed trigger emits no `aria-controls`, so there is no IDREF to dangle.
2. **Chakra's Dialog defaults `lazyMount: true` and `unmountOnExit: true`**, so the closed state *is*
   the unmounted state unless a consumer opts out. hope-ui's ZagDialog set neither.
3. **The other route to `aria-valid-attr-value` is already closed.** A1 — Zag emitting real booleans
   and `@solidjs/web` writing `true` as `aria-modal=""` — is fixed in the fork's
   `normalize-props.ts`, which stringifies boolean `aria-*` in both directions
   (`zag-solid-adapter.md` §4.1). It was already fixed when ZagDialog was measured (`c6c86e2`
   precedes `c102292`), so it is not among the six either; it is listed here because a re-sync that
   dropped the fix would put `aria-valid-attr-value` back on the **open**-state calls, which is a
   different failure that would look like this one.

**Expected baseline for our Dialog: `aria-hidden-focus` on open-state assertions only. Closed-state
assertions run clean.** **Measured at step 5, and both halves hold** — a closed Dialog returns zero
violations and zero incompletes, and an open one returns zero violations plus that single
incomplete. What must not happen is the first `aria-hidden-focus` failure getting "fixed" by
re-introducing the kernel.

**One thing no prediction covered, and it is the reason an axe assertion on this family flakes.**
While the enter animation runs, the surface is part-way through `fade-in` — at ~0.03 opacity axe
computes a real, *failing* `color-contrast` ratio against it and reports a **violation**, which
disappears once the animation settles and reappears on the next run. An axe call on a part that
animates in must wait for the animation to finish (`await vi.waitFor(() =>
expect(getComputedStyle(content).opacity).toBe("1"))`), not for a fixed number of frames. Every
presence-family component inherits this.

### 9.3 How the definition of done has to say it

P7 owns the wording; the shape this blueprint requires is:

- Every mounting test runs axe. **Non-negotiable, unchanged.**
- Allowances are **enumerated per component and per rule**, never a global flag, and each names
  **where the gap is argued in our own documents** — not an upstream issue number. *(This bullet said
  "the upstream issue number." **D-110** replaced the requirement in `testing.md` §4.2 and
  `definition-of-done.md` §5 and this restatement was missed by that sweep; corrected at S4.)*
- An allowance that stops being needed is a **failure** — a rule that is allowed but no longer
  violated means the upstream fix landed, and the allowance has to go.
- `plan.md`'s ancestor promised *"axe on every mounting test with zero allowances."* **Not achievable,
  and it should not be** (`prior-art.md` §10.1 row F). A faithful port carries inherited allowances by
  construction.

`prior-art.md` §7's other finding stands and bounds the damage: **it does not generalise.** The
a11y cost belongs to the **modality stack** — ZagListbox's full-anatomy axe assertions came back with
zero allowances, and the listbox closure pulls no `@zag-js/aria-hidden` at all.

---

## 10. SSR and hydration

**Mark what is inferred.** `prior-art.md` §0.2 is explicit that the two hope-ui branches never
coexisted: no Zag machine has ever rendered through a Panda recipe in this lineage, let alone through
Chakra's preset. Everything below about the *machine* half is observed on hope-ui's ZagDialog; the
*recipe* half is inferred from `renderStyled` being pure render-time computation. Each subsection says
which.

### 10.1 `_hk` — Solid matches server and client nodes by position

**Observed.** Solid stamps a positional key on server-rendered nodes and matches against it on
hydrate, so **anything that changes how many nodes a subtree allocates, changes every key after it.**
Three consequences for a part component:

1. **A Root renders no host element.** Dialog's Root is providers only — exactly like Chakra's
   `DialogRoot`, which is `withRootProvider(ArkDialog.Root)` over a component that renders nothing. A
   Root that wrapped its children in a `<div>` would shift the Trigger's key relative to a consumer's
   own markup.
2. **The `<Show>` gates on presence-gated parts are inside a Portal-guarded subtree**, which never
   renders server-side, so they consume no server key.
3. **`recipeClass` is a class-string computation, not a node.** It cannot move a key. That is why
   `renderStyled` being *pure render-time computation — no DOM, no effects, no generated ids* matters
   beyond tidiness (`prior-art.md` §2.5), and why `hash: false` stays (`plan.md` §3.1): a hashed name
   still hydrates, but a coverage failure becomes a hex string.

### 10.2 The `children()` decision procedure

**Observed, with isolated SSR→hydrate round-trips.** A consumer's component-valued *prop*
(`startDecorator={<Icon/>}`) compiles to a getter that runs `createComponent(Icon)` on **every** read.

> **Resolve once with Solid's `children()` and read the accessor iff the component-valued prop is read
> more than once in a render.** A slot read exactly once — inside a `<Show>` or not — needs neither.

What does **not** need it, each established by round-trip rather than reasoning: a single read, even
inside a `<Show>`; a double read confined to the body (`{x != null ? x : null}`); and a static,
directly-written child (`<Dialog.Content><Icon/></Dialog.Content>`), which compiles to a value created
once rather than a getter.

Two axes, and the second one closed upstream but did not remove the first:

- **Single creation** — reading a prop N times builds it N times and discards N−1. Always applies.
- **Hydration** — `<Show when={x != null}>…{x}…</Show>` used to key differently on server and client
  because the discarded `when`-gate build still allocated a key. **Fixed upstream in `2.0.0-beta.32`**,
  the version we pin. That does not make existing `children()` calls removable: `children()` is not
  key-neutral even now — it resolves in the ambient owner and therefore allocates *ahead* of the
  surrounding element — so removing one moves `_hk` for that subtree and owes a real round-trip, not a
  green typecheck.

**Dialog's own case: no part needs it.** Every part reads `children` exactly once — through the merged
bag, which forwards it as a single lazy key — and no part branches on a component-valued prop. That is
not luck; it is what §11.7 buys by *not* carrying hope-ui's auto-`CloseTrigger`, which read `children`
a second time inside a fragment. A part that later gains a themeable slot (an `Icon` default, a
`loadingText`) re-enters this procedure and probably needs `children()` on the single-creation axis.

### 10.3 Portal-guarded cross-scope writes — and why a 1:1 port makes none

**Observed.** Solid 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes to a signal
owned by an ancestor scope from its own synchronous render body. hope-ui's Dialog hit it: `Title` and
`Description` registered their ids into Root's context for `Content`'s `aria-labelledby`. The fix is
`onSettled` deferral, packaged as `createRegisteredId`.

**A Zag-backed port has no such write.** The machine hands out a fixed `dialog:<id>:title` and decides
whether to *use* it by querying the DOM one frame after open:

```ts
checkRenderedElements({ context, scope }) {
  raf(() => context.set("rendered", { title: !!dom.getTitleEl(scope), description: !!dom.getDescriptionEl(scope) }))
}
```

DOM-sniffed, not registered. `Title` registers nothing. That is why `createRegisteredId` is available
and not a pattern (§8), and why building one on it would be a divergence from Chakra rather than a
convenience.

**The caveat to carry forward**, because the next component may not be so lucky: hope-ui's deferral was
safe *because* the writing components only ever rendered inside a Portal-guarded subtree that never
renders server-side, so there was no server-rendered value for a later client-only write to disagree
with. A cross-scope write **outside** a Portal-guarded subtree needs that reasoning re-checked, not
inherited.

### 10.4 Two hazards a machine component inherits from the compiler

**Observed, and neither is visible to any Vitest project here.**

1. **A `Portal` must never render during SSR.** `@solidjs/web`'s `Portal` throws server-side rather
   than degrading. Guard with a plain `if (isServer)`, not a `<Show>` — `isServer` is a fixed
   per-environment constant, so there is no reactive branch to build.
2. **A static child plus a dynamic sibling inside an element with a restrictive HTML content model
   (`<select>`, `<table>`) crashes the non-hydratable compile**, and only Storybook can see it:
   `babel-preset-solid` omits closing tags unless `hydratable: true`, the parser reparents the
   placeholder comments, and the generated walk throws on a `null`. Fix: make the restricted element's
   children a **single** dynamic expression. It reaches every machine component with a hidden native
   `<select>` — `select`, `combobox`, `listbox` — not Dialog, but it belongs in the blueprint because
   the component author has no other warning. This is `prior-art.md` §8.1's fourth rule in mechanical
   form: **a story is a deliverable; open it.**

### 10.5 What is inferred, and where it gets checked

| Claim | Basis | Checked at |
|---|---|---|
| `renderStyled`'s class getter cannot move `_hk` | Inferred — it is pure computation, but it has never run beside a Zag machine | **Step 5**, Dialog's SSR→hydrate round-trip fixture |
| A slot recipe resolved on the Root produces identical class strings on server and client | Inferred — `hash: false` plus a pure `sva()` | **Step 4**, the throwaway consumer |
| The machine's server-rendered part ids match the client's | Observed on ZagDialog: `createUniqueId()` survives the round-trip | re-confirmed at **step 5** |
| Presence's initial state is "unmounted" server-side under `lazyMount` | Inferred from `presence.machine.ts`'s `initialState({ prop }) { return prop("present") ? "mounted" : "unmounted" }` | **Step 5** |

---

## 11. Dialog, worked fully through

> **Three things every listing below gets wrong, corrected at the `dialog` ship. Read them before
> copying any part component out of this section.**
>
> 1. **`renderStyled` has no `styleSource` option.** Every part here passes one. Its seven options
>    are `as`, `props`, `render`, `ref`, `recipeClass`, `baseStyles` and `forwardProp`; §4.1.1's
>    addition 4 was not built that way. The collision it guards against is real but is answered by
>    `forwardProp`, and Dialog needs no override on any part — no key `dialog.connect()` emits is a
>    style prop.
> 2. **The context is the machine, not `ctx.api()` / `ctx.contentPresence`.** What ships is a store
>    of reactive getters (`ctx.getTriggerProps()`, `ctx.open`) plus `presence`, `unmounted`,
>    `renderStrategy` and `slots`.
> 3. **§11.12's `Portal` is not ported** — see §0.3.

Against the adapter's public surface as `zag-solid-adapter.md` §3.1 states it — `useMachine`,
`normalizeProps`, `mergeProps` and `PropTypes`, the four exports — **and nothing else.**
`MaybeAccessor` is **not** among them: §3.1 says it "ships alongside `mergeProps` as its parameter
type", and that is all it does — it reaches `dist/index.d.ts` as a local type in `mergeProps`'s
signature, never as an export. Upstream's barrel is a named `export { mergeProps }` too. Measured
against the built package, a part component that writes `import { type MaybeAccessor }` gets

```
error TS2459: Module '"@chakra-ui-solid/core"' declares 'MaybeAccessor' locally, but it is not exported.
```

`createPresence` takes it as a parameter type, but `createPresence` lives *in* `core` and reaches it
relatively (§7.2). Nothing outside `core` needs the name.

### 11.1 File layout

```
packages/chakra-ui-solid/src/components/dialog/
├── index.ts                     export * as Dialog from "./namespace"; public types
├── namespace.ts                 the dotted surface — Chakra's namespace.ts, name for name
├── dialog.types.ts              public prop interfaces
├── dialog-context.ts            the context value (§3.3)
├── dialog-root.tsx              shape: provider-only
├── dialog-trigger.tsx           shape A + the §1.2 aria-controls line
├── dialog-backdrop.tsx          shape B, owns its own presence
├── dialog-positioner.tsx        shape A, gated on the shared presence
├── dialog-content.tsx           shape B, shares the Root's presence
├── dialog-title.tsx             shape A
├── dialog-description.tsx       shape A
├── dialog-close-trigger.tsx     shape A
├── dialog-action-trigger.tsx    shape D
├── dialog-slots.tsx             shape C ×3 — Header, Body, Footer
└── __tests__/                   unit · ssr · browser (`brief-plan` §2.8's three projects)
```

`Portal` is **not** here — it is `packages/chakra-ui-solid/src/components/portal/` (§0.3, §11.12).

### 11.2 `dialog-context.ts`

```tsx
import {
  createComponentContext, type PresenceApi, type PropTypes, type RenderStrategyProps,
} from "@chakra-ui-solid/core"
import type { Api } from "@zag-js/dialog"
import type { Accessor } from "solid-js"

export type DialogSlot =
  | "trigger" | "backdrop" | "positioner" | "content"
  | "title" | "description" | "closeTrigger" | "header" | "body" | "footer"

/**
 * Composition, not inheritance: this HOLDS the connected machine rather than spreading it, so the
 * styling layer never masquerades as the behavior layer.
 */
export interface DialogContextValue {
  /** The connected machine API, recomputed on every transition. Parts call `ctx.api().getXProps()`. */
  api: Accessor<Api<PropTypes>>
  /** One class string per slot, resolved once on Root (§4.2). */
  slots: Accessor<Record<DialogSlot, string>>
  /** Shared by Content and Positioner. Backdrop owns its own — see §7.5. */
  contentPresence: PresenceApi
  /** Read by Backdrop, which builds its own presence with the Root's strategy. */
  renderStrategy: RenderStrategyProps
}

export const [DialogContext, useDialogContext] =
  createComponentContext<DialogContextValue>("Dialog")
```

### 11.3 `dialog-root.tsx`

```tsx
import * as dialog from "@zag-js/dialog"
import {
  createPresence, createSlotClasses, normalizeProps, type RenderStrategyProps,
  useEnvironmentContext, useLocaleContext, useMachine, withDefaults,
} from "@chakra-ui-solid/core"
import { dialogSlotRecipe } from "@chakra-ui-solid/styled-system/recipes"
import { type Component, createMemo, createUniqueId } from "solid-js"
import { DialogContext } from "./dialog-context"
import type { DialogRootProps } from "./dialog.types"

/**
 * Starts the `@zag-js/dialog` machine, resolves the slot recipe once, creates the shared
 * Content/Positioner presence, and shares all of it on context.
 *
 * Renders **no host element** — Chakra's `DialogRoot` is `withRootProvider(ArkDialog.Root)` over a
 * component that renders nothing, and Solid matches server and client nodes by position (its "_hk"
 * key), so a wrapper element here would shift every key after it in the consumer's own markup.
 */
export const DialogRoot: Component<DialogRootProps> = (props) => {
  // Chakra's defaults, verbatim: dialog.tsx ships { unmountOnExit: true, lazyMount: true }.
  // The four VARIANT defaults are deliberately absent — the recipe's own `defaultVariants` applies
  // them, so restating them here would be a second source of truth that drifts on a preset bump.
  const merged = withDefaults(props, {
    unmountOnExit: true,
    lazyMount: true,
    skipAnimationOnMount: false,
  })

  const locale = useLocaleContext()
  const environment = useEnvironmentContext()

  // Every part id is `dialog:${scope.id}:<part>` (dialog.dom.ts), and it has to survive the
  // SSR -> hydrate round-trip, so it comes from Solid's own id allocator rather than a counter.
  // `id` stays a public prop because Ark exposes it and Chakra inherits that.
  const scopeId = createUniqueId()

  // Bare `useMachine` — no `untrack`. The fork's `seedFromProps` absorbs the one-time seed reads;
  // a [STRICT_READ_UNTRACKED] here means a real bug in this body or in the machine's `watch`
  // (§2.2), and wrapping it would hide exactly that.
  const service = useMachine(dialog.machine, () => ({
    id: merged.id ?? scopeId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    ids: merged.ids,
    open: merged.open,
    defaultOpen: merged.defaultOpen,
    onOpenChange: merged.onOpenChange,
    modal: merged.modal,
    role: merged.role,
    trapFocus: merged.trapFocus,
    preventScroll: merged.preventScroll,
    restoreFocus: merged.restoreFocus,
    closeOnEscape: merged.closeOnEscape,
    closeOnInteractOutside: merged.closeOnInteractOutside,
    initialFocusEl: merged.initialFocusEl,
    finalFocusEl: merged.finalFocusEl,
    persistentElements: merged.persistentElements,
    triggerValue: merged.triggerValue,
    defaultTriggerValue: merged.defaultTriggerValue,
    onTriggerValueChange: merged.onTriggerValueChange,
    "aria-label": merged["aria-label"],
    onEscapeKeyDown: merged.onEscapeKeyDown,
    onFocusOutside: merged.onFocusOutside,
    onInteractOutside: merged.onInteractOutside,
    onPointerDownOutside: merged.onPointerDownOutside,
    onRequestDismiss: merged.onRequestDismiss,
  }))

  const api = createMemo(() => dialog.connect(service, normalizeProps))

  const slots = createSlotClasses(dialogSlotRecipe, {
    variantProps: () => ({
      size: merged.size,
      placement: merged.placement,
      scrollBehavior: merged.scrollBehavior,
      motionPreset: merged.motionPreset,
    }),
    unstyled: () => merged.unstyled,
  })

  // Created HERE, not in Content: Content mounts lazily, so a presence created there would see
  // `present` already true on its first run and latch straight to "entered", skipping the enter
  // animation (§7.5).
  const contentPresence = createPresence(() => ({
    present: api().open,
    lazyMount: merged.lazyMount,
    unmountOnExit: merged.unmountOnExit,
    skipAnimationOnMount: merged.skipAnimationOnMount,
    onExitComplete: merged.onExitComplete,
    immediate: merged.immediate,
  }))

  // One stable object with reactive getters, not a getter returning a fresh object: Backdrop reads
  // it to build its own presence, and a new identity on every read would re-run that build.
  const renderStrategy: RenderStrategyProps = {
    get lazyMount() {
      return merged.lazyMount
    },
    get unmountOnExit() {
      return merged.unmountOnExit
    },
  }

  return (
    <DialogContext value={{ api, slots, contentPresence, renderStrategy }}>
      {merged.children}
    </DialogContext>
  )
}
```

### 11.4 `dialog-trigger.tsx` — shape A, plus the one line §1.2 buys

```tsx
import { mergeProps, renderStyled } from "@chakra-ui-solid/core"
import type { JSX, ValidComponent } from "@solidjs/web"
import { type Component, omit } from "solid-js"
import { useDialogContext } from "./dialog-context"
import type { DialogTriggerProps } from "./dialog.types"

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>

export const DialogTrigger: Component<DialogTriggerProps> = (props) => {
  const ctx = useDialogContext()

  const elementProps = mergeProps(
    () => ctx.api().getTriggerProps({ value: props.value }),
    // ⚠ **THIS GATE DELETES NOTHING — do not copy it.** The adapter's `mergeProps` resolves a
    // non-composing key to the last *defined* value, so a later `undefined` never wins; it is the
    // same rule that keeps a consumer's forwarded `undefined` from wiping the machine's
    // `type="button"`. What ships rewrites the machine's own bag instead:
    //
    //   mergeProps(() => {
    //     const triggerProps = ctx.getTriggerProps({ value: props.value })
    //     return ctx.unmounted() ? { ...triggerProps, "aria-controls": undefined } : triggerProps
    //   }, localProps)
    //
    // Ark ships the gate on **five** triggers, not the six claimed here — `dialog`, `drawer`,
    // `floating-panel`, `menu`, `popover` — each with its own test ("should not have aria-controls
    // if lazy mounted"), so Chakra ships it too: porting it is parity, not an a11y improvement.
    // Presence-gated, not open-gated: while the content is mounted-but-closed the IDREF resolves
    // to a real element and stays.
    () => (ctx.contentPresence.unmounted() ? { "aria-controls": undefined } : {}),
    // `value` is a machine argument, not a DOM attribute — Ark splits it out for the same reason.
    // `omit` on a lazy props source stays lazy.
    () => omit(props, "value"),
  )

  return renderStyled<ButtonProps, HTMLButtonElement>({
    as: (props.as ?? "button") as ValidComponent,
    props: elementProps,
    // The CONSUMER's props, never `elementProps` — a merged bag carries machine-emitted DOM
    // attributes, and any of them colliding with a style-prop name would be swallowed into a class
    // and never reach the element (§4.1.1).
    styleSource: props,
    render: props.render,
    recipeClass: () => ctx.slots().trigger,
  })
}
```

### 11.5 `dialog-backdrop.tsx` — shape B, owning its own presence

```tsx
import { createPresence, mergeProps, renderStyled } from "@chakra-ui-solid/core"
import type { JSX, ValidComponent } from "@solidjs/web"
import { type Component, Show } from "solid-js"
import { useDialogContext } from "./dialog-context"
import type { DialogBackdropProps } from "./dialog.types"

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

/**
 * The scrim. Its own presence, not the Root's: it mounts independently of Content and animates on
 * its own curve (the recipe gives it `fade-in`/`fade-out` against Content's `scale-in, fade-in`).
 * The render strategy still comes from the Root, so `unmountOnExit` reaches both.
 *
 * Zag's `hidden` is NOT stripped. Presence's `hidden` overrides it (§7.4), and the backdrop slot
 * sets no `display`, so the UA `[hidden] { display: none }` rule already suffices for it.
 */
export const DialogBackdrop: Component<DialogBackdropProps> = (props) => {
  const ctx = useDialogContext()

  const presence = createPresence(() => ({
    present: ctx.api().open,
    lazyMount: ctx.renderStrategy.lazyMount,
    unmountOnExit: ctx.renderStrategy.unmountOnExit,
  }))

  const elementProps = mergeProps(
    () => ctx.api().getBackdropProps(),
    () => presence.presenceProps(),
    props,
  )

  return (
    <Show when={!presence.unmounted()}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (props.as ?? "div") as ValidComponent,
        props: elementProps,
        styleSource: props,
        render: props.render,
        ref: presence.setNode,
        recipeClass: () => ctx.slots().backdrop,
      })}
    </Show>
  )
}
```

### 11.6 `dialog-positioner.tsx` — shape A, gated on the shared presence

```tsx
export const DialogPositioner: Component<DialogPositionerProps> = (props) => {
  const ctx = useDialogContext()
  const elementProps = mergeProps(() => ctx.api().getPositionerProps(), props)

  return (
    <Show when={!ctx.contentPresence.unmounted()}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (props.as ?? "div") as ValidComponent,
        props: elementProps,
        styleSource: props,
        render: props.render,
        recipeClass: () => ctx.slots().positioner,
      })}
    </Show>
  )
}
```

The positioner carries **no** presence props and **no** `hidden` — the machine emits neither for this
part. Its `style: { pointerEvents }` is the machine's and is forwarded untouched (§5.2).

### 11.7 `dialog-content.tsx` — shape B, sharing the Root's presence

```tsx
import { mergeProps, renderStyled } from "@chakra-ui-solid/core"
import type { JSX, ValidComponent } from "@solidjs/web"
import { type Component, Show } from "solid-js"
import { useDialogContext } from "./dialog-context"
import type { DialogContentProps } from "./dialog.types"

/**
 * The dialog surface. Everything behavioral — `role`, `aria-modal`, the labelling IDREFs, the focus
 * trap, the dismiss layer, the scroll lock, the `aria-hidden` blanket — comes from the machine's
 * `getContentProps()` and the effects its `open` state runs. This layer is assembly plus the slot
 * class.
 *
 * The `"div"` fallback follows the DOM, not Chakra's type. Chakra types this part
 * `HTMLChakraProps<"section", …>` while the element Ark actually renders is `ark.div`; the DOM is
 * what a recipe selector, a snapshot and a screen reader all see, so the DOM wins. Same for
 * `Description`, typed `"p"` and rendered `div`. It is what the part renders when the consumer
 * names nothing — a consumer's `as` still overrides it (§3.5).
 */
export const DialogContent: Component<DialogContentProps> = (props) => {
  const ctx = useDialogContext()

  const elementProps = mergeProps(
    () => ctx.api().getContentProps(),
    () => ctx.contentPresence.presenceProps(),
    props,
  )

  return (
    <Show when={!ctx.contentPresence.unmounted()}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (props.as ?? "div") as ValidComponent,
        props: elementProps,
        styleSource: props,
        render: props.render,
        ref: ctx.contentPresence.setNode,
        recipeClass: () => ctx.slots().content,
      })}
    </Show>
  )
}
```

**No auto-`CloseTrigger`.** hope-ui's `Content` rendered one behind a `showCloseButton` prop; Chakra's
does not, and the port rule settles it. A consumer places `<Dialog.CloseTrigger>` themselves.

### 11.8 `dialog-title.tsx` and `dialog-description.tsx` — shape A at its smallest

```tsx
export const DialogTitle: Component<DialogTitleProps> = (props) => {
  const ctx = useDialogContext()
  const elementProps = mergeProps(() => ctx.api().getTitleProps(), props)

  return renderStyled<JSX.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>({
    as: (props.as ?? "h2") as ValidComponent,
    props: elementProps,
    styleSource: props,
    render: props.render,
    recipeClass: () => ctx.slots().title,
  })
}
```

`Description` is the same with a `"div"` fallback, `getDescriptionProps()`, and the `description` slot.
**Neither registers anything** — the machine sniffs the DOM for `dialog:<id>:title` one frame after
open and sets `context.rendered` from what it finds (§10.3).

### 11.9 `dialog-close-trigger.tsx` — shape A on a button

```tsx
export const DialogCloseTrigger: Component<DialogCloseTriggerProps> = (props) => {
  const ctx = useDialogContext()
  const elementProps = mergeProps(() => ctx.api().getCloseTriggerProps(), props)

  return renderStyled<ButtonProps, HTMLButtonElement>({
    as: (props.as ?? "button") as ValidComponent,
    props: elementProps,
    styleSource: props,
    render: props.render,
    recipeClass: () => ctx.slots().closeTrigger,
  })
}
```

### 11.10 `dialog-slots.tsx` — shape C, ×3

```tsx
/**
 * Header / Body / Footer have a recipe slot and no machine part: the slot recipe's `slots` array
 * carries ten names, the machine's anatomy seven (§3.1). No `mergeProps` — there is nothing from
 * the machine to merge, so the consumer's props ARE the element props and `styleSource` defaults.
 */
function createSlotPart(slot: "header" | "body" | "footer"): Component<DialogSlotPartProps> {
  return (props) => {
    const ctx = useDialogContext()
    return renderStyled<DivProps, HTMLDivElement>({
      as: (props.as ?? "div") as ValidComponent,
      props,
      render: props.render,
      recipeClass: () => ctx.slots()[slot],
    })
  }
}

export const DialogHeader = createSlotPart("header")
export const DialogBody = createSlotPart("body")
export const DialogFooter = createSlotPart("footer")
```

### 11.11 `dialog-action-trigger.tsx` — shape D, and the only `composeEventHandlers` in the family

```tsx
import { composeEventHandlers, renderStyled, withDefaults } from "@chakra-ui-solid/core"
import type { ValidComponent } from "@solidjs/web"
import { merge } from "solid-js"

/**
 * A convenience close button with no recipe slot and no machine part — Chakra renders it as a plain
 * `chakra.button` that calls `setOpen(false)`. Because there are no machine props to merge, the
 * adapter's `mergeProps` (which chains `on*` handlers for free) is not in play, so this is the one
 * part in the family that composes a handler itself.
 */
export const DialogActionTrigger: Component<DialogActionTriggerProps> = (props) => {
  const ctx = useDialogContext()

  // `withDefaults`, not `merge({ type: "button" }, props)`: `merge` resolves by presence, so a
  // wrapper forwarding `type={props.type}` unset would produce a form-SUBMITTING button (§2.5).
  const merged = withDefaults(props, { type: "button" as const })

  const elementProps = merge(merged, {
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(merged.onClick, () =>
        ctx.api().setOpen(false),
      )
    },
  })

  return renderStyled<ButtonProps, HTMLButtonElement>({
    // `merged`, not `props`, for both — it is the only props object once `withDefaults` has run
    // (`CLAUDE.md`, *The third hazard*), and reading either off the raw bag is how the factory's
    // own `defaultProps: { as: "span" }` came to do nothing at all.
    as: (merged.as ?? "button") as ValidComponent,
    props: elementProps,
    // `styleSource` stays `props` here and in every other part: §4.1's rule names the consumer's
    // own props, and the thing it exists to exclude is `elementProps`, the merged machine bag.
    styleSource: props,
    render: merged.render,
  })
}
```

### 11.12 `Portal` — a standalone component, in its own folder

```tsx
// packages/chakra-ui-solid/src/components/portal/portal.tsx
import { useEnvironmentContext } from "@chakra-ui-solid/core"
import { isServer, Portal as SolidPortal } from "@solidjs/web"
import type { Component, JSX } from "solid-js"

export interface PortalProps {
  /** Explicit mount target. Defaults to the environment's document body or shadow root. */
  container?: Element
  children?: JSX.Element
}

export const Portal: Component<PortalProps> = (props) => {
  const environment = useEnvironmentContext()

  // `@solidjs/web`'s Portal throws server-side ("Portal is not supported on the server") rather
  // than degrading, so this must never render it during SSR. A plain `if`, not `<Show>`:
  // `isServer` is a fixed per-environment constant, so there is no reactive branch.
  if (isServer) return props.children

  return (
    <SolidPortal mount={props.container ?? environment().getRootNode()}>
      {props.children}
    </SolidPortal>
  )
}
```

**Two deltas against Chakra, both `React→Solid`:**

1. `container` is an `Element`, not a `RefObject` — Solid has no ref objects.
2. Chakra portals each child separately via `Children.map(createPortal)`. No Solid analogue, no
   observable difference.

**And one prop Chakra has that we do not ship: `disabled`.** P5 shipped it non-reactive with a note
and assigned the reactive question to P6; **P6 decided it out and P9 applied that here.** Three
reasons, and `roadmap.md` §5.1 owns them: a prop that is read once and silently ignores later changes
is `plan.md` §0.2 in prop form, and **omitting it makes passing it a type error**; the reactive form
needs `<Show>` over a `children()`-resolved accessor, which **relocates `_hk`** for the whole
portalled subtree (§10.2) on every Dialog, Popover, Menu, Select and Tooltip; and no Chakra component
renders a `<Portal>` with it. A consumer who wants the behavior writes `<Show>` in their own tree,
where the hydration-key shift is local to markup they wrote. The `React→Solid` row is `plan.md` §0.4.

### 11.13 `namespace.ts` and what a consumer writes

```tsx
export {
  DialogRoot as Root, DialogTrigger as Trigger, DialogBackdrop as Backdrop,
  DialogPositioner as Positioner, DialogContent as Content, DialogTitle as Title,
  DialogDescription as Description, DialogCloseTrigger as CloseTrigger,
  DialogHeader as Header, DialogBody as Body, DialogFooter as Footer,
  DialogActionTrigger as ActionTrigger, DialogContext as Context,
} from "./dialog"
```

`RootProvider` and `PropsProvider` are **deferred to P6** with a reason each: `RootProvider` needs a
public `useDialog` hook (`plan.md` §5.5's `./hooks` subpath), and `PropsProvider` is a defaults
injection context that is a cross-cutting mechanism rather than a Dialog part. Both are in Chakra's
namespace, so P6 records them as *planned*, not *excluded*.

```tsx
<Dialog.Root size="lg" placement="center" motionPreset="slide-in-bottom">
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Header><Dialog.Title>Title</Dialog.Title></Dialog.Header>
        <Dialog.Body><Dialog.Description>Body</Dialog.Description></Dialog.Body>
        <Dialog.Footer><Dialog.ActionTrigger>Cancel</Dialog.ActionTrigger></Dialog.Footer>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
```

### 11.14 Everything it imports, and where each thing comes from

| From | Symbols |
|---|---|
| `@chakra-ui-solid/core` — the adapter surface, **and nothing else of it** (`zag-solid-adapter.md` §3.1) | `useMachine`, `normalizeProps`, `mergeProps`, `PropTypes` |
| `@chakra-ui-solid/core` — the styling and rendering kernel | `renderStyled`, `RenderProp`, `createSlotClasses`, `createPresence`, `RenderStrategyProps`, `PresenceApi`, `useLocaleContext`, `useEnvironmentContext`, `withDefaults`, `composeEventHandlers`, `createComponentContext` |
| `@chakra-ui-solid/styled-system/recipes` | `dialogSlotRecipe` |
| `@zag-js/dialog` | `machine`, `connect`, `Api`, `Props`, `OpenChangeDetails`, `ElementIds` |
| `solid-js` | `Component`, `Show`, `createMemo`, `createUniqueId`, `merge`, `omit` |
| `@solidjs/web` | `JSX`, `isServer`, `Portal` |

**`createBindable`, `createRefs`, `createTrack` are never imported.** They are internal to the
adapter; a machine reaches them through the service object `useMachine` constructs
(`zag-solid-adapter.md` §3.1).

---

## 12. Assumptions this blueprint rests on, and the gate for each

### 12.1 `brief-plan` §8 assumptions

| # | Assumption | Status | Gate |
|---|---|---|---|
| **9** | **The preset's `data-*` vocabulary matches Zag's.** §3.7 rests on it entirely — we write no state attributes | **Open.** Spot-checked at 6 of 56 slot recipes, all matching (`prior-art.md` §4.3). **The largest downside if skipped:** every affected slot recipe would need a translation getter per part, a per-component tax this blueprint does not price | **Step 4** — diff the preset's `data-*` selectors against the machines' emitted attributes. Cheapest check in the project |
| **2** | Each machine's `anatomy` export at 1.43.0 | Open, and P6's — §3.1 reads Dialog's directly rather than assuming | **P6** |
| **4** | `staticCss` in a preset covers internally-emitted recipe variants | Narrowed by `prior-art.md` §10.2 row 11; §4.5 makes it a precondition for writing Dialog at all | **Step 4** |
| **11** | `createPresence` composes with Chakra's animations | **CLOSED at P2 and resolved the other way** — `@zag-js/presence` is the correct mechanism (§7.1). **Do not re-open** | — |
| **3, 8, 10** | Panda↔preset pairing; runtime stylesheet injection; the fork against 1.43.0 | Settled or assigned elsewhere: 3 → step 3; 8 → **PASS** at P4 (`zag-solid-adapter.md` §5.3); 10 → **closed and refuted**, three one-line deltas, D3 reaching §2.6 | — |

### 12.2 `plan.md` §11.2's P3 assumptions this blueprint depends on

| # | Assumption | What it decides here |
|---|---|---|
| **P3-A** | Recipe-level `staticCss` through `theme.extend` reaches the consumer's codegen | §4.2 entirely. Fallback ladder is `plan.md` §1.5 |
| **P3-E** | Panda's `preflight: true` emits no `[hidden] { display: none !important }`, so our preset adds one `globalCss` line | §6.3 rule 3. **The rule is written to survive either answer** — only the preset's content changes |
| **P3-C** | A `hash`/`prefix` mismatch across the consumer boundary unstyles everything silently | Why §10.1 keeps `hash: false` |

### 12.3 New assumptions P5 introduces

| # | Assumption | Blocks if wrong | Verified at |
|---|---|---|---|
| **P5-A** | Panda's generated slot recipe is callable as `recipe(variantProps) → Record<Slot, string>` | §4.2 — the whole seam. No fallback | **Step 4** |
| **P5-B** | It also exposes `splitVariantProps` | Nothing for Dialog (§4.3); Workstream B's atomic recipes need it | **Step 3**, first `Button` |
| **P5-C** | A Chakra-faithful Dialog's closed-state axe assertions run clean, and only `aria-hidden-focus` needs an allowance (§9.2) | The DoD's expected-allowance list. **If wrong the number goes up; nothing structural changes** | **Step 5**, first axe run |
| **P5-D** | No key any Zag `connect()` emits collides with a style-prop name *once `styleSource` is in place* — i.e. addition 4 fully closes the class, rather than closing it for the known `editable` case only | §4.1.1. If a collision survives, the lint rule becomes a per-part deny-list | ~~**Step 5**~~ — **restate before verifying.** `styleSource` was never built (§4.1.1's callout), so the gate as worded cannot be answered. Collapsible, Dialog and Popover each shipped with no collision on any part, which is three components of evidence for the claim and none for the mechanism. It becomes a `forwardProp` gate, first exercised at `editable` |
| **P5-E** | Two presences per Dialog (plus the dialog machine) is an acceptable instance count | Nothing functional; a per-graph bundle and instantiation cost | **Milestone 5**, where the `+13.4 KB` claim gets re-measured (`zag-solid-adapter.md` §9.2) |

---

## 13. What P5 changes — re-plan P6 before P6 is written

| # | The source says | P5 decides | Touches |
|---|---|---|---|
| **1** | `prior-art.md` §5.2 / §8.2 / §10.1 row E, and the P5 brief: the `aria-controls` **and** `aria-labelledby` override getters are *"not taken"*, because *"Ark forwards `getTriggerProps()` / `getContentProps()` straight through"* | **Half wrong, measured.** Six Ark components carry a presence-gated `aria-controls` override, four of them with a dedicated test; Chakra inherits it. **We port it** — under the port rule it is parity, not an improvement (§1.2). `aria-labelledby` on listbox content is genuinely not overridden and stays not taken | **P6** (every presence-gated trigger part), **P7** (the DoD's allowance list — §9.2 revises the expected count from six to open-state-only) |
| **2** | `plan.md` §2.3: `renderStyled` needs **three** additions | ~~**Four.**~~ **Three, after all** — this row said `styleSource` was required, and the `dialog` ship shipped `renderStyled` without it. The collision is real and `forwardProp` answers it; `editable`'s `size: 1` is still the live case (§4.1.1) and still unmeasured | **P7** (the lint rule), **P9** (`decisions-ledger.md`) |
| **3** | `brief-plan` §3.5 row B5 + §4.1 doc 4: document *"the `untrack`-around-`useMachine` seed idiom"* | **Deleted, not documented.** One line replaces the section: a Root calls `useMachine` bare, and a diagnostic there is a real bug (§2.1, §2.2). Restates `zag-solid-adapter.md` §10 row 1 | — (acted on here) |
| **4** | `brief-plan` §2.11 / §7 concern 3: *"drop by default, **adopt by exception**"*, with a per-component retained-primitive column in the roadmap | **The column is deleted.** The port rule removed the exception mechanism (§8). Restates `prior-art.md` §10.1 row D | **P6** — deletes a planned column |
| **5** | `brief-plan` §4.1 doc 5 lists `portal` among the *"React-idiom or Solid-native"* exclusions | ~~**`Portal` must ship.**~~ **The exclusion was right and this row was wrong**, measured at the `dialog` ship: `@solidjs/web`'s server `Portal` does not throw as this row assumed — it renders nothing, returns `undefined` and consumes exactly one hydration child id, the same number its client counterpart consumes, so no `_hk` after a portal shifts between builds. That closed the SSR guard the row was built on, `disabled` was already decided out, and `portal` is back under *Not ported* (§0.3, `roadmap.md`) | — (settled) |
| **6** | `plan.md` §5.3's list of what `@chakra-ui-solid/core` owns | **Two additions:** `createComponentContext` (row 6), and `RenderStrategyProps` / `PresenceApi` as public types (row 4). Also: `core` gains a direct `@zag-js/presence` dependency, and `components` gains one `@zag-js/<machine>` per component — neither appears in `plan.md` §5.2's table | **P6, P9** |
| **7** | `plan.md` §5.5: `chakra-ui-solid` mirrors Chakra's subpaths one-to-one | Chakra's namespace carries **`RootProvider`** and **`PropsProvider`** on every machine component. Deferred, not excluded — `RootProvider` needs the `./hooks` subpath's `useDialog` (§11.13) | **P6** |
| **8** | `prior-art.md` §3.4: a *"~15-line, three-row recurring floor"* per component | **hope-ui's number, against hope-ui's stack.** Re-measured against Chakra it is two named arguments per part plus one line on presence-gated triggers (§1.4). The warning that the floor **grows by category** stands, and a floating component is still untested by anyone | **P6** (build-order risk), **P7** |
| **9** | `brief-plan` §2.11: `composeEventHandlers` is *"needed the moment a part composes a consumer handler with a machine handler"* | **A machine part never calls it** — the adapter's `mergeProps` chains `on*` across sources. It is needed for shapes C and D only (§3.4). The carry-over stands; its justification changes | **P9** |
| **10** | hope-ui's parts strip `id` from consumer props | **Do not strip.** Ark and Chakra forward it; `ids` on the Root is the supported override and it is proven to work (§3.4) | **P6, P8** (docs must carry `ids`) |

---

## 14. What P5 could not act on

| Item | Why not | What it blocks |
|---|---|---|
| **Running any of it** | No package exists, by P-pass rule. Every claim about the reference sources is `grep`/`sed` on the checkouts; nothing has been compiled, rendered, or axe'd | Nothing. §12.3's five assumptions carry the exposure |
| **Panda's generated `sva` surface** | Panda is installed in no checkout (`plan.md` §13) — the same limit `prior-art.md` §5.1 and `plan.md` §2.2 hit | §4.2's seam, as assumptions **P5-A** and **P5-B**. It is why §4.5 puts step 4 in front of Dialog |
| **`prior-art.md` §5.1's open `[hidden]` item** | Same cause. Whether Panda's preflight carries Chakra's rule is unanswerable here | Nothing — §6.3 is written to survive either answer, and only the preset's `globalCss` content changes |
| **The repeated-part shape** | Dialog has none, and inventing one against no worked component is how a pattern gets stamped wrong 100 times (§0.2) | **P6** — the first component with a repeated part extends §3.2 with a fifth shape |
| **`prior-art.md` §3.3 seam 3 — Zag writing `--layer-index`/`--z-index` imperatively into the same `style` attribute Solid binds reactively, with a `MutationObserver` watching it** | It is a **floating** component's seam, and neither hope-ui spike built one. Dialog's recipe reads `var(--layer-index, 0)` and never writes it | **Priced at step 5b, on Popover: it is free, and the number is 1500 / 1501** — a stacked pair, outer content and inner, each positioner taking its own by `var(--z-index)`. Solid's object-form `style` binding diffs per property against what it last wrote, so a reactive rewrite — consumer signal, machine re-emit, or an `autoUpdate` pass — removes only keys it owns and leaves popper's eight imperative custom properties alone. **Two rules follow, and neither is enforced by a type: only the object form of `style` may reach a positioner** (a string binding rewrites the whole attribute; popper's `zIndexComputed` flag and its approximate-equality guards then believe the properties are written and an ordinary update will not restore them — only a `reposition()`, which builds a fresh closure, does); **and content must stay the positioner's `firstElementChild`**, because `--z-index` is copied once per floating-element identity off `getComputedStyle(firstElementChild).zIndex`. Pinned in `popover.browser.test.tsx`, *the seam* |
| **`prior-art.md` §10.5's bundle bytes** | Not reproducible from git, and no machine closure exists until milestone 5 | **P7**, which carries the check to milestone 5 |

**Everything in `prior-art.md` §10 and `zag-solid-adapter.md` §10 that reaches P5, P5 acted on:**
§10.1 rows A–D (§8 — the kernel is struck, presence is a build, the column is deleted), row E (§1.2 —
**and it is the one row P5 had to contradict**), row F (§9 — the DoD's allowance shape); §10.2 rows 3
and 4 (§2.1 — the retired idiom and the superseded A3 fix), row 6 (by omission — no `untrack` count is
quoted anywhere here), row 12 (18 + 56 throughout). From `zag-solid-adapter.md` §10: row 1 (§2.1),
row 2 (§2.1), row 5 (§2.6 — D3's controlled-mode predicate at part level). Rows 3, 4, 6–11 are P6's or
P7's by construction.
