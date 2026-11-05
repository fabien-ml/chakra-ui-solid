# A JSX-valued prop read twice is built twice

A JSX-element **prop** (`spinner={<X />}`) compiles to a lazy getter that runs `createComponent` on every read. A gate plus a body (`<Show when={props.text}>…{props.text}…`) builds it twice and throws one away, with whatever state it set up.

## Why it needs writing down

The discarded build is invisible to markup, geometry and computed-style assertions: the suite stays green. Measured in `Loader`: raw reads built both slots exactly twice.

## Procedure

| Slot is read | Do |
|---|---|
| more than once in one render | resolve once with `children()`; the default goes inside the call: `children(() => props.spinner ?? <Spinner />)` |
| exactly once, gated or not | nothing. A reflexive `children()` adds a memo and moves the subtree's hydration key |
| a directly written child (`<Button><Icon /></Button>`) | nothing; only props are getters |

A multi-read slot owes a test that counts real constructions: mount with a slot component that increments a counter and assert `1`. Nothing else can see the discarded build.
