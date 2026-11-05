# `InputGroup` reaches its control through an opt-in context

Chakra's `InputGroup` does `Children.only` + `cloneElement` to push start and end offsets onto its control. Nothing can be cloned or walked in Solid, so the group publishes `hasStartElement()` / `hasEndElement()` through a context, and a control that opts in reads it as the **lowest** source in its own `mergeProps` chain. That is where upstream's `...children.props`-last precedence lands: the consumer's own `ps` or `pe` still wins.

- **A control opts in by declaring `--input-height`** in its recipe (`Input`, `NativeSelect.Field`, `TagsInput.Control`: the slot that declares the variable, not the inner input). It owes about three lines.
- **The control may be nested or wrapped**, so `children` is ordinary `JSX.Element` and `Children.only` has no counterpart.
- **A control that has not opted in keeps its own recipe padding** instead of losing it.
- `Group` needed no change: it reads a child's position structurally, and `InputElement` marks itself.

No CSS descendant rule is involved. Measured: none of the three cascade spellings can reproduce author precedence, and the `:where()` one silently zeroes a `Textarea` that declares no `--input-height` (invalid at computed-value time on a non-inherited property).
