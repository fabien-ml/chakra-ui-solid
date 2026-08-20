# Verified facts

Facts that already cost time to establish. **Check here before researching anything.**

A row earns its place by having been *measured* — a browser run, a script, a diff — not by having
been read somewhere. Cite what produced it.

| Fact | Measured | How |
|---|---|---|
| Biome 2.5.7's `style/noMagicNumbers` flags the operands of any arithmetic, **including inside the named `const` it tells you to extract** — `const DEFAULT_RATIO = 4 / 3` and `maxBuffer: 64 * 1024 * 1024` both fail. The rule takes **no options**: `NoMagicNumbersOptions` in `configuration_schema.json` is `{"type":"object","additionalProperties":false}`, so ESLint's `ignore` array has no equivalent. Rejected — a rule whose only satisfying answer is a `biome-ignore` teaches suppression | 2026-08-20 | `biome check` over 1 018 files, then the shipped schema |
| `complexity/useArrowFunction` has **0** violations across the repo, so it lands as `error` for free | 2026-08-20 | `biome lint --only=complexity/useArrowFunction` |
| `biome lint --only=<rule>` **ignores `overrides`** — it forces the rule on everywhere. Measuring a candidate rule's real cost needs a full `biome check` with the override already written | 2026-08-20 | 128 hits under `--only` vs 17 under `check`, same tree |
| The `skills` CLI rejects `--agent claude`; the id is **`claude-code`**. It installs into `.claude/skills/` as real directories, so matching this repo's layout (`.agents/skills/` canonical, `.claude/skills/` symlinks) is a manual `mv` + `ln -s` after each add | 2026-08-20 | `pnpm dlx skills@latest add`, twice |
