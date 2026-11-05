# `solid-contract` tests pin Solid's behaviour, not ours

A small test set characterizes the Solid semantics our code rests on: `merge` resolves by presence, `createSignal(fn)` is the memo overload, `useContext` throws without a provider, sibling effect order and reverse-order cleanup on disposal, `applyRef` flattening, `sharedConfig.hydrating` marking the hydration pass, and `flush()` ordering. They run across the unit, ssr and browser projects. When Solid's 2.0 line moves, one red contract test names the cause, instead of dozens of component tests failing with no common cause.

Where our code depends on an undocumented Solid branch, it is pinned here and the dependent code is named in the test.
