# A props context is a default: `withContextDefaults`, not `merge(context, props)`

A `PropsProvider` supplies props that a local prop overrides, so it is a default with a dynamic key set, not a precedence chain. `merge` resolves by presence ([0066](0066-with-defaults-resolves-by-value.md)), so `merge(usePropsContext(), props)` loses a `<ButtonGroup size="sm">` to a `<Button size={props.size}>` whose `size` is unset. Use `withContextDefaults(props, usePropsContext())`. Chakra's own merge is value-based on this line, so presence semantics here would be a divergence as well as a hazard.

`withContextDefaults` is `withDefaults` with an honest return type: the latter marks every key required and non-nullish, which is right for a literal defaults object and wrong for a context bag. Each use owes a forwarded-`undefined` test: `<X prop={undefined} />`.
