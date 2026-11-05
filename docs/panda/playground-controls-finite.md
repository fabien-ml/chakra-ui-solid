# Playground and Storybook controls are finite

A control cannot drive a style prop. Panda reads style-prop values from source text at build time, so `<Box p={args.padding}>` computes a class whose rule was never generated: the control moves and nothing changes, with no error.

A control may offer only:

- a recipe variant or an enumerated machine prop (a finite set already in the generated CSS), or
- a CSS custom property.

Stories are prebuilt variants. They declare no `argTypes` for style props, and every style prop in a story is a literal.

A free-form style-prop editor needs a build step. Running Panda in the browser has not been tried and has no verdict.
