# Polymorphism is `render` (a function) plus `as`, never `asChild`

`as` names the element; `render` is a **function** receiving the computed props and returning the element. It is never a JSX element, because a Solid JSX element is an already-constructed DOM node by the time it reaches us and Solid has no `cloneElement`, so accepting one could only mean dropping every computed prop. It is the JSX child that is rejected, not the idea; `as` is not rejected at all.

State escape hatches follow the same rule: a checkbox's `checked` and `indeterminate` indicators are `RenderProp`s, not `JSX.Element`s, and a consumer's JSX element there is a compile error, the right failure mode.
