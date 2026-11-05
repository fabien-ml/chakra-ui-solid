# `ClientOnly` is a signal flipped in `onMount`

`ClientOnly` renders its children only on the client. It is built as `createSignal(false)` set to `true` in `onMount`, not as a branch on Solid's `isServer`: `isServer` is already `false` on the client's first render, so branching on it makes the first client render disagree with the server markup and breaks hydration. The signal form keeps both renders identical until after mount.
