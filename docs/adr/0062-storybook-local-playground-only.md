# Storybook is a local playground only

There is no story gate, no CI job, no rule that a story must exist, no addons. A story renders a component in a harness we control (our aliases, our compile, our stylesheet), which proves nothing a consumer cares about. The validation surface is the docs app: an example is installed by package name, resolved through `exports` to `dist` under the `solid` condition, and styled by the app's own Panda run, then typechecked, mounted with no console error and run through axe.

**Accepted cost:** a broken story can reach `main`, since nothing else reads one, and the cost is one debugging session for the next person who opens the playground. Storybook has no docs page of its own, since it is not a deliverable.
