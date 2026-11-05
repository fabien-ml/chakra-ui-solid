# Derivative obligations

A file that reproduces upstream's expression (could someone diff it against theirs and see the same structure and sequence?) is a derivative. Four obligations land in the same commit as the code, so a branch fails its checks before anything is published:

1. an entry in `attribution.config.ts`
2. an `@license` header on the file
3. a row in the root `NOTICE.md` and in the owning package's `NOTICE.md`
4. `LICENSE` and `NOTICE.md` in that package's `package.json#files`

`check:attribution` enforces the mechanics. What it cannot enforce:

| Rule | Why |
|---|---|
| The header names the upstream **file**, never a version; the version goes in `NOTICE.md` | a version in the header goes stale on every bump |
| `LICENSE` is never edited | it is upstream's text |
| `package: null` marks a derivative that is not published (the docs app): the entry, header and root `NOTICE.md` row stay; the package `NOTICE.md`, the `files` entry and the `dist/` header check go | an app has no tarball a consumer receives |
| A file that cannot carry a header (a directory, a binary, a logo) is declared as a notice-only path with its reason, never given a registry entry | the registry's defining assertion is a matching header |
| On any upstream major, re-read its `license` field and `LICENSE` copyright line and re-stamp `NOTICE.md` | a licence can change between majors |
| `comments.legal` stays pinned in `tsdown.config.base.ts` | unpinned, the headers vanish from `dist/` |
