#!/usr/bin/env node

// check:docs-consumer-config — the docs app is built the way a consumer's app is built
// (`docs-site.md` §1.1, §6.1).
//
// Four assertions. Each covers a shortcut that would leave the site working, the suite green, and
// the evidence worthless.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_CONFIG_KEYS,
  inspectPandaConfig,
  srcAliases,
} from "./lib/docs-consumer-config.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(repoRoot, "apps/docs");
const failures = [];

// 1 & 2 — the Panda config is `chakraConfig()` plus `include`/`outdir`, and nothing else.
const pandaConfigPath = join(docsRoot, "panda.config.ts");
const { spreadsChakraConfig, extraKeys } = inspectPandaConfig(
  pandaConfigPath,
  readFileSync(pandaConfigPath, "utf8"),
);

if (!spreadsChakraConfig) {
  failures.push(
    "apps/docs/panda.config.ts does not spread `chakraConfig()`.\n" +
      "  That function carries every knob which has to match our published runtime — `hash` above " +
      "all. A consumer whose sheet is hashed gets rules our `css()` never names, and every " +
      "component renders naked with no error anywhere (`plan.md` §3.4).",
  );
}

if (extraKeys.length > 0) {
  failures.push(
    `apps/docs/panda.config.ts declares ${extraKeys.length} key(s) beyond the spread: ` +
      `${extraKeys.join(", ")}.\n` +
      `  Only ${ALLOWED_CONFIG_KEYS.join(" and ")} are a consumer's to write. A hand-written knob ` +
      "here makes the docs app a config no reader has, which is the moment the site stops being " +
      "evidence.",
  );
}

// 3 — the production build carries no `src` alias for our packages.
//
// The config is **called**, in both modes, rather than grepped: what matters is the array Vite
// receives, not how it was spelled. `docs-site.md` §1.3 — dev resolves to `src` so the library
// hot-reloads; build resolves through `exports` → `dist` under the `"solid"` condition, which is
// the only thing that makes a docs example a consumer test.
const viteConfigPath = join(docsRoot, "vite.config.ts");
const viteConfigModule = await import(viteConfigPath);
const defineConfigArgument = viteConfigModule.default;

if (typeof defineConfigArgument !== "function") {
  failures.push(
    "apps/docs/vite.config.ts does not export a function of `{ command }`.\n" +
      "  The dev/build alias split needs one, and a static object cannot express it.",
  );
} else {
  const aliasesFor = (command) =>
    srcAliases(defineConfigArgument({ command, mode: "x" })?.resolve?.alias, repoRoot);

  const inBuild = aliasesFor("build");
  const inServe = aliasesFor("serve");

  if (inBuild.length > 0) {
    failures.push(
      `apps/docs/vite.config.ts keeps ${inBuild.length} \`src\` alias(es) in the production ` +
        `build:\n${inBuild.map((alias) => `    ${alias.find} → ${alias.replacement}`).join("\n")}\n` +
        "  The built site would then resolve our packages from source rather than through " +
        '`exports` → `dist` under the `"solid"` condition, which is the path a reader\'s build ' +
        "takes and the only one that proves anything.",
    );
  }
  if (inServe.length === 0) {
    failures.push(
      "apps/docs/vite.config.ts declares no `src` alias in `serve`.\n" +
        "  Dev is meant to resolve to source so the library hot-reloads while the docs are " +
        "written (`docs-site.md` §1.3). With none, editing a component does nothing until it is " +
        "rebuilt — the failure `plan.md` §9 exists to prevent.",
    );
  }
}

// 4 — no import of the repo's own dev stylesheet anywhere in the app.
//
// That sheet is generated from *our* source for the browser tests and Storybook. Importing it here
// would style the site without the docs app's own Panda run ever having to succeed, which is
// precisely the evidence the site is supposed to be. The one exception is the examples' browser
// test, which imports the **docs app's** sheet — a different file.
const devStylesheetUsers = [];
const { readdirSync } = await import("node:fs");
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
    } else if (/\.(tsx?|mdx)$/.test(entry.name)) {
      const contents = readFileSync(absolute, "utf8");
      if (
        contents.includes("packages/styled-system/styled-system") ||
        contents.includes("dev-stylesheet")
      ) {
        devStylesheetUsers.push(absolute.replace(`${repoRoot}/`, ""));
      }
    }
  }
};
walk(join(docsRoot, "src"));

if (devStylesheetUsers.length > 0) {
  failures.push(
    `${devStylesheetUsers.length} file(s) import the repo's dev stylesheet:\n` +
      devStylesheetUsers.map((file) => `    ${file}`).join("\n") +
      "\n  The site must render against the sheet its own Panda run produced. Borrowing ours " +
      "would make a broken consumer config invisible.",
  );
}

if (failures.length > 0) {
  console.error(`check:docs-consumer-config —\n\n${failures.join("\n\n")}\n`);
  process.exit(1);
}

console.log(
  "check:docs-consumer-config — the docs app spreads `chakraConfig()` with only " +
    `${ALLOWED_CONFIG_KEYS.join("/")} beside it, resolves our packages through \`dist\` in ` +
    "`build` and through `src` in `serve`, and renders against its own generated stylesheet.",
);
