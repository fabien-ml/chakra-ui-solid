// Prints one `<key>|<message>` line per upstream layer that has a Solid 2 or Panda 2 release on npm.
// The conditions are the ones `deps-bump` waits for; see docs/adr/0069-wait-for-upstream-solid-2-releases.md.

const conditions = [
  {
    key: "ark",
    packageName: "@ark-ui/solid",
    meets: (manifest) => "@solidjs/web" in { ...manifest.dependencies, ...manifest.peerDependencies },
    message: "depends on `@solidjs/web`, the Solid 2 renderer",
  },
  {
    key: "chakra-preset",
    packageName: "@chakra-ui/panda-preset",
    meets: (manifest) => {
      const range = { ...manifest.dependencies, ...manifest.peerDependencies }["@pandacss/types"];
      return range !== undefined && /(^|[^\d.])2\./.test(range);
    },
    message: "is built on Panda 2 (`@pandacss/types` 2.x)",
  },
];

for (const condition of conditions) {
  const response = await fetch(`https://registry.npmjs.org/${condition.packageName.replace("/", "%2f")}`, {
    // The abbreviated packument carries every version's dependencies at a fraction of the size.
    headers: { accept: "application/vnd.npm.install-v1+json" },
  });
  if (!response.ok) throw new Error(`${condition.packageName}: registry answered ${response.status}`);
  const packument = await response.json();
  const version = Object.keys(packument.versions).find((v) => condition.meets(packument.versions[v]));
  if (version !== undefined) {
    console.log(`${condition.key}|\`${condition.packageName}@${version}\` ${condition.message}.`);
  }
}
