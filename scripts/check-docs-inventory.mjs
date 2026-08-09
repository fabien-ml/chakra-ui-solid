#!/usr/bin/env node

// check:docs-inventory — the component tier and the parity matrix agree, in both directions
// (`docs-site.md` §6.1; `definition-of-done.md` rule 2.15).
//
// Live from step 3b, which is the point: this is an inventory check that would otherwise not fire
// until step 8, by which time every component would have shipped without a page (D-99).

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  contentTiers,
  documentedComponents,
  findInventoryDrift,
  landedComponents,
  parseParityMatrix,
  readRoadmap,
  shippingComponents,
} from "./lib/docs-inventory.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

// The four tiers `docs-site.md` §2.1 settles, and the top bar renders. A content directory outside
// this set is a page nobody can navigate to.
const SETTLED_TIERS = ["get-started", "components", "styling", "theming"];

const rows = parseParityMatrix(readRoadmap(repoRoot));
const shipping = shippingComponents(rows);
const landed = landedComponents(repoRoot);
const documented = documentedComponents(repoRoot);
const { undocumented, unbuilt } = findInventoryDrift({ shipping, landed, documented });

const strayTiers = contentTiers(repoRoot).filter((tier) => !SETTLED_TIERS.includes(tier));

const failures = [];

if (undocumented.length > 0) {
  failures.push(
    `${undocumented.length} shipped component(s) with no docs page:\n` +
      undocumented
        .map((name) => `  ${name}  →  apps/docs/src/content/components/${name}.mdx`)
        .join("\n") +
      "\n\nA component is not done until its docs page is done, in the same phase " +
      "(`definition-of-done.md` rule 2.15). A shipped component nobody can find is the half of " +
      "this that has no other symptom.",
  );
}

if (unbuilt.length > 0) {
  failures.push(
    `${unbuilt.length} docs page(s) for a component that has not shipped:\n` +
      unbuilt.map((name) => `  apps/docs/src/content/components/${name}.mdx`).join("\n") +
      "\n\nA page for an unbuilt component is a promise (`roadmap.md` §9.2). Either the component " +
      "is missing from `packages/components/src`, or its `roadmap.md` §4 row does not say `ships`.",
  );
}

if (strayTiers.length > 0) {
  failures.push(
    `${strayTiers.length} content tier(s) outside the settled four:\n` +
      strayTiers.map((tier) => `  apps/docs/src/content/${tier}/`).join("\n") +
      `\n\nThe nav is exactly ${SETTLED_TIERS.join(" · ")} (\`docs-site.md\` §2.1). A page in ` +
      "another tier renders at a URL with nothing linking to it.",
  );
}

if (failures.length > 0) {
  console.error(`check:docs-inventory —\n\n${failures.join("\n\n")}\n`);
  process.exit(1);
}

console.log(
  `check:docs-inventory — ${documented.length} component page(s), matching the ` +
    `${shipping.filter((name) => landed.includes(name)).length} shipping row(s) of ` +
    `roadmap.md §4 that have landed (of ${shipping.length} that will).`,
);
