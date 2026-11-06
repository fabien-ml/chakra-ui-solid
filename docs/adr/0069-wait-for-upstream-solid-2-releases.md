# Wait for upstream Solid 2 releases

The project wires Chakra v4 onto Solid 2 and builds on the layers Chakra's core team publishes: `@ark-ui/solid`, which runs Zag through `@zag-js/solid`, and Chakra's Panda 2 preset. When a layer has no npm release for Solid 2 or Panda 2, under any dist-tag, the roadmap waits for it. Porting those layers is their maintainers' work. A fork of ours would double the code we answer for and drift with every upstream commit.

## Considered options

- **Port `@ark-ui/solid` v6 to Solid 2 in a fork.** Rejected. Its Solid source is 1,850 files, and 171 of them import `solid-js/web`, which Solid 2 renames `@solidjs/web`.
- **Build on Solid 1 until Ark moves.** Rejected by [0054](0054-project-goal-and-scope.md): the target is Solid 2.

## Consequences

`deps-bump` names the releases it waits for, and the weekly `upstream-releases` workflow reports when they appear. Every roadmap issue sits behind it. A prerelease on npm unblocks; only an unpublished layer blocks.
