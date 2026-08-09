/**
 * The three Vitest projects' file globs, in one place.
 *
 * `vitest.config.ts` builds its projects from this table, and `check:test-projects` reads the same
 * table to assert that every test file under a package's `src` directory resolves to **exactly
 * one** project. Two consumers, one declaration: a check that carried its own copy of the globs
 * would go on passing after the config changed, which is the failure it exists to prevent
 * (`testing.md` §1.7).
 */

export interface TestProject {
  name: "unit" | "ssr" | "browser";
  include: string[];
  exclude: string[];
}

const NEVER_SCANNED = ["**/node_modules/**", "**/dist/**"];

export const testProjects: TestProject[] = [
  {
    name: "unit",
    // `scripts/` rides in this project rather than getting a fourth one: the split is by module
    // resolution, and a check-script test needs no special resolution at all — no Solid, no DOM,
    // no aliases. It is exactly "node, pure logic".
    include: ["packages/*/src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
    // `*.ssr.test.ts` and `*.browser.test.ts` also end in `.test.ts`, so `unit` claims them
    // without these two lines and every SSR test runs a second time against the wrong build.
    exclude: ["**/*.browser.test.*", "**/*.ssr.test.*", ...NEVER_SCANNED],
  },
  {
    name: "ssr",
    include: ["packages/*/src/**/*.ssr.test.{ts,tsx}"],
    exclude: NEVER_SCANNED,
  },
  {
    name: "browser",
    include: ["packages/*/src/**/*.browser.test.{ts,tsx}"],
    exclude: NEVER_SCANNED,
  },
];
