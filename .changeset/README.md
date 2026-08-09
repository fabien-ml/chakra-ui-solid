# Changesets

Release notes and version bumps live here, one Markdown file per change. `pnpm changeset` writes
one; `pnpm version-packages` consumes them.

## No changeset while a package is at `0.0.0`

**Nothing is published yet, and nothing should be version-bumped until it is** — `plan.md` §8, and
rule 4.12 of `__internal__/definition-of-done.md`. A changeset written against a `0.0.0` package
does not describe a release anybody can install; it describes work in progress, which is what the
commit message is for.

The release workflow enforces this rather than trusting it (`.github/workflows/release.yml`): a
pending changeset alongside a `0.0.0` package fails the run. The policy ends the day the first
package takes a real version.
