# Loose `as`, and a cast where `ref` types disagree

`as` is a loose `ValidComponent`, never a generic that re-types props from the element, and `RenderProp` is not generic over its target element. Deep conditional polymorphic types wreck editor completions on every part of every component; an occasional cast is the cheaper price.

**The measured price:** `Ref<T>` is invariant in Solid's JSX types, so `render={(props) => <a {...props} />}` on a part typed against `HTMLElement` is a type error on `ref` alone and needs a cast. A part typed against its own element (a button part rendering a button) needs none. The docs mention this only where it bites, so a reader does not assume they are doing it wrong. Dropping `ref` from the forwarded props would fix the error by removing a feature, which the port rule forbids ([0050](0050-port-rule-observable-difference.md)).
