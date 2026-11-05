# Prop-position JSX is a getter: one node or many

Solid compiles JSX in a prop position to a getter. `separator={<X />}` yields a fresh node on every read; `const sep = <X />` yields one node. Inserting that single node N-1 times **moves** it, so the result is one separator at the last gap, silently.

So a prop that is repeated per gap takes a component (`separator={StackSeparator}`), which makes the element spelling a type error. See also [a JSX-valued prop read twice](double-read-children.md).
