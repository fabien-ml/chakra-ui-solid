# A child that needs injected styles must be passed as a component

When a parent styles a child the consumer passes in (Stack's `separator`), the child is a component, not an element: `separator={StackSeparator}`, never `separator={<StackSeparator />}`.

- **Styles** flow by context: the separator reads the stack direction from a context and computes its own class. The separators must be built inside the provider, because Solid resolves context through the owner that created the component.
- **Repetition**: a JSX element in a prop position compiles to a getter and yields a fresh node per read, but `const sep = <X />` yields one node, and inserting one node N-1 times moves it, leaving a single separator at the last gap, silently. Taking a component makes the element spelling a type error.

Chakra's separator margins are the `gap` prop; no rule in anyone's sheet carries them, so Stack keeps the flex `gap` on, with the same geometry (measured, not assumed).
