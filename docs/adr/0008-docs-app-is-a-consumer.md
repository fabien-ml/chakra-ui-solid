# The docs app is a consumer of the packages, not a privileged in-repo app

The docs app installs the library the way a user does: it writes its own `panda.config.ts` from the preset's config helper and runs its own Panda build. In dev it aliases package imports to `src`; in the production build they resolve through `exports` to `dist` under the `"solid"` condition, the real consumer path.

This makes it a standing consumer test, which a throwaway consumer (alive for one test run) cannot be:

- The CSS-coverage check runs against the docs app's own generated sheet on every push.
- Every docs example is consumer-shaped code, the largest body of it this repo has.
- A docs build failure is a distribution failure, not a documentation one.

If the app takes a shortcut (importing the repo's dev stylesheet, aliasing to `src` in the production build, hand-writing the Panda options the config helper owns), the docs stop being evidence and become decoration. A check keeps that from happening quietly.

It also means the docs site takes its theme from the consumer path: see [0023](0023-docs-site-shows-consumer-theme.md).
