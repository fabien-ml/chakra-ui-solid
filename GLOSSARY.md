# chakra-ui-solid

Chakra UI's component API for SolidJS: machines for behavior, Panda CSS for styling, no CSS written at runtime.

## Language

### Naming

**The React version**:
Chakra UI's own implementation, `@chakra-ui/react`, that this project follows. We are Chakra UI for Solid, so upstream is never just "Chakra".
_Avoid_: Chakra (for upstream), "Coming from Chakra", the original

### Behavior

**Machine**:
A framework-free state machine that owns one component's state and ARIA wiring.
_Avoid_: state, controller

**Anatomy**:
The list of named parts a machine expects, such as `trigger` and `content`.
_Avoid_: structure

**Part component**:
One exported piece of a multi-part component (`Dialog.Trigger`); it merges the machine's prop getter under the consumer's props and wears its slot's class.
_Avoid_: subcomponent, child component

**Presence**:
The lifecycle that keeps a closing part in the DOM until its exit animation ends.
_Avoid_: mount state, visibility

**Mount helper** (`mount()`):
The test-render helper that fails a test on any Solid reactivity diagnostic raised while the tree was mounted.
_Avoid_: render helper

### Part shapes

**Machine part**:
A part that takes machine props and wears a recipe slot (`Title`, `CloseTrigger`).

**Presence-gated part**:
A machine part that is also gated by presence (`Content`, `Backdrop`).

**Slot-only part**:
A part with a recipe slot and no machine behavior (`Header`, `Footer`).

**Behavior-only part**:
A part with context behavior and no recipe slot (`ActionTrigger`).

**Repeated part**:
A part that opens a per-item context because one machine drives N items (`RadioGroup.Item`).

**Context part**:
The one part that renders no element: it calls its render prop with the component's context.
_Avoid_: consumer part

### Styling

**Style prop**:
A CSS property passed as a JSX prop (`px={4}`).
_Avoid_: utility prop

**Static extraction**:
Panda's build-time scan that reads the consumer's source and generates exactly the CSS its style values name.
_Avoid_: tree-shaking, JIT

**Recipe**:
A named style definition with variants (`size="sm"`).

**Slot recipe**:
The multi-part recipe: one style block per slot, resolved to one class string per slot.
_Avoid_: multipart recipe

**Slot**:
One named style block of a slot recipe. Slots and a machine's anatomy parts are different sets and neither contains the other.
_Avoid_: part (a part is the component, a slot is the style)

**Compound variant**:
A style block that applies only when several variants hold at once.

**`staticCss`**:
The Panda config list that generates CSS for values no source file literally writes.

**Style route**:
One of the three ways a style value reaches a stylesheet: a statically extractable literal, a `staticCss` row, or a CSS custom property. There is no fourth; see [dynamic value routes](docs/adr/0026-dynamic-value-routes.md).
_Avoid_: escape hatch

**Silent unstyling**:
A Panda class whose CSS was never generated, so it renders nothing and raises no error.

**Styling**:
What a consumer writes on a component. It is resolved at their build time.

**Theming**:
What a consumer changes in the Panda config. Styling and theming split exactly at the build-time boundary.

### Server rendering

**`_hk`**:
The positional key Solid stamps on server-rendered nodes and matches against on hydration.
_Avoid_: hydration id
