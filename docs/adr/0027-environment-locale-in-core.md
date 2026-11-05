# Environment and locale contexts live in core

`environment` and `locale` are contexts, not components. They ship from the core package and are re-exported from `components/environment` and `components/locale`, so Chakra's import paths resolve.
