# Dev server fails with `EPERM: uv_cwd` on macOS

`Error: EPERM: process.cwd failed with error operation not permitted, uv_cwd` when a preview server starts means macOS TCC: **System Settings → Privacy & Security → Files and Folders → `node` → Documents Folder** is off. Turn it on; an app update can reset it.

## Cause

The repo lives under `~/Documents`, which TCC protects. Claude.app spawns preview servers through a helper that disclaims TCC responsibility, so macOS attributes the child to `node` and consults `node`'s grant. Node calls `process.cwd()` during bootstrap, so it dies whatever the command (`pnpm`, `node`, `vite`).

## Three TCC subjects

| Process | Governed by the row |
|---|---|
| the agent's tool calls (Read, Bash) | Claude Code |
| dev servers | `node` |
| the Claude app | neither |

Granting the Claude row does not fix the dev-server case. The agent can transiently lose repo access (Read and Bash returning `EPERM` for every path under `~/Documents`) and it recovers within a minute with no change; retry once before concluding anything.

## Diagnosing

Do not debug `.claude/launch.json`, the scripts or pnpm: swapping the runtime changes nothing. A `/bin/sh` launch config that writes `ls ~/Documents` to `/tmp` shows the signature: "Operation not permitted" with `/tmp` and `~` readable. A green `pnpm build:docs` is not evidence the grant is present. While blocked, build the docs and read the generated HTML.
