# A docs example is one real `.tsx` file

Every example is a real `.tsx` file under the docs app's `examples/` folder, imports by package name, and is addressed by basename. The page renders the component and reads the same file for the code pane, so preview and code cannot diverge (a hand-copied snippet drifts silently and survives every check). The file is shown three ways: preview, code, and as the thing the checks run on.

A check (`check:docs-examples`) holds each example to four tests: it typechecks under the docs app's tsconfig; it imports only subpaths the package exports map really has; it mounts in the browser test project with no console error and a non-empty root; and it passes axe ([0001](0001-axe-incomplete-policy.md)).

The mount test earns its place: "compiles" and "works" are different, and an earlier port's stories were written, typechecked, linted and committed, then every one crashed because nobody opened them. Verified against deliberate failures: an example that throws at mount and one that renders nothing both pass Biome, `tsc` and the style-contract check, and both fail here.

A docs example is the validation surface, not a Storybook story: it renders a component the way a consumer gets it (installed by package name, resolved through `exports` to `dist`, styled by the docs app's own Panda run), whereas a story renders it in a harness with our aliases ([0062](0062-storybook-local-playground-only.md)).
