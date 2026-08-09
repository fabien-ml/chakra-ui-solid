#!/usr/bin/env node

// check:preset-token-resolution — what Panda does with a recipe that references a token nobody
// registered, and whether our one-key delta fixes it (`testing.md` §8; assumption P6-F).
//
// The live case: `@chakra-ui/panda-preset` registers the Switch `cursor` token under the misspelled
// key `swittch` while its own Switch recipe references `cursor: "switch"`. `@chakra-ui/react`'s
// runtime theme spells both `switch` and loses nothing, which makes this a **preset defect rather
// than Chakra behavior** — so inheriting it would be a divergence from the thing we are porting.
// `@chakra-ui-solid/preset` adds one token key, `cursor.switch`, and leaves the misspelled
// slot-recipe key alone (renaming that would fork the package we depend on).
//
// Two runs, one question each:
//
//   without the delta — does Panda error, or emit something broken quietly? If it errors, the
//                       preset does not build for anyone and the finding is much larger than one
//                       component.
//   with the delta    — is the declaration actually restored?

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const presetDir = join(repoRoot, "packages/preset");
const pandaBin = join(presetDir, "node_modules/.bin/panda");
const builtPreset = join(presetDir, "dist/index.js");

if (!existsSync(builtPreset)) {
  console.error(
    `check:preset-token-resolution — ${builtPreset} does not exist. Run \`pnpm build\` first: this ` +
      "check measures the preset as Panda's config loader reads it, which is the built shape.",
  );
  process.exit(1);
}

/** The Switch recipe's own `cursor`, as emitted. */
function emittedSwitchCursor(css) {
  const match = /\.switch__control[^{]*\{[^}]*?cursor:\s*([^;\n}]+)/s.exec(css);
  return match?.[1]?.trim();
}

function cssgenWith(presetsExpression) {
  const directory = mkdtempSync(join(tmpdir(), "chakra-solid-token-probe-"));
  try {
    writeFileSync(join(directory, "package.json"), '{ "name": "probe", "type": "module" }\n');
    // Module resolution walks up from the config file, so the probe borrows the preset package's
    // own `node_modules` instead of installing anything. `@chakra-ui-solid/preset` is not in there
    // — a package cannot depend on itself — so it is imported by the path Panda would read it at.
    symlinkSync(join(presetDir, "node_modules"), join(directory, "node_modules"), "dir");
    writeFileSync(
      join(directory, "panda.config.ts"),
      [
        'import chakraPreset from "@chakra-ui/panda-preset"',
        `import { chakraSolidPreset } from ${JSON.stringify(builtPreset)}`,
        'import { defineConfig } from "@pandacss/dev"',
        "void chakraPreset; void chakraSolidPreset;",
        "export default defineConfig({",
        "  eject: true,",
        `  presets: ${presetsExpression},`,
        // Only the Switch recipe, so the probe reads one declaration rather than a 300 KB sheet.
        '  staticCss: { recipes: { swittch: ["*"] } },',
        "  include: [],",
        "  exclude: [],",
        "  preflight: false,",
        "  hash: false,",
        '  outdir: "styled-system",',
        "})",
        "",
      ].join("\n"),
    );

    // `--outfile` is resolved against the process cwd, not `--cwd`, so it is passed absolute.
    const outfile = join(directory, "out.css");
    execFileSync(pandaBin, ["cssgen", "--cwd", directory, "--outfile", outfile], {
      cwd: presetDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return readFileSync(outfile, "utf8");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

let before;
let after;
try {
  before = emittedSwitchCursor(cssgenWith('["@pandacss/preset-base", chakraPreset]'));
  after = emittedSwitchCursor(cssgenWith("[chakraSolidPreset]"));
} catch (error) {
  // A non-zero exit here is the finding, not a probe failure: an unresolvable token reference is
  // expected to degrade quietly, and if it is fatal instead then the preset does not build for
  // anyone and the problem is far larger than one component's cursor.
  console.error(
    "check:preset-token-resolution — the probe build FAILED.\n\n" +
      "If the error below is Panda rejecting the upstream preset, that is the finding: an " +
      "unresolvable token reference is fatal rather than quiet, and `@chakra-ui/panda-preset` " +
      "does not build for anyone. If it is a resolution or filesystem error, the probe itself is " +
      `broken.\n\n${error.stderr ?? error.message ?? error}`,
  );
  process.exit(1);
}

const problems = [];

if (before === undefined) {
  problems.push(
    "the Switch recipe emitted no `cursor` declaration at all in the probe — the " +
      "probe's selector is stale, so this check is measuring nothing",
  );
} else if (before === "var(--cursor-switch)" || before === "pointer") {
  problems.push(
    `upstream now resolves \`cursor\` on its own (emitted \`${before}\`). The ` +
      "`theme.extend.tokens.cursor.switch` delta in our preset has become a no-op and should be " +
      "removed — a delta that fixes nothing is a fork nobody can justify later",
  );
}

if (after !== "var(--cursor-switch)") {
  problems.push(
    `with our preset the Switch recipe emits \`cursor: ${after}\` rather than ` +
      "`var(--cursor-switch)`, so the one-key delta is not restoring the token reference",
  );
}

if (problems.length > 0) {
  console.error(
    `check:preset-token-resolution — ${problems.length} problem(s):\n\n` +
      `${problems.map((problem) => `  - ${problem}`).join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  "check:preset-token-resolution — an unresolvable token reference degrades quietly rather than " +
    `failing the build (upstream emits \`cursor: ${before}\`), and our \`cursor.switch\` delta ` +
    "restores it to `var(--cursor-switch)`.",
);
