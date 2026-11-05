# Package names: unscoped `chakra-ui-solid` plus scoped satellites

The main package is the unscoped `chakra-ui-solid`. The satellites are `@chakra-ui-solid/core`, `@chakra-ui-solid/styled-system` and `@chakra-ui-solid/panda-preset`, plus a private internal test-utils package. The unscoped name is the only one where the directory, the package and the project agree; a second segment under a scope that already says design system and framework would be filler. npm keeps scoped and unscoped namespaces separate, so owning the scope did not reserve the unscoped name.

- `chakra-ui-solid@0.0.1` is a placeholder published from outside the repo. Never unpublish it; the real release goes out at a higher version.
- `core` is a permanent satellite, not a staging area: absorbing it into the main package breaks declaration emit.
