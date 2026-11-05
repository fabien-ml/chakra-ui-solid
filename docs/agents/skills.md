# Installing a skill

Skills are vendored with the `skills` CLI and tracked in `skills-lock.json`. The canonical copy lives
in `.agents/skills/<name>/`, and `.claude/skills/<name>` is a symlink to it.

```bash
pnpm dlx skills@latest add <owner>/<repo> -a universal -a claude-code -y -s <skill>
pnpm dlx skills@latest remove <skill> -y
pnpm dlx skills@latest update
```

| Trap | Why |
|---|---|
| `npx skills` fails | `package.json` declares `devEngines.packageManager: pnpm` |
| `-a claude-code` alone copies into `.claude/skills/` | only `-a universal` puts the canonical copy in `.agents/skills/` and symlinks it |
| `grill-with-docs` dead-ends | it calls `grilling` and `domain-modeling`, so all three must be installed |

**A vendored skill is never edited.** Anything this repo needs differently is a rule in `CLAUDE.md`.
